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
import { formatMetersMadeGood } from '../utils/maneuverFormatters';

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

// Wind arrow icon
const createWindIcon = (direction, speed) =>
  L.divIcon({
    className: 'wind-arrow-icon',
    html: `
      <div style="
        text-align:center;
        width:34px;
      ">
        <div style="
          transform: rotate(${direction +180}deg);
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
          background:white;
          border-radius:4px;
          padding:1px 2px;
          margin-top:-2px;
        ">
          ${Math.round(speed)}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

// Tack marker
const tackIcon = L.divIcon({
  className: 'tack-icon',
  html: `
    <div style="
      background:white;
      border-radius:50%;
      width:26px;
      height:26px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid #2563eb;
      font-size:14px;
      font-weight:bold;
    ">
      ⤴
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function relativeWindAngle(
  heading,
  windDirection
) {
  let angle =
    normalizeAngle(
      heading - windDirection
    );

  if (angle > 180) {
    angle -= 360;
  }

  return angle;
}

function angleDifference(a, b) {
  let diff = Math.abs(a - b);

  if (diff > 180) {
    diff = 360 - diff;
  }

  return diff;
}
function getPerformanceColor(trackpoint) {
  if (
    !trackpoint.wind ||
    trackpoint.heading == null
  ) {
    return '#6b7280';
  }

  const angle = angleDifference(
    trackpoint.heading,
    trackpoint.wind.direction
  );

  // Very simplistic VMG model

  if (angle < 45) {
    return '#dc2626'; // poor
  }

  if (angle < 90) {
    return '#eab308'; // moderate
  }

  return '#16a34a'; // good
}

export default function RaceMap({
  trackpoints = [],
  marks = [],
  maneuvers: providedManeuvers = []
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
const maneuvers = [];

if (providedManeuvers.length > 0) {
  providedManeuvers.forEach(maneuver => {
    const point = validTrackpoints.find(
      p => p.index === maneuver.index
    );

    if (point) {
      maneuvers.push({
        type: maneuver.type,
        point,
        metersMadeGood: maneuver.metersMadeGood
      });
    }
  });
} else {
  for (
    let i = 20;
    i < validTrackpoints.length - 20;
    i++
  ) {
    const pt = validTrackpoints[i];

    if (
      !pt.wind ||
      pt.heading == null ||
      validTrackpoints[i - 20]?.heading == null ||
      validTrackpoints[i + 20]?.heading == null
    ) {
      continue;
    }

    const before =
      relativeWindAngle(
        validTrackpoints[i - 20].heading,
        pt.wind.direction
      );

    const after =
      relativeWindAngle(
        validTrackpoints[i + 20].heading,
        pt.wind.direction
      );

    if (
      (before < -30 && after > 30) ||
      (before > 30 && after < -30)
    ) {
      maneuvers.push({
        type: 'Tack',
        point: pt
      });

      i += 50;
      continue;
    }

    if (
      (before < -120 && after > 120) ||
      (before > 120 && after < -120)
    ) {
      maneuvers.push({
        type: 'Gybe',
        point: pt
      });

      i += 50;
    }
  }
}
  return (
    <div>
      <MapContainer
        center={center}
        zoom={13}
        style={{
          height: '650px',
          width: '100%'
        }}
        className="z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Performance Track */}
        {validTrackpoints
          .slice(1)
          .map((pt, index) => {
            const prev =
              validTrackpoints[index];

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
                color={getPerformanceColor(pt)}
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
                🚩 Race Start
              </strong>

              <br />
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
                🏁 Race Finish
              </strong>

              <br />
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

        {/* Tack / Gybe Detection */}
{maneuvers.map((m, index) => (
  <Marker
    key={`maneuver-${index}`}
    position={[
      Number(m.point.lat),
      Number(m.point.lon)
    ]}
    icon={L.divIcon({
      ...tackIcon.options,
      html: tackIcon.options.html.replace(
        '#2563eb',
        m.type === 'Gybe' ? '#b45309' : '#2563eb'
      )
    })}
  >
    <Popup>
      <div>
        <strong>
          {m.type}
        </strong>

        <br />

        Heading:
        {' '}
        {Math.round(
          m.point.heading || 0
        )}
        °

        <br />

        Wind:
        {' '}
        {m.point.wind?.direction}
        °

        <br />

        Made good:
        {' '}
        {formatMetersMadeGood(
          m.metersMadeGood
        )}
      </div>
    </Popup>
  </Marker>
))}
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
          .map((pt, index) => {
            const angle =
              angleDifference(
                pt.heading || 0,
                pt.wind.direction
              );

            return (
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

                    Heading:
                    {' '}
                    {Math.round(
                      pt.heading || 0
                    )}
                    °

                    <br />
                    <br />

                    {angle < 45 && (
                      <div>
                        ⚠ Sailing
                        close-hauled
                      </div>
                    )}

                    {angle >= 45 &&
                      angle < 90 && (
                        <div>
                          ⚡ Moderate
                          VMG
                        </div>
                      )}

                    {angle >= 90 && (
                      <div>
                        ✅ Good VMG
                        angle
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded" />
          Good VMG
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          Moderate VMG
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          Poor Angle
        </div>

        <div className="flex items-center gap-2">
          🔄 Tack / Gybe
        </div>

        <div className="flex items-center gap-2">
          ↑ Wind Direction
        </div>

      </div>
    </div>
  );
}
