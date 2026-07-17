import React from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

export default function RaceMap({ trackpoints = [], marks = [] }) {
  const validTrackpoints = trackpoints.filter(
    (pt) =>
      pt &&
      pt.lat != null &&
      pt.lon != null &&
      !isNaN(pt.lat) &&
      !isNaN(pt.lon)
  );

  if (validTrackpoints.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No valid GPS tracking data available
      </div>
    );
  }

  const positions = validTrackpoints.map((pt) => [
    Number(pt.lat),
    Number(pt.lon)
  ]);

  const startPoint = validTrackpoints[0];
  const endPoint = validTrackpoints[validTrackpoints.length - 1];

  const center = [
    Number(startPoint.lat),
    Number(startPoint.lon)
  ];

  const validMarks = (marks || []).filter(
    (m) =>
      m &&
      m.lat != null &&
      m.lon != null &&
      !isNaN(m.lat) &&
      !isNaN(m.lon)
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Polyline
        positions={positions}
        color="blue"
        weight={3}
        opacity={0.8}
      />

      <Marker
        position={[
          Number(startPoint.lat),
          Number(startPoint.lon)
        ]}
      >
        <Popup>
          <div>
            <strong>Start</strong>
            <br />
            {startPoint.time
              ? new Date(startPoint.time).toLocaleTimeString()
              : 'Unknown'}
          </div>
        </Popup>
      </Marker>

      <Marker
        position={[
          Number(endPoint.lat),
          Number(endPoint.lon)
        ]}
      >
        <Popup>
          <div>
            <strong>Finish</strong>
            <br />
            {endPoint.time
              ? new Date(endPoint.time).toLocaleTimeString()
              : 'Unknown'}
          </div>
        </Popup>
      </Marker>

      {validMarks.map((mark, index) => (
        <Marker
          key={index}
          position={[
            Number(mark.lat),
            Number(mark.lon)
          ]}
        >
          <Popup>
            <div>
              <strong>
                {mark.name || `Mark ${index + 1}`}
              </strong>
              {mark.desc && <div>{mark.desc}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
