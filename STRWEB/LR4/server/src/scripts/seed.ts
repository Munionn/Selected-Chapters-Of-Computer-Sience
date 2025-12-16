import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Pizza from '../models/Pizza';
import Ingredient from '../models/Ingredient';
import Order from '../models/Order';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzeria');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Pizza.deleteMany({});
    await Ingredient.deleteMany({});
    await Order.deleteMany({});

    // Create ingredients
    const ingredients = await Ingredient.insertMany([
      { name: 'Mozzarella', category: 'cheese', price: 2.5, isAvailable: true },
      { name: 'Parmesan', category: 'cheese', price: 3.0, isAvailable: true },
      { name: 'Gorgonzola', category: 'cheese', price: 3.5, isAvailable: true },
      { name: 'Pepperoni', category: 'meat', price: 4.0, isAvailable: true },
      { name: 'Ham', category: 'meat', price: 3.5, isAvailable: true },
      { name: 'Chicken', category: 'meat', price: 4.5, isAvailable: true },
      { name: 'Bacon', category: 'meat', price: 4.0, isAvailable: true },
      { name: 'Tomatoes', category: 'vegetables', price: 1.5, isAvailable: true },
      { name: 'Mushrooms', category: 'vegetables', price: 2.0, isAvailable: true },
      { name: 'Bell Peppers', category: 'vegetables', price: 2.0, isAvailable: true },
      { name: 'Onions', category: 'vegetables', price: 1.5, isAvailable: true },
      { name: 'Olives', category: 'vegetables', price: 2.5, isAvailable: true },
      { name: 'Basil', category: 'spices', price: 1.0, isAvailable: true },
      { name: 'Oregano', category: 'spices', price: 1.0, isAvailable: true },
      { name: 'Garlic', category: 'spices', price: 1.0, isAvailable: true },
      { name: 'Tomato Sauce', category: 'sauce', price: 1.5, isAvailable: true },
      { name: 'Pesto', category: 'sauce', price: 2.5, isAvailable: true },
      { name: 'Alfredo Sauce', category: 'sauce', price: 2.0, isAvailable: true }
    ]);

    console.log(`Created ${ingredients.length} ingredients`);

    // Create pizzas
    const pizzas = await Pizza.insertMany([
      {
        name: 'Margherita',
        description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
        basePrice: 12.99,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        ingredients: [ingredients[0]._id, ingredients[15]._id, ingredients[12]._id],
        category: 'classic',
        isAvailable: true,
        rating: 4.8
      },
      {
        name: 'Pepperoni',
        description: 'Traditional pepperoni pizza with mozzarella cheese',
        basePrice: 15.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        ingredients: [ingredients[0]._id, ingredients[3]._id, ingredients[15]._id],
        category: 'classic',
        isAvailable: true,
        rating: 4.9
      },
      {
        name: 'Quattro Formaggi',
        description: 'Four cheese pizza with mozzarella, parmesan, gorgonzola, and ricotta',
        basePrice: 18.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        ingredients: [ingredients[0]._id, ingredients[1]._id, ingredients[2]._id],
        category: 'premium',
        isAvailable: true,
        rating: 4.7
      },
      {
        name: 'Hawaiian',
        description: 'Ham and pineapple pizza with mozzarella',
        basePrice: 16.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        ingredients: [ingredients[0]._id, ingredients[4]._id, ingredients[15]._id],
        category: 'premium',
        isAvailable: true,
        rating: 4.5
      },
      {
        name: 'Vegetarian Delight',
        description: 'Fresh vegetables with mozzarella and tomato sauce',
        basePrice: 14.99,
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500',
        ingredients: [ingredients[0]._id, ingredients[7]._id, ingredients[8]._id, ingredients[9]._id, ingredients[10]._id, ingredients[11]._id],
        category: 'vegetarian',
        isAvailable: true,
        rating: 4.6
      },
      {
        name: 'Spicy Chicken',
        description: 'Spicy chicken with jalapeños and mozzarella',
        basePrice: 17.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        ingredients: [ingredients[0]._id, ingredients[5]._id, ingredients[15]._id],
        category: 'spicy',
        isAvailable: true,
        rating: 4.8
      },
      {
        name: 'BBQ Chicken',
        description: 'BBQ chicken pizza with red onions and mozzarella',
        basePrice: 18.99,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561b1e?w=500',
        ingredients: [ingredients[0]._id, ingredients[5]._id, ingredients[10]._id],
        category: 'premium',
        isAvailable: true,
        rating: 4.7
      },
      {
        name: 'Meat Lovers',
        description: 'Pepperoni, ham, bacon, and chicken with mozzarella',
        basePrice: 19.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        ingredients: [ingredients[0]._id, ingredients[3]._id, ingredients[4]._id, ingredients[6]._id, ingredients[5]._id],
        category: 'premium',
        isAvailable: true,
        rating: 4.9
      },
      {
        name: 'Pesto Special',
        description: 'Pesto sauce with mozzarella, tomatoes, and basil',
        basePrice: 16.99,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        ingredients: [ingredients[0]._id, ingredients[16]._id, ingredients[7]._id, ingredients[12]._id],
        category: 'premium',
        isAvailable: true,
        rating: 4.6
      },
      {
        name: 'Mushroom Supreme',
        description: 'Mixed mushrooms with mozzarella and garlic',
        basePrice: 15.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        ingredients: [ingredients[0]._id, ingredients[8]._id, ingredients[14]._id, ingredients[15]._id],
        category: 'vegetarian',
        isAvailable: true,
        rating: 4.5
      },
      {
        name: 'Capricciosa',
        description: 'Ham, mushrooms, artichokes, and olives',
        basePrice: 17.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        ingredients: [ingredients[0]._id, ingredients[4]._id, ingredients[8]._id, ingredients[11]._id, ingredients[15]._id],
        category: 'classic',
        isAvailable: true,
        rating: 4.7
      },
      {
        name: 'Diavola',
        description: 'Spicy salami with mozzarella and chili peppers',
        basePrice: 16.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        ingredients: [ingredients[0]._id, ingredients[3]._id, ingredients[15]._id],
        category: 'spicy',
        isAvailable: true,
        rating: 4.8
      }
    ]);

    console.log(`Created ${pizzas.length} pizzas`);

    // Create admin user
    const admin = await User.create({
      email: 'admin@pizzeria.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });

    // Create regular user
    const user = await User.create({
      email: 'user@pizzeria.com',
      password: 'user123',
      name: 'Regular User',
      role: 'user'
    });

    console.log('Created admin and user accounts');
    console.log('Admin: admin@pizzeria.com / admin123');
    console.log('User: user@pizzeria.com / user123');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

