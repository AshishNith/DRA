const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/login - Create or update user on login
router.post('/login', async (req, res) => {
  try {
    const { uid, name, email, imageURL } = req.body;

    // Validate required fields
    if (!uid || !name || !email) {
      return res.status(400).json({
        success: false,
        error: 'UID, name, and email are required'
      });
    }

    // Find or create user
    const user = await User.findOrCreate({
      uid,
      name,
      email,
      imageURL: imageURL || ''
    });

    res.status(200).json({
      success: true,
      data: user,
      message: user.createdAt === user.updatedAt ? 'User created successfully' : 'User updated successfully'
    });

  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process user login'
    });
  }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// GET /api/users/stats/overview - Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

// GET /api/users/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      usersData,
      initiativesData,
      locationsData,
      complianceData
    ] = await Promise.all([
      User.aggregate([
        { $group: { 
          _id: null, 
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }}
      ]),
      require('../models/Initiative').aggregate([
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }}
      ]),
      require('../models/Location').countDocuments({ isActive: true }),
      require('../models/Compliance').aggregate([
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 }
        }}
      ])
    ]);

    // Process the data
    const userStats = usersData[0] || { totalUsers: 0, activeUsers: 0 };
    
    const initiativeStats = initiativesData.reduce((acc, item) => {
      acc[item._id] = item.count;
      acc.totalBudget = (acc.totalBudget || 0) + (item.totalBudget || 0);
      return acc;
    }, {});

    const complianceStats = complianceData.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const overview = {
      totalUsers: userStats.totalUsers,
      totalInitiatives: Object.values(initiativeStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0),
      totalLocations: locationsData,
      totalCompliance: Object.values(complianceStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0),
      activeInitiatives: initiativeStats.Active || 0,
      completedInitiatives: initiativeStats.Completed || 0,
      planningInitiatives: initiativeStats.Planning || 0,
      pendingCompliance: complianceStats['Pending Review'] || 0,
      overdueCompliance: complianceStats['Non-Compliant'] || 0,
      totalBudget: initiativeStats.totalBudget || 0,
      monthlyGrowth: 5 // This would be calculated from historical data
    };

    const completionRates = {
      initiatives: overview.totalInitiatives > 0 ? Math.round((overview.completedInitiatives / overview.totalInitiatives) * 100) : 0,
      compliance: overview.totalCompliance > 0 ? Math.round(((complianceStats.Compliant || 0) / overview.totalCompliance) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        overview,
        completionRates,
        recentActivities: [],
        locationStats: []
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// GET /api/users/:uid - Get user by UID
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid }).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// PUT /api/users/:uid - Update user
router.put('/:uid', async (req, res) => {
  try {
    const { name, email, imageURL, role, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (imageURL !== undefined) updateData.imageURL = imageURL;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user'
    });
  }
});

// DELETE /api/users/:uid - Soft delete user
router.delete('/:uid', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { isActive: false },
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    });
  }
});

module.exports = router;
