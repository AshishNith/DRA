const mongoose = require('mongoose');

const complianceRequirementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Requirement title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Pending Review', 'In Progress'],
    default: 'Pending Review'
  },
  dueDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  }
});

const complianceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Compliance title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Environmental', 'Safety', 'Legal', 'Financial', 'Operational', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Pending Review', 'In Progress'],
    default: 'Pending Review'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  lastReviewDate: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  },
  assignedTo: {
    type: String,
    trim: true
  },
  requirements: [complianceRequirementSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
complianceSchema.index({ location: 1, status: 1 });
complianceSchema.index({ dueDate: 1, status: 1 });
complianceSchema.index({ category: 1, priority: 1 });

// Virtual to check if compliance is expiring
complianceSchema.virtual('isExpiring').get(function() {
  if (!this.dueDate) return false;
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  return this.dueDate <= thirtyDaysFromNow && this.status !== 'Compliant';
});

module.exports = mongoose.model('Compliance', complianceSchema);
