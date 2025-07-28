import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';

export default function ArtistProjects() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Summer Vibes EP',
      status: 'active',
      tracks: 4,
      earnings: 2340,
      streams: 45678,
      lastUpdated: '2024-01-15',
      cover: '🎵'
    },
    {
      id: 2,
      title: 'Midnight Sessions',
      status: 'draft',
      tracks: 6,
      earnings: 0,
      streams: 0,
      lastUpdated: '2024-01-10',
      cover: '🎵'
    },
    {
      id: 3,
      title: 'Acoustic Collection',
      status: 'completed',
      tracks: 8,
      earnings: 5670,
      streams: 89012,
      lastUpdated: '2024-01-05',
      cover: '🎵'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your projects.</div>;
  }

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Only allow artists to access this page
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    return project.status === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'draft': return '🟡';
      case 'completed': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">Manage your music projects and track their performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🎵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tracks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((sum, project) => sum + project.tracks, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${projects.reduce((sum, project) => sum + project.earnings, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((sum, project) => sum + project.streams, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: 'All Projects', count: projects.length },
                { id: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
                { id: 'draft', label: 'Draft', count: projects.filter(p => p.status === 'draft').length },
                { id: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Create New Project Button */}
        <div className="mb-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
            <span className="mr-2">➕</span>
            Create New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{project.cover}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)} {project.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tracks:</span>
                    <span className="font-medium">{project.tracks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Earnings:</span>
                    <span className="font-medium text-green-600">${project.earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Streams:</span>
                    <span className="font-medium">{project.streams.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium">{new Date(project.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded">
                    Edit
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Create your first music project to get started!</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 