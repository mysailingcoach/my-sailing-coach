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

// Wind arrow icon with speed label
const createWindIcon = (direction, speed) =>
  L.divIcon({
    className: 'wind-arrow-icon',
    html: `
      <div style="
        text-align:center;
        width:32px;
      ">
        <div style="
          transform: rotate(${direction}deg);
          font-size:22px;
          font-weight:bold;
          color:#2563eb;
          text-shadow:0 0 4px white;
          line-height:1;
        ">
          ↑
        </div>
        <div style="
          font-size:10px;
          font-weight:bold;
          color:black;
          margin-top:-2px;
          background:white;
          border-radius:4px;
          padding:1px 2px;
        ">
          ${speed}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

function getWindColor(speed) {
  if (speed >= 20) return '#dc2626'; // red
  if (speed >= 15) return '#eab308'; // yellow
  if (speed >= 8) return '#16a34a'; // green
  return '#2563eb'; // blue
}

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

  const startPoint = validTrackpoints[0];

  const endPoint =
    validTrackpoints[
      validTrackpoints.length - 1
    ];

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

  return (
    <div>
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
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Wind-Coloured Track */}
        {validTrackpoints
          .slice(1)
          .map((pt, index) => {
            const prev =
              validTrackpoints[index];

            const windSpeed =
              pt.wind?.speed || 0;

            return (
              <Polyline
                key={`segment-${index}`}
                positions={[
                  [
                    Number(prev.lat),
                    Number(prev.lon)
                  ],
                  [
                    Number(pt.lat),
                    Number(pt.lon)
                  ]
                ]}
                color={getWindColor(
                  windSpeed
                )}
                weight={5}
                opacity={0.9}
              />
            );
          })}

        {/* Start */}
        <Marker
          position={[
            Number(startPoint.lat),
            Number(startPoint.lon)
          ]}
        >
          <Popup>
            <div>
              <strong>
                🚩 Start
              </strong>

              <br />
              <br />

              Time:
              <br />

              {startPoint.time
                ? new Date(
                    startPoint.time
                  ).toLocaleString()
                : 'Unknown'}
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
              <strong>
                🏁 Finish
              </strong>

              <br />
              <br />

              Time:
              <br />

              {endPoint.time
                ? new Date(
                    endPoint.time
                  ).toLocaleString()
                : 'Unknown'}
            </div>
          </Popup>
        </Marker>

        {/* Marks */}
        {validMarks.map(
          (mark, index) => (
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
          )
        )}

        {/* Wind Arrows */}
        {validTrackpoints
          .filter(
            (_, index) =>
              index % 50 === 0
          )
          .filter(
            pt =>
              pt.wind &&
              pt.wind.speed
          )
          .map((pt, index) => (
            <Marker
              key={`wind-${index}`}
              position={[
                Number(pt.lat),
                Number(pt.lon)
              ]}
              icon={createWindIcon(
                pt.wind.direction,
                pt.wind.speed
              )}
            >
              <Popup>
                <div>
                  <strong>
                    🌬 Wind
                  </strong>

                  <br />
                  <br />

                  Speed:
                  {' '}
                  {pt.wind.speed}
                  {' '}
                  knots

                  <br />

                  Direction:
                  {' '}
                  {pt.wind.direction}
                  °

                  <br />

                  Time:
                  <br />

                  {pt.wind.time}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">

        <div className="flex items-center gap-1">
          <span className="text-blue-600 text-xl">
            ↑
          </span>
          Wind direction
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          &lt; 8 knots
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded" />
          8–15 knots
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          15–20 knots
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          20+ knots
        </div>

      </div>
    </div>
  );
}
