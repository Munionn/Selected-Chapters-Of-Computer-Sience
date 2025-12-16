import mongoose, { Document, Schema } from 'mongoose';

export interface IPizza extends Document {
  name: string;
  description: string;
  basePrice: number;
  image: string;
  ingredients: mongoose.Types.ObjectId[];
  category: 'classic' | 'premium' | 'vegetarian' | 'spicy' | 'custom';
  isAvailable: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const pizzaSchema = new Schema<IPizza>({
  name: {
    type: String,
    required: [true, 'Pizza name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  ingredients: [{
    type: Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  }],
  category: {
    type: String,
    enum: ['classic', 'premium', 'vegetarian', 'spicy', 'custom'],
    required: [true, 'Category is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IPizza>('Pizza', pizzaSchema);

