import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const startIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const finishIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function RaceMap({
  trackpoints = [],
  analysis,
  selectedLeg,
  setSelectedLeg
}) {

  const positions = useMemo(() => {

    return trackpoints
      .filter(p => p.lat && p.lon)
      .map(p => [p.lat, p.lon]);

  }, [trackpoints]);

  if (!positions.length) {

    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        No GPS track available.
      </div>
    );

  }

  const centre = positions[Math.floor(positions.length / 2)];

  return (

    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <h2 className="text-2xl font-bold mb-4">
        Interactive Race Map
      </h2>

      <MapContainer
        center={centre}
        zoom={14}
        style={{
          height: "650px",
          width: "100%",
          borderRadius: "12px"
        }}
      >

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {analysis?.legs?.map((leg, index) => {

          const pts = positions.slice(
            leg.start,
            leg.end + 1
          );

          let colour = "#ef4444";

          if (leg.score >= 90)
            colour = "#16a34a";
          else if (leg.score >= 75)
            colour = "#f59e0b";

          const active =
            selectedLeg === index;

          return (

            <Polyline
              key={index}
              positions={pts}
              pathOptions={{
                color: colour,
                weight: active ? 8 : 5,
                opacity: active ? 1 : 0.8
              }}
              eventHandlers={{
                click: () => setSelectedLeg(index)
              }}
            >

              <Popup>

                <strong>
                  Leg {index + 1}
                </strong>

                <br />

                Rating:
                {" "}
                {leg.rating}

                <br />

                Score:
                {" "}
                {leg.score}

                <br />

                Avg Speed:
                {" "}
                {leg.avgSpeed.toFixed(2)}
                {" "}
                km/h

              </Popup>

            </Polyline>

          );

        })}

        <Marker
          position={positions[0]}
          icon={startIcon}
        >
          <Popup>Race Start</Popup>
        </Marker>

        <Marker
          position={
            positions[positions.length - 1]
          }
          icon={finishIcon}
        >
          <Popup>Race Finish</Popup>
        </Marker>

      </MapContainer>

    </div>

  );

}