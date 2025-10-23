/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { Toolbar } from '@web/components/toolbar';
import { ToolbarButton, ToolbarSeparator } from '@web/components/toolbarButton';
import { Dialog } from './dialog';
import { PreferencesForm } from './preferencesForm';
import type { CallLog, ElementInfo, Mode, Source } from '@recorder/recorderTypes';
import { Recorder } from '@recorder/recorder';
import type { CrxSettings } from './settings';
import { addSettingsChangedListener, defaultSettings, loadSettings, removeSettingsChangedListener } from './settings';
import ModalContainer, { create as createModal } from 'react-modal-promise';
import { SaveCodeForm } from './saveCodeForm';
import { SelfHealingUI } from './selfHealingUI';
import { AISelfHealingUI } from './aiSelfHealingUI';
import { DDTManager } from './ddtManager';
import { DebuggerUI } from './debuggerUI';
import { TestExecutorUI } from './testExecutorUI';
import { ApiTestingUI } from './apiTestingUI';
import { apiService } from './apiService';
import './crxRecorder.css';
import './form.css';
import './apiTesting.css';

function setElementPicked(elementInfo: ElementInfo, userGesture?: boolean) {
  window.playwrightElementPicked(elementInfo, userGesture);
}

function setRunningFileId(fileId: string) {
  window.playwrightSetRunningFile(fileId);
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function generateDatetimeSuffix() {
  return new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '-');
}

const codegenFilenames: Record<string, string> = {
  'javascript': 'example.js',
  'playwright-test': 'example.spec.ts',
  'java-junit': 'TestExample.java',
  'java': 'Example.java',
  'python-pytest': 'test_example.py',
  'python': 'example.py',
  'python-async': 'example.py',
  'csharp-mstest': 'Tests.cs',
  'csharp-nunit': 'Tests.cs',
  'csharp': 'Example.cs',
};

