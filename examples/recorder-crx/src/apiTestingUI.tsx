/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import {
  apiTestingService,
  type ApiTestCase,
  type ApiRequest,
  type ApiResponse,
  type ApiAssertion,
  type ApiMock,
  type PerformanceBenchmark,
  type HttpMethod
} from './apiTestingService';

interface ApiTestingUIProps {
  onClose: () => void;
}

type TabType = 'recorder' | 'tests' | 'mocks' | 'benchmark' | 'contracts';

export const ApiTestingUI: React.FC<ApiTestingUIProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<TabType>('recorder');
  const [capturedRequests, setCapturedRequests] = React.useState<Array<{ request: ApiRequest; response?: ApiResponse }>>([]);
  const [testCases, setTestCases] = React.useState<ApiTestCase[]>([]);
  const [selectedRequest, setSelectedRequest] = React.useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = React.useState<ApiTestCase | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [mocks, setMocks] = React.useState<ApiMock[]>([]);
  const [benchmarks, setBenchmarks] = React.useState<PerformanceBenchmark[]>([]);
  const [showNewTest, setShowNewTest] = React.useState(false);
  const [showNewMock, setShowNewMock] = React.useState(false);
  const [showNewBenchmark, setShowNewBenchmark] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCapturedRequests(apiTestingService.getCapturedRequests());
    setTestCases(apiTestingService.getTestCases());
    setMocks(apiTestingService.getMocks());
    setBenchmarks(apiTestingService.getBenchmarks());
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    apiTestingService.clearCapturedRequests();
    setCapturedRequests([]);

    // In a real implementation, this would start intercepting network requests
    // through the background script or content script
    chrome.runtime.sendMessage({ type: 'startApiRecording' });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    chrome.runtime.sendMessage({ type: 'stopApiRecording' });
    loadData();
  };

  const handleCreateTestFromRequest = (requestId: string) => {
    const name = prompt('Enter test case name:');
    if (!name) return;

    const testCase = apiTestingService.createTestCaseFromRequest(requestId, name);
    if (testCase) {
      loadData();
      setActiveTab('tests');
    }
  };

  const handleExecuteTest = async (testId: string) => {
    try {
      await apiTestingService.executeTestCase(testId);
      loadData();
    } catch (error) {
      alert(`Test execution failed: ${error}`);
    }
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      apiTestingService.deleteTestCase(testId);
      loadData();
    }
  };

  const handleToggleMock = (mockId: string) => {
    const mock = mocks.find(m => m.id === mockId);
    if (mock) {
      apiTestingService.updateMock(mockId, { enabled: !mock.enabled });
      loadData();
    }
  };

  const handleRunBenchmark = async (benchmarkId: string) => {
    try {
      await apiTestingService.runBenchmark(benchmarkId, 10);
      loadData();
    } catch (error) {
      alert(`Benchmark failed: ${error}`);
    }
  };

  return (
    <div className="api-testing-panel">
      <div className="api-testing-header">
        <h2>🔌 API Testing Suite</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="api-testing-tabs">
        <button
          className={activeTab === 'recorder' ? 'active' : ''}
          onClick={() => setActiveTab('recorder')}
        >
          📡 Recorder
        </button>
        <button
          className={activeTab === 'tests' ? 'active' : ''}
          onClick={() => setActiveTab('tests')}
        >
          ✅ Tests ({testCases.length})
        </button>
        <button
          className={activeTab === 'mocks' ? 'active' : ''}
          onClick={() => setActiveTab('mocks')}
        >
          🎭 Mocks ({mocks.length})
        </button>
        <button
          className={activeTab === 'benchmark' ? 'active' : ''}
          onClick={() => setActiveTab('benchmark')}
        >
          ⚡ Benchmark
        </button>
        <button
          className={activeTab === 'contracts' ? 'active' : ''}
          onClick={() => setActiveTab('contracts')}
        >
          📋 Contracts
        </button>
      </div>

      <div className="api-testing-content">
        {activeTab === 'recorder' && (
          <RecorderTab
            isRecording={isRecording}
            capturedRequests={capturedRequests}
            selectedRequest={selectedRequest}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onSelectRequest={setSelectedRequest}
            onCreateTest={handleCreateTestFromRequest}
          />
        )}

        {activeTab === 'tests' && (
          <TestsTab
            testCases={testCases}
            selectedTestCase={selectedTestCase}
            onSelectTestCase={setSelectedTestCase}
            onExecuteTest={handleExecuteTest}
            onDeleteTest={handleDeleteTest}
            onNewTest={() => setShowNewTest(true)}
          />
        )}

        {activeTab === 'mocks' && (
          <MocksTab
            mocks={mocks}
            onToggleMock={handleToggleMock}
            onNewMock={() => setShowNewMock(true)}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkTab
            benchmarks={benchmarks}
            onRunBenchmark={handleRunBenchmark}
            onNewBenchmark={() => setShowNewBenchmark(true)}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsTab />
        )}
      </div>
    </div>
  );
};

