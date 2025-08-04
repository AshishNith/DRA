const express = require('express');
const Compliance = require('../models/Compliance');
const Location = require('../models/Location');

const router = express.Router();

// GET all compliance items
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 1000, 
      search, 
      status, 
      category, 
      priority, 
      location, 
      expiring 
    } = req.query;
    
    const query = {};
    
    // Add filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (location) query.location = location;
    
    // Handle expiring filter
    if (expiring === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.dueDate = { $lte: thirtyDaysFromNow };
      query.status = { $ne: 'Compliant' };
    }

    const compliance = await Compliance.find(query)
      .populate('location', 'name city state address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Compliance.countDocuments(query);

    res.json({
      success: true,
      data: {
        compliance,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET compliance by ID
router.get('/:id', async (req, res) => {
  try {
    const compliance = await Compliance.findById(req.params.id)
      .populate('location', 'name city state address');
    
    if (!compliance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Compliance item not found' 
      });
    }

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET compliance by location
router.get('/location/:locationId', async (req, res) => {
  try {
    const compliance = await Compliance.find({ location: req.params.locationId })
      .populate('location', 'name city state address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET expiring compliance
router.get('/expiring/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const compliance = await Compliance.find({
      dueDate: { $lte: futureDate },
      status: { $ne: 'Compliant' },
      isActive: true
    })
    .populate('location', 'name city state address')
    .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET compliance stats
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Compliance.countDocuments({ isActive: true });
    const compliant = await Compliance.countDocuments({ status: 'Compliant', isActive: true });
    const nonCompliant = await Compliance.countDocuments({ status: 'Non-Compliant', isActive: true });
    const pending = await Compliance.countDocuments({ status: 'Pending Review', isActive: true });
    const inProgress = await Compliance.countDocuments({ status: 'In Progress', isActive: true });
    
    // Get expiring compliance (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiring = await Compliance.countDocuments({
      dueDate: { $lte: thirtyDaysFromNow },
      status: { $ne: 'Compliant' },
      isActive: true
    });

    // Get overdue compliance
    const today = new Date();
    const overdue = await Compliance.countDocuments({
      dueDate: { $lt: today },
      status: { $ne: 'Compliant' },
      isActive: true
    });

    const stats = {
      total,
      compliant,
      nonCompliant,
      pending,
      inProgress,
      expiring,
      overdue,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST create new compliance
router.post('/', async (req, res) => {
  try {
    // Verify location exists
    const location = await Location.findById(req.body.location);
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid location ID' 
      });
    }

    const compliance = new Compliance(req.body);
    const savedCompliance = await compliance.save();
    await savedCompliance.populate('location', 'name city state address');

    res.status(201).json({
      success: true,
      data: savedCompliance
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT update compliance
router.put('/:id', async (req, res) => {
  try {
    // Verify location exists if being updated
    if (req.body.location) {
      const location = await Location.findById(req.body.location);
      if (!location) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid location ID' 
        });
      }
    }

    const compliance = await Compliance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('location', 'name city state address');

    if (!compliance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Compliance item not found' 
      });
    }

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT update compliance requirement
router.put('/:complianceId/requirements/:requirementId', async (req, res) => {
  try {
    const compliance = await Compliance.findById(req.params.complianceId);
    if (!compliance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Compliance item not found' 
      });
    }

    const requirement = compliance.requirements.id(req.params.requirementId);
    if (!requirement) {
      return res.status(404).json({ 
        success: false, 
        error: 'Requirement not found' 
      });
    }

    // Update requirement fields
    Object.assign(requirement, req.body);
    
    await compliance.save();
    await compliance.populate('location', 'name city state address');

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE compliance
router.delete('/:id', async (req, res) => {
  try {
    const compliance = await Compliance.findByIdAndDelete(req.params.id);
    if (!compliance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Compliance item not found' 
      });
    }

    res.json({
      success: true,
      message: 'Compliance item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
