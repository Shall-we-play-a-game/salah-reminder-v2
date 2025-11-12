import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from '../models/City.js';
import { generateId } from '../utils/helpers.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'test_database';

// Curated list of major cities worldwide, with focus on Islamic countries
const cities = [
  // Middle East
  { name: 'Makkah', country: 'Saudi Arabia', country_code: 'SA', latitude: 21.4225, longitude: 39.8262, is_capital: false, population: 2042000 },
  { name: 'Madinah', country: 'Saudi Arabia', country_code: 'SA', latitude: 24.4672, longitude: 39.6111, is_capital: false, population: 1512000 },
  { name: 'Riyadh', country: 'Saudi Arabia', country_code: 'SA', latitude: 24.7136, longitude: 46.6753, is_capital: true, population: 7676000 },
  { name: 'Jeddah', country: 'Saudi Arabia', country_code: 'SA', latitude: 21.2854, longitude: 39.2376, is_capital: false, population: 4781000 },
  { name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', latitude: 25.2048, longitude: 55.2708, is_capital: false, population: 3411000 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', country_code: 'AE', latitude: 24.4539, longitude: 54.3773, is_capital: true, population: 1512000 },
  { name: 'Doha', country: 'Qatar', country_code: 'QA', latitude: 25.2867, longitude: 51.5333, is_capital: true, population: 2382000 },
  { name: 'Kuwait City', country: 'Kuwait', country_code: 'KW', latitude: 29.3759, longitude: 47.9774, is_capital: true, population: 4200000 },
  { name: 'Muscat', country: 'Oman', country_code: 'OM', latitude: 23.5880, longitude: 58.3829, is_capital: true, population: 1572000 },
  { name: 'Manama', country: 'Bahrain', country_code: 'BH', latitude: 26.2285, longitude: 50.5860, is_capital: true, population: 529000 },
  { name: 'Amman', country: 'Jordan', country_code: 'JO', latitude: 31.9454, longitude: 35.9284, is_capital: true, population: 4642000 },
  { name: 'Beirut', country: 'Lebanon', country_code: 'LB', latitude: 33.8886, longitude: 35.4955, is_capital: true, population: 2424000 },
  { name: 'Damascus', country: 'Syria', country_code: 'SY', latitude: 33.5138, longitude: 36.2765, is_capital: true, population: 2566000 },
  { name: 'Baghdad', country: 'Iraq', country_code: 'IQ', latitude: 33.3152, longitude: 44.3661, is_capital: true, population: 8126000 },
  { name: 'Tehran', country: 'Iran', country_code: 'IR', latitude: 35.6892, longitude: 51.3890, is_capital: true, population: 9500000 },
  { name: 'Jerusalem', country: 'Palestine', country_code: 'PS', latitude: 31.7683, longitude: 35.2137, is_capital: true, population: 936000 },
  { name: 'Sanaa', country: 'Yemen', country_code: 'YE', latitude: 15.3694, longitude: 44.1910, is_capital: true, population: 2957000 },
  
  // North Africa
  { name: 'Cairo', country: 'Egypt', country_code: 'EG', latitude: 30.0444, longitude: 31.2357, is_capital: true, population: 21300000 },
  { name: 'Alexandria', country: 'Egypt', country_code: 'EG', latitude: 31.2001, longitude: 29.9187, is_capital: false, population: 5484000 },
  { name: 'Casablanca', country: 'Morocco', country_code: 'MA', latitude: 33.5731, longitude: -7.5898, is_capital: false, population: 3752000 },
  { name: 'Rabat', country: 'Morocco', country_code: 'MA', latitude: 34.0209, longitude: -6.8416, is_capital: true, population: 580000 },
  { name: 'Algiers', country: 'Algeria', country_code: 'DZ', latitude: 36.7538, longitude: 3.0588, is_capital: true, population: 2768000 },
  { name: 'Tunis', country: 'Tunisia', country_code: 'TN', latitude: 36.8065, longitude: 10.1815, is_capital: true, population: 2290000 },
  { name: 'Tripoli', country: 'Libya', country_code: 'LY', latitude: 32.8872, longitude: 13.1913, is_capital: true, population: 1176000 },
  { name: 'Khartoum', country: 'Sudan', country_code: 'SD', latitude: 15.5007, longitude: 32.5599, is_capital: true, population: 6344000 },
  
  // South Asia
  { name: 'Islamabad', country: 'Pakistan', country_code: 'PK', latitude: 33.6844, longitude: 73.0479, is_capital: true, population: 1095000 },
  { name: 'Karachi', country: 'Pakistan', country_code: 'PK', latitude: 24.8607, longitude: 67.0011, is_capital: false, population: 16000000 },
  { name: 'Lahore', country: 'Pakistan', country_code: 'PK', latitude: 31.5497, longitude: 74.3436, is_capital: false, population: 13000000 },
  { name: 'Dhaka', country: 'Bangladesh', country_code: 'BD', latitude: 23.8103, longitude: 90.4125, is_capital: true, population: 22000000 },
  { name: 'Delhi', country: 'India', country_code: 'IN', latitude: 28.7041, longitude: 77.1025, is_capital: true, population: 32000000 },
  { name: 'Mumbai', country: 'India', country_code: 'IN', latitude: 19.0760, longitude: 72.8777, is_capital: false, population: 20400000 },
  { name: 'Hyderabad', country: 'India', country_code: 'IN', latitude: 17.3850, longitude: 78.4867, is_capital: false, population: 10500000 },
  { name: 'Kabul', country: 'Afghanistan', country_code: 'AF', latitude: 34.5553, longitude: 69.2075, is_capital: true, population: 4601000 },
  
  // Southeast Asia
  { name: 'Jakarta', country: 'Indonesia', country_code: 'ID', latitude: -6.2088, longitude: 106.8456, is_capital: true, population: 10770000 },
  { name: 'Kuala Lumpur', country: 'Malaysia', country_code: 'MY', latitude: 3.1390, longitude: 101.6869, is_capital: true, population: 8420000 },
  { name: 'Singapore', country: 'Singapore', country_code: 'SG', latitude: 1.3521, longitude: 103.8198, is_capital: true, population: 5454000 },
  { name: 'Brunei', country: 'Brunei', country_code: 'BN', latitude: 4.9031, longitude: 114.9398, is_capital: true, population: 100000 },
  
  // Turkey & Central Asia
  { name: 'Istanbul', country: 'Turkey', country_code: 'TR', latitude: 41.0082, longitude: 28.9784, is_capital: false, population: 15460000 },
  { name: 'Ankara', country: 'Turkey', country_code: 'TR', latitude: 39.9334, longitude: 32.8597, is_capital: true, population: 5700000 },
  { name: 'Tashkent', country: 'Uzbekistan', country_code: 'UZ', latitude: 41.2995, longitude: 69.2401, is_capital: true, population: 2500000 },
  { name: 'Almaty', country: 'Kazakhstan', country_code: 'KZ', latitude: 43.2220, longitude: 76.8512, is_capital: false, population: 2000000 },
  { name: 'Baku', country: 'Azerbaijan', country_code: 'AZ', latitude: 40.4093, longitude: 49.8671, is_capital: true, population: 2300000 },
  
  // Europe & Americas
  { name: 'London', country: 'United Kingdom', country_code: 'GB', latitude: 51.5074, longitude: -0.1278, is_capital: true, population: 9000000 },
  { name: 'Paris', country: 'France', country_code: 'FR', latitude: 48.8566, longitude: 2.3522, is_capital: true, population: 11000000 },
  { name: 'Berlin', country: 'Germany', country_code: 'DE', latitude: 52.5200, longitude: 13.4050, is_capital: true, population: 3500000 },
  { name: 'New York', country: 'United States', country_code: 'US', latitude: 40.7128, longitude: -74.0060, is_capital: false, population: 8300000 },
  { name: 'Los Angeles', country: 'United States', country_code: 'US', latitude: 34.0522, longitude: -118.2437, is_capital: false, population: 3900000 },
  { name: 'Chicago', country: 'United States', country_code: 'US', latitude: 41.8781, longitude: -87.6298, is_capital: false, population: 2700000 },
  { name: 'Toronto', country: 'Canada', country_code: 'CA', latitude: 43.6532, longitude: -79.3832, is_capital: false, population: 6200000 },
  { name: 'Sydney', country: 'Australia', country_code: 'AU', latitude: -33.8688, longitude: 151.2093, is_capital: false, population: 5300000 }
];

const seedCities = async () => {
  try {
    await mongoose.connect(`${MONGO_URL}/${DB_NAME}`);
    console.log('Connected to MongoDB');

    // Clear existing cities
    await City.deleteMany({});
    console.log('Cleared existing cities');

    // Insert cities
    const cityDocuments = cities.map(city => ({
      id: generateId(),
      ...city
    }));

    await City.insertMany(cityDocuments);
    console.log(`✅ Seeded ${cityDocuments.length} cities successfully`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding cities:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCities();
