import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'assistant_admin'],
      default: 'member'
    }
  }],
  minContribution: {
    type: Number,
    required: true,
    default: 10000, // 10,000 UGX minimum
    min: [10000, 'Minimum contribution must be at least 10,000 UGX']
  },
  contributionMultiple: {
    type: Number,
    required: true,
    default: 10000, // Multiples of 10,000 UGX
    min: [10000, 'Contribution multiple must be at least 10,000 UGX']
  },
  currency: {
    type: String,
    default: 'UGX'
  },
  meetingSchedule: {
    type: String,
    trim: true
  },
  totalBalance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFlexibleContributions: {
      type: Boolean,
      default: true
    },
    autoApproveMembers: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Add admin as first member when group is created
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.admin,
      role: 'member'
    });
  }
  next();
});

// Method to check if contribution amount is valid
groupSchema.methods.isValidContribution = function(amount) {
  return amount >= this.minContribution && amount % this.contributionMultiple === 0;
};

// Method to add member to group
groupSchema.methods.addMember = function(userId) {
  if (!this.members.some(member => member.user.toString() === userId.toString())) {
    this.members.push({ user: userId });
    return true;
  }
  return false;
};

export default mongoose.model('Group', groupSchema);