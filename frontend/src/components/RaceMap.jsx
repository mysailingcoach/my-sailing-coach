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

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

export default function RaceMap({
  trackpoints = [],
  marks = []
}) {
  const validTrackpoints = trackpoints.filter(
    pt =>
      pt &&
      pt.lat != null &&
      pt.lon != null &&
      !isNaN(pt.lat) &&
      !isNaN(pt.lon)
  );

  if (validTrackpoints.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No valid GPS tracking data available
      </div>
    );
  }

  const positions = validTrackpoints.map(pt => [
    Number(pt.lat),
    Number(pt.lon)
  ]);

  const startPoint = validTrackpoints[0];
  const endPoint =
    validTrackpoints[validTrackpoints.length - 1];

  const center = [
    Number(startPoint.lat),
    Number(startPoint.lon)
  ];

  const validMarks = (marks || []).filter(
    mark =>
      mark &&
      mark.lat != null &&
      mark.lon != null &&
      !isNaN(mark.lat) &&
      !isNaN(mark.lon)
  );

  const weatherPoints = validTrackpoints.filter(
    pt => pt.wind
  );

  console.log(
    'Trackpoints:',
    validTrackpoints.length
  );

  console.log(
    'Trackpoints with wind:',
    weatherPoints.length
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: '600px',
        width: '100%'
      }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Race Track */}
      <Polyline
        positions={positions}
        color="blue"
        weight={4}
        opacity={0.8}
      />

      {/* Start */}
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
            <br />

            Time:
            <br />
            {startPoint.time
              ? new Date(
                  startPoint.time
                ).toLocaleTimeString()
              : 'Unknown'}

            {startPoint.wind && (
              <>
                <hr />

                <strong>Wind</strong>

                <br />
                Speed:
                {' '}
                {startPoint.wind.speed}

                <br />
                Direction:
                {' '}
                {startPoint.wind.direction}°
              </>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Finish */}
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
            <br />

            Time:
            <br />
            {endPoint.time
              ? new Date(
                  endPoint.time
                ).toLocaleTimeString()
              : 'Unknown'}

            {endPoint.wind && (
              <>
                <hr />

                <strong>Wind</strong>

                <br />
                Speed:
                {' '}
                {endPoint.wind.speed}

                <br />
                Direction:
                {' '}
                {endPoint.wind.direction}°
              </>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Course Marks */}
      {validMarks.map((mark, index) => (
        <Marker
          key={`mark-${index}`}
          position={[
            Number(mark.lat),
            Number(mark.lon)
          ]}
        >
          <Popup>
            <div>
              <strong>
                {mark.name ||
                  `Mark ${index + 1}`}
              </strong>

              {mark.desc && (
                <>
                  <br />
                  {mark.desc}
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Wind Points */}
      {validTrackpoints
        .filter((pt, index) => index % 25 === 0)
        .filter(pt => pt.wind)
        .map((pt, index) => (
          <Marker
            key={`wind-${index}`}
            position={[
              Number(pt.lat),
              Number(pt.lon)
            ]}
          >
            <Popup>
              <div>
                <strong>Wind Data</strong>

                <br />
                <br />

                Speed:
                {' '}
                {pt.wind.speed}

                <br />

                Direction:
                {' '}
                {pt.wind.direction}°

                <br />

                Time:
                <br />
                {pt.wind.time}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
