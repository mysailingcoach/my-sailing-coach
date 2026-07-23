console.log("========== BACKEND SERVER.JS ==========");
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import {
  parseGPXContent,
  computeAdvancedAnalysis
} from './utils/gpxParser.js';
import {
  initDatabase,
  saveRace,
  updateRaceData
} from './utils/database.js';

import { analyzeRaceAI } from './utils/aiWorker.js';
import { enrichTrackpointsWithWeather } from './utils/weather.js';

import raceRoutes from './routes/races.js';
import authRoutes from './routes/auth.js';
console.log("========== UPLOAD ROUTE ==========");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

const PORT = process.env.PORT || 5000;
const UPLOAD_RATE_LIMIT =
  Number(process.env.UPLOAD_RATE_LIMIT) || 15;


// --------------------
// CORS
// --------------------

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null
].filter(Boolean);


app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : true,
    credentials: true
  })
);


app.use(express.json());


// --------------------
// Upload folder
// --------------------

const uploadDir =
  path.join(__dirname, 'uploads');


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}


// --------------------
// Multer
// --------------------

const storage = multer.memoryStorage();



const upload =
  multer({

    storage,


    fileFilter(req, file, cb) {

      if (
        file.originalname
          .toLowerCase()
          .endsWith('.gpx')
      ) {

        cb(null, true);

      } else {

        cb(
          new Error(
            'Only GPX files are allowed'
          ),
          false
        );

      }

    }

  });

const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: UPLOAD_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      'Too many uploads. Please wait and try again.'
  }
});



// --------------------
// Database
// --------------------

await initDatabase();



// --------------------
// Routes
// --------------------

app.use(
  '/api/races',
  raceRoutes
);

app.use(
  '/api/auth',
  authRoutes
);



// --------------------
// Upload GPX
// --------------------

app.post(
  '/api/upload',
  uploadRateLimiter,
  upload.single('gpx'),
  async (req, res) => {
console.log("UPLOAD ENDPOINT HIT");
    try {


      if (!req.file) {

        return res.status(400).json({

          error:
            'No GPX file uploaded'

        });

      }



      console.log(
        'Processing:',
        req.file.originalname
      );



      const rawGpx = req.file.buffer?.toString(
        'utf8'
      );

      const raceData = parseGPXContent(rawGpx);



      console.log(
        'Trackpoints:',
        raceData.trackpoints?.length
      );



      // --------------------
      // WEATHER
      // --------------------

      if (
        Array.isArray(
          raceData.trackpoints
        ) &&
        raceData.trackpoints.length > 0
      ) {


        console.log(
          'Starting weather enrichment...'
        );


        await enrichTrackpointsWithWeather(
          raceData.trackpoints
        );


        const weatherCount =
          raceData.trackpoints.filter(
            p => p.wind
          ).length;



        console.log(
          'Weather attached:',
          weatherCount
        );


        console.log(
          'Weather sample:',
          raceData.trackpoints[0]
        );


      } else {


        console.log(
          'No trackpoints found'
        );


      }

      raceData.analysis =
        computeAdvancedAnalysis(
          raceData.trackpoints || [],
          raceData.marks || [],
          raceData.analysis
        );




      // Save race

      const raceId =
        await saveRace({

          name:
            req.body.raceName ||
            req.file.originalname
              .replace('.gpx',''),


          filePath: null,


          data: raceData,


          uploadDate:
            new Date()

        });



      console.log(
        'Race saved:',
        raceId
      );



      // Return finished data

      res.json({

        success:true,

        raceId,

        message:
          'GPX processed successfully',

        data:
          raceData

      });




      // AI runs after response

      (async () => {
  console.log("=== AI START ===");

  try {
    console.log("Calling analyzeRaceAI...");

    const ai = await analyzeRaceAI({
      id: raceId,
      data: raceData
    });

    console.log("AI RESULT:");
    console.dir(ai, { depth: null });

    raceData.analysis = raceData.analysis || {};
    raceData.analysis.ai = ai;

    console.log("Saving AI to database...");

    await updateRaceData(raceId, raceData);

    console.log("AI SAVED");

  } catch (error) {
    console.error("AI FAILED:");
    console.error(error);
  }
})();



    } catch(error) {


      console.error(
        'Upload failed:',
        error
      );


      res.status(500).json({

        error:
          error.message

      });


    }


  }
);



// --------------------
// Health
// --------------------

app.get(
  '/api/health',
  (req,res)=>{

    res.json({

      status:'OK',

      service:
        'My Sailing Coach API'

    });

  }
);



app.get(
  '/',
  (req,res)=>{

    res.json({

      status:'OK',

      message:
        'My Sailing Coach API is running'

    });

  }
);



// --------------------
// Error handler
// --------------------

// Catches multer errors (e.g. wrong file type) and any other
// synchronous/middleware errors, returning a consistent JSON response.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// --------------------
// Start server
// --------------------

app.listen(
  PORT,
  ()=>{

    console.log(
      `🚀 API running on port ${PORT}`
    );

  }
);
