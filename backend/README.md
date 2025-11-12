# Salah Reminder Backend - MVC Architecture

## Overview
This is a Node.js/Express backend for the Salah Reminder application, following industry-standard MVC (Model-View-Controller) architecture.

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── models/
│   ├── User.js              # User schema (users, admins, superadmins)
│   ├── Mosque.js            # Mosque schema
│   ├── PrayerTime.js        # Prayer times schema
│   └── Post.js              # Community posts schema
├── controllers/
│   ├── authController.js    # Authentication logic (register, login)
│   ├── mosqueController.js  # Mosque CRUD operations
│   ├── userController.js    # User management operations
│   ├── prayerTimeController.js # Prayer times operations
│   └── postController.js    # Community posts operations
├── routes/
│   ├── authRoutes.js        # /api/auth/* routes
│   ├── mosqueRoutes.js      # /api/mosques/* routes
│   ├── userRoutes.js        # /api/users/* routes
│   ├── prayerTimeRoutes.js  # /api/prayer-times/* routes
│   └── postRoutes.js        # /api/posts/* routes
├── middleware/
│   └── upload.js            # Multer file upload configuration
├── utils/
│   └── helpers.js           # Helper functions (generateId, hash/verify password)
├── server.js                # Main application entry point
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **Authentication**: bcryptjs for password hashing
- **External API**: Aladhan API for prayer times

## API Routes

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user or admin
- `POST /api/auth/login` - User login

### Mosques (`/api/mosques`)
- `GET /api/mosques` - Get all mosques (supports search, sort & city filter)
- `GET /api/mosques/search-external?lat=&lng=&radius=` - Search mosques from external API (MasjidiAPI)
- `GET /api/mosques/api-status` - Check external API configuration status
- `GET /api/mosques/:mosque_id` - Get specific mosque
- `POST /api/mosques` - Create new mosque
- `POST /api/mosques/:mosque_id/donation-qr` - Upload donation QR code

### Cities (`/api/cities`) **NEW**
- `GET /api/cities` - Get all cities (sorted A-Z by default)
- `GET /api/cities/search?name=cityname&country=countryname` - Search cities
- `GET /api/cities/country/:countryName` - Get cities by country

### Users (`/api/users`)
- `GET /api/users/pending` - Get pending admin approvals
- `GET /api/users/:user_id/id-proof` - Get user ID proof
- `PATCH /api/users/:user_id/status` - Update user status
- `POST /api/users/:user_id/favorites/:mosque_id` - Add favorite mosque
- `DELETE /api/users/:user_id/favorites/:mosque_id` - Remove favorite mosque
- `GET /api/users/:user_id/favorites` - Get user's favorite mosques

### Prayer Times (`/api/prayer-times`)
- `GET /api/prayer-times/:mosque_id` - Get prayer times (from cache, API, or manual)
- `POST /api/prayer-times` - Set manual prayer times

### Posts (`/api/posts`)
- `GET /api/posts` - Get posts (supports filtering, search & sort)
- `POST /api/posts` - Create new post
- `GET /api/posts/pending` - Get pending posts for approval
- `PATCH /api/posts/:post_id/status` - Update post status
- `PATCH /api/posts/:post_id` - Update post
- `DELETE /api/posts/:post_id` - Delete post

## Features

### Search & Sort
- **Mosques**: Search by name, sort by name/city/country
- **Posts**: Search by title, sort by created_at/title/event_start_date

### Advanced Filtering
- **Posts**: Filter by scope (mosque/city/country), status, city, country

### File Uploads
- ID proof for admin registration
- Donation QR codes for mosques
- Images for community posts

### Role-Based Access
- **User**: View mosques, prayer times, posts, manage favorites
- **Admin**: Manage mosque, create posts, set prayer times
- **Superadmin**: Approve admins, manage all mosques and posts

## Environment Variables

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```

## Running the Application

```bash
# Install dependencies
yarn install

# Start the server
node server.js
# or with supervisor
sudo supervisorctl start backend
```

The server runs on port `8001` and binds to `0.0.0.0`.

## Database Schema

### User
- id, email, password_hash, role, mosque_id, id_proof, favorite_mosques, status, created_at

### Mosque
- id, name, phone, alternate_phone, address, district, city, state, country, latitude, longitude, donation_qr_code, created_at

### PrayerTime
- id, mosque_id, date, fajr, dhuhr, asr, maghrib, isha, is_manual, created_at

### Post
- id, mosque_id, admin_id, title, content, image, scope, city, country, event_start_date, event_end_date, status, created_at

## Migration Notes

This backend was refactored from a monolithic `server.js` file (673 lines) to a clean MVC architecture with:
- Separated concerns (models, controllers, routes)
- Reusable middleware
- Utility functions
- Better maintainability and scalability

All functionality has been preserved and thoroughly tested.
