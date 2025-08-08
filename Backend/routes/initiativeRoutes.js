const express = require('express');
const Initiative = require('../models/Initiative');
const Location = require('../models/Location');

const router = express.Router();

// GET all initiatives
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 1000, location, status, category, search } = req.query;
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
      .populate('location', 'name city state address zipCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Return direct array for compatibility
    res.json(initiatives);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching initiatives', 
      error: error.message 
    });
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
    console.log('Received initiative data:', JSON.stringify(req.body, null, 2));
    
    // Verify location exists
    if (!req.body.location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location is required' 
      });
    }

    const location = await Location.findById(req.body.location);
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid location ID' 
      });
    }

    // Set default values and ensure required fields are present
    const initiativeData = {
      title: req.body.title || '',
      description: req.body.description || '',
      location: req.body.location,
      category: req.body.category || 'Other',
      status: req.body.status || 'Planning',
      startDate: req.body.startDate || new Date().toISOString().split('T')[0],
      endDate: req.body.endDate || null,
      budget: req.body.budget || 0,
      participants: req.body.participants || 0,
      typeOfPermission: req.body.typeOfPermission || 'Not Applicable',
      agency: req.body.agency || 'Not Applicable',
      applicable: req.body.applicable || 'No',
      registrationInfo: {
        registered: req.body.registrationInfo?.registered || 'No',
        licenseNumber: req.body.registrationInfo?.licenseNumber || '',
        validity: req.body.registrationInfo?.validity ? 
          (req.body.registrationInfo.validity === '' ? null : new Date(req.body.registrationInfo.validity)) : 
          null,
        quantity: req.body.registrationInfo?.quantity || '',
        remarks: req.body.registrationInfo?.remarks || ''
      },
      contactPerson: {
        name: req.body.contactPerson?.name || '',
        email: req.body.contactPerson?.email || '',
        phone: req.body.contactPerson?.phone || ''
      },
      complianceStatus: req.body.complianceStatus || 'Pending Review',
      // Add new tracking fields
      statusCounts: {
        planning: req.body.statusCounts?.planning || 0,
        active: req.body.statusCounts?.active || 0,
        completed: req.body.statusCounts?.completed || 0,
        onHold: req.body.statusCounts?.onHold || 0,
        cancelled: req.body.statusCounts?.cancelled || 0
      },
      projectPhase: req.body.projectPhase || 'Initial',
      riskLevel: req.body.riskLevel || 'Low',
      complianceScore: req.body.complianceScore || 0,
      lastUpdated: req.body.lastUpdated ? new Date(req.body.lastUpdated) : new Date(),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    console.log('Processing initiative data:', JSON.stringify(initiativeData, null, 2));

    const initiative = new Initiative(initiativeData);
    const savedInitiative = await initiative.save();
    
    // Populate location data before sending response
    await savedInitiative.populate('location', 'name city state address zipCode');
    
    console.log('Initiative created successfully:', savedInitiative._id);
    res.status(201).json(savedInitiative);
  } catch (error) {
    console.error('Initiative creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationErrors,
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error creating initiative', 
      error: error.message 
    });
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
    ).populate('location', 'name city state address zipCode');

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
