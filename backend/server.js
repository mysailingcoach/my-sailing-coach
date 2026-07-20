import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { parseGPXFile } from './utils/gpxParser.js';
import {
  initDatabase,
  saveRace,
  updateRaceData
} from './utils/database.js';

import { analyzeRaceAI } from './utils/aiWorker.js';
import { enrichTrackpointsWithWeather } from './utils/weather.js';

import raceRoutes from './routes/races.js';
import authRoutes from './routes/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

const PORT = process.env.PORT || 5000;


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

const storage =
  multer.diskStorage({

    destination(req, file, cb) {
      cb(null, uploadDir);
    },


    filename(req, file, cb) {

      cb(
        null,
        Date.now() +
        '-' +
        file.originalname
      );

    }

  });



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
  upload.single('gpx'),
  async (req, res) => {

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



      const filePath =
        req.file.path;



      // Parse GPX

      const raceData =
        await parseGPXFile(filePath);



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




      // Save race

      const raceId =
        await saveRace({

          name:
            req.body.raceName ||
            req.file.originalname
              .replace('.gpx',''),


          filePath,


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

      (async()=>{

        try {


          const ai =
            await analyzeRaceAI({

              id: raceId,

              data: raceData

            });



          raceData.analysis =
            raceData.analysis || {};



          raceData.analysis.ai =
            ai;



          await updateRaceData(
            raceId,
            raceData
          );



          console.log(
            'AI saved:',
            raceId
          );



        } catch(error) {


          console.error(
            'AI error:',
            error
          );


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
