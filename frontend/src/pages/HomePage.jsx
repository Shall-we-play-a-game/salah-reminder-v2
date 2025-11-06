import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MapPin, Heart, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    role: 'user',
    mosque_id: '',
    id_proof: null
  });

  // Audio for alarm - use data URL for reliability
  const [audio] = useState(() => {
    const audioElement = new Audio();
    // Use a simple beep sound
    audioElement.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQwOVqzl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWshBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBit83vLTgjMGHm7A7+OZRQ0PVqvl6bVeGAg+lt7xyWwhBQ==';
    return audioElement;
  });

  useEffect(() => {
    fetchMosques();
    checkNotificationPermission();
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
      setMosques(response.data);
      if (response.data.length > 0) {
        setSelectedMosque(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching mosques:', error);
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
        formData.append('mosque_id', registerForm.mosque_id);
        if (registerForm.id_proof) {
          formData.append('id_proof', registerForm.id_proof);
        }
      }

      await axios.post(`${API}/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (registerForm.role === 'admin') {
        toast.success('Registration submitted! Awaiting admin approval.');
      } else {
        toast.success('Registration successful! Please login.');
      }
      setAuthMode('login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const selectedMosqueData = mosques.find(m => m.id === selectedMosque);

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
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-emerald-700">{user.email}</span>
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
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold islamic-heading text-emerald-800">Select Mosque</h2>
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
              <p className="mt-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                {selectedMosqueData.address}, {selectedMosqueData.city}
              </p>
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

        {/* Donation Section */}
        {selectedMosqueData?.donation_qr_code && (
          <Card className="prayer-card" data-testid="donation-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold islamic-heading text-emerald-800">Support Our Mosque</h2>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <p className="text-gray-600 text-center">
                  Scan the QR code below to make a donation to {selectedMosqueData.name}
                </p>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={`data:image/png;base64,${selectedMosqueData.donation_qr_code}`}
                    alt="Donation QR Code"
                    className="w-64 h-64 object-contain"
                    data-testid="donation-qr-code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed Section */}
        {posts.length > 0 && (
          <Card className="prayer-card" data-testid="feed-section">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold islamic-heading text-emerald-800">Community Feed</h2>
              </div>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200"
                    data-testid={`post-${post.id}`}
                  >
                    <h3 className="font-semibold text-emerald-800 mb-2">{post.title}</h3>
                    <p className="text-gray-700 text-sm">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md" data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="islamic-heading text-2xl text-emerald-800">
              {authMode === 'login' ? 'Login' : 'Register'}
            </DialogTitle>
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
            <form onSubmit={handleRegister} className="space-y-4">
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
                  <div>
                    <Label htmlFor="register-mosque">Select Mosque</Label>
                    <Select
                      value={registerForm.mosque_id}
                      onValueChange={(value) => setRegisterForm({ ...registerForm, mosque_id: value })}
                    >
                      <SelectTrigger data-testid="register-mosque-select">
                        <SelectValue placeholder="Choose mosque" />
                      </SelectTrigger>
                      <SelectContent>
                        {mosques.map((mosque) => (
                          <SelectItem key={mosque.id} value={mosque.id}>
                            {mosque.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="id-proof">ID Proof (Required)</Label>
                    <Input
                      id="id-proof"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRegisterForm({ ...registerForm, id_proof: e.target.files[0] })}
                      required
                      data-testid="register-id-proof-input"
                    />
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
    </div>
  );
};

export default HomePage;