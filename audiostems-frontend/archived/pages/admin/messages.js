import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Bell, Mail, AlertTriangle, CheckCircle, Clock, 
  User, Shield, Building2, Music, MessageSquare, Trash2, 
  MarkRead, Send, Plus
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '@/lib/user-utils';

export default function AdminMessages() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, notifications, alerts
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', body: '' });
  const [showCompose, setShowCompose] = useState(false);

  const userRole = getUserRole(user);

  // Check admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      loadMessages();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadMessages = () => {
    // Mock data for now - will be replaced with real API
    const mockMessages = [
      {
        id: 1,
        from: 'system@mscandco.com',
        fromName: 'MSC & Co System',
        subject: 'New Artist Registration Requires Approval',
        body: 'A new artist "John Doe" has registered and is awaiting approval.',
        type: 'notification',
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'medium'
      },
      {
        id: 2,
        from: 'security@mscandco.com',
        fromName: 'Security Alert',
        subject: 'Failed Login Attempts Detected',
        body: 'Multiple failed login attempts detected for user info@htay.co.uk. Please review security logs.',
        type: 'alert',
        read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'high'
      },
      {
        id: 3,
        from: 'releases@mscandco.com',
        fromName: 'Release System',
        subject: 'Release "My New Song" Submitted for Review',
        body: 'Artist Sarah Smith has submitted "My New Song" for distribution approval.',
        type: 'notification',
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'medium'
      },
      {
        id: 4,
        from: 'payments@mscandco.com',
        fromName: 'Payment System',
        subject: 'Monthly Revenue Report Available',
        body: 'The monthly revenue report for October 2024 is now available for review.',
        type: 'notification',
        read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'low'
      }
    ];
    setMessages(mockMessages);
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !message.read;
    return message.type === filter;
  });

  const markAsRead = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const deleteMessage = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    setSelectedMessage(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO pageTitle="Admin Messages" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <MessageSquare className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Admin Messages</h1>
              </div>
              <p className="text-blue-100">
                System notifications, alerts, and communications
              </p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                  <span className="text-sm text-gray-500">
                    {filteredMessages.filter(m => !m.read).length} unread
                  </span>
                </div>
                
                {/* Filter buttons */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'unread', 'notifications', 'alert'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        filter === filterType
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterType === 'alert' ? 'alerts' : filterType}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) markAsRead(message.id);
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      } ${!message.read ? 'bg-blue-25' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            {getTypeIcon(message.type)}
                            <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                              {message.fromName}
                            </span>
                            {!message.read && (
                              <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-1 truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {selectedMessage ? (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {getTypeIcon(selectedMessage.type)}
                        <h3 className="ml-2 text-xl font-semibold text-gray-900">
                          {selectedMessage.subject}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority} priority
                        </span>
                        <button
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>From: {selectedMessage.fromName}</span>
                      <span>{formatTime(selectedMessage.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedMessage.body}
                      </p>
                    </div>
                    
                    {/* Action buttons based on message type */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {selectedMessage.type === 'notification' && (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      )}
                      {selectedMessage.type === 'alert' && (
                        <>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Investigate
                          </button>
                          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                            Mark as Resolved
                          </button>
                        </>
                      )}
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a message</h3>
                  <p>Choose a message from the list to read its contents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

