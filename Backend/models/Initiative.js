const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Initiative title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    enum: [
      'Batching Plant',
      'Blasting',
      'BOCW Act',
      'CLRA Licence',
      'Crusher',
      'DG Set',
      'Employees Compensation Policy',
      'Environment Clearance',
      'Extraction of Ground Water',
      'Factories approval',
      'FSSAI license',
      'Hot Mix Plant',
      'ISMW',
      'Mining Clearance',
      'Petrol/Diesel Browser',
      'Petrol Pump Station',
      'PT Registration',
      'Shop & Establishment',
      'Tree Cutting',
      'Wet Mix Plant',
      'Environmental Clearance',
      'Forest Clearance',
      'Land Acquisition',
      'Safety Permits',
      'Education',
      'Healthcare',
      'Environment',
      'Technology',
      'Community',
      'Other'
    ]
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Environmental', 'Safety', 'Legal', 'Financial', 'Operational', 'Education', 'Healthcare', 'Technology', 'Community', 'Other'],
    default: 'Environmental'
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Planning'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  participants: {
    type: Number,
    min: [0, 'Participants cannot be negative'],
    default: 0
  },
  contactPerson: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  typeOfPermission: {
    type: String,
    enum: [
      'Consent to Establish',
      'Consent to Operate',
      'Insurance',
      'NOC',
      'NOC/Permission from client',
      'Permission',
      'blank',
      'Government Approval',
      'Environmental Permit',
      'Construction License',
      'Operational Permit',
      'Not Applicable'
    ],
    default: 'Not Applicable'
  },
  agency: {
    type: String,
    enum: [
      'Chief Controller of Explosives',
      'DEIAA/SEIAA',
      'Factories Department',
      'Forest Department',
      'Government/Private',
      'Labour Department Authority',
      'MOEFCC',
      'State Pollution Control Board',
      'State Water Department',
      'The Food Safety and Standards Authority of India',
      'Ministry of Environment',
      'Municipal Corporation',
      'State Government',
      'Central Government',
      'Not Applicable'
    ],
    trim: true,
    default: 'Not Applicable'
  },
  applicable: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  registrationInfo: {
    registered: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    licenseNumber: {
      type: String,
      trim: true,
      sparse: true
    },
    validity: {
      type: Date,
      validate: {
        validator: function(value) {
          // Allow null/undefined values or dates in the future
          if (!value) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day for comparison
          const validityDate = new Date(value);
          validityDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
          return validityDate >= today;
        },
        message: 'Validity date must be today or in the future'
      }
    },
    quantity: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    }
  },
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Pending Review', 'In Progress'],
    default: 'Pending Review'
  },
  lastComplianceCheck: {
    type: Date
  },
  nextComplianceReview: {
    type: Date
  },
  // Add new tracking fields
  statusCounts: {
    planning: {
      type: Number,
      default: 0,
      min: 0
    },
    active: {
      type: Number,
      default: 0,
      min: 0
    },
    completed: {
      type: Number,
      default: 0,
      min: 0
    },
    onHold: {
      type: Number,
      default: 0,
      min: 0
    },
    cancelled: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  projectPhase: {
    type: String,
    enum: ['Initial', 'Design', 'Execution', 'Monitoring', 'Closure'],
    default: 'Initial'
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

initiativeSchema.index({ location: 1, status: 1 });
initiativeSchema.index({ startDate: 1, endDate: 1 });
initiativeSchema.index({ 'registrationInfo.validity': 1, complianceStatus: 1 });
initiativeSchema.index({ agency: 1, typeOfPermission: 1 });

initiativeSchema.virtual('isExpiringRegistration').get(function() {
  if (!this.registrationInfo?.validity) return false;
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  return this.registrationInfo.validity <= thirtyDaysFromNow;
});

// Add virtual for total initiatives count
initiativeSchema.virtual('totalInitiatives').get(function() {
  if (!this.statusCounts) return 0;
  return Object.values(this.statusCounts).reduce((sum, count) => sum + count, 0);
});

// Add virtual for completion rate
initiativeSchema.virtual('completionRate').get(function() {
  if (!this.statusCounts || this.totalInitiatives === 0) return 0;
  return Math.round((this.statusCounts.completed / this.totalInitiatives) * 100);
});

// Add virtual for risk score calculation
initiativeSchema.virtual('riskScore').get(function() {
  const riskValues = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const phaseMultipliers = { Initial: 0.5, Design: 0.7, Execution: 1.0, Monitoring: 0.8, Closure: 0.3 };
  
  const baseRisk = riskValues[this.riskLevel] || 1;
  const phaseMultiplier = phaseMultipliers[this.projectPhase] || 1;
  const complianceBonus = this.complianceScore > 80 ? 0.8 : 1;
  
  return Math.round(baseRisk * phaseMultiplier * complianceBonus * 10) / 10;
});

module.exports = mongoose.model('Initiative', initiativeSchema);
