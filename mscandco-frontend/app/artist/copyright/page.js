'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CopyrightProtection() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('registrations'); // registrations, dmca, monitoring, verification
  const [releases, setReleases] = useState([]);
  const [copyrights, setCopyrights] = useState([]);
  const [dmcaClaims, setDmcaClaims] = useState([]);
  const [monitoringReports, setMonitoringReports] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // Registration state
  const [registerForm, setRegisterForm] = useState({
    release_id: '',
    work_title: '',
    copyright_type: 'sound_recording',
    registration_number: '',
    registration_date: '',
    territory: 'worldwide',
    notes: '',
  });

  // DMCA claim state
  const [dmcaForm, setDmcaForm] = useState({
    infringing_url: '',
    platform: '',
    description: '',
    evidence_urls: [],
  });

  const copyrightTypes = [
    { value: 'sound_recording', label: 'Sound Recording', description: 'The recorded performance' },
    { value: 'composition', label: 'Musical Composition', description: 'The underlying musical work' },
    { value: 'lyrics', label: 'Lyrics', description: 'The written lyrics' },
    { value: 'artwork', label: 'Artwork', description: 'Album cover or promotional images' },
    { value: 'video', label: 'Video', description: 'Music videos or visual content' },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadReleases();
        await loadCopyrights();
        await loadDMCAClaims();
        await loadMonitoring();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadReleases() {
    const { data } = await supabase
      .from('releases')
      .select('*')
      .order('release_date', { ascending: false });
    setReleases(data || []);
  }

  async function loadCopyrights() {
    try {
      const response = await fetch('/api/features/copyright/registrations');
      const data = await response.json();
      setCopyrights(data.registrations || []);
    } catch (error) {
      console.error('Failed to load copyrights:', error);
    }
  }

  async function loadDMCAClaims() {
    try {
      const response = await fetch('/api/features/copyright/dmca-claims');
      const data = await response.json();
      setDmcaClaims(data.claims || []);
    } catch (error) {
      console.error('Failed to load DMCA claims:', error);
    }
  }

  async function loadMonitoring() {
    try {
      const response = await fetch('/api/features/copyright/monitoring');
      const data = await response.json();
      setMonitoringReports(data.reports || []);
    } catch (error) {
      console.error('Failed to load monitoring:', error);
    }
  }

  async function registerCopyright() {
    if (!registerForm.release_id || !registerForm.work_title) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/features/copyright/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('Copyright registered successfully!');
        setRegisterForm({
          release_id: '',
          work_title: '',
          copyright_type: 'sound_recording',
          registration_number: '',
          registration_date: '',
          territory: 'worldwide',
          notes: '',
        });
        await loadCopyrights();
      } else {
        alert('Failed to register: ' + data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register: ' + error.message);
    }
  }

  async function fileDMCA() {
    if (!dmcaForm.infringing_url || !dmcaForm.platform) {
      alert('Please provide the infringing URL and platform');
      return;
    }

    try {
      const response = await fetch('/api/features/copyright/dmca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dmcaForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('DMCA claim filed successfully!');
        setDmcaForm({
          infringing_url: '',
          platform: '',
          description: '',
          evidence_urls: [],
        });
        await loadDMCAClaims();
      } else {
        alert('Failed to file claim: ' + data.error);
      }
    } catch (error) {
      console.error('DMCA error:', error);
      alert('Failed to file claim: ' + error.message);
    }
  }

  async function runVerification(copyrightId) {
    try {
      const response = await fetch(`/api/features/copyright/verify/${copyrightId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert(`Verification complete! Status: ${data.verification.status}`);
        await loadCopyrights();
      } else {
        alert('Verification failed: ' + data.error);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed: ' + error.message);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      registered: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      disputed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const getDMCAStatusColor = (status) => {
    const colors = {
      filed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      content_removed: 'bg-green-100 text-green-800',
      counter_notice: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.filed;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">©️ Copyright Protection & Rights Management</h1>
          <p className="text-gray-600">
            Protect your creative works with copyright registration, DMCA takedowns, and AI-powered monitoring
          </p>
        </div>

        {/* Protection Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Registered Works</div>
            <div className="text-3xl font-bold">{copyrights.length}</div>
            <div className="text-xs text-green-600 mt-1">Protected</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active DMCA Claims</div>
            <div className="text-3xl font-bold text-blue-600">
              {dmcaClaims.filter(c => ['filed', 'in_progress'].includes(c.status)).length}
            </div>
            <div className="text-xs text-blue-500 mt-1">In progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Takedowns Successful</div>
            <div className="text-3xl font-bold text-green-600">
              {dmcaClaims.filter(c => c.status === 'content_removed').length}
            </div>
            <div className="text-xs text-green-500 mt-1">Violations removed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Monitoring Reports</div>
            <div className="text-3xl font-bold text-purple-600">
              {monitoringReports.length}
            </div>
            <div className="text-xs text-purple-500 mt-1">Scans completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'registrations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('registrations')}
          >
            📋 Registrations ({copyrights.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            ➕ Register Copyright
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'dmca'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dmca')}
          >
            ⚠️ DMCA Takedowns ({dmcaClaims.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'monitoring'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('monitoring')}
          >
            🔍 Infringement Monitoring
          </button>
        </div>

        {/* TAB: Registrations */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {copyrights.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No copyright registrations yet</p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register Your First Copyright
                </button>
              </div>
            ) : (
              copyrights.map(copyright => (
                <div key={copyright.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{copyright.work_title}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {copyrightTypes.find(t => t.value === copyright.copyright_type)?.label}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(copyright.status)}`}>
                      {copyright.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {copyright.registration_number && (
                      <div>
                        <div className="text-xs text-gray-500">Registration #</div>
                        <div className="font-semibold">{copyright.registration_number}</div>
                      </div>
                    )}
                    {copyright.registration_date && (
                      <div>
                        <div className="text-xs text-gray-500">Registration Date</div>
                        <div className="font-semibold">{new Date(copyright.registration_date).toLocaleDateString()}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500">Territory</div>
                      <div className="font-semibold capitalize">{copyright.territory}</div>
                    </div>
                  </div>

                  {copyright.ai_verification_status && (
                    <div className="p-3 bg-blue-50 rounded mb-4">
                      <div className="text-sm font-medium">AI Verification Status: {copyright.ai_verification_status}</div>
                      {copyright.verification_confidence && (
                        <div className="text-xs text-gray-600 mt-1">
                          Confidence: {(copyright.verification_confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => runVerification(copyright.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                      Run AI Verification
                    </button>
                    <button
                      onClick={() => setSelectedRelease(copyright)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                      View Details
                    </button>
                  </div>

                  {copyright.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-1">Notes:</div>
                      <div className="text-sm text-gray-700">{copyright.notes}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Register Copyright */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">➕ Register Copyright</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Select Release <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerForm.release_id}
                  onChange={(e) => {
                    const release = releases.find(r => r.id === e.target.value);
                    setRegisterForm({
                      ...registerForm,
                      release_id: e.target.value,
                      work_title: release?.title || '',
                    });
                  }}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="">-- Select a release --</option>
                  {releases.map(release => (
                    <option key={release.id} value={release.id}>
                      {release.title} - {release.artist_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Work Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerForm.work_title}
                  onChange={(e) => setRegisterForm({...registerForm, work_title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Enter the work title"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Copyright Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {copyrightTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setRegisterForm({...registerForm, copyright_type: type.value})}
                      className={`p-3 border rounded-lg text-left ${
                        registerForm.copyright_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Number (Optional)</label>
                <input
                  type="text"
                  value={registerForm.registration_number}
                  onChange={(e) => setRegisterForm({...registerForm, registration_number: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="e.g., TX 8-123-456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Date (Optional)</label>
                <input
                  type="date"
                  value={registerForm.registration_date}
                  onChange={(e) => setRegisterForm({...registerForm, registration_date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Territory</label>
                <select
                  value={registerForm.territory}
                  onChange={(e) => setRegisterForm({...registerForm, territory: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="worldwide">Worldwide</option>
                  <option value="usa">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="eu">European Union</option>
                  <option value="canada">Canada</option>
                  <option value="australia">Australia</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={registerForm.notes}
                  onChange={(e) => setRegisterForm({...registerForm, notes: e.target.value})}
                  className="w-full h-24 px-4 py-2 border rounded-md"
                  placeholder="Additional notes about this copyright registration..."
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">💡 Copyright Protection Tips</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Register your copyright as soon as your work is created in fixed form</li>
                <li>• Keep detailed records of creation dates and versions</li>
                <li>• Store original files and project files securely</li>
                <li>• Use our AI verification system to monitor for infringement</li>
                <li>• File DMCA takedown notices immediately upon discovery of unauthorized use</li>
              </ul>
            </div>

            <button
              onClick={registerCopyright}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
            >
              Register Copyright
            </button>
          </div>
        )}

        {/* TAB: DMCA Takedowns */}
        {activeTab === 'dmca' && (
          <div className="space-y-6">
            {/* File New DMCA */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">⚠️ File DMCA Takedown Notice</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Infringing URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={dmcaForm.infringing_url}
                    onChange={(e) => setDmcaForm({...dmcaForm, infringing_url: e.target.value})}
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="https://example.com/unauthorized-use"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dmcaForm.platform}
                    onChange={(e) => setDmcaForm({...dmcaForm, platform: e.target.value})}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="">-- Select platform --</option>
                    <option value="youtube">YouTube</option>
                    <option value="soundcloud">SoundCloud</option>
                    <option value="spotify">Spotify</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description of Infringement</label>
                  <textarea
                    value={dmcaForm.description}
                    onChange={(e) => setDmcaForm({...dmcaForm, description: e.target.value})}
                    className="w-full h-32 px-4 py-2 border rounded-md"
                    placeholder="Describe how your work is being used without authorization..."
                  />
                </div>

                <button
                  onClick={fileDMCA}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
                >
                  File DMCA Takedown Notice
                </button>
              </div>
            </div>

            {/* Existing DMCA Claims */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Active & Past DMCA Claims</h2>

              {dmcaClaims.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No DMCA claims filed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {dmcaClaims.map(claim => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{claim.platform}</div>
                          <a
                            href={claim.infringing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {claim.infringing_url}
                          </a>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDMCAStatusColor(claim.status)}`}>
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {claim.description && (
                        <p className="text-sm text-gray-700 mb-3">{claim.description}</p>
                      )}

                      <div className="text-xs text-gray-500">
                        Filed: {new Date(claim.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">🔍 AI-Powered Infringement Monitoring</h2>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-2">Automated Copyright Monitoring</h3>
              <p className="text-gray-700 mb-4">
                Our AI system continuously scans the internet for unauthorized use of your copyrighted works,
                including audio fingerprinting, image recognition, and text matching across major platforms.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-purple-600">150+</div>
                  <div className="text-sm text-gray-600">Platforms Monitored</div>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Continuous Scanning</div>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-600">Detection Accuracy</div>
                </div>
              </div>
            </div>

            {monitoringReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No monitoring reports yet. Reports are generated weekly.
              </div>
            ) : (
              <div className="space-y-4">
                {monitoringReports.map((report, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">Scan Report #{report.id?.slice(0, 8)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(report.scan_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{report.violations_found || 0}</div>
                        <div className="text-xs text-gray-600">Potential violations</div>
                      </div>
                    </div>

                    {report.violations_found > 0 && (
                      <div className="p-3 bg-red-50 rounded">
                        <div className="font-semibold text-sm text-red-800 mb-2">
                          Violations detected - immediate action recommended
                        </div>
                        <button
                          onClick={() => setActiveTab('dmca')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          File DMCA Takedown
                        </button>
                      </div>
                    )}
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
