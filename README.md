# Salah Reminder Application

A beautiful Islamic-inspired salah (prayer) reminder application with mosque management, prayer times, donation system, and community feed.

## 🕌 Features

### User Features (No Login Required)
- **Prayer Times Display**: Automatically fetches prayer times using Aladhan API
- **Mosque Selection**: Choose from available mosques
- **Prayer Alarms**: Toggle browser notifications + audio alarms for each prayer
- **Donation Support**: Scan QR codes to donate to selected mosque
- **Community Feed**: View approved announcements and posts from mosque admins

### Admin Features
- **Registration with ID Proof**: Upload valid ID during registration
- **Manual Prayer Times**: Override API times with custom mosque timings
- **QR Code Upload**: Upload donation QR codes for the mosque
- **Community Posts**: Create announcements (requires superadmin approval)

### Super Admin Features
- **Admin Approval**: Review ID proofs and approve/reject admin registrations
- **Post Moderation**: Approve/reject community posts before publication
- **Full Control**: Manage all mosques and their admins

## 🎨 Design

Islamic-inspired minimalist design featuring:
- Emerald/green color scheme
- Amiri font for headings (Islamic calligraphy style)
- Glass-morphism effects
- Smooth animations and transitions
- Responsive mobile-first design
- Clean and intuitive interface

## 🚀 Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn UI Components
- Axios
- React Router
- Sonner (Toast notifications)

**Backend:**
- FastAPI (Python)
- MongoDB (Motor async driver)
- Passlib (Password hashing)
- Aladhan API (Prayer times)

## 🎯 Usage

### Default Credentials

**Super Admin:**
- Email: `superadmin@salah.com`
- Password: `superadmin123`

### Pre-seeded Mosques
1. Al-Noor Mosque - New York
2. Masjid Al-Rahman - Los Angeles
3. Islamic Center - Chicago

### User Flow

1. **Browse as Guest**:
   - Visit homepage
   - Select a mosque from dropdown
   - View prayer times (auto-fetched from Aladhan API)
   - Toggle alarms for prayers you want to be reminded of
   - View donation QR code and community posts

2. **Register as Admin**:
   - Click "Login/Register"
   - Switch to "Register"
   - Select "Mosque Admin" role
   - Choose your mosque
   - Upload your ID proof
   - Wait for superadmin approval

3. **Admin Dashboard**:
   - After approval, login with your credentials
   - Set custom prayer times for your mosque
   - Upload donation QR codes
   - Create community announcements

4. **Super Admin Dashboard**:
   - Login with superadmin credentials
   - Review pending admin registrations
   - View ID proofs before approval
   - Moderate community posts

## 🔔 Alarm Features

The app supports dual alarm systems:

1. **Browser Notifications**: Requests permission and shows system notifications
2. **Audio Alert**: Plays an embedded audio beep

Alarms are stored in localStorage per mosque, so preferences persist across sessions.

## 🔌 API Integration

### Aladhan Prayer Times API
- Automatically fetches prayer times based on mosque coordinates
- Caches results in MongoDB to reduce API calls
- Admin manual times override API times

### Prayer Time Priority
1. Manual times set by admin (highest priority)
2. Cached API times
3. Fresh API fetch from Aladhan

## 🔐 Security Features

- Password hashing with bcrypt
- Role-based access control
- ID proof verification for admins
- Superadmin approval workflow
- CORS protection
- Input validation

## 🌟 Key Features Implemented

✅ Islamic-inspired minimalist design  
✅ Aladhan API integration for prayer times  
✅ Manual prayer time override by admin  
✅ Dual alarm system (browser + audio)  
✅ LocalStorage persistence for alarms  
✅ ID proof upload for admin verification  
✅ Donation QR code system  
✅ Community feed with approval workflow  
✅ Role-based dashboards  
✅ Responsive mobile design  
✅ Toast notifications  
✅ Session management  

## 🙏 Credits

- Prayer times provided by [Aladhan API](https://aladhan.com/prayer-times-api)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Islamic font: Amiri by Google Fonts

---

**Built with ❤️ and dedication to help Muslims never miss their prayers**
