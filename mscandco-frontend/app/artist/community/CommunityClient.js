'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Users, UserPlus, UserCheck, MessageCircle, TrendingUp, Heart } from 'lucide-react';

export default function CommunityPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('discover'); // discover, following, followers, posts
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // New post state
  const [newPostContent, setNewPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadFollowersAndFollowing();
        await loadCommunityPosts();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadFollowersAndFollowing() {
    try {
      const response = await fetch('/api/features/social/users/follow');
      const data = await response.json();

      if (data.success) {
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.error('Failed to load followers/following:', error);
    }
  }

  async function loadCommunityPosts() {
    setLoadingPosts(true);
    try {
      // This would be a new API route for community posts
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profiles!community_posts_user_id_fkey (
            artist_name,
            display_name,
            profile_picture_url,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setCommunityPosts(data);
      }
    } catch (error) {
      console.error('Failed to load community posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function searchUsers() {
    if (!searchQuery || searchQuery.trim().length < 2) {
      alert('Please enter at least 2 characters to search');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/features/social/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users || []);
      } else {
        alert('Search failed: ' + data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search users');
    } finally {
      setSearching(false);
    }
  }

  async function followUser(userId) {
    try {
      const response = await fetch('/api/features/social/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Successfully followed user!');
        await loadFollowersAndFollowing();
        // Update search results to reflect new follow status
        if (searchQuery) {
          await searchUsers();
        }
      } else {
        alert('Failed to follow user: ' + data.error);
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Failed to follow user');
    }
  }

  async function unfollowUser(userId) {
    if (!confirm('Are you sure you want to unfollow this user?')) return;

    try {
      const response = await fetch('/api/features/social/users/follow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Successfully unfollowed user!');
        await loadFollowersAndFollowing();
        // Update search results to reflect new follow status
        if (searchQuery) {
          await searchUsers();
        }
      } else {
        alert('Failed to unfollow user: ' + data.error);
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      alert('Failed to unfollow user');
    }
  }

  async function createPost() {
    if (!newPostContent.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPostContent,
          visibility: postVisibility,
          media_urls: [],
          media_type: 'none',
        })
        .select()
        .single();

      if (error) throw error;

      alert('Post created successfully!');
      setNewPostContent('');
      setPostVisibility('public');
      await loadCommunityPosts();
      setActiveTab('posts');
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setPosting(false);
    }
  }

  async function likePost(postId) {
    try {
      const { error } = await supabase
        .from('community_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          // Unlike the post
          await supabase
            .from('community_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          throw error;
        }
      }

      await loadCommunityPosts();
    } catch (error) {
      console.error('Like post error:', error);
    }
  }

  const renderUserCard = (u) => (
    <div
      key={u.user_id}
      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {u.profile_picture_url ? (
              <img
                src={u.profile_picture_url}
                alt={u.artist_name || u.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(u.artist_name || u.display_name || u.email || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {u.artist_name || u.display_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-600">{u.role || 'User'}</p>
            {u.bio && (
              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{u.bio}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>{u.follower_count || 0} followers</span>
              <span>{u.following_count || 0} following</span>
            </div>
          </div>
        </div>
        {!u.is_current_user && (
          <button
            onClick={() => u.is_following ? unfollowUser(u.user_id) : followUser(u.user_id)}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
              u.is_following
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {u.is_following ? (
              <><UserCheck className="inline w-4 h-4 mr-1" /> Following</>
            ) : (
              <><UserPlus className="inline w-4 h-4 mr-1" /> Follow</>
            )}
          </button>
        )}
        {u.is_current_user && (
          <span className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
            You
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🌍 Community</h1>
          <p className="text-gray-600">
            Connect with artists, discover new talent, and build your network
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                placeholder="Search users by name, artist name, or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchUsers}
              disabled={searching || searchQuery.trim().length < 2}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'discover'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('discover')}
          >
            🔍 Discover ({searchResults.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'following'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('following')}
          >
            👥 Following ({following.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'followers'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            ❤️ Followers ({followers.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            📝 Community Feed
          </button>
        </div>

        {/* TAB: Discover */}
        {activeTab === 'discover' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">🔍 Discover Users</h2>

            {searchResults.length === 0 && !searching && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Enter a search query above to discover users</p>
              </div>
            )}

            {searching && (
              <div className="text-center py-12 text-gray-500">
                Searching...
              </div>
            )}

            <div className="space-y-4">
              {searchResults.map(renderUserCard)}
            </div>
          </div>
        )}

        {/* TAB: Following */}
        {activeTab === 'following' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">👥 People You Follow</h2>

            {following.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>You're not following anyone yet</p>
                <p className="text-sm mt-2">Search for users to start building your network</p>
              </div>
            ) : (
              <div className="space-y-4">
                {following.map(f => renderUserCard({
                  ...f.user_profiles,
                  user_id: f.following_id,
                  is_following: true
                }))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Followers */}
        {activeTab === 'followers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">❤️ Your Followers</h2>

            {followers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No followers yet</p>
                <p className="text-sm mt-2">Share great content and people will follow you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followers.map(f => renderUserCard({
                  ...f.user_profiles,
                  user_id: f.follower_id,
                  is_following: following.some(fw => fw.following_id === f.follower_id)
                }))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Community Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">✍️ Create Post</h2>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-4">
                <select
                  value={postVisibility}
                  onChange={(e) => setPostVisibility(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="public">🌍 Public</option>
                  <option value="followers">👥 Followers Only</option>
                  <option value="private">🔒 Private</option>
                </select>
                <button
                  onClick={createPost}
                  disabled={posting || !newPostContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Community Feed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">📝 Community Feed</h2>

              {loadingPosts && (
                <div className="text-center py-12 text-gray-500">Loading posts...</div>
              )}

              {!loadingPosts && communityPosts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No posts yet</p>
                  <p className="text-sm mt-2">Be the first to share something!</p>
                </div>
              )}

              <div className="space-y-6">
                {communityPosts.map(post => (
                  <div key={post.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {post.user_profiles?.profile_picture_url ? (
                          <img
                            src={post.user_profiles.profile_picture_url}
                            alt={post.user_profiles.artist_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{(post.user_profiles?.artist_name || 'U')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {post.user_profiles?.artist_name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{post.user_profiles?.role}</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800 mb-3">{post.content}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center gap-1 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
