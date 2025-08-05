const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  imageURL: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ uid: 1 });
userSchema.index({ email: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function(userData) {
  try {
    let user = await this.findOne({ uid: userData.uid });
    
    if (!user) {
      // Create new user
      user = new this({
        ...userData,
        lastLogin: new Date()
      });
      await user.save();
      console.log(`New user created: ${userData.email}`);
    } else {
      // Update existing user info and last login
      const updateFields = {
        name: userData.name,
        email: userData.email,
        lastLogin: new Date()
      };
      
      // Only update imageURL if provided and different
      if (userData.imageURL && userData.imageURL !== user.imageURL) {
        updateFields.imageURL = userData.imageURL;
      }
      
      Object.assign(user, updateFields);
      await user.save();
      console.log(`User updated: ${userData.email}`);
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreate:', error);
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

module.exports = mongoose.model('User', userSchema);
