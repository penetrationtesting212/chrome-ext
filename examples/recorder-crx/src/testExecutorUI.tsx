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
import { testExecutor, TestRun, ExecutionProgress } from './testExecutor';
import { ddtService } from './ddtService';
import { apiService, Script } from './apiService';

interface TestExecutorPanelProps {
  scriptId?: string;
  onDataDrivenExecution?: (testRunId: string) => void;
  onClose?: () => void;
}

export const TestExecutorPanel: React.FC<TestExecutorPanelProps> = ({ scriptId, onDataDrivenExecution, onClose }) => {
  const [testRuns, setTestRuns] = React.useState<TestRun[]>([]);
  const [selectedDataFile, setSelectedDataFile] = React.useState<string>('');
  const [dataFiles, setDataFiles] = React.useState<any[]>([]);
  const [isExecuting, setIsExecuting] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<ExecutionProgress | null>(null);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [activeTestRunId, setActiveTestRunId] = React.useState<string | null>(null);

  // Saved scripts management
  const [savedScripts, setSavedScripts] = React.useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = React.useState<Script | null>(null);
  const [showScriptLibrary, setShowScriptLibrary] = React.useState<boolean>(false);
  const [isLoadingScripts, setIsLoadingScripts] = React.useState<boolean>(false);
  const [scriptError, setScriptError] = React.useState<string>('');

  const loadSavedScripts = React.useCallback(async () => {
    setIsLoadingScripts(true);
    setScriptError('');
    try {
      console.log('Loading saved scripts from API...');
      // Fetch scripts from API
      const scripts = await apiService.getScripts();
      console.log('Scripts loaded:', scripts.length);
      setSavedScripts(scripts);
      if (scripts.length === 0) {
        setScriptError('No scripts found. Save a script using "Save DB" button.');
      }
    } catch (error: any) {
      console.error('Error loading scripts:', error);
      setScriptError(error?.message || 'Failed to load saved scripts. Make sure you are logged in.');
    } finally {
      setIsLoadingScripts(false);
    }
  }, []);

  // Load data files and saved scripts on component mount
  React.useEffect(() => {
    const loadData = async () => {
      await loaddataFiles();
      await loadSavedScripts();
    };
    loadData();
  }, [loadSavedScripts]);

  const loaddataFiles = async () => {
    try {
      const files = await ddtService.getDataFiles();
      setDataFiles(files);
    } catch (error) {
      // Error loading data files
    }
  };

  const handleScriptSelect = async (script: Script) => {
    setSelectedScript(script);
    setShowScriptLibrary(false);
  };

  const handleExecuteSavedScript = async () => {
    if (!selectedScript)
      return;

    if (isExecuting)
      return;

    setIsExecuting(true);
    setProgress(null);
    setLogs([]);

    try {
      const testRun = await testExecutor.executeTest(selectedScript.id);
      setActiveTestRunId(testRun.id);

      // Add progress callback
      testExecutor.addProgressCallback(testRun.id, progress => {
        setProgress(progress);
      });

      // Add log callback
      testExecutor.addLogCallback(testRun.id, log => {
        setLogs(prev => [...prev, log]);
      });

      // Add to test runs
      setTestRuns(prev => [testRun, ...prev]);
    } catch (error: any) {
      setProgress({
        status: 'failed',
        error: error?.message || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecute = async () => {
    if (isExecuting || !scriptId)
      return;

    setIsExecuting(true);
    setProgress(null);
    setLogs([]);

    try {
      const testRun = await testExecutor.executeTest(scriptId);
      setActiveTestRunId(testRun.id);

      // Add progress callback
      testExecutor.addProgressCallback(testRun.id, progress => {
        setProgress(progress);
      });

      // Add log callback
      testExecutor.addLogCallback(testRun.id, log => {
        setLogs(prev => [...prev, log]);
      });

      // Add to test runs
      setTestRuns(prev => [testRun, ...prev]);
    } catch (error: any) {
      setProgress({
        status: 'failed',
        error: error?.message || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDataDrivenExecute = async () => {
    if (isExecuting || !selectedDataFile || !scriptId)
      return;

    setIsExecuting(true);
    setProgress(null);
    setLogs([]);

    try {
      const testRun = await testExecutor.executeDataDrivenTest(scriptId, selectedDataFile);
      setActiveTestRunId(testRun.id);

      // Add progress callback
      testExecutor.addProgressCallback(testRun.id, progress => {
        setProgress(progress);
      });

      // Add log callback
      testExecutor.addLogCallback(testRun.id, log => {
        setLogs(prev => [...prev, log]);
      });

      // Add to test runs
      setTestRuns(prev => [testRun, ...prev]);

      // Notify parent
      if (onDataDrivenExecution)
        onDataDrivenExecution(testRun.id);

    } catch (error: any) {
      setProgress({
        status: 'failed',
        error: error?.message || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeTestRunId)
      return;

    try {
      await testExecutor.cancelTestRun(activeTestRunId);
    } catch (error) {
      // Error cancelling test run
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'failed': return 'red';
      case 'running': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className='test-executor-panel'>
      <div className='executor-header'>
        <h3>Test Execution</h3>
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
        )}
      </div>

      <div className='execution-controls'>
        {/* Saved Scripts Section */}
        <div className='saved-scripts-section'>
          <button
            onClick={() => {
              setShowScriptLibrary(true);
              loadSavedScripts(); // Reload scripts when opening library
            }}
            className='script-library-btn'
            disabled={isExecuting}
          >
            📚 Script Library ({savedScripts.length})
          </button>

          {selectedScript && (
            <div className='selected-script-info'>
              <span className='script-name'>✅ {selectedScript.name}</span>
              <span className='script-language'>({selectedScript.language})</span>
              <button
                onClick={handleExecuteSavedScript}
                disabled={isExecuting}
                className='execute-btn'
              >
                {isExecuting ? 'Executing...' : '▶️ Run Selected'}
              </button>
            </div>
          )}
        </div>

        {/* Script Library Modal */}
        {showScriptLibrary && (
          <div className='script-library-modal'>
            <div className='modal-header'>
              <h4>Saved Scripts</h4>
              <button onClick={() => setShowScriptLibrary(false)}>✕</button>
            </div>

            {scriptError && (
              <div className='error-message'>{scriptError}</div>
            )}

            {isLoadingScripts ? (
              <div className='loading'>Loading scripts...</div>
            ) : savedScripts.length === 0 ? (
              <div className='empty-state'>
                <p>No saved scripts found.</p>
                <p>Save your recorded scripts using the API service.</p>
              </div>
            ) : (
              <div className='scripts-list'>
                {savedScripts.map(script => (
                  <div
                    key={script.id}
                    className={`script-item ${selectedScript?.id === script.id ? 'selected' : ''}`}
                    onClick={() => handleScriptSelect(script)}
                  >
                    <div className='script-header'>
                      <span className='script-name'>{script.name}</span>
                      <span className='script-language'>{script.language}</span>
                    </div>
                    {script.description && (
                      <div className='script-description'>{script.description}</div>
                    )}
                    <div className='script-meta'>
                      <span>Created: {new Date(script.createdAt).toLocaleDateString()}</span>
                      {script.project && (
                        <span>Project: {script.project.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className='modal-footer'>
              <button onClick={loadSavedScripts} disabled={isLoadingScripts}>
                🔄 Refresh
              </button>
            </div>
          </div>
        )}

        <div className='divider'>OR</div>

        {/* Current Script Execution */}
        <button
          onClick={handleExecute}
          disabled={isExecuting || !scriptId}
          className='execute-btn'
          title='Execute the currently recorded script'
        >
          {isExecuting ? 'Executing...' : '▶️ Execute Current Script'}
        </button>

        <div className='data-driven-controls'>
          <select
            value={selectedDataFile}
            onChange={e => setSelectedDataFile(e.target.value)}
            disabled={isExecuting}
          >
            <option value=''>Select data file for DDT</option>
            {dataFiles.map(file => (
              <option key={file.id} value={file.id}>
                {file.name} ({file.rowCount} rows)
              </option>
            ))}
          </select>
          <button
            onClick={handleDataDrivenExecute}
            disabled={isExecuting || !selectedDataFile}
            className='ddt-execute-btn'
          >
            {isExecuting ? 'Executing...' : 'Execute with Data'}
          </button>
        </div>

        {activeTestRunId && (
          <button
            onClick={handleCancel}
            disabled={!isExecuting}
            className='cancel-btn'
          >
            Cancel
          </button>
        )}
      </div>

      {progress && (
        <div className='execution-progress'>
          <div className='progress-status'>
            Status: <span style={{ color: progress.status === 'completed' ? 'green' : progress.status === 'failed' ? 'red' : 'blue' }}>
              {progress.status}
            </span>
          </div>
          {progress.message && (
            <div className='progress-message'>
              {progress.message}
            </div>
          )}
          {progress.error && (
            <div className='progress-error'>
              Error: {progress.error}
            </div>
          )}
        </div>
      )}

      {logs.length > 0 && (
        <div className='execution-logs'>
          <h4>Execution Logs</h4>
          <div className='logs-container'>
            {logs.map((log, index) => (
              <div key={index} className='log-entry'>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {testRuns.length > 0 && (
        <div className='execution-history'>
          <h4>Execution History</h4>
          <div className='history-list'>
            {testRuns.map(run => (
              <div key={run.id} className='history-item'>
                <div className='run-info'>
                  <span className='run-id'>#{run.id.substring(0, 6)}</span>
                  <span className='run-status' style={{ color: getStatusColor(run.status) }}>
                    {run.status}
                  </span>
                  <span className='run-time'>
                    {run.startTime.toLocaleTimeString()}
                  </span>
                </div>
                {run.logs.length > 0 && (
                  <div className='run-logs-preview'>
                    {run.logs.slice(-2).join('\n')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export a simple wrapper
export const TestExecutorUI: React.FC<{ onClose?: () => void; script?: string; scriptName?: string }> = ({ onClose, script, scriptName }) => {
  return <TestExecutorPanel scriptId={scriptName || 'current'} onClose={onClose} />;
};
