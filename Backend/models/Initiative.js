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
    enum: ['Education', 'Healthcare', 'Environment', 'Technology', 'Community', 'Other'],
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
  }
}, {
  timestamps: true
});

// Index for better query performance
initiativeSchema.index({ location: 1, status: 1 });
initiativeSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Initiative', initiativeSchema);
