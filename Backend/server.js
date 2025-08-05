const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const locationRoutes = require('./routes/locationRoutes');
const initiativeRoutes = require('./routes/initiativeRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const usersRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://dra-phi.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dra_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/users', usersRoutes);

// Add dashboard stats route
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Initiative = require('./models/Initiative');
    const Location = require('./models/Location');
    
    const [
      usersData,
      initiativesData,
      locationsData
    ] = await Promise.all([
      User.aggregate([
        { $group: { 
          _id: null, 
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }}
      ]),
      Initiative.aggregate([
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }}
      ]),
      Location.countDocuments({ isActive: true })
    ]);

    // Process the data
    const userStats = usersData[0] || { totalUsers: 0, activeUsers: 0 };
    
    const initiativeStats = initiativesData.reduce((acc, item) => {
      acc[item._id] = item.count;
      acc.totalBudget = (acc.totalBudget || 0) + (item.totalBudget || 0);
      return acc;
    }, {});

    const overview = {
      totalUsers: userStats.totalUsers,
      totalInitiatives: Object.values(initiativeStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0),
      totalLocations: locationsData,
      activeInitiatives: initiativeStats.Active || 0,
      completedInitiatives: initiativeStats.Completed || 0,
      planningInitiatives: initiativeStats.Planning || 0,
      totalBudget: initiativeStats.totalBudget || 0,
      monthlyGrowth: 5 // This would be calculated from historical data
    };

    const completionRates = {
      initiatives: overview.totalInitiatives > 0 ? Math.round((overview.completedInitiatives / overview.totalInitiatives) * 100) : 0
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

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'DRA Backend API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
