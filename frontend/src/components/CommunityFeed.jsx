import { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Search } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://prayerpal-14.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

export default function CommunityFeed({ selectedMosque, mosqueData }) {
  const [posts, setPosts] = useState([]);
  const [filterScope, setFilterScope] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMosque && mosqueData) {
      fetchPosts();
    }
  }, [selectedMosque, filterScope, searchQuery, sortBy, mosqueData]);

  const fetchPosts = async () => {
    if (!selectedMosque || !mosqueData) return;
    
    setLoading(true);
    try {
      const params = { status: 'approved' };
      
      if (filterScope === 'all') {
        // Get all levels: mosque, city, country
        params.mosque_id = selectedMosque;
        params.city_for_mosque = mosqueData.city;
        params.country_for_mosque = mosqueData.country;
      } else if (filterScope === 'mosque') {
        params.mosque_id = selectedMosque;
        params.scope = 'mosque';
      } else if (filterScope === 'city') {
        params.scope = 'city';
        params.city = mosqueData.city;
      } else if (filterScope === 'country') {
        params.scope = 'country';
        params.country = mosqueData.country;
      }
      
      // Add search and sort
      if (searchQuery) params.search = searchQuery;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortBy === 'title' ? 'asc' : 'desc';
      }
      
      const response = await axios.get(`${API}/posts`, { params });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter, Search, and Sort Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2 block">
            Filter by Scope:
          </Label>
          <Select value={filterScope} onValueChange={setFilterScope} data-testid="filter-scope-select">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="mosque">Mosque Only</SelectItem>
              <SelectItem value="city">City Level</SelectItem>
              <SelectItem value="country">Country Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2 block">
            Search by Title:
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="post-search-input"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2 block">
            Sort by:
          </Label>
          <Select value={sortBy} onValueChange={setSortBy} data-testid="sort-by-select">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="event_start_date">Event Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading posts...</p>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700"
              data-testid={`post-${post.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">{post.title}</h3>
                <div className="flex gap-1">
                  <Badge variant={post.scope === 'mosque' ? 'default' : post.scope === 'city' ? 'secondary' : 'outline'} className="text-xs">
                    {post.scope}
                  </Badge>
                </div>
              </div>
              
              {post.city && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  📍 {post.city}, {post.country}
                </p>
              )}
              
              {post.event_start_date && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  Event: {new Date(post.event_start_date).toLocaleDateString()} - {new Date(post.event_end_date).toLocaleDateString()}
                </div>
              )}
              
              {post.image && (
                <div className="my-3">
                  <img
                    src={`data:image/png;base64,${post.image}`}
                    alt={post.title}
                    className="w-full max-h-96 object-cover rounded-lg"
                    data-testid={`post-image-${post.id}`}
                  />
                </div>
              )}
              
              {post.content && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">{post.content}</p>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No community posts available for {filterScope === 'all' ? 'any scope' : filterScope + ' level'}
        </p>
      )}
    </div>
  );
}
