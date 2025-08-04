const express = require('express');
const Location = require('../models/Location');
const Initiative = require('../models/Initiative');

const router = express.Router();

// GET all locations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const locations = await Location.find(query)
      .populate('initiatives')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Location.countDocuments(query);

    res.json({
      locations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

// GET single location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('initiatives');
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location', error: error.message });
  }
});

// POST create new location
router.post('/', async (req, res) => {
  try {
    const location = new Location(req.body);
    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
});

// PUT update location
router.put('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
});

// DELETE location
router.delete('/:id', async (req, res) => {
  try {
    // Check if location has associated initiatives
    const initiativeCount = await Initiative.countDocuments({ location: req.params.id });
    if (initiativeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete location with associated initiatives',
        initiativeCount 
      });
    }

    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
});

module.exports = router;