// Recorder Tab Component
const RecorderTab: React.FC<{
  isRecording: boolean;
  capturedRequests: Array<{ request: ApiRequest; response?: ApiResponse }>;
  selectedRequest: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSelectRequest: (id: string) => void;
  onCreateTest: (id: string) => void;
}> = ({ isRecording, capturedRequests, selectedRequest, onStartRecording, onStopRecording, onSelectRequest, onCreateTest }) => {
  const selected = capturedRequests.find(r => r.request.id === selectedRequest);

  return (
    <div className="recorder-tab">
      <div className="recorder-controls">
        {!isRecording ? (
          <button className="primary-button" onClick={onStartRecording}>
            ▶️ Start Recording
          </button>
        ) : (
          <button className="danger-button" onClick={onStopRecording}>
            ⏹️ Stop Recording
          </button>
        )}
        <span className="recording-status">
          {isRecording ? '🔴 Recording...' : '⚫ Not Recording'}
        </span>
      </div>

      <div className="captured-requests">
        <h3>Captured Requests ({capturedRequests.length})</h3>
        <div className="request-list">
          {capturedRequests.map(({ request, response }) => (
            <div
              key={request.id}
              className={`request-item ${selectedRequest === request.id ? 'selected' : ''}`}
              onClick={() => onSelectRequest(request.id)}
            >
              <div className="request-method-badge" data-method={request.method}>
                {request.method}
              </div>
              <div className="request-url">{request.url}</div>
              {response && (
                <div className={`status-badge status-${Math.floor(response.status / 100)}xx`}>
                  {response.status}
                </div>
              )}
              <button
                className="create-test-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTest(request.id);
                }}
              >
                + Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="request-details">
          <h3>Request Details</h3>
          <div className="detail-section">
            <h4>Request</h4>
            <div><strong>URL:</strong> {selected.request.url}</div>
            <div><strong>Method:</strong> {selected.request.method}</div>
            <div><strong>Headers:</strong></div>
            <pre>{JSON.stringify(selected.request.headers, null, 2)}</pre>
            {selected.request.body && (
              <>
                <div><strong>Body:</strong></div>
                <pre>{selected.request.body}</pre>
              </>
            )}
          </div>

          {selected.response && (
            <div className="detail-section">
              <h4>Response</h4>
              <div><strong>Status:</strong> {selected.response.status} {selected.response.statusText}</div>
              <div><strong>Response Time:</strong> {selected.response.responseTime}ms</div>
              <div><strong>Headers:</strong></div>
              <pre>{JSON.stringify(selected.response.headers, null, 2)}</pre>
              {selected.response.body && (
                <>
                  <div><strong>Body:</strong></div>
                  <pre className="response-body">{selected.response.body}</pre>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tests Tab Component
const TestsTab: React.FC<{
  testCases: ApiTestCase[];
  selectedTestCase: ApiTestCase | null;
  onSelectTestCase: (test: ApiTestCase) => void;
  onExecuteTest: (id: string) => void;
  onDeleteTest: (id: string) => void;
  onNewTest: () => void;
}> = ({ testCases, selectedTestCase, onSelectTestCase, onExecuteTest, onDeleteTest, onNewTest }) => {
  return (
    <div className="tests-tab">
      <div className="tests-header">
        <h3>API Test Cases</h3>
        <button className="primary-button" onClick={onNewTest}>+ New Test</button>
      </div>

      <div className="test-list">
        {testCases.map(test => {
          const allPassed = test.assertions.every(a => a.passed);
          const hasFailed = test.assertions.some(a => a.passed === false);

          return (
            <div
              key={test.id}
              className={`test-item ${selectedTestCase?.id === test.id ? 'selected' : ''}`}
              onClick={() => onSelectTestCase(test)}
            >
              <div className="test-info">
                <div className="test-name">{test.name}</div>
                <div className="test-meta">
                  <span className="request-method-badge" data-method={test.request.method}>
                    {test.request.method}
                  </span>
                  <span className="test-url">{test.request.url}</span>
                </div>
              </div>
              <div className="test-actions">
                {test.response && (
                  <span className={`test-status ${allPassed ? 'passed' : hasFailed ? 'failed' : 'pending'}`}>
                    {allPassed ? '✅' : hasFailed ? '❌' : '⏳'}
                  </span>
                )}
                <button onClick={(e) => { e.stopPropagation(); onExecuteTest(test.id); }}>
                  ▶️ Run
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteTest(test.id); }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTestCase && (
        <div className="test-details">
          <h3>{selectedTestCase.name}</h3>
          {selectedTestCase.description && <p>{selectedTestCase.description}</p>}

          <div className="assertions-section">
            <h4>Assertions ({selectedTestCase.assertions.length})</h4>
            {selectedTestCase.assertions.map(assertion => (
              <div key={assertion.id} className={`assertion-item ${assertion.passed ? 'passed' : 'failed'}`}>
                <div className="assertion-icon">
                  {assertion.passed ? '✅' : assertion.passed === false ? '❌' : '⏳'}
                </div>
                <div className="assertion-details">
                  <div className="assertion-type">{assertion.type}</div>
                  <div className="assertion-message">{assertion.message}</div>
                  <div className="assertion-values">
                    <span>Expected: {JSON.stringify(assertion.expected)}</span>
                    {assertion.actual !== undefined && (
                      <span>Actual: {JSON.stringify(assertion.actual)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTestCase.response && (
            <div className="response-section">
              <h4>Last Response</h4>
              <div><strong>Status:</strong> {selectedTestCase.response.status}</div>
              <div><strong>Time:</strong> {selectedTestCase.response.responseTime}ms</div>
              <pre className="response-body">{selectedTestCase.response.body}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mocks Tab Component
const MocksTab: React.FC<{
  mocks: ApiMock[];
  onToggleMock: (id: string) => void;
  onNewMock: () => void;
}> = ({ mocks, onToggleMock, onNewMock }) => {
  return (
    <div className="mocks-tab">
      <div className="mocks-header">
        <h3>API Mocks</h3>
        <button className="primary-button" onClick={onNewMock}>+ New Mock</button>
      </div>

      <div className="mock-list">
        {mocks.map(mock => (
          <div key={mock.id} className={`mock-item ${mock.enabled ? 'enabled' : 'disabled'}`}>
            <div className="mock-info">
              <div className="mock-name">{mock.name}</div>
              <div className="mock-pattern">
                <span className="request-method-badge" data-method={mock.method}>
                  {mock.method}
                </span>
                <span>{mock.pattern}</span>
              </div>
              <div className="mock-response">
                Status: {mock.response.status}
                {mock.response.delay && ` | Delay: ${mock.response.delay}ms`}
              </div>
            </div>
            <div className="mock-actions">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={mock.enabled}
                  onChange={() => onToggleMock(mock.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {mocks.length === 0 && (
        <div className="empty-state">
          <p>No mocks configured</p>
          <p>Create a mock to intercept and stub API responses</p>
        </div>
      )}
    </div>
  );
};

// Benchmark Tab Component
const BenchmarkTab: React.FC<{
  benchmarks: PerformanceBenchmark[];
  onRunBenchmark: (id: string) => void;
  onNewBenchmark: () => void;
}> = ({ benchmarks, onRunBenchmark, onNewBenchmark }) => {
  return (
    <div className="benchmark-tab">
      <div className="benchmark-header">
        <h3>Performance Benchmarks</h3>
        <button className="primary-button" onClick={onNewBenchmark}>+ New Benchmark</button>
      </div>

      <div className="benchmark-list">
        {benchmarks.map(benchmark => (
          <div key={benchmark.id} className="benchmark-item">
            <div className="benchmark-info">
              <div className="benchmark-name">{benchmark.name}</div>
              <div className="benchmark-endpoint">
                <span className="request-method-badge" data-method={benchmark.method}>
                  {benchmark.method}
                </span>
                <span>{benchmark.endpoint}</span>
              </div>
              <div className="benchmark-target">
                Target: {benchmark.targetResponseTime}ms
              </div>

              {benchmark.avgResponseTime !== undefined && (
                <div className="benchmark-stats">
                  <div className="stat">
                    <label>Avg:</label>
                    <span className={benchmark.avgResponseTime <= benchmark.targetResponseTime ? 'good' : 'bad'}>
                      {benchmark.avgResponseTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="stat">
                    <label>P50:</label>
                    <span>{benchmark.p50}ms</span>
                  </div>
                  <div className="stat">
                    <label>P95:</label>
                    <span>{benchmark.p95}ms</span>
                  </div>
                  <div className="stat">
                    <label>P99:</label>
                    <span>{benchmark.p99}ms</span>
                  </div>
                  <div className="stat">
                    <label>Min:</label>
                    <span>{benchmark.minResponseTime}ms</span>
                  </div>
                  <div className="stat">
                    <label>Max:</label>
                    <span>{benchmark.maxResponseTime}ms</span>
                  </div>
                </div>
              )}
            </div>
            <div className="benchmark-actions">
              <button onClick={() => onRunBenchmark(benchmark.id)}>▶️ Run</button>
            </div>
          </div>
        ))}
      </div>

      {benchmarks.length === 0 && (
        <div className="empty-state">
          <p>No benchmarks configured</p>
          <p>Create a benchmark to measure API performance</p>
        </div>
      )}
    </div>
  );
};

// Contracts Tab Component
const ContractsTab: React.FC = () => {
  return (
    <div className="contracts-tab">
      <div className="contracts-header">
        <h3>Contract Testing</h3>
        <button className="primary-button">+ New Contract</button>
      </div>
      <div className="empty-state">
        <p>Contract testing coming soon</p>
        <p>Define and validate API contracts between providers and consumers</p>
      </div>
    </div>
  );
};
