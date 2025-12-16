import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  category: 'cheese' | 'meat' | 'vegetables' | 'sauce' | 'spices' | 'other';
  price: number;
  image?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['cheese', 'meat', 'vegetables', 'sauce', 'spices', 'other'],
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IIngredient>('Ingredient', ingredientSchema);

