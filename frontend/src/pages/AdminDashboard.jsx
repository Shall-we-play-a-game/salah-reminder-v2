import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Upload, FileText, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [mosque, setMosque] = useState(null);
  const [prayerForm, setPrayerForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: ''
  });
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    image: null
  });
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    // Get admin from localStorage or redirect
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin') {
        setAdmin(user);
        fetchMosque(user.mosque_id);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchMosque = async (mosqueId) => {
    try {
      const response = await axios.get(`${API}/mosques/${mosqueId}`);
      setMosque(response.data);
    } catch (error) {
      console.error('Error fetching mosque:', error);
    }
  };

  const handleSetPrayerTimes = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/prayer-times`, {
        mosque_id: admin.mosque_id,
        ...prayerForm
      });
      toast.success('Prayer times set successfully');
      setPrayerForm({
        date: new Date().toISOString().split('T')[0],
        fajr: '',
        dhuhr: '',
        asr: '',
        maghrib: '',
        isha: ''
      });
    } catch (error) {
      toast.error('Failed to set prayer times');
    }
  };

  const handleUploadQR = async (e) => {
    e.preventDefault();
    if (!qrFile) {
      toast.error('Please select a QR code image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', qrFile);
      await axios.post(`${API}/mosques/${admin.mosque_id}/donation-qr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('QR code uploaded successfully');
      setQrFile(null);
      fetchMosque(admin.mosque_id);
    } catch (error) {
      toast.error('Failed to upload QR code');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      formData.append('content', postForm.content);
      if (postForm.image) {
        formData.append('image', postForm.image);
      }
      
      await axios.post(
        `${API}/posts?admin_id=${admin.id}&mosque_id=${admin.mosque_id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      toast.success('Post created! Awaiting superadmin approval.');
      setPostForm({ title: '', content: '', image: null });
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  if (!admin || !mosque) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold islamic-heading text-emerald-800" data-testid="admin-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-emerald-600 mt-1">{mosque.name}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')} data-testid="back-home-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Set Prayer Times */}
        <Card className="prayer-card" data-testid="set-prayer-times-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Set Prayer Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPrayerTimes} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={prayerForm.date}
                    onChange={(e) => setPrayerForm({ ...prayerForm, date: e.target.value })}
                    required
                    data-testid="prayer-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="fajr">Fajr</Label>
                  <Input
                    id="fajr"
                    type="time"
                    value={prayerForm.fajr}
                    onChange={(e) => setPrayerForm({ ...prayerForm, fajr: e.target.value })}
                    required
                    data-testid="fajr-time-input"
                  />
                </div>
                <div>
                  <Label htmlFor="dhuhr">Dhuhr</Label>
                  <Input
                    id="dhuhr"
                    type="time"
                    value={prayerForm.dhuhr}
                    onChange={(e) => setPrayerForm({ ...prayerForm, dhuhr: e.target.value })}
                    required
                    data-testid="dhuhr-time-input"
                  />
                </div>
                <div>
                  <Label htmlFor="asr">Asr</Label>
                  <Input
                    id="asr"
                    type="time"
                    value={prayerForm.asr}
                    onChange={(e) => setPrayerForm({ ...prayerForm, asr: e.target.value })}
                    required
                    data-testid="asr-time-input"
                  />
                </div>
                <div>
                  <Label htmlFor="maghrib">Maghrib</Label>
                  <Input
                    id="maghrib"
                    type="time"
                    value={prayerForm.maghrib}
                    onChange={(e) => setPrayerForm({ ...prayerForm, maghrib: e.target.value })}
                    required
                    data-testid="maghrib-time-input"
                  />
                </div>
                <div>
                  <Label htmlFor="isha">Isha</Label>
                  <Input
                    id="isha"
                    type="time"
                    value={prayerForm.isha}
                    onChange={(e) => setPrayerForm({ ...prayerForm, isha: e.target.value })}
                    required
                    data-testid="isha-time-input"
                  />
                </div>
              </div>
              <Button type="submit" className="green-gradient text-white" data-testid="submit-prayer-times-btn">
                Set Prayer Times
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upload Donation QR */}
        <Card className="prayer-card" data-testid="upload-qr-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Upload Donation QR Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadQR} className="space-y-4">
              <div>
                <Label htmlFor="qr-file">QR Code Image</Label>
                <Input
                  id="qr-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files[0])}
                  data-testid="qr-file-input"
                />
              </div>
              {mosque.donation_qr_code && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Current QR Code:</p>
                  <img
                    src={`data:image/png;base64,${mosque.donation_qr_code}`}
                    alt="Current QR"
                    className="w-32 h-32 object-contain border rounded"
                    data-testid="current-qr-preview"
                  />
                </div>
              )}
              <Button type="submit" className="green-gradient text-white" data-testid="upload-qr-btn">
                Upload QR Code
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Create Post */}
        <Card className="prayer-card" data-testid="create-post-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Create Community Post</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  required
                  data-testid="post-title-input"
                />
              </div>
              <div>
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  rows={4}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  required
                  data-testid="post-content-input"
                />
              </div>
              <div>
                <Label htmlFor="post-image">Image (Optional)</Label>
                <Input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostForm({ ...postForm, image: e.target.files[0] })}
                  data-testid="post-image-input"
                />
                {postForm.image && (
                  <p className="text-sm text-emerald-600 mt-2">
                    Selected: {postForm.image.name}
                  </p>
                )}
              </div>
              <Button type="submit" className="green-gradient text-white" data-testid="create-post-btn">
                Create Post
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;