'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  // Learning Dashboard State
  const [learningStats, setLearningStats] = useState({
    total_courses_completed: 0,
    total_hours_learned: 0,
    current_skill_level: 'Intermediate',
    certificates_earned: 0,
    active_courses: 0,
    learning_streak_days: 0,
  });

  const [skillProgress, setSkillProgress] = useState([
    { skill: 'Music Production', level: 75, category: 'Technical' },
    { skill: 'Audio Engineering', level: 60, category: 'Technical' },
    { skill: 'Music Business', level: 85, category: 'Business' },
    { skill: 'Marketing & Promotion', level: 70, category: 'Business' },
    { skill: 'Copyright Law', level: 55, category: 'Legal' },
    { skill: 'Live Performance', level: 80, category: 'Performance' },
    { skill: 'Songwriting', level: 90, category: 'Creative' },
    { skill: 'Music Theory', level: 65, category: 'Creative' },
  ]);

  // Courses State
  const [availableCourses, setAvailableCourses] = useState([
    {
      id: 1,
      title: 'Advanced Mixing Techniques',
      provider: 'Berklee Online',
      category: 'Technical',
      duration: '8 weeks',
      hours: 40,
      level: 'Advanced',
      rating: 4.8,
      enrolled: false,
      price: '£299',
      certified: true,
      description: 'Master professional mixing techniques used in modern music production.',
    },
    {
      id: 2,
      title: 'Music Business Fundamentals',
      provider: 'MI Online',
      category: 'Business',
      duration: '6 weeks',
      hours: 30,
      level: 'Intermediate',
      rating: 4.9,
      enrolled: false,
      price: '£199',
      certified: true,
      description: 'Learn the essential business skills every independent artist needs.',
    },
    {
      id: 3,
      title: 'Copyright & Publishing Essentials',
      provider: 'Music Rights Academy',
      category: 'Legal',
      duration: '4 weeks',
      hours: 20,
      level: 'Beginner',
      rating: 4.7,
      enrolled: false,
      price: '£149',
      certified: true,
      description: 'Understand music copyright, publishing, and royalty collection.',
    },
    {
      id: 4,
      title: 'Live Performance Mastery',
      provider: 'Artist Development Institute',
      category: 'Performance',
      duration: '10 weeks',
      hours: 50,
      level: 'Intermediate',
      rating: 4.9,
      enrolled: false,
      price: '£349',
      certified: true,
      description: 'Transform your live shows with professional performance techniques.',
    },
    {
      id: 5,
      title: 'Social Media Marketing for Musicians',
      provider: 'Digital Artist Academy',
      category: 'Business',
      duration: '5 weeks',
      hours: 25,
      level: 'Beginner',
      rating: 4.6,
      enrolled: false,
      price: '£129',
      certified: false,
      description: 'Build your online presence and engage with fans effectively.',
    },
    {
      id: 6,
      title: 'Mastering for Streaming Platforms',
      provider: 'Audio Engineering Society',
      category: 'Technical',
      duration: '3 weeks',
      hours: 15,
      level: 'Advanced',
      rating: 4.8,
      enrolled: false,
      price: '£179',
      certified: true,
      description: 'Learn optimization techniques for Spotify, Apple Music, and more.',
    },
  ]);

  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: 101,
      title: 'Music Production Fundamentals',
      provider: 'Berklee Online',
      category: 'Technical',
      progress: 85,
      started_date: '2025-01-15',
      expected_completion: '2025-03-15',
      hours_completed: 34,
      total_hours: 40,
      current_module: 'Module 7: Final Mix',
      grade: 92,
    },
    {
      id: 102,
      title: 'Digital Marketing Essentials',
      provider: 'MI Online',
      category: 'Business',
      progress: 45,
      started_date: '2025-02-01',
      expected_completion: '2025-03-30',
      hours_completed: 13.5,
      total_hours: 30,
      current_module: 'Module 4: Content Strategy',
      grade: 88,
    },
  ]);

  // Mentorship State
  const [mentors, setMentors] = useState([
    {
      id: 1,
      name: 'Sarah Williams',
      expertise: 'Music Production & Engineering',
      experience: '15 years',
      sessions_available: 3,
      hourly_rate: '£120',
      rating: 4.9,
      total_reviews: 127,
      bio: 'Grammy-nominated producer who has worked with major artists across multiple genres.',
      availability: 'Mon, Wed, Fri',
      specialties: ['Mixing', 'Mastering', 'Vocal Production'],
    },
    {
      id: 2,
      name: 'James Chen',
      expertise: 'Music Business & Rights',
      experience: '12 years',
      sessions_available: 5,
      hourly_rate: '£95',
      rating: 4.8,
      total_reviews: 94,
      bio: 'Former A&R executive now helping independent artists navigate the music industry.',
      availability: 'Tue, Thu, Sat',
      specialties: ['Publishing', 'Contracts', 'Royalties'],
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      expertise: 'Live Performance & Touring',
      experience: '20 years',
      sessions_available: 2,
      hourly_rate: '£150',
      rating: 5.0,
      total_reviews: 203,
      bio: 'Touring musician and stage director with experience in major festivals worldwide.',
      availability: 'Wed, Thu',
      specialties: ['Stage Presence', 'Tour Management', 'Band Leadership'],
    },
  ]);

  const [bookedSessions, setBookedSessions] = useState([
    {
      id: 1,
      mentor_name: 'Sarah Williams',
      topic: 'Mixing Techniques Review',
      scheduled_date: '2025-11-15',
      scheduled_time: '14:00',
      duration: '60 minutes',
      status: 'Confirmed',
      meeting_link: 'https://zoom.us/j/example123',
    },
  ]);

  // Resources State
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Complete Guide to Music Rights',
      type: 'eBook',
      category: 'Legal',
      format: 'PDF',
      pages: 145,
      price: 'Free',
      downloaded: false,
      rating: 4.7,
    },
    {
      id: 2,
      title: 'Production Workflow Templates',
      type: 'Template',
      category: 'Technical',
      format: 'ZIP',
      files: 25,
      price: '£29',
      downloaded: false,
      rating: 4.9,
    },
    {
      id: 3,
      title: 'Artist Brand Development Workbook',
      type: 'Workbook',
      category: 'Business',
      format: 'PDF',
      pages: 68,
      price: 'Free',
      downloaded: false,
      rating: 4.8,
    },
    {
      id: 4,
      title: 'Industry Contact Database',
      type: 'Database',
      category: 'Business',
      format: 'Excel',
      entries: 500,
      price: '£49',
      downloaded: false,
      rating: 4.6,
    },
  ]);

  const [webinars, setWebinars] = useState([
    {
      id: 1,
      title: 'New Streaming Royalty Models Explained',
      presenter: 'Mark Thompson - Music Business Expert',
      date: '2025-11-18',
      time: '18:00 GMT',
      duration: '90 minutes',
      registered: false,
      capacity: 500,
      registered_count: 387,
      type: 'Live',
    },
    {
      id: 2,
      title: 'AI in Music Production: Friend or Foe?',
      presenter: 'Panel Discussion',
      date: '2025-11-22',
      time: '19:00 GMT',
      duration: '120 minutes',
      registered: false,
      capacity: 1000,
      registered_count: 756,
      type: 'Live',
    },
    {
      id: 3,
      title: 'Building Your Artist Brand in 2025',
      presenter: 'Lisa Martinez - Marketing Strategist',
      date: 'On-Demand',
      time: 'Available Now',
      duration: '75 minutes',
      registered: false,
      views: 2341,
      type: 'Recorded',
    },
  ]);

  // Learning Path Form State
  const [learningGoal, setLearningGoal] = useState({
    primary_goal: '',
    target_skills: [],
    time_commitment: '',
    budget: '',
    timeline: '',
  });

  const [sessionBookingForm, setSessionBookingForm] = useState({
    mentor_id: '',
    topic: '',
    preferred_date: '',
    preferred_time: '',
    duration: '60',
    notes: '',
  });

  useEffect(() => {
    fetchUser();
    fetchLearningData();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchLearningData = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await fetch('/api/features/learning/stats');
      // const data = await response.json();
      // setLearningStats(data.stats);
      // setSkillProgress(data.skills);

      // Simulated data loading
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching learning data:', error);
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await fetch('/api/features/learning/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });

      if (response.ok) {
        setAvailableCourses(
          availableCourses.map((course) =>
            course.id === courseId ? { ...course, enrolled: true } : course
          )
        );
        alert('Successfully enrolled in course!');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/features/learning/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionBookingForm),
      });

      if (response.ok) {
        alert('Mentorship session booked successfully!');
        setSessionBookingForm({
          mentor_id: '',
          topic: '',
          preferred_date: '',
          preferred_time: '',
          duration: '60',
          notes: '',
        });
        fetchLearningData();
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  const handleDownloadResource = async (resourceId) => {
    try {
      const response = await fetch(`/api/features/learning/download/${resourceId}`);
      if (response.ok) {
        setResources(
          resources.map((resource) =>
            resource.id === resourceId ? { ...resource, downloaded: true } : resource
          )
        );
        alert('Resource downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Failed to download resource. Please try again.');
    }
  };

  const handleRegisterWebinar = async (webinarId) => {
    try {
      const response = await fetch('/api/features/learning/register-webinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webinar_id: webinarId }),
      });

      if (response.ok) {
        setWebinars(
          webinars.map((webinar) =>
            webinar.id === webinarId ? { ...webinar, registered: true } : webinar
          )
        );
        alert('Registered for webinar successfully!');
      }
    } catch (error) {
      console.error('Error registering for webinar:', error);
      alert('Failed to register for webinar. Please try again.');
    }
  };

  const handleSubmitLearningGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/features/learning/set-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(learningGoal),
      });

      if (response.ok) {
        alert('Learning goal set successfully! We will recommend courses based on your goals.');
        setLearningGoal({
          primary_goal: '',
          target_skills: [],
          time_commitment: '',
          budget: '',
          timeline: '',
        });
      }
    } catch (error) {
      console.error('Error setting learning goal:', error);
      alert('Failed to set learning goal. Please try again.');
    }
  };

  // Chart Data
  const skillRadarData = {
    labels: skillProgress.map((skill) => skill.skill),
    datasets: [
      {
        label: 'Current Skill Level',
        data: skillProgress.map((skill) => skill.level),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
      },
    ],
  };

  const learningProgressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Hours Learned',
        data: [3, 5, 7, 6, 8, 10, 9, 12],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const categoryDistributionData = {
    labels: ['Technical', 'Business', 'Legal', 'Creative', 'Performance'],
    datasets: [
      {
        label: 'Hours by Category',
        data: [45, 32, 18, 38, 27],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const certificateProgressData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [5, 2, 8],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(148, 163, 184, 0.5)',
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skills Development & Learning</h1>
          <p className="mt-2 text-gray-600">
            Access professional courses, mentorship, resources, and continuous learning opportunities
            to advance your music career.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.total_courses_completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Learned</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.total_hours_learned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.certificates_earned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.learning_streak_days} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'courses', label: 'Courses', icon: '📚' },
                { id: 'mentorship', label: 'Mentorship', icon: '👥' },
                { id: 'resources', label: 'Resources', icon: '📖' },
                { id: 'progress', label: 'My Progress', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Learning Overview
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Skill Distribution
                      </h3>
                      <div className="h-64">
                        <Radar data={skillRadarData} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Learning Hours by Category
                      </h3>
                      <div className="h-64">
                        <Doughnut
                          data={categoryDistributionData}
                          options={{ maintainAspectRatio: false }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Weekly Learning Progress
                      </h3>
                      <div className="h-64">
                        <Bar
                          data={learningProgressData}
                          options={{ maintainAspectRatio: false }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Certificate Progress
                      </h3>
                      <div className="h-64">
                        <Doughnut
                          data={certificateProgressData}
                          options={{ maintainAspectRatio: false }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Courses */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Currently Enrolled Courses
                  </h3>
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-600">{course.provider}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {course.progress}% Complete
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{course.current_module}</span>
                            <span>Grade: {course.grade}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>
                            {course.hours_completed}/{course.total_hours} hours
                          </span>
                          <span>Due: {course.expected_completion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Sessions */}
                {bookedSessions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Upcoming Mentorship Sessions
                    </h3>
                    <div className="space-y-4">
                      {bookedSessions.map((session) => (
                        <div
                          key={session.id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{session.topic}</h4>
                              <p className="text-sm text-gray-600">
                                with {session.mentor_name}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                📅 {session.scheduled_date} at {session.scheduled_time} •{' '}
                                {session.duration}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {session.status}
                            </span>
                          </div>
                          {session.meeting_link && (
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              Join Meeting →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Available Courses
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Browse professional courses from top music education providers. All courses
                    include certification upon completion.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600">{course.provider}</p>
                          </div>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                            {course.level}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">{course.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {course.duration} ({course.hours} hours)
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {course.rating} / 5.0
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            {course.category}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {course.price}
                            </span>
                            {course.certified && (
                              <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                ✓ Certified
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEnrollCourse(course.id)}
                            disabled={course.enrolled}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              course.enrolled
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {course.enrolled ? 'Enrolled' : 'Enroll Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mentorship Tab */}
            {activeTab === 'mentorship' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Connect with Industry Mentors
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Book one-on-one sessions with experienced music industry professionals to get
                    personalized guidance and expert advice.
                  </p>

                  <div className="space-y-6">
                    {mentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {mentor.name}
                                </h3>
                                <p className="text-sm text-gray-600">{mentor.expertise}</p>
                                <p className="text-sm text-gray-500">
                                  {mentor.experience} experience
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="h-4 w-4 text-yellow-400 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {mentor.rating} ({mentor.total_reviews})
                                </div>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                  {mentor.hourly_rate}/hr
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mt-3">{mentor.bio}</p>

                            <div className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {mentor.specialties.map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                📅 Available: {mentor.availability}
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {mentor.sessions_available} slots available
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Session Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Book a Mentorship Session
                  </h3>
                  <form onSubmit={handleBookSession} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Mentor
                      </label>
                      <select
                        value={sessionBookingForm.mentor_id}
                        onChange={(e) =>
                          setSessionBookingForm({
                            ...sessionBookingForm,
                            mentor_id: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Choose a mentor...</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name} - {mentor.expertise}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Topic
                      </label>
                      <input
                        type="text"
                        value={sessionBookingForm.topic}
                        onChange={(e) =>
                          setSessionBookingForm({
                            ...sessionBookingForm,
                            topic: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Mixing techniques for electronic music"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={sessionBookingForm.preferred_date}
                          onChange={(e) =>
                            setSessionBookingForm({
                              ...sessionBookingForm,
                              preferred_date: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={sessionBookingForm.preferred_time}
                          onChange={(e) =>
                            setSessionBookingForm({
                              ...sessionBookingForm,
                              preferred_time: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration
                      </label>
                      <select
                        value={sessionBookingForm.duration}
                        onChange={(e) =>
                          setSessionBookingForm({
                            ...sessionBookingForm,
                            duration: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={sessionBookingForm.notes}
                        onChange={(e) =>
                          setSessionBookingForm({
                            ...sessionBookingForm,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Any specific topics or questions you'd like to discuss..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      Book Session
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Learning Resources
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Access downloadable resources, templates, and guides to support your music
                    career development.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-gray-600">{resource.type}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {resource.category}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            {resource.format}
                            {resource.pages && ` • ${resource.pages} pages`}
                            {resource.files && ` • ${resource.files} files`}
                            {resource.entries && ` • ${resource.entries} entries`}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="h-4 w-4 text-yellow-400 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {resource.rating} / 5.0
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-lg font-bold text-gray-900">
                            {resource.price}
                          </span>
                          <button
                            onClick={() => handleDownloadResource(resource.id)}
                            disabled={resource.downloaded}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              resource.downloaded
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : resource.price === 'Free'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {resource.downloaded ? '✓ Downloaded' : 'Download'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Webinars Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Upcoming Webinars & Workshops
                  </h2>
                  <div className="space-y-4">
                    {webinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full mr-3 ${
                                  webinar.type === 'Live'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {webinar.type === 'Live' ? '🔴 Live' : '📹 On-Demand'}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {webinar.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{webinar.presenter}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {webinar.date}
                              </div>
                              {webinar.time && (
                                <div className="flex items-center">
                                  <svg
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {webinar.time}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                                {webinar.duration}
                              </div>
                            </div>
                            {webinar.type === 'Live' && (
                              <div className="mt-3 text-sm text-gray-600">
                                {webinar.registered_count}/{webinar.capacity} registered
                              </div>
                            )}
                            {webinar.type === 'Recorded' && (
                              <div className="mt-3 text-sm text-gray-600">
                                {webinar.views} views
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRegisterWebinar(webinar.id)}
                            disabled={webinar.registered}
                            className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                              webinar.registered
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {webinar.registered
                              ? '✓ Registered'
                              : webinar.type === 'Live'
                              ? 'Register'
                              : 'Watch Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">My Skill Progress</h2>
                  <div className="space-y-4">
                    {skillProgress.map((skill, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                            <p className="text-sm text-gray-600">{skill.category}</p>
                          </div>
                          <span className="text-lg font-bold text-indigo-600">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Goals */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Set Your Learning Goals
                  </h3>
                  <form onSubmit={handleSubmitLearningGoal} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Learning Goal
                      </label>
                      <select
                        value={learningGoal.primary_goal}
                        onChange={(e) =>
                          setLearningGoal({ ...learningGoal, primary_goal: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Choose your primary goal...</option>
                        <option value="production">Master Music Production</option>
                        <option value="business">Understand Music Business</option>
                        <option value="performance">Improve Live Performance</option>
                        <option value="marketing">Learn Digital Marketing</option>
                        <option value="rights">Master Copyright & Rights</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Skills (select multiple)
                      </label>
                      <select
                        multiple
                        value={learningGoal.target_skills}
                        onChange={(e) =>
                          setLearningGoal({
                            ...learningGoal,
                            target_skills: Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            ),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        size={5}
                      >
                        {skillProgress.map((skill) => (
                          <option key={skill.skill} value={skill.skill}>
                            {skill.skill}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hold Ctrl/Cmd to select multiple skills
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Commitment
                        </label>
                        <select
                          value={learningGoal.time_commitment}
                          onChange={(e) =>
                            setLearningGoal({
                              ...learningGoal,
                              time_commitment: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select time...</option>
                          <option value="1-3">1-3 hours/week</option>
                          <option value="3-5">3-5 hours/week</option>
                          <option value="5-10">5-10 hours/week</option>
                          <option value="10+">10+ hours/week</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Budget
                        </label>
                        <select
                          value={learningGoal.budget}
                          onChange={(e) =>
                            setLearningGoal({ ...learningGoal, budget: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select budget...</option>
                          <option value="0-50">£0-50</option>
                          <option value="50-100">£50-100</option>
                          <option value="100-200">£100-200</option>
                          <option value="200+">£200+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Timeline
                      </label>
                      <select
                        value={learningGoal.timeline}
                        onChange={(e) =>
                          setLearningGoal({ ...learningGoal, timeline: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select timeline...</option>
                        <option value="1-3">1-3 months</option>
                        <option value="3-6">3-6 months</option>
                        <option value="6-12">6-12 months</option>
                        <option value="12+">12+ months</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      Set Learning Goals
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
