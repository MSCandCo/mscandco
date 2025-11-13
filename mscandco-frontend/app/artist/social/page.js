'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SocialMediaManagement() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('connections'); // connections, schedule, analytics
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Platform configurations
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-blue-400' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadConnections();
        await loadPosts();
        await loadReleases();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadConnections() {
    try {
      const response = await fetch('/api/features/social/connections');
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  }

  async function loadPosts() {
    try {
      const response = await fetch('/api/features/social/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }

  async function loadReleases() {
    const { data } = await supabase
      .from('releases')
      .select('*')
      .order('release_date', { ascending: false })
      .limit(20);
    setReleases(data || []);
  }

  async function connectPlatform(platform) {
    try {
      const response = await fetch('/api/features/social/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to initiate OAuth: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Connect error:', error);
      alert('Failed to connect: ' + error.message);
    }
  }

  async function disconnectPlatform(connectionId) {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const response = await fetch(`/api/features/social/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Account disconnected successfully');
        await loadConnections();
      } else {
        alert('Failed to disconnect account');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect: ' + error.message);
    }
  }

  async function generateAIContent() {
    if (!selectedRelease) {
      alert('Please select a release first');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/features/social/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          release_id: selectedRelease.id,
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();

      if (data.content) {
        setPostContent(data.content);
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  async function schedulePost() {
    if (!postContent.trim()) {
      alert('Please enter post content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    try {
      const scheduledFor = scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : null;

      const response = await fetch('/api/features/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          platforms: selectedPlatforms,
          scheduled_for: scheduledFor,
          release_id: selectedRelease?.id,
          post_immediately: !scheduledFor,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(scheduledFor ? 'Post scheduled successfully!' : 'Post published successfully!');
        setPostContent('');
        setSelectedPlatforms([]);
        setScheduleDate('');
        setScheduleTime('');
        setSelectedRelease(null);
        await loadPosts();
        setActiveTab('schedule');
      } else {
        alert('Failed to schedule post: ' + data.error);
      }
    } catch (error) {
      console.error('Schedule error:', error);
      alert('Failed to schedule post: ' + error.message);
    }
  }

  async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/features/social/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Post deleted successfully');
        await loadPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post: ' + error.message);
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      posted: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📱 Social Media Automation</h1>
          <p className="text-gray-600">
            Connect platforms, schedule posts, and automate your social media presence
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'connections'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('connections')}
          >
            🔗 Connections
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            ✍️ Create Post
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'schedule'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Scheduled Posts ({posts.filter(p => p.status === 'scheduled').length})
          </button>
        </div>

        {/* TAB: Connections */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">🔗 Connected Accounts</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map(platform => {
                  const connection = connections.find(c => c.platform === platform.id);
                  const isConnected = connection && connection.is_active;

                  return (
                    <div
                      key={platform.id}
                      className={`border rounded-lg p-6 ${
                        isConnected ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{platform.icon}</span>
                          <div>
                            <h3 className="font-bold">{platform.name}</h3>
                            {isConnected && connection.username && (
                              <p className="text-sm text-gray-600">@{connection.username}</p>
                            )}
                          </div>
                        </div>
                        {isConnected && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                            Active
                          </span>
                        )}
                      </div>

                      {isConnected ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            Connected: {new Date(connection.connected_at).toLocaleDateString()}
                          </div>
                          {connection.expires_at && (
                            <div className="text-sm text-gray-600">
                              Expires: {new Date(connection.expires_at).toLocaleDateString()}
                            </div>
                          )}
                          <button
                            onClick={() => disconnectPlatform(connection.id)}
                            className="w-full mt-3 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm font-medium"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => connectPlatform(platform.id)}
                          className={`w-full px-4 py-2 ${platform.color} text-white rounded-md hover:opacity-90 font-medium`}
                        >
                          Connect {platform.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">🔒 Privacy & Security</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• We only request necessary permissions to post on your behalf</li>
                  <li>• Your credentials are encrypted and never stored on our servers</li>
                  <li>• You can disconnect at any time</li>
                  <li>• OAuth 2.0 secure authentication for all platforms</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Create Post */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post Creator */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">✍️ Create Social Post</h2>

              {/* Release Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Release (Optional)
                </label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={selectedRelease?.id || ''}
                  onChange={(e) => {
                    const release = releases.find(r => r.id === e.target.value);
                    setSelectedRelease(release);
                  }}
                >
                  <option value="">-- No release --</option>
                  {releases.map(release => (
                    <option key={release.id} value={release.id}>
                      {release.title} - {release.artist_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Content Generator */}
              {selectedRelease && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">🤖 AI Content Generator</span>
                    <button
                      onClick={generateAIContent}
                      disabled={generating || selectedPlatforms.length === 0}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                    >
                      {generating ? 'Generating...' : 'Generate Content'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Select platforms below, then click to generate AI-optimized content for your release
                  </p>
                </div>
              )}

              {/* Platform Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Platforms <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => {
                    const connection = connections.find(c => c.platform === platform.id);
                    const isConnected = connection && connection.is_active;
                    const isSelected = selectedPlatforms.includes(platform.id);

                    return (
                      <button
                        key={platform.id}
                        onClick={() => {
                          if (!isConnected) {
                            alert(`Please connect your ${platform.name} account first`);
                            return;
                          }
                          setSelectedPlatforms(prev =>
                            isSelected
                              ? prev.filter(p => p !== platform.id)
                              : [...prev, platform.id]
                          );
                        }}
                        disabled={!isConnected}
                        className={`p-3 border rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isConnected
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <span className="mr-2">{platform.icon}</span>
                        {platform.name}
                        {!isConnected && <span className="ml-2 text-xs text-red-500">(Not connected)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Post Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your post content here... Include hashtags, emojis, and mentions!"
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  maxLength={2200}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {postContent.length}/2200 characters
                </p>
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Schedule (Optional - Leave empty to post immediately)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={schedulePost}
                disabled={!postContent.trim() || selectedPlatforms.length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {scheduleDate && scheduleTime ? '📅 Schedule Post' : '🚀 Post Now'}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">👁️ Preview</h2>

              {postContent ? (
                <div className="space-y-4">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return (
                      <div key={platformId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{platform.icon}</span>
                          <span className="font-semibold">{platform.name}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {postContent}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Your post preview will appear here
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Scheduled Posts */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">📅 Scheduled & Published Posts</h2>

            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No posts yet. Create your first post!
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(post.status)}`}>
                            {post.status}
                          </span>
                          {post.platforms && (
                            <div className="flex gap-1">
                              {post.platforms.map(p => {
                                const platform = platforms.find(pl => pl.id === p);
                                return platform ? (
                                  <span key={p} className="text-lg">{platform.icon}</span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                          {post.content}
                        </p>
                        <div className="text-xs text-gray-500">
                          {post.scheduled_for ? (
                            <>Scheduled for: {new Date(post.scheduled_for).toLocaleString()}</>
                          ) : post.posted_at ? (
                            <>Posted: {new Date(post.posted_at).toLocaleString()}</>
                          ) : (
                            <>Created: {new Date(post.created_at).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
