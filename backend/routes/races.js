import express from 'express';
import {
  getRaces,
  getRaceById,
  deleteRace,
  getRaceAnalyses,
  updateRaceData
} from '../utils/database.js';

const router = express.Router();

function isValidVideoUrl(url) {
  if (!url) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch (error) {
    return false;
  }
}

function buildComparativeAnalytics(race, allRaces) {
  const analysis = race?.data?.analysis || {};

  const history = allRaces
    .filter(item => item.id !== race.id)
    .map(item => item.data?.analysis)
    .filter(Boolean);

  if (history.length === 0) {
    return {
      hasHistory: false,
      historyCount: 0,
      delta: null,
      trend: []
    };
  }

  const avg = key =>
    history.reduce((sum, item) => sum + (item[key] || 0), 0) /
    history.length;

  const historicalAvgSpeed = avg('avgSpeed');
  const historicalDistance = avg('totalDistance');
  const historicalPerformanceIndex =
    history.reduce(
      (sum, item) =>
        sum + (item.performanceIndex?.score || 0),
      0
    ) / history.length;

  const trend = allRaces
    .slice()
    .reverse()
    .map(item => ({
      id: item.id,
      name: item.name,
      date: item.uploadDate || item.createdAt,
      avgSpeed: item.data?.analysis?.avgSpeed || 0,
      performanceIndex:
        item.data?.analysis?.performanceIndex?.score || 0
    }))
    .slice(-10);

  const segments = (analysis.legs || []).map(leg => ({
    ...leg,
    performanceDelta:
      historicalAvgSpeed > 0
        ? Number(
            (
              ((leg.avgSpeed - historicalAvgSpeed) /
                historicalAvgSpeed) *
              100
            ).toFixed(1)
          )
        : 0
  }));

  const sortedSegments = [...segments].sort(
    (a, b) => b.avgSpeed - a.avgSpeed
  );

  return {
    hasHistory: true,
    historyCount: history.length,
    baseline: {
      avgSpeed: Number(historicalAvgSpeed.toFixed(2)),
      totalDistance: Number(historicalDistance.toFixed(2)),
      performanceIndex: Number(
        historicalPerformanceIndex.toFixed(1)
      )
    },
    delta: {
      avgSpeed: Number(
        ((analysis.avgSpeed || 0) - historicalAvgSpeed).toFixed(2)
      ),
      performanceIndex: Number(
        (
          (analysis.performanceIndex?.score || 0) -
          historicalPerformanceIndex
        ).toFixed(1)
      )
    },
    trend,
    personalBestSegment: sortedSegments[0] || null,
    personalWorstSegment:
      sortedSegments[sortedSegments.length - 1] || null
  };
}

// Get all races
router.get('/', async (req, res) => {
  try {
    const races = await getRaces();
    res.json(races);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific race
router.get('/:id', async (req, res) => {
  try {
    const race = await getRaceById(req.params.id);
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    const allRaces = await getRaceAnalyses();
    res.json({
      ...race,
      comparative: buildComparativeAnalytics(
        race,
        allRaces
      )
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/video', async (req, res) => {
  try {
    const race = await getRaceById(req.params.id);

    if (!race) {
      return res
        .status(404)
        .json({ error: 'Race not found' });
    }

    const {
      url,
      offsetSeconds = 0,
      annotations = []
    } = req.body || {};

    const safeOffset = Number(offsetSeconds) || 0;
    const safeUrl =
      typeof url === 'string' ? url.trim() : '';

    if (!isValidVideoUrl(safeUrl)) {
      return res.status(400).json({
        error: 'Invalid video URL'
      });
    }

    race.data = race.data || {};
    race.data.video = {
      url: safeUrl,
      offsetSeconds: safeOffset,
      annotations: Array.isArray(annotations)
        ? annotations.slice(0, 100)
        : [],
      updatedAt: new Date().toISOString()
    };

    await updateRaceData(req.params.id, race.data);

    res.json({
      success: true,
      video: race.data.video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete race
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteRace(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Race not found' });
    }
    res.json({ success: true, message: 'Race deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
