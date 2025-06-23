import { Schema, model } from 'mongoose';

const markerSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  private: { type: Boolean, default: false },
  fileUrls: { type: [String], default: [] },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Marker = model('markers', markerSchema);

export default Marker;
