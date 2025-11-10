import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MapPin, Heart, Calendar, User, LogOut, Menu, X, Star, Moon, Sun, Music } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import CommunityFeed from '@/components/CommunityFeed';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mosque-connect-11.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

// Debug: Log API URL
console.log('API URL:', API);

const HomePage = () => {
  const [mosques, setMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [alarms, setAlarms] = useState({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  });
  const [posts, setPosts] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [favoriteMosques, setFavoriteMosques] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRingtone, setSelectedRingtone] = useState('adhan');
  const [showSettings, setShowSettings] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    role: 'user',
    mosque_name: '',
    mosque_phone: '',
    mosque_alternate_phone: '',
    mosque_address: '',
    mosque_district: '',
    mosque_city: '',
    mosque_state: '',
    mosque_country: '',
    mosque_latitude: '',
    mosque_longitude: '',
    id_proof: null,
    donation_qr: null
  });

  // Ringtone options
  const ringtones = {
    adhan: 'https://www.soundjay.com/phone/sounds/phone-calling-1.mp3',
    bell: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3',
    chime: 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3',
    gong: 'https://www.soundjay.com/misc/sounds/gong-01.mp3',
    soft: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3'
  };
  const [audio] = useState(() => new Audio(ringtones.adhan));

  useEffect(() => {
    fetchMosques();
    checkNotificationPermission();
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.role === 'user') {
        fetchFavoriteMosques(userData.id);
      }
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Load ringtone preference
    const savedRingtone = localStorage.getItem('ringtone') || 'adhan';
    setSelectedRingtone(savedRingtone);
    audio.src = ringtones[savedRingtone];
  }, []);

  useEffect(() => {
    if (selectedMosque) {
      fetchPrayerTimes();
      fetchPosts();
      loadAlarms();
    }
  }, [selectedMosque]);

  useEffect(() => {
    if (selectedMosque && prayerTimes) {
      const interval = setInterval(() => {
        checkPrayerAlarms();
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedMosque, prayerTimes, alarms]);

  const checkNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const fetchMosques = async () => {
    try {
      const response = await axios.get(`${API}/mosques`);
      const data = response.data;
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMosques(data);
        if (data.length > 0) {
          setSelectedMosque(data[0].id);
        }
      } else {
        console.error('Mosques data is not an array:', data);
        setMosques([]);
        toast.error('Failed to load mosques data');
      }
    } catch (error) {
      console.error('Error fetching mosques:', error);
      setMosques([]);
      toast.error('Failed to connect to server. Please check your connection.');
    }
  };

  const fetchPrayerTimes = async () => {
    if (!selectedMosque) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/prayer-times/${selectedMosque}`, {
        params: { date: today }
      });
      setPrayerTimes(response.data);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      toast.error('Failed to load prayer times');
    }
  };

  const fetchPosts = async () => {
    if (!selectedMosque) return;
    try {
      const response = await axios.get(`${API}/posts`, {
        params: { mosque_id: selectedMosque, status: 'approved' }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchFavoriteMosques = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}/favorites`);
      setFavoriteMosques(response.data.map(m => m.id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (mosqueId) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (favoriteMosques.includes(mosqueId)) {
        await axios.delete(`${API}/users/${user.id}/favorites/${mosqueId}`);
        setFavoriteMosques(favoriteMosques.filter(id => id !== mosqueId));
        toast.success('Removed from favorites');
      } else {
        await axios.post(`${API}/users/${user.id}/favorites/${mosqueId}`);
        setFavoriteMosques([...favoriteMosques, mosqueId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeRingtone = (ringtone) => {
    setSelectedRingtone(ringtone);
    localStorage.setItem('ringtone', ringtone);
    audio.src = ringtones[ringtone];
    // Play preview
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  const loadAlarms = () => {
    const saved = localStorage.getItem(`alarms_${selectedMosque}`);
    if (saved) {
      setAlarms(JSON.parse(saved));
    }
  };

  const toggleAlarm = (prayer) => {
    const newAlarms = { ...alarms, [prayer]: !alarms[prayer] };
    setAlarms(newAlarms);
    localStorage.setItem(`alarms_${selectedMosque}`, JSON.stringify(newAlarms));
    toast.success(`Alarm ${newAlarms[prayer] ? 'enabled' : 'disabled'} for ${prayer}`);
  };

  const checkPrayerAlarms = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    Object.keys(alarms).forEach((prayer) => {
      if (alarms[prayer]) {
        const prayerTime = prayerTimes[prayer]?.split(' ')[0]; // Extract time part
        if (prayerTime === currentTime) {
          triggerAlarm(prayer);
        }
      }
    });
  };

  const triggerAlarm = (prayer) => {
    // Audio alarm
    audio.play().catch(err => console.error('Audio play failed:', err));

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time for ${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer`, {
        body: 'It\'s time for prayer',
        icon: '/prayer-icon.png'
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginForm);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Logged in successfully');
      setShowAuth(false);
      
      // Redirect based on role
      if (response.data.role === 'admin') {
        window.location.href = '/admin';
      } else if (response.data.role === 'superadmin') {
        window.location.href = '/superadmin';
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('email', registerForm.email);
      formData.append('password', registerForm.password);
      formData.append('role', registerForm.role);
      
      if (registerForm.role === 'admin') {
        // Mosque details
        formData.append('mosque_name', registerForm.mosque_name);
        formData.append('mosque_phone', registerForm.mosque_phone);
        if (registerForm.mosque_alternate_phone) {
          formData.append('mosque_alternate_phone', registerForm.mosque_alternate_phone);
        }
        formData.append('mosque_address', registerForm.mosque_address);
        formData.append('mosque_district', registerForm.mosque_district);
        formData.append('mosque_city', registerForm.mosque_city);
        formData.append('mosque_state', registerForm.mosque_state);
        formData.append('mosque_country', registerForm.mosque_country);
        if (registerForm.mosque_latitude) {
          formData.append('mosque_latitude', registerForm.mosque_latitude);
        }
        if (registerForm.mosque_longitude) {
          formData.append('mosque_longitude', registerForm.mosque_longitude);
        }
        
        // ID proof and QR code
        if (registerForm.id_proof) {
          formData.append('id_proof', registerForm.id_proof);
        }
        if (registerForm.donation_qr) {
          formData.append('donation_qr', registerForm.donation_qr);
        }
      }

      await axios.post(`${API}/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (registerForm.role === 'admin') {
        toast.success('Registration submitted! Awaiting superadmin approval.');
      } else {
        toast.success('Registration successful! Please login.');
      }
      
      // Reset form
      setRegisterForm({
        email: '',
        password: '',
        role: 'user',
        mosque_name: '',
        mosque_phone: '',
        mosque_alternate_phone: '',
        mosque_address: '',
        mosque_district: '',
        mosque_city: '',
        mosque_state: '',
        mosque_country: '',
        mosque_latitude: '',
        mosque_longitude: '',
        id_proof: null,
        donation_qr: null
      });
      
      // Switch to login mode after a brief delay
      setTimeout(() => {
        setAuthMode('login');
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const selectedMosqueData = Array.isArray(mosques) ? mosques.find(m => m.id === selectedMosque) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 mosque-pattern">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold islamic-heading text-emerald-800" data-testid="app-title">Salah Reminder</h1>
                <p className="text-sm text-emerald-600">Never miss a prayer</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                data-testid="theme-toggle"
                className="rounded-full"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                data-testid="settings-btn"
              >
                <Music className="w-5 h-5" />
              </Button>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">{user.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setUser(null);
                    localStorage.removeItem('user');
                  }} data-testid="logout-btn">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuth(true)} className="green-gradient text-white" data-testid="login-btn">
                  <User className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-emerald-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-emerald-200 pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-emerald-700">{user.email}</p>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setUser(null);
                    localStorage.removeItem('user');
                  }} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuth(true)} className="green-gradient text-white w-full">
                  <User className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Mosque Selection */}
        <Card className="prayer-card" data-testid="mosque-selection-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold islamic-heading text-emerald-800">Select Mosque</h2>
              </div>
              {selectedMosque && user && user.role === 'user' && (
                <button
                  onClick={() => toggleFavorite(selectedMosque)}
                  className="p-2 rounded-full hover:bg-emerald-100 transition-colors"
                  data-testid="favorite-mosque-btn"
                >
                  <Star
                    className={`w-6 h-6 ${
                      favoriteMosques.includes(selectedMosque)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
            </div>
            <Select value={selectedMosque} onValueChange={setSelectedMosque}>
              <SelectTrigger className="w-full" data-testid="mosque-select">
                <SelectValue placeholder="Choose a mosque" />
              </SelectTrigger>
              <SelectContent>
                {mosques.map((mosque) => (
                  <SelectItem key={mosque.id} value={mosque.id} data-testid={`mosque-option-${mosque.id}`}>
                    {mosque.name} - {mosque.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMosqueData && (
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {selectedMosqueData.address}, {selectedMosqueData.district}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedMosqueData.city}, {selectedMosqueData.state}, {selectedMosqueData.country}
                </p>
                {selectedMosqueData.phone && (
                  <p className="text-sm text-emerald-600 font-medium">
                    📞 {selectedMosqueData.phone}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prayer Times */}
        {prayerTimes && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 fade-in">
            {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
              <Card key={prayer} className="prayer-card" data-testid={`prayer-card-${prayer}`}>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold islamic-heading text-emerald-800 capitalize">
                      {prayer}
                    </h3>
                    <div className="prayer-time-text" data-testid={`prayer-time-${prayer}`}>
                      {prayerTimes[prayer]?.split(' ')[0] || 'N/A'}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <Switch
                        checked={alarms[prayer]}
                        onCheckedChange={() => toggleAlarm(prayer)}
                        data-testid={`alarm-toggle-${prayer}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Donation & Feed Tabs */}
        {(selectedMosqueData?.donation_qr_code || posts.length > 0) && (
          <Card className="prayer-card" data-testid="donation-feed-tabs">
            <CardContent className="p-6">
              <Tabs defaultValue="donation" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="donation" className="flex items-center space-x-2" data-testid="donation-tab">
                    <Heart className="w-4 h-4" />
                    <span>Donation</span>
                  </TabsTrigger>
                  <TabsTrigger value="feed" className="flex items-center space-x-2" data-testid="feed-tab">
                    <Calendar className="w-4 h-4" />
                    <span>Community Feed</span>
                  </TabsTrigger>
                </TabsList>

                {/* Donation Tab Content */}
                <TabsContent value="donation" data-testid="donation-content">
                  {selectedMosqueData?.donation_qr_code ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Heart className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-xl font-semibold islamic-heading text-emerald-800 dark:text-emerald-400">
                          Support {selectedMosqueData.name}
                        </h2>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Scan the QR code below to make a donation
                      </p>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <img
                          src={`data:image/png;base64,${selectedMosqueData.donation_qr_code}`}
                          alt="Donation QR Code"
                          className="w-64 h-64 object-contain"
                          data-testid="donation-qr-code"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No donation QR code available for this mosque</p>
                    </div>
                  )}
                </TabsContent>

                {/* Feed Tab Content */}
                <TabsContent value="feed" data-testid="feed-content">
                  <CommunityFeed selectedMosque={selectedMosque} mosqueData={selectedMosqueData} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-2xl" data-testid="auth-dialog" aria-describedby="auth-description">
          <DialogHeader>
            <DialogTitle className="islamic-heading text-2xl text-emerald-800">
              {authMode === 'login' ? 'Login' : 'Register'}
            </DialogTitle>
            <p id="auth-description" className="sr-only">
              {authMode === 'login' ? 'Login to your account' : 'Register a new account'}
            </p>
          </DialogHeader>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  data-testid="login-email-input"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  data-testid="login-password-input"
                />
              </div>
              <Button type="submit" className="w-full green-gradient text-white" data-testid="login-submit-btn">
                Login
              </Button>
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-emerald-600 font-semibold hover:underline"
                  data-testid="switch-to-register-btn"
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  data-testid="register-password-input"
                />
              </div>
              <div>
                <Label htmlFor="register-role">Role</Label>
                <Select
                  value={registerForm.role}
                  onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                >
                  <SelectTrigger data-testid="register-role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Mosque Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {registerForm.role === 'admin' && (
                <>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold text-emerald-800 mb-3">Mosque Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="mosque-name">Mosque Name *</Label>
                        <Input
                          id="mosque-name"
                          value={registerForm.mosque_name}
                          onChange={(e) => setRegisterForm({ ...registerForm, mosque_name: e.target.value })}
                          required
                          data-testid="register-mosque-name-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="mosque-phone">Phone *</Label>
                          <Input
                            id="mosque-phone"
                            type="tel"
                            value={registerForm.mosque_phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_phone: e.target.value })}
                            required
                            data-testid="register-mosque-phone-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mosque-alt-phone">Alternate Phone</Label>
                          <Input
                            id="mosque-alt-phone"
                            type="tel"
                            value={registerForm.mosque_alternate_phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_alternate_phone: e.target.value })}
                            data-testid="register-mosque-alt-phone-input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="mosque-address">Full Address *</Label>
                        <Input
                          id="mosque-address"
                          value={registerForm.mosque_address}
                          onChange={(e) => setRegisterForm({ ...registerForm, mosque_address: e.target.value })}
                          required
                          data-testid="register-mosque-address-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="mosque-district">District *</Label>
                          <Input
                            id="mosque-district"
                            value={registerForm.mosque_district}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_district: e.target.value })}
                            required
                            data-testid="register-mosque-district-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mosque-city">City *</Label>
                          <Input
                            id="mosque-city"
                            value={registerForm.mosque_city}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_city: e.target.value })}
                            required
                            data-testid="register-mosque-city-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="mosque-state">State *</Label>
                          <Input
                            id="mosque-state"
                            value={registerForm.mosque_state}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_state: e.target.value })}
                            required
                            data-testid="register-mosque-state-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mosque-country">Country *</Label>
                          <Input
                            id="mosque-country"
                            value={registerForm.mosque_country}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_country: e.target.value })}
                            required
                            data-testid="register-mosque-country-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="mosque-lat">Latitude (Optional)</Label>
                          <Input
                            id="mosque-lat"
                            type="number"
                            step="any"
                            value={registerForm.mosque_latitude}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_latitude: e.target.value })}
                            data-testid="register-mosque-lat-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mosque-lng">Longitude (Optional)</Label>
                          <Input
                            id="mosque-lng"
                            type="number"
                            step="any"
                            value={registerForm.mosque_longitude}
                            onChange={(e) => setRegisterForm({ ...registerForm, mosque_longitude: e.target.value })}
                            data-testid="register-mosque-lng-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold text-emerald-800 mb-3">Documents</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="id-proof">ID Proof (Required) *</Label>
                        <Input
                          id="id-proof"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setRegisterForm({ ...registerForm, id_proof: e.target.files[0] })}
                          required
                          data-testid="register-id-proof-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="donation-qr">Donation QR Code (Optional)</Label>
                        <Input
                          id="donation-qr"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setRegisterForm({ ...registerForm, donation_qr: e.target.files[0] })}
                          data-testid="register-donation-qr-input"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full green-gradient text-white" data-testid="register-submit-btn">
                Register
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-emerald-600 font-semibold hover:underline"
                  data-testid="switch-to-login-btn"
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md" data-testid="settings-dialog" aria-describedby="settings-description">
          <DialogHeader>
            <DialogTitle className="islamic-heading text-2xl text-emerald-800 dark:text-emerald-400">
              <Music className="w-6 h-6 inline mr-2" />
              Ringtone Settings
            </DialogTitle>
            <p id="settings-description" className="sr-only">Choose your prayer alarm ringtone</p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Select a ringtone for prayer alarms:</p>
            
            <div className="space-y-2">
              {Object.keys(ringtones).map((key) => (
                <button
                  key={key}
                  onClick={() => changeRingtone(key)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedRingtone === key
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                  }`}
                  data-testid={`ringtone-${key}`}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className={`w-5 h-5 ${selectedRingtone === key ? 'text-emerald-600' : 'text-gray-500'}`} />
                    <div className="text-left">
                      <p className={`font-medium capitalize ${
                        selectedRingtone === key ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {key === 'adhan' ? 'Adhan Call' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {key === 'adhan' && 'Traditional call to prayer'}
                        {key === 'bell' && 'Classic bell sound'}
                        {key === 'chime' && 'Gentle chime tone'}
                        {key === 'gong' && 'Deep gong sound'}
                        {key === 'soft' && 'Soft bell ring'}
                      </p>
                    </div>
                  </div>
                  {selectedRingtone === key && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="pt-4 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Tap a ringtone to preview and select
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;