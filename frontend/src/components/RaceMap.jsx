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
import {
  getSpeedColorDomain,
  getSpeedTrackColor
} from '../utils/trackSpeedColors';

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
  const speedColorDomain =
    getSpeedColorDomain(validTrackpoints);

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
  const windPoint =
    [...validTrackpoints]
      .reverse()
      .find(
        pt =>
          pt.wind &&
          pt.wind.speed != null
      );

  return (
    <div style={{ position: 'relative' }}>
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
                color={getSpeedTrackColor(
                  pt.sog,
                  speedColorDomain
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

        Heading
        {' '}
        {Math.round(
          m.point.heading || 0
        )}
        °

        <br />

        Wind
        {' '}
        {m.point.wind?.direction}
        °

        <br />

        Made good
        {' '}
        {formatMetersMadeGood(
          m.metersMadeGood
        )}
      </div>
    </Popup>
  </Marker>
))}
      </MapContainer>

      {/* Wind / Weather Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          padding: '10px 14px',
          fontSize: '13px',
          color: '#1e293b',
          minWidth: '150px'
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '6px'
          }}
        >
          🌬 Wind &amp; Weather
        </div>

        <div>
          Speed:{' '}
          {windPoint?.wind?.speed != null
            ? `${windPoint.wind.speed} kn`
            : '—'}
        </div>

        <div>
          Direction:{' '}
          {windPoint?.wind?.direction != null
            ? `${windPoint.wind.direction}°`
            : '—'}
        </div>

        <div>
          Heading:{' '}
          {windPoint?.heading != null
            ? `${Math.round(windPoint.heading)}°`
            : '—'}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-700" />
          Slower speed
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          Faster speed
        </div>

        <div className="flex items-center gap-2">
          🔄 Tack / Gybe
        </div>

      </div>
    </div>
  );
}
