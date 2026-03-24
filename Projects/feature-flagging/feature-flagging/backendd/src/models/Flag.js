const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SegmentRule = new Schema({
  attribute: String, // e.g. region, plan
  value: String      // e.g. EU, premium
});
const FlagSchema = new Schema({
  key: { type: String, unique: true, required: true },
  name: String,
  description: String,
  status: { type: String, enum: ['draft','active','archived'], default: 'draft' },
  enabled: { type: Boolean, default: false },
  rules: {
    percentage: { type: Number, default: 0 },
    segments: [ SegmentRule ] // simple list of rule objects
  },
  createdBy: String,
  updatedBy: String,
  version: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Flag', FlagSchema);