# Salah Reminder Application

A beautiful Islamic-inspired salah (prayer) reminder application with mosque management, prayer times, donation system, and community feed.

## 🕌 Features

### User Features (No Login Required)
- **Prayer Times Display**: Automatically fetches prayer times using Aladhan API
- **Mosque Selection**: Choose from available mosques with favorite option
- **Prayer Alarms**: Toggle browser notifications + audio alarms for each prayer
- **5 Ringtone Options**: Choose from Adhan Call, Bell, Chime, Gong, or Soft bell
- **Light/Dark Mode**: Toggle between light and dark themes
- **Tabbed Interface**: Separate tabs for Donation and Community Feed
- **Donation Support**: Scan QR codes to donate to selected mosque
- **Community Feed**: View approved announcements and posts with images

### Admin Features
- **Registration with Complete Mosque Details**:
  - Mosque name, phone, alternate phone
  - Full address with district, city, state, country
  - Location coordinates (optional)
  - ID proof upload (required)
  - Donation QR code upload (optional)
- **Manual Prayer Times**: Override API times with custom mosque timings
- **Community Posts**: Create announcements with optional images
- **Post Management**: All posts require superadmin approval before publication

### Super Admin Features
- **Admin Approval**: Review ID proofs and approve/reject admin registrations
- **Post Moderation**: Approve/reject community posts with images
- **Full Control**: Manage all mosques and their admins

## 🎨 Design

Islamic-inspired minimalist design featuring:
- Emerald/green color scheme
- Amiri font for headings (Islamic calligraphy style)
- Light & Dark mode support
- Glass-morphism effects
- Tabbed interface for better organization
- Smooth animations and transitions
- Responsive mobile-first design

## 🚀 Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn UI Components (with Tabs)
- Axios
- React Router
- Sonner (Toast notifications)

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Bcrypt (Password hashing)
- Multer (File uploads)
- Aladhan API (Prayer times)

## 🎯 Usage

### Default Credentials

**Super Admin:**
- Email: `superadmin@salah.com`
- Password: `superadmin123`

**Test Admin:**
- Email: `admin@test.com`
- Password: `admin123`
- Mosque: Al-Noor Mosque

### Pre-seeded Mosques
1. Al-Noor Mosque - New York
2. Masjid Al-Rahman - Los Angeles
3. Islamic Center - Chicago

### User Flow

1. **Browse as Guest**:
   - Visit homepage
   - Select a mosque from dropdown
   - View prayer times (auto-fetched from Aladhan API)
   - Toggle alarms for prayers
   - Choose ringtone from 5 options via Settings button
   - Toggle between light/dark mode
   - Switch between Donation and Feed tabs
   - Mark mosques as favorites (star icon)

2. **Register as Admin**:
   - Click "Login/Register"
   - Switch to "Register"
   - Select "Mosque Admin" role
   - Fill complete mosque details:
     - Name, phone numbers, full address
     - District, city, state, country
     - Coordinates (optional)
   - Upload ID proof (required)
   - Upload donation QR code (optional)
   - Wait for superadmin approval

3. **Admin Dashboard**:
   - After approval, login with credentials
   - Set custom prayer times for mosque
   - Upload/update donation QR codes
   - Create community posts with optional images

4. **Super Admin Dashboard**:
   - Login with superadmin credentials
   - Review pending admin registrations
   - View ID proofs before approval
   - Moderate community posts with images

## 🔔 New Features

### 1. Light/Dark Mode Toggle
- Theme switcher in header (Moon/Sun icon)
- Smooth transitions between modes
- Persistent preference in localStorage
- Custom styling for all components in both modes

### 2. Ringtone Selection
- 5 different alarm sounds:
  - **Adhan Call**: Traditional call to prayer
  - **Bell**: Classic bell sound
  - **Chime**: Gentle chime tone
  - **Gong**: Deep gong sound
  - **Soft**: Soft bell ring
- Settings accessible via Music icon
- Preview on selection
- Persistent selection

### 3. Tabbed Interface
- **Donation Tab**: QR code display
- **Feed Tab**: Community posts with images
- Clean, organized layout
- Better user experience

### 4. Image Support in Posts
- Admins can attach images to posts
- Images display in feed
- Base64 encoding for storage
- Responsive image display

## 🔐 Security Features

- Password hashing with bcrypt
- Role-based access control
- ID proof verification for admins
- Superadmin approval workflow
- File upload validation
- CORS protection

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/mosques` - List all mosques
- `GET /api/prayer-times/{mosque_id}?date={date}` - Get prayer times
- `GET /api/posts?mosque_id={id}&status=approved` - Get approved posts

### Authentication
- `POST /api/auth/register` - Register user/admin (with file upload)
- `POST /api/auth/login` - Login

### Admin Only
- `POST /api/prayer-times` - Set manual prayer times
- `POST /api/mosques/{mosque_id}/donation-qr` - Upload QR code
- `POST /api/posts` - Create post (with optional image)

### Super Admin Only
- `GET /api/users/pending` - Get pending admin approvals
- `PATCH /api/users/{user_id}/status` - Approve/reject admin
- `GET /api/posts/pending` - Get pending posts
- `PATCH /api/posts/{post_id}/status` - Approve/reject post

### User Features
- `POST /api/users/{user_id}/favorites/{mosque_id}` - Add favorite
- `DELETE /api/users/{user_id}/favorites/{mosque_id}` - Remove favorite
- `GET /api/users/{user_id}/favorites` - Get user's favorites

## 🌟 Key Features Summary

✅ Node.js Express backend with MongoDB  
✅ Islamic-inspired minimalist design  
✅ Light/Dark mode toggle  
✅ 5 ringtone options for alarms  
✅ Tabbed interface (Donation/Feed)  
✅ Image support in community posts  
✅ Aladhan API integration for prayer times  
✅ Manual prayer time override by admin  
✅ Dual alarm system (browser + audio)  
✅ LocalStorage persistence for preferences  
✅ Favorite mosques functionality  
✅ Complete mosque details in admin registration  
✅ ID proof & QR code upload  
✅ Donation QR code system  
✅ Community feed with approval workflow  
✅ Role-based dashboards  
✅ Responsive mobile design  

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify MongoDB is running
3. Check supervisor logs: `/var/log/supervisor/backend.*.log`
4. Ensure all environment variables are set

---

**Built with ❤️ to help Muslims never miss their prayers**
