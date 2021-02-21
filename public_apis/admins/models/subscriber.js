const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    newsletter_id: {
      type: String,
      required: true
    },
    subscription_id: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      required: false
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: false
    },
    birthdate: {
      type: Date,
      required: false
    },
    privacy_acceptance: {
      type: Boolean,
      required: false
    }
  },
  { timestamps: true },
);

subscriberSchema.index({ subscription_id: 1 }, { unique: true });
subscriberSchema.index({ email: 1, newsletter_id: 1 });

module.exports = mongoose.model('subscriptions', subscriberSchema);
