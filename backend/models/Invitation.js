import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  method: {
    type: String,
    enum: ['sms', 'whatsapp', 'link'],
    default: 'sms'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'accepted', 'expired', 'failed'],
    default: 'pending'
  },
  messageId: {
    type: String
  },
  error: {
    type: String
  },
  sentAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
invitationSchema.index({ group: 1, status: 1 });
invitationSchema.index({ phone: 1, status: 1 });

export default mongoose.model('Invitation', invitationSchema);