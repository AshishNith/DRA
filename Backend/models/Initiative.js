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
    enum: ['Environmental Clearance', 'Forest Clearance', 'Land Acquisition', 'Safety Permits', 'Education', 'Healthcare', 'Environment', 'Technology', 'Community', 'Other']
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
    default: 'Other'
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
    enum: ['Government Approval', 'Environmental Permit', 'Construction License', 'Operational Permit', 'Not Applicable'],
    default: 'Not Applicable'
  },
  agency: {
    type: String,
    enum: ['Ministry of Environment', 'Forest Department', 'Municipal Corporation', 'State Government', 'Central Government', 'Not Applicable'],
    trim: true
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

module.exports = mongoose.model('Initiative', initiativeSchema);
