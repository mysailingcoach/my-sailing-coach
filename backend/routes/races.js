import express from 'express';
import { getRaces, getRaceById, deleteRace } from '../utils/database.js';

const router = express.Router();

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
    res.json(race);
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
