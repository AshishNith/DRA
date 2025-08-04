const express = require('express');
const Initiative = require('../models/Initiative');
const Location = require('../models/Location');

const router = express.Router();

// GET all initiatives
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, location, status, category, search } = req.query;
    const query = {};
    
    if (location) query.location = location;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const initiatives = await Initiative.find(query)
      .populate('location', 'name city state')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Initiative.countDocuments(query);

    res.json({
      initiatives,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching initiatives', error: error.message });
  }
});

// GET initiatives by location
router.get('/location/:locationId', async (req, res) => {
  try {
    const initiatives = await Initiative.find({ location: req.params.locationId })
      .populate('location', 'name city state')
      .sort({ startDate: -1 });
    res.json(initiatives);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching initiatives', error: error.message });
  }
});

// GET single initiative by ID
router.get('/:id', async (req, res) => {
  try {
    const initiative = await Initiative.findById(req.params.id).populate('location');
    if (!initiative) {
      return res.status(404).json({ message: 'Initiative not found' });
    }
    res.json(initiative);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching initiative', error: error.message });
  }
});

// POST create new initiative
router.post('/', async (req, res) => {
  try {
    // Verify location exists
    const location = await Location.findById(req.body.location);
    if (!location) {
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    const initiative = new Initiative(req.body);
    const savedInitiative = await initiative.save();
    await savedInitiative.populate('location', 'name city state');
    res.status(201).json(savedInitiative);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating initiative', error: error.message });
  }
});

// PUT update initiative
router.put('/:id', async (req, res) => {
  try {
    // Verify location exists if being updated
    if (req.body.location) {
      const location = await Location.findById(req.body.location);
      if (!location) {
        return res.status(400).json({ message: 'Invalid location ID' });
      }
    }

    const initiative = await Initiative.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('location', 'name city state');

    if (!initiative) {
      return res.status(404).json({ message: 'Initiative not found' });
    }
    res.json(initiative);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating initiative', error: error.message });
  }
});

// DELETE initiative
router.delete('/:id', async (req, res) => {
  try {
    const initiative = await Initiative.findByIdAndDelete(req.params.id);
    if (!initiative) {
      return res.status(404).json({ message: 'Initiative not found' });
    }
    res.json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting initiative', error: error.message });
  }
});

module.exports = router;
