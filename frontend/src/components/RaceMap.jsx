import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function RaceMap({ trackpoints, marks = [] }) {
  if (!trackpoints || trackpoints.length === 0) {
    return <div className="h-96 flex items-center justify-center text-gray-500">No tracking data available</div>;
  }

  // Convert trackpoints to Leaflet format [lat, lon]
  const positions = trackpoints.map(pt => [pt.lat, pt.lon]);
  
  // Calculate center
  const center = trackpoints.length > 0 ? [
    trackpoints[0].lat,
    trackpoints[0].lon
  ] : [0, 0];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Race route line */}
      <Polyline
        positions={positions}
        color="blue"
        weight={3}
        opacity={0.7}
      />

      {/* Start marker */}
      <Marker position={[trackpoints[0].lat, trackpoints[0].lon]}>
        <Popup>
          <div className="text-sm">
            <strong>Start</strong><br />
            {new Date(trackpoints[0].time).toLocaleTimeString()}
          </div>
        </Popup>
      </Marker>

      {/* End marker */}
      <Marker position={[trackpoints[trackpoints.length - 1].lat, trackpoints[trackpoints.length - 1].lon]}>
        <Popup>
          <div className="text-sm">
            <strong>Finish</strong><br />
            {new Date(trackpoints[trackpoints.length - 1].time).toLocaleTimeString()}
          </div>
        </Popup>
      </Marker>

      {/* Marks / Waypoints */}
      {marks && marks.length > 0 && marks.map((m, i) => (
        <Marker key={`mark-${i}`} position={[m.lat, m.lon]}>
          <Popup>
            <div className="text-sm">
              <strong>{m.name || `Mark ${i + 1}`}</strong>
              {m.desc && <div className="text-xs text-gray-600">{m.desc}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
