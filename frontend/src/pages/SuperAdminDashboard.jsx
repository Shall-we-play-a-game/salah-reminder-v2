import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, UserCheck, FileCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mosque-connect-11.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [selectedIdProof, setSelectedIdProof] = useState(null);
  const [showIdProof, setShowIdProof] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role !== 'superadmin') {
        navigate('/');
      }
    } else {
      navigate('/');
    }

    fetchPendingAdmins();
    fetchPendingPosts();
  }, [navigate]);

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
    } catch (error) {
      toast.error('Failed to update post status');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold islamic-heading text-emerald-800" data-testid="superadmin-dashboard-title">
                Super Admin Dashboard
              </h1>
              <p className="text-emerald-600">Manage approvals</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')} data-testid="back-home-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Pending Admin Approvals */}
        <Card className="prayer-card" data-testid="pending-admins-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Pending Admin Registrations ({pendingAdmins.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAdmins.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending admin registrations</p>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                    data-testid={`pending-admin-${admin.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800">{admin.email}</p>
                      <p className="text-sm text-gray-600">
                        Registered: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary" className="mt-1">{admin.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewIdProof(admin.id)}
                        data-testid={`view-id-proof-btn-${admin.id}`}
                      >
                        View ID
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAdminStatus(admin.id, 'approved')}
                        data-testid={`approve-admin-btn-${admin.id}`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAdminStatus(admin.id, 'rejected')}
                        data-testid={`reject-admin-btn-${admin.id}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Post Approvals */}
        <Card className="prayer-card" data-testid="pending-posts-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Pending Post Approvals ({pendingPosts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending posts</p>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                    data-testid={`pending-post-${post.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-800 text-lg">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Posted: {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{post.status}</Badge>
                    </div>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handlePostStatus(post.id, 'approved')}
                        data-testid={`approve-post-btn-${post.id}`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePostStatus(post.id, 'rejected')}
                        data-testid={`reject-post-btn-${post.id}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ID Proof Dialog */}
      <Dialog open={showIdProof} onOpenChange={setShowIdProof}>
        <DialogContent className="sm:max-w-lg" data-testid="id-proof-dialog" aria-describedby="id-proof-description">
          <DialogHeader>
            <DialogTitle>ID Proof</DialogTitle>
            <p id="id-proof-description" className="sr-only">View admin ID proof document</p>
          </DialogHeader>
          {selectedIdProof && (
            <div className="mt-4">
              <img
                src={`data:image/png;base64,${selectedIdProof}`}
                alt="ID Proof"
                className="w-full h-auto object-contain rounded"
                data-testid="id-proof-image"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;