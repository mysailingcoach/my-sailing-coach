# Technical Architecture

## Overview

My Free Sailing Coach is a full-stack web application built with:
- **Frontend**: React with Vite, Tailwind CSS, and Leaflet for maps
- **Backend**: Node.js/Express with SQLite database
- **Communication**: REST API with JSON

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Upload Page                                          │
│  - Dashboard                                            │
│  - Race Detail with Map                                 │
│  - Performance Metrics Display                          │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────────────────────────┐
│             Backend (Express.js)                        │
│  POST /api/upload    (GPX processing)                   │
│  GET /api/races      (fetch all races)                  │
│  GET /api/races/:id  (fetch specific race)              │
│  DELETE /api/races   (delete race)                      │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│  Data Processing Layer                                  │
│  - GPX File Parser                                      │
│  - Distance Calculator (Haversine)                      │
│  - Speed Analysis                                       │
│  - Data Aggregation                                     │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│  Database (SQLite)                                      │
│  - Races Table                                          │
│  - Stored race metadata and GPS data                    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. GPX Upload Flow

```
User selects GPX file
    ↓
Frontend validates file type
    ↓
FormData sent to /api/upload
    ↓
Backend receives multipart data
    ↓
Multer saves file to /uploads
    ↓
GPX Parser extracts trackpoints
    ↓
Analysis Engine calculates metrics
    ↓
Data stored in SQLite
    ↓
Response sent to frontend with race ID
    ↓
Frontend redirects to race detail page
```

### 2. Race Display Flow

```
User views race detail
    ↓
Frontend requests GET /api/races/:id
    ↓
Backend queries SQLite database
    ↓
Trackpoints retrieved
    ↓
Data formatted as JSON
    ↓
Frontend renders map with React Leaflet
    ↓
Performance metrics displayed
```

## File Structure Details

### Backend Structure

```
backend/
├── server.js                 # Express app initialization
├── routes/
│   └── races.js             # Race CRUD endpoints
├── utils/
│   ├── gpxParser.js         # GPX parsing logic
│   │   ├── extractTrackpoints()
│   │   ├── analyzeRace()
│   │   ├── calculateDistance()
│   │   └── extractMetadata()
│   └── database.js          # SQLite operations
│       ├── initDatabase()
│       ├── saveRace()
│       ├── getRaces()
│       ├── getRaceById()
│       └── deleteRace()
├── uploads/                 # GPX file storage
├── sailingcoach.db         # SQLite database file
├── package.json
└── .env                     # Environment variables
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── Layout.jsx           # Main layout with nav/footer
│   ├── RaceMap.jsx          # Leaflet map component
│   └── PerformanceMetrics.jsx # Metrics dashboard
├── pages/
│   ├── Home.jsx             # Upload interface
│   ├── Dashboard.jsx        # Race list
│   └── RaceDetail.jsx       # Full race analysis
├── App.jsx                  # Route definitions
├── main.jsx                 # React DOM render
└── index.css               # Tailwind styles
```

## Key Technologies Explained

### GPX Parsing

The `gpxParser.js` module:
1. Reads XML file using `fast-xml-parser`
2. Extracts `<trkpt>` (track point) elements
3. Converts to standardized format:
   ```javascript
   {
     lat: number,
     lon: number,
     time: ISO8601 string,
     ele: elevation in meters,
     index: sequence number
   }
   ```

### Distance Calculation

Uses the Haversine formula to calculate great-circle distance between coordinates:

```javascript
const R = 6371; // Earth's radius in km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
const a = 
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
const distance = R * c;
```

**Accuracy**: ±0.05% for most sailing distances

### Speed Calculation

```
Speed = Total Distance / Total Time
Average Speed = Sum of all segment speeds / Number of segments
```

**Note**: This differs from device instantaneous speed readings.

## Database Schema

### races table

```sql
CREATE TABLE races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  filePath TEXT,
  data TEXT NOT NULL,  -- JSON string of analysis
  uploadDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**data column structure**:
```json
{
  "trackpoints": [
    {
      "lat": 41.5,
      "lon": -71.3,
      "time": "2024-01-15T10:30:00Z",
      "ele": 5.2,
      "index": 0
    }
  ],
  "analysis": {
    "totalDistance": 12.5,
    "totalTime": 1.5,
    "avgSpeed": 8.33,
    "maxSpeed": 15.2,
    "minSpeed": 0.5,
    "pointCount": 450,
    "startTime": "2024-01-15T10:30:00Z",
    "endTime": "2024-01-15T12:00:00Z"
  },
  "metadata": {
    "creator": "Device Name",
    "time": "2024-01-15T12:00:00Z",
    "name": "Race Name"
  }
}
```

## API Endpoints Reference

### POST /api/upload
**Purpose**: Process and store a new GPX file

**Request**:
```
Content-Type: multipart/form-data

