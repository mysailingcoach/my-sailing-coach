import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { getApiUrl } from "../api/client";
import RaceHeader from "../components/RaceHeader";
import RaceStats from "../components/RaceStats";
import RaceMap from "../components/RaceMap";
import AIInsights from "../components/AIInsights";

export default function RaceDetail() {
  const { id } = useParams();

  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRace() {
      try {
        const response = await axios.get(
          getApiUrl(`/races/${id}`)
        );

        console.log("Race loaded:", response.data);

        setRace(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load race.");
      } finally {
        setLoading(false);
      }
    }

    fetchRace();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl">Loading race...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-red-600">{error}</h2>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="p-6">
        <h2>Race not found.</h2>
      </div>
    );
  }
console.log("AI:", race.data.analysis.ai);
  return (
    <div className="max-w-7xl mx-auto p-6">

      <RaceHeader race={race} />

<RaceStats analysis={race.data.analysis} />

<AIInsights ai={race.data.analysis.ai} />

<RaceMap trackpoints={race.data.trackpoints} />

<RaceStats />
    </div>
  );
}