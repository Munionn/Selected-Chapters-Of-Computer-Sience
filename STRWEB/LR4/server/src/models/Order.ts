import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  pizza: mongoose.Types.ObjectId;
  customIngredients?: mongoose.Types.ObjectId[];
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'packaging' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  courierLocation?: {
    lat: number;
    lng: number;
  };
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  pizza: {
    type: Schema.Types.ObjectId,
    ref: 'Pizza',
    required: true
  },
  customIngredients: [{
    type: Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'packaging', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true
  },
  courierLocation: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  estimatedDeliveryTime: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', orderSchema);