Parameters:
- gpx (File): The GPX file
- raceName (string): Name for the race
```

**Response** (200):
```json
{
  "success": true,
  "raceId": 1,
  "message": "GPX file processed successfully",
  "data": {
    "trackpoints": [...],
    "analysis": {...},
    "metadata": {...}
  }
}
```

**Errors**:
- 400: No file uploaded
- 400: Invalid file type
- 500: GPX parsing failed

### GET /api/races
**Purpose**: Get list of all races

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Local Cup 2024",
    "uploadDate": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

### GET /api/races/:id
**Purpose**: Get detailed race data

**Response** (200):
```json
{
  "id": 1,
  "name": "Local Cup 2024",
  "filePath": "uploads/1234-race.gpx",
  "data": {...},
  "uploadDate": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors**:
- 404: Race not found

### DELETE /api/races/:id
**Purpose**: Delete a race and associated files

**Response** (200):
```json
{
  "success": true,
  "message": "Race deleted"
}
```

**Errors**:
- 404: Race not found

## Component Architecture

### Layout Component
- Provides consistent header and footer
- Navigation bar
- Responsive wrapper

### RaceMap Component
- Wraps React Leaflet
- Displays:
  - Tile layer (OpenStreetMap)
  - Route polyline (blue)
  - Start marker (green)
  - End marker (red)
- Interactive zoom/pan

### PerformanceMetrics Component
- Card-based metric display
- Color-coded by metric type
- Timeline information
- Responsive grid layout

## State Management

Currently uses React hooks:
- `useState` for local component state
- `useEffect` for data fetching
- `useParams` from React Router for URL parameters

**Future improvement**: Consider Redux or Zustand for complex state.

## Error Handling

### Frontend
- User-friendly error messages
- Validation before submission
- Network error handling with try/catch

### Backend
- Multer validation for file uploads
- GPX parsing error handling
- Database error handling
- HTTP status codes (4xx client, 5xx server)

## Performance Optimization Tips

### Frontend
1. Lazy load map component
2. Implement pagination for large race lists
3. Cache API responses
4. Optimize images in map tiles
5. Use React.memo for expensive components

### Backend
1. Index database queries
2. Implement response caching
3. Compress responses with gzip
4. Stream large files
5. Rate limiting on endpoints

### Database
1. Add indexes on frequently queried columns
2. Implement data archiving for old races
3. Regular database vacuum/optimization
4. Consider moving to PostgreSQL for scaling

## Security Considerations

### File Upload
- Validate file type server-side
- Limit file size
- Scan for malicious content
- Secure file storage path

### API
- Input validation on all endpoints
- SQL injection prevention (using parameterized queries)
- CORS configuration
- Rate limiting
- Authentication (future)

### Data Privacy
- No personally identifiable information required
- GPS data stored locally
- HTTPS in production
- Regular security audits

## Testing Strategy

### Unit Tests (Future)
- GPX parsing functions
- Distance calculations
- Data validation

### Integration Tests (Future)
- API endpoints
- Database operations
- File upload workflow

### E2E Tests (Future)
- Upload flow
- Dashboard navigation
- Map rendering

## Monitoring & Logging

### Recommended Tools
- **Frontend**: LogRocket, Sentry
- **Backend**: Winston, Morgan
- **Infrastructure**: DataDog, New Relic

## Scaling Approach

### Phase 1 (Current)
- Single server
- SQLite database
- Local file storage

### Phase 2
- Separate frontend/backend
- PostgreSQL database
- Cloud file storage (S3)

### Phase 3
- Load balancer
- Multiple backend instances
- Database replication
- CDN for static content

### Phase 4
- Microservices architecture
- Advanced caching
- Real-time features
- Machine learning integration

---

For more information, see:
- [SETUP.md](SETUP.md) - Installation guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [USER_GUIDE.md](USER_GUIDE.md) - User documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