export const CrxRecorder: React.FC = ({
}) => {
  const [settings, setSettings] = React.useState<CrxSettings>(defaultSettings);
  const [sources, setSources] = React.useState<Source[]>([]);
  const [paused, setPaused] = React.useState(false);
  const [log, setLog] = React.useState(new Map<string, CallLog>());
  const [mode, setMode] = React.useState<Mode>('none');
  const [selectedFileId, setSelectedFileId] = React.useState<string>(defaultSettings.targetLanguage);
  
  // Enhanced features state
  const [showSelfHealing, setShowSelfHealing] = React.useState(false);
  const [showAISelfHealing, setShowAISelfHealing] = React.useState(false);
  const [showDDT, setShowDDT] = React.useState(false);
  const [showDebugger, setShowDebugger] = React.useState(false);
  const [showTestExecutor, setShowTestExecutor] = React.useState(false);
  const [showApiTesting, setShowApiTesting] = React.useState(false);

  // Save to database state
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [scriptName, setScriptName] = React.useState('');
  const [scriptDescription, setScriptDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [showLoginForm, setShowLoginForm] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Load tokens from storage
        await apiService.loadTokens();

        // Try to get profile to verify token is valid
        const profile = await apiService.getProfile();
        setIsAuthenticated(true);
        setUserEmail(profile.email);
      } catch (error) {
        // Not authenticated
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  React.useEffect(() => {
    const port = chrome.runtime.connect({ name: 'recorder' });
    const onMessage = (msg: any) => {
      if (!('type' in msg) || msg.type !== 'recorder')
        return;

      switch (msg.method) {
        case 'setPaused': setPaused(msg.paused); break;
        case 'setMode': setMode(msg.mode); break;
        case 'setSources': setSources(msg.sources); break;
        case 'resetCallLogs': setLog(new Map()); break;
        case 'updateCallLogs': setLog(log => {
          const newLog = new Map<string, CallLog>(log);
          for (const callLog of msg.callLogs) {
            callLog.reveal = !log.has(callLog.id);
            newLog.set(callLog.id, callLog);
          }
          return newLog;
        }); break;
        case 'setRunningFile': setRunningFileId(msg.file); break;
        case 'elementPicked': setElementPicked(msg.elementInfo, msg.userGesture); break;
      }
    };
    port.onMessage.addListener(onMessage);

    window.dispatch = async (data: any) => {
      port.postMessage({ type: 'recorderEvent', ...data });
      if (data.event === 'fileChanged')
        setSelectedFileId(data.params.file);
    };
    loadSettings().then(settings => {
      setSettings(settings);
      setSelectedFileId(settings.targetLanguage);
    }).catch(() => {});

    addSettingsChangedListener(setSettings);

    return () => {
      removeSettingsChangedListener(setSettings);
      port.disconnect();
    };
  }, []);

  const source = React.useMemo(() => sources.find(s => s.id === selectedFileId), [sources, selectedFileId]);

  const requestStorageState = React.useCallback(() => {
    if (!settings.experimental)
      return;

    chrome.runtime.sendMessage({ event: 'storageStateRequested' }).then(storageState => {
      const fileSuffix = generateDatetimeSuffix();
      download(`storageState-${fileSuffix}.json`, JSON.stringify(storageState, null, 2));
    });
  }, [settings]);

  const showPreferences = React.useCallback(() => {
    const modal = createModal(({ isOpen, onResolve }) =>
      <Dialog title='Preferences' isOpen={isOpen} onClose={onResolve}>
        <PreferencesForm />
      </Dialog>
    );
    modal().catch(() => {});
  }, []);

  const saveCode = React.useCallback(() => {
    if (!settings.experimental)
      return;

    const modal = createModal(({ isOpen, onResolve, onReject }) => {
      return <Dialog title='Save code' isOpen={isOpen} onClose={onReject}>
        <SaveCodeForm onSubmit={onResolve} suggestedFilename={codegenFilenames[selectedFileId]} />
      </Dialog>;
    });
    modal()
        .then(({ filename }) => {
          const code = source?.text;
          if (!code)
            return;

          download(filename, code);
        })
        .catch(() => {});
  }, [settings, source, selectedFileId]);

  const saveToDatabase = React.useCallback(async () => {
    if (!source?.text) {
      setSaveError('No code to save');
      return;
    }

    setShowSaveModal(true);
    setSaveError('');
    setSaveSuccess(false);
  }, [source]);

  const handleSaveToDatabase = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scriptName.trim()) {
      setSaveError('Script name is required');
      return;
    }

    if (!source?.text) {
      setSaveError('No code to save');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      await apiService.createScript(
        scriptName.trim(),
        source.text,
        selectedFileId,
        scriptDescription.trim() || undefined
      );
      
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setScriptName('');
        setScriptDescription('');
        setSaveSuccess(false);
      }, 1500);
    } catch (error: any) {
      setSaveError(error?.message || 'Failed to save script');
    } finally {
      setIsSaving(false);
    }
  }, [scriptName, scriptDescription, source, selectedFileId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await apiService.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      setUserEmail(response.user.email);
      setShowLoginForm(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      setLoginError(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUserEmail('');
    } catch (error) {
      // Logout failed, clear tokens anyway
      apiService.clearTokens();
      setIsAuthenticated(false);
      setUserEmail('');
    }
  };

  const toggleSelfHealing = React.useCallback(() => {
    setShowSelfHealing(prev => !prev);
  }, []);

  const toggleAISelfHealing = React.useCallback(() => {
    setShowAISelfHealing(prev => !prev);
  }, []);

  const toggleDDT = React.useCallback(() => {
    setShowDDT(prev => !prev);
  }, []);

  const toggleDebugger = React.useCallback(() => {
    setShowDebugger(prev => !prev);
  }, []);

  const toggleTestExecutor = React.useCallback(() => {
    setShowTestExecutor(prev => !prev);
  }, []);

  const toggleApiTesting = React.useCallback(() => {
    setShowApiTesting(prev => !prev);
  }, []);

  React.useEffect(() => {
    if (!settings.experimental)
      return;

    const keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCode();
      }
    };
    window.addEventListener('keydown', keydownHandler);

    return () => {
      window.removeEventListener('keydown', keydownHandler);
    };
  }, [selectedFileId, settings, saveCode]);

  const dispatchEditedCode = React.useCallback((code: string) => {
    window.dispatch({ event: 'codeChanged', params: { code } });
  }, []);

  const dispatchCursorActivity = React.useCallback((position: { line: number }) => {
    window.dispatch({ event: 'cursorActivity', params: { position } });
  }, []);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-content">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h2>Playwright CRX</h2>
            <p>Please login to continue</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {loginError && (
              <div className="auth-error">
                {loginError}
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="demo@example.com"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLoggingIn}
              />
            </div>

            <button type="submit" className="auth-button" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-hint">
              <p>Demo credentials:</p>
              <p className="auth-demo">demo@example.com / demo123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <>
    <ModalContainer />

    {/* Save to Database Modal */}
    {showSaveModal && (
      <div className="auth-container" style={{ zIndex: 9999 }}>
        <div className="auth-box" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <h2>Save Script to Database</h2>
            <button 
              onClick={() => setShowSaveModal(false)} 
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSaveToDatabase} className="auth-form">
            {saveError && (
              <div className="auth-error">
                {saveError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="auth-success" style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
                ✓ Script saved successfully!
              </div>
            )}

            <div className="auth-field">
              <label>Script Name *</label>
              <input
                type="text"
                value={scriptName}
                onChange={e => setScriptName(e.target.value)}
                placeholder="My Test Script"
                required
                disabled={isSaving || saveSuccess}
              />
            </div>

            <div className="auth-field">
              <label>Description (optional)</label>
              <textarea
                value={scriptDescription}
                onChange={e => setScriptDescription(e.target.value)}
                placeholder="Describe what this script does..."
                rows={3}
                disabled={isSaving || saveSuccess}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="auth-field">
              <label>Language</label>
              <input
                type="text"
                value={selectedFileId}
                disabled
                style={{ background: '#f0f0f0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                className="auth-button" 
                disabled={isSaving || saveSuccess}
                style={{ flex: 1 }}
              >
                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Database'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowSaveModal(false)} 
                disabled={isSaving}
                style={{ flex: 1, background: '#6c757d' }}
                className="auth-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    <div className='recorder'>
      {settings.experimental && <>
        <Toolbar>
          <ToolbarButton icon='save' title='Save to File' disabled={false} onClick={saveCode}>Save File</ToolbarButton>
          <ToolbarButton icon='cloud-upload' title='Save to Database' disabled={false} onClick={saveToDatabase}>Save DB</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton icon='debug-console' title='Test Executor' disabled={false} onClick={toggleTestExecutor}>Execute</ToolbarButton>
          <ToolbarButton icon='debug-alt' title='Debugger' disabled={false} onClick={toggleDebugger}>Debug</ToolbarButton>
          <ToolbarButton icon='plug' title='API Testing' disabled={false} onClick={toggleApiTesting}>API</ToolbarButton>
          <ToolbarButton icon='sparkle' title='Self-Healing' disabled={false} onClick={toggleSelfHealing}>Heal</ToolbarButton>
          <ToolbarButton icon='brain' title='AI Self-Healing' disabled={false} onClick={toggleAISelfHealing}>AI</ToolbarButton>
          <ToolbarButton icon='database' title='Data-Driven Testing' disabled={false} onClick={toggleDDT}>Data</ToolbarButton>
          <div style={{ flex: 'auto' }}></div>
          <div className='dropdown'>
            <ToolbarButton icon='tools' title='Tools' disabled={false} onClick={() => {}}></ToolbarButton>
            <div className='dropdown-content right-align'>
              <a href='#' onClick={requestStorageState}>Download storage state</a>
            </div>
          </div>
          <ToolbarSeparator />
          <ToolbarButton icon='settings-gear' title='Preferences' onClick={showPreferences}></ToolbarButton>
        </Toolbar>
      </>}
      <Recorder sources={sources} paused={paused} log={log} mode={mode} onEditedCode={dispatchEditedCode} onCursorActivity={dispatchCursorActivity} />
      
      {/* Enhanced Features Panels */}
      {showSelfHealing && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'var(--vscode-sideBar-background)', borderLeft: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <SelfHealingUI onClose={toggleSelfHealing} />
        </div>
      )}
      
      {showAISelfHealing && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '550px', height: '100%', background: 'var(--vscode-sideBar-background)', borderLeft: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <AISelfHealingUI onClose={toggleAISelfHealing} />
        </div>
      )}
      
      {showDDT && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '100%', background: 'var(--vscode-sideBar-background)', borderLeft: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <DDTManager onFileSelected={(fileId) => console.log('Selected file:', fileId)} />
          <button onClick={toggleDDT} style={{ position: 'absolute', top: '10px', right: '10px' }}>Close</button>
        </div>
      )}
      
      {showDebugger && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '300px', background: 'var(--vscode-sideBar-background)', borderTop: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <DebuggerUI onClose={toggleDebugger} />
        </div>
      )}
      
      {showTestExecutor && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '450px', height: '100%', background: 'var(--vscode-sideBar-background)', borderLeft: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <TestExecutorUI onClose={toggleTestExecutor} script={source?.text || ''} scriptName={selectedFileId} />
        </div>
      )}
      
      {showApiTesting && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '550px', height: '100%', background: 'var(--vscode-sideBar-background)', borderLeft: '1px solid var(--vscode-panel-border)', zIndex: 1000, overflow: 'auto' }}>
          <ApiTestingUI onClose={toggleApiTesting} />
        </div>
      )}
    </div>
  </>;
};
