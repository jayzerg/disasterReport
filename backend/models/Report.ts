import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  type: 'earthquake' | 'storm' | 'flood' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  imageUrl?: string;
  verified: boolean;
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['earthquake', 'storm', 'flood', 'landslide']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  location: {
    type: {
      type: String,
      required: true,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  imageUrl: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index on location
ReportSchema.index({ location: '2dsphere' });

export default mongoose.model<IReport>('Report', ReportSchema);