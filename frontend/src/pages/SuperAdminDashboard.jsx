import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, UserCheck, FileCheck, ArrowLeft, Clock, Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://prayerpal-14.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [mosques, setMosques] = useState([]);
  const [selectedIdProof, setSelectedIdProof] = useState(null);
  const [showIdProof, setShowIdProof] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [user, setUser] = useState(null);

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    scope: 'mosque',
    city: '',
    country: '',
    mosque_id: '',
    event_start_date: '',
    event_end_date: '',
    image: null
  });

  const [prayerForm, setPrayerForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(userData);
      }
    } else {
      navigate('/');
    }

    fetchPendingAdmins();
    fetchPendingPosts();
    fetchAllPosts();
    fetchMosques();
  }, [navigate]);

  const fetchMosques = async () => {
    try {
      const response = await axios.get(`${API}/mosques`);
      setMosques(response.data);
    } catch (error) {
      console.error('Error fetching mosques:', error);
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const response = await axios.get(`${API}/users/pending`);
      setPendingAdmins(response.data);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
    }
  };

  const fetchPendingPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts/pending`);
      setPendingPosts(response.data);
    } catch (error) {
      console.error('Error fetching pending posts:', error);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`, { params: { status: 'approved' } });
      setAllPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAdminStatus = async (userId, status) => {
    try {
      await axios.patch(`${API}/users/${userId}/status?status=${status}`);
      toast.success(`Admin ${status}`);
      fetchPendingAdmins();
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const handlePostStatus = async (postId, status) => {
    try {
      await axios.patch(`${API}/posts/${postId}/status`, { status });
      toast.success(`Post ${status}`);
      fetchPendingPosts();
      fetchAllPosts();
    } catch (error) {
      toast.error('Failed to update post status');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`${API}/posts/${postId}`);
      toast.success('Post deleted');
      fetchAllPosts();
      fetchPendingPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content || '',
      scope: post.scope,
      city: post.city || '',
      country: post.country || '',
      mosque_id: post.mosque_id || '',
      event_start_date: post.event_start_date ? new Date(post.event_start_date).toISOString().split('T')[0] : '',
      event_end_date: post.event_end_date ? new Date(post.event_end_date).toISOString().split('T')[0] : '',
      image: null
    });
    setShowEditPost(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      if (postForm.content) formData.append('content', postForm.content);
      formData.append('scope', postForm.scope);
      if (postForm.city) formData.append('city', postForm.city);
      if (postForm.country) formData.append('country', postForm.country);
      if (postForm.event_start_date) formData.append('event_start_date', postForm.event_start_date);
      if (postForm.event_end_date) formData.append('event_end_date', postForm.event_end_date);
      if (postForm.image) formData.append('image', postForm.image);

      await axios.patch(`${API}/posts/${editingPost.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Post updated successfully');
      setShowEditPost(false);
      fetchAllPosts();
      fetchPendingPosts();
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      if (postForm.content) formData.append('content', postForm.content);
      formData.append('scope', postForm.scope);
      if (postForm.city) formData.append('city', postForm.city);
      if (postForm.country) formData.append('country', postForm.country);
      if (postForm.event_start_date) formData.append('event_start_date', postForm.event_start_date);
      if (postForm.event_end_date) formData.append('event_end_date', postForm.event_end_date);
      if (postForm.image) formData.append('image', postForm.image);

      await axios.post(
        `${API}/posts?admin_id=${user.id}&mosque_id=${postForm.mosque_id || ''}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      toast.success('Post created successfully');
      setShowCreatePost(false);
      setPostForm({
        title: '',
        content: '',
        scope: 'mosque',
        city: '',
        country: '',
        mosque_id: '',
        event_start_date: '',
        event_end_date: '',
        image: null
      });
      fetchPendingPosts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create post');
    }
  };

  const handleSetPrayerTimes = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/prayer-times`, {
        mosque_id: selectedMosque,
        ...prayerForm
      });
      
      toast.success('Prayer times updated');
      setShowPrayerTimes(false);
      setPrayerForm({
        date: new Date().toISOString().split('T')[0],
        fajr: '',
        dhuhr: '',
        asr: '',
        maghrib: '',
        isha: ''
      });
    } catch (error) {
      toast.error('Failed to update prayer times');
    }
  };

  const viewIdProof = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}/id-proof`);
      setSelectedIdProof(response.data.id_proof);
      setShowIdProof(true);
    } catch (error) {
      toast.error('Failed to load ID proof');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold islamic-heading text-emerald-800 dark:text-emerald-400" data-testid="superadmin-dashboard-title">
                Super Admin Dashboard
              </h1>
              <p className="text-emerald-600 dark:text-emerald-500">Manage system</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreatePost(true)} className="green-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="admins">Pending Admins ({pendingAdmins.length})</TabsTrigger>
            <TabsTrigger value="posts">Pending Posts ({pendingPosts.length})</TabsTrigger>
            <TabsTrigger value="allposts">All Posts ({allPosts.length})</TabsTrigger>
            <TabsTrigger value="mosques">Mosques ({mosques.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <Card className="prayer-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Pending Admin Registrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAdmins.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending registrations</p>
                ) : (
                  <div className="space-y-4">
                    {pendingAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <div className="flex-1">
                          <p className="font-semibold text-emerald-800 dark:text-emerald-400">{admin.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Registered: {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="mt-1">{admin.status}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => viewIdProof(admin.id)}>
                            View ID
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAdminStatus(admin.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAdminStatus(admin.id, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="prayer-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Pending Post Approvals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPosts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending posts</p>
                ) : (
                  <div className="space-y-4">
                    {pendingPosts.map((post) => (
                      <PostCard key={post.id} post={post} onApprove={handlePostStatus} onReject={handlePostStatus} onEdit={handleEditPost} onDelete={handleDeletePost} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allposts">
            <Card className="prayer-card">
              <CardHeader>
                <CardTitle>All Approved Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allPosts.map((post) => (
                    <PostCard key={post.id} post={post} onEdit={handleEditPost} onDelete={handleDeletePost} showActions={true} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mosques">
            <Card className="prayer-card">
              <CardHeader>
                <CardTitle>All Mosques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mosques.map((mosque) => (
                    <div key={mosque.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-400">{mosque.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {mosque.city}, {mosque.country}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => {
                        setSelectedMosque(mosque.id);
                        setShowPrayerTimes(true);
                      }}>
                        <Clock className="w-4 h-4 mr-2" />
                        Set Prayer Times
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={showIdProof} onOpenChange={setShowIdProof}>
        <DialogContent>
          <DialogHeader><DialogTitle>ID Proof</DialogTitle></DialogHeader>
          {selectedIdProof && (
            <img src={`data:image/png;base64,${selectedIdProof}`} alt="ID Proof" className="w-full" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPost} onOpenChange={setShowEditPost}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
          <PostForm form={postForm} setForm={setPostForm} onSubmit={handleUpdatePost} mosques={mosques} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
          <PostForm form={postForm} setForm={setPostForm} onSubmit={handleCreatePost} mosques={mosques} />
        </DialogContent>
      </Dialog>

      <Dialog open={showPrayerTimes} onOpenChange={setShowPrayerTimes}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Prayer Times</DialogTitle></DialogHeader>
          <PrayerTimesForm form={prayerForm} setForm={setPrayerForm} onSubmit={handleSetPrayerTimes} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostCard({ post, onApprove, onReject, onEdit, onDelete, showActions = false }) {
  return (
    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 text-lg">{post.title}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant={post.scope === 'mosque' ? 'default' : post.scope === 'city' ? 'secondary' : 'outline'}>
              {post.scope}
            </Badge>
            {post.city && <Badge variant="outline">{post.city}</Badge>}
            {post.country && <Badge variant="outline">{post.country}</Badge>}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Posted: {new Date(post.created_at).toLocaleDateString()}
          </p>
          {post.event_start_date && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Event: {new Date(post.event_start_date).toLocaleDateString()} - {new Date(post.event_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <Badge variant="secondary">{post.status}</Badge>
      </div>
      {post.image && (
        <img src={`data:image/png;base64,${post.image}`} alt={post.title} className="w-full max-h-64 object-cover rounded-lg my-3" />
      )}
      {post.content && <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>}
      <div className="flex gap-2">
        {onApprove && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onApprove(post.id, 'approved')}>Approve</Button>}
        {onReject && <Button size="sm" variant="destructive" onClick={() => onReject(post.id, 'rejected')}>Reject</Button>}
        {showActions && (
          <>
            <Button size="sm" variant="outline" onClick={() => onEdit(post)}><Edit className="w-4 h-4" /></Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
          </>
        )}
      </div>
    </div>
  );
}

function PostForm({ form, setForm, onSubmit, mosques }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div>
        <Label>Scope *</Label>
        <Select value={form.scope} onValueChange={(value) => setForm({ ...form, scope: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mosque">Mosque Level</SelectItem>
            <SelectItem value="city">City Level</SelectItem>
            <SelectItem value="country">Country Level</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.scope === 'mosque' && (
        <div>
          <Label>Mosque *</Label>
          <Select value={form.mosque_id} onValueChange={(value) => setForm({ ...form, mosque_id: value })}>
            <SelectTrigger><SelectValue placeholder="Select mosque" /></SelectTrigger>
            <SelectContent>
              {mosques.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>City {form.scope !== 'mosque' && '*'}</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required={form.scope !== 'mosque'} />
        </div>
        <div>
          <Label>Country {form.scope !== 'mosque' && '*'}</Label>
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required={form.scope !== 'mosque'} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Event Start Date</Label>
          <Input type="date" value={form.event_start_date} onChange={(e) => setForm({ ...form, event_start_date: e.target.value })} />
        </div>
        <div>
          <Label>Event End Date</Label>
          <Input type="date" value={form.event_end_date} onChange={(e) => setForm({ ...form, event_end_date: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Content (optional if image provided)</Label>
        <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </div>
      <div>
        <Label>Image (optional if content provided)</Label>
        <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
      </div>
      <Button type="submit" className="w-full green-gradient text-white">Submit</Button>
    </form>
  );
}

function PrayerTimesForm({ form, setForm, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Date *</Label>
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => (
          <div key={prayer}>
            <Label>{prayer.charAt(0).toUpperCase() + prayer.slice(1)} *</Label>
            <Input type="time" value={form[prayer]} onChange={(e) => setForm({ ...form, [prayer]: e.target.value })} required />
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full green-gradient text-white">Set Prayer Times</Button>
    </form>
  );
}