import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Add axios interceptor to always include token from localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface Script {
  id: string;
  name: string;
  language: string;
  description?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface TestRun {
  id: string;
  status: string;
  duration?: number;
  startedAt: string;
  allureReportUrl?: string;
  script: {
    name: string;
  };
}

interface HealingSuggestion {
  id: string;
  brokenLocator: string;
  validLocator: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  scriptId?: string;
  scriptName?: string;
  createdAt: string;
  reason?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activeTab, setActiveTab] = useState<'scripts' | 'runs' | 'stats' | 'allure' | 'healing'>('scripts');
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [healingSuggestions, setHealingSuggestions] = useState<HealingSuggestion[]>([]);
  const [healingStats, setHealingStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, avgConfidence: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await loadData();
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login...');
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Login response:', response.data);
      const { accessToken } = response.data;
      console.log('Access token received:', accessToken ? 'Yes' : 'No');
      localStorage.setItem('accessToken', accessToken);
      console.log('Token stored in localStorage');
      setIsAuthenticated(true);
      await loadData();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setScripts([]);
    setTestRuns([]);
    setHealingSuggestions([]);
  };

  const loadData = async () => {
    try {
      const [scriptsRes, runsRes, healingRes] = await Promise.all([
        axios.get(`${API_URL}/scripts`),
        axios.get(`${API_URL}/test-runs`),
        axios.get(`${API_URL}/self-healing/suggestions`).catch(() => ({ data: { suggestions: [] } }))
      ]);
      setScripts(scriptsRes.data.scripts || []);
      setTestRuns(runsRes.data.data || []);
      setHealingSuggestions(healingRes.data.suggestions || []);
      
      const suggestions = healingRes.data.suggestions || [];
      const stats = {
        total: suggestions.length,
        pending: suggestions.filter((s: HealingSuggestion) => s.status === 'pending').length,
        approved: suggestions.filter((s: HealingSuggestion) => s.status === 'approved').length,
        rejected: suggestions.filter((s: HealingSuggestion) => s.status === 'rejected').length,
        avgConfidence: suggestions.length > 0
          ? suggestions.reduce((sum: number, s: HealingSuggestion) => sum + s.confidence, 0) / suggestions.length
          : 0
      };
      setHealingStats(stats);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const generateAllureReport = async (testRunId: string) => {
    setGeneratingReport(testRunId);
    try {
      const response = await axios.post(`${API_URL}/allure/generate/${testRunId}`);
      await loadData();
      setSelectedReport(response.data.reportUrl);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGeneratingReport(null);
    }
  };

  const viewAllureReport = (reportUrl: string) => {
    setSelectedReport(reportUrl);
    setActiveTab('allure');
  };

  const approveSuggestion = async (id: string) => {
    try {
      await axios.post(`${API_URL}/self-healing/suggestions/${id}/approve`);
      await loadData();
    } catch (err) {
      console.error('Error approving suggestion:', err);
    }
  };

  const rejectSuggestion = async (id: string) => {
    try {
      await axios.post(`${API_URL}/self-healing/suggestions/${id}/reject`);
      await loadData();
    } catch (err) {
      console.error('Error rejecting suggestion:', err);
    }
  };

  const createDemoSuggestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token from localStorage:', token);
      console.log('Axios default auth header:', axios.defaults.headers.common['Authorization']);
      
      if (!token) {
        console.error('No access token found. Please login again.');
        alert('Please login first');
        return;
      }
      
      console.log('Sending demo request...');
      const response = await axios.post(`${API_URL}/self-healing/suggestions/demo`);
      console.log('Demo response:', response.data);
      await loadData();
    } catch (err: any) {
      console.error('Error creating demo suggestions:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        handleLogout();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Playwright-CRX</h1>
            <p className="text-gray-600">Test Automation Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="demo@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Demo credentials:</p>
              <p className="font-mono text-xs mt-1">demo@example.com / demo123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Playwright-CRX Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('scripts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scripts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scripts ({scripts.length})
              </button>
              <button
                onClick={() => setActiveTab('runs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'runs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Test Runs ({testRuns.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('allure')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'allure'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Allure Reports
              </button>
              <button
                onClick={() => setActiveTab('healing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'healing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💊 Self-Healing ({healingStats.pending})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'scripts' && (
          <div className="grid gap-4">
            {scripts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No scripts found. Record some tests using the extension!</p>
              </div>
            ) : (
              scripts.map(script => (
                <div key={script.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{script.name}</h3>
                      {script.description && (
                        <p className="text-gray-600 mt-1">{script.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {script.language}
                        </span>
                        <span>Created: {new Date(script.createdAt).toLocaleDateString()}</span>
                        <span>By: {script.user.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'runs' && (
          <div className="grid gap-4">
            {testRuns.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No test runs yet. Execute tests using the extension!</p>
              </div>
            ) : (
              testRuns.map(run => (
                <div key={run.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{run.script.name}</h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          run.status === 'passed' ? 'bg-green-100 text-green-800' :
                          run.status === 'failed' ? 'bg-red-100 text-red-800' :
                          run.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(run.startedAt).toLocaleString()}
                        </span>
                        {run.duration && (
                          <span className="text-gray-500">{run.duration}ms</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {run.allureReportUrl ? (
                        <button
                          onClick={() => viewAllureReport(run.allureReportUrl!)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          📊 View Report
                        </button>
                      ) : (
                        <button
                          onClick={() => generateAllureReport(run.id)}
                          disabled={generatingReport === run.id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {generatingReport === run.id ? '⏳ Generating...' : '📊 Generate Report'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'healing' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{healingStats.total}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Pending</div>
                <div className="mt-2 text-3xl font-bold text-yellow-600">{healingStats.pending}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Approved</div>
                <div className="mt-2 text-3xl font-bold text-green-600">{healingStats.approved}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Avg Confidence</div>
                <div className="mt-2 text-3xl font-bold text-blue-600">{Math.round(healingStats.avgConfidence * 100)}%</div>
              </div>
            </div>

            <div className="mb-6 flex gap-4">
              <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                🔄 Refresh
              </button>
              <button onClick={createDemoSuggestions} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                ✨ Create Demo Suggestions
              </button>
            </div>

            {healingSuggestions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Self-Healing Suggestions</h3>
                <p className="text-gray-600 mb-6">Suggestions will appear when tests fail with broken locators.</p>
                <button onClick={createDemoSuggestions} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  ✨ Create Demo Suggestions
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {healingSuggestions.filter(s => s.status === 'pending').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Pending ({healingSuggestions.filter(s => s.status === 'pending').length})</h2>
                    <div className="space-y-4">
                      {healingSuggestions.filter(s => s.status === 'pending').map(s => (
                        <div key={s.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium text-red-600 mb-1">❌ Broken:</div>
                              <code className="bg-red-50 px-3 py-2 rounded text-sm block break-all">{s.brokenLocator}</code>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-600 mb-1">✅ Suggested:</div>
                              <code className="bg-green-50 px-3 py-2 rounded text-sm block break-all">{s.validLocator}</code>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className={`font-bold ${s.confidence > 0.8 ? 'text-green-600' : s.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {Math.round(s.confidence * 100)}%
                              </span>
                              {s.scriptName && <span>{s.scriptName}</span>}
                              <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => approveSuggestion(s.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">✓ Approve</button>
                              <button onClick={() => rejectSuggestion(s.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">✗ Reject</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {healingSuggestions.filter(s => s.status === 'approved').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Approved ({healingSuggestions.filter(s => s.status === 'approved').length})</h2>
                    <div className="space-y-4">
                      {healingSuggestions.filter(s => s.status === 'approved').map(s => (
                        <div key={s.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">Broken:</div>
                              <code className="bg-gray-50 px-3 py-2 rounded text-sm block break-all">{s.brokenLocator}</code>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-600 mb-1">Fixed:</div>
                              <code className="bg-green-50 px-3 py-2 rounded text-sm block break-all">{s.validLocator}</code>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Approved</span>
                            <span>{Math.round(s.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Scripts</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{scripts.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Runs</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{testRuns.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Success Rate</div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {testRuns.length > 0
                  ? `${Math.round((testRuns.filter(r => r.status === 'passed').length / testRuns.length) * 100)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allure' && (
          <div className="bg-white rounded-lg shadow">
            {selectedReport ? (
              <div className="h-screen">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Allure Test Report</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close Report
                  </button>
                </div>
                <iframe
                  src={`http://localhost:3000${selectedReport}`}
                  className="w-full h-full border-0"
                  title="Allure Report"
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Selected</h3>
                <p className="text-gray-600 mb-4">
                  Go to Test Runs tab and generate or view an Allure report
                </p>
                <button
                  onClick={() => setActiveTab('runs')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Test Runs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
