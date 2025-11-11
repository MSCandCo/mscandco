'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function SkillsAcademyPage() {
  const supabase = createClientComponentClient();

  const [modules, setModules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skillProfile, setSkillProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAITutor, setShowAITutor] = useState(false);

  const categories = [
    { id: 'all', name: 'All Courses', icon: '📚' },
    { id: 'distribution_basics', name: 'Distribution', icon: '🎵' },
    { id: 'marketing_promotion', name: 'Marketing', icon: '📈' },
    { id: 'music_rights', name: 'Rights & Legal', icon: '⚖️' },
    { id: 'production_skills', name: 'Production', icon: '🎹' },
    { id: 'business_finance', name: 'Business', icon: '💼' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load modules
      const { data: modulesData } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      setModules(modulesData || []);

      // Load enrollments
      const { data: enrollmentsData } = await supabase
        .from('learning_enrollments')
        .select('*, learning_modules(*)')
        .eq('user_id', user.id);

      setEnrollments(enrollmentsData || []);

      // Load certificates
      const { data: certificatesData } = await supabase
        .from('learning_certificates')
        .select('*, learning_modules(module_title)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      setCertificates(certificatesData || []);

      // Load skill profile
      const { data: profileData } = await supabase
        .from('user_skill_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSkillProfile(profileData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading skills data:', error);
      setLoading(false);
    }
  }

  async function enrollInModule(moduleId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('learning_enrollments')
        .insert([
          {
            user_id: user.id,
            module_id: moduleId,
            enrollment_status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await loadData();
      alert('Successfully enrolled!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll');
    }
  }

  const filteredModules =
    selectedCategory === 'all'
      ? modules
      : modules.filter((m) => m.module_category === selectedCategory);

  const completedCount = enrollments.filter(
    (e) => e.enrollment_status === 'completed'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skills Academy</h1>
        <p className="mt-2 text-gray-600">
          Master music business with AI-powered learning
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Enrolled Courses</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {enrollments.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Active learning</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {completedCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Courses finished</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Certificates</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {certificates.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Blockchain-verified</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Skill Level</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {skillProfile?.overall_skill_level || 'Beginner'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Current proficiency</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Course Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Available Courses ({filteredModules.length})
            </h2>

            {filteredModules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No courses found in this category
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((module) => {
                  const isEnrolled = enrollments.some(
                    (e) => e.module_id === module.id
                  );
                  const enrollment = enrollments.find(
                    (e) => e.module_id === module.id
                  );

                  return (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      {module.thumbnail_url && (
                        <img
                          src={module.thumbnail_url}
                          alt={module.module_title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {module.module_title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {module.module_description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>⏱ {module.estimated_duration_hours}h</span>
                        <span className="px-2 py-1 rounded bg-gray-100">
                          {module.difficulty_level}
                        </span>
                      </div>

                      {isEnrolled ? (
                        <div>
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {enrollment.progress_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${enrollment.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <Link
                            href={`/skills/modules/${module.id}`}
                            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            Continue Learning
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => enrollInModule(module.id)}
                          className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Progress & Tools */}
        <div className="space-y-6">
          {/* AI Tutor */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              🤖 AI Tutor
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              Get personalized help from GPT-4 powered tutor
            </p>
            <button
              onClick={() => setShowAITutor(true)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Chat with AI Tutor
            </button>
          </div>

          {/* Certificates */}
          {certificates.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Your Certificates</h3>
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cert.learning_modules?.module_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
                {certificates.length > 3 && (
                  <button className="w-full text-sm text-blue-600 hover:text-blue-700">
                    View all {certificates.length} certificates →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Learning Path */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Path</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Distribution Basics
                  </p>
                  <p className="text-xs text-gray-500">2 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-sm font-bold">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Marketing Essentials
                  </p>
                  <p className="text-xs text-gray-500">3 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-sm font-bold">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Rights Management
                  </p>
                  <p className="text-xs text-gray-500">4 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              What You Get
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>100+ professional courses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>GPT-4 powered AI tutor</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Blockchain certificates</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Interactive quizzes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Downloadable resources</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Progress tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Tutor Modal */}
      {showAITutor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">AI Tutor Chat</h3>
              <button
                onClick={() => setShowAITutor(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-700">
                💡 Ask me anything about music distribution, marketing, rights
                management, or any course topic!
              </p>
            </div>

            <div className="h-96 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto">
              <p className="text-sm text-gray-500 text-center">
                AI tutor integration coming soon...
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
