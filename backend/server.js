import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseGPXFile } from './utils/gpxParser.js';
import { initDatabase, saveRace, getRaces, getRaceById, updateRaceData } from './utils/database.js';
import { analyzeRaceAI } from './utils/aiWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());

// File upload setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/gpx+xml' || file.originalname.endsWith('.gpx')) {
      cb(null, true);
    } else {
      cb(new Error('Only GPX files are allowed'), false);
    }
  }
});

// Initialize database
initDatabase();

// Routes
import raceRoutes from './routes/races.js';
app.use('/api/races', raceRoutes);

// Upload endpoint
app.post('/api/upload', upload.single('gpx'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const raceData = await parseGPXFile(filePath);
    
    const raceId = await saveRace({
      name: req.body.raceName || req.file.originalname.replace('.gpx', ''),
      filePath: filePath,
      data: raceData,
      uploadDate: new Date()
    });

    // Respond immediately
    res.json({ 
      success: true, 
      raceId,
      message: 'GPX file processed successfully',
      data: raceData
    });

    // Run AI analysis asynchronously and persist results
    (async () => {
      try {
        const ai = await analyzeRaceAI({ id: raceId, data: raceData });
        // attach to race data and update
        raceData.analysis = raceData.analysis || {};
        raceData.analysis.ai = ai;
        await updateRaceData(raceId, raceData);
        console.log('AI analysis saved for race', raceId);
      } catch (e) {
        console.error('AI analysis error for race', raceId, e);
      }
    })();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'My Sailing Coach API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 My Free Sailing Coach API running on http://localhost:${PORT}`);
});
