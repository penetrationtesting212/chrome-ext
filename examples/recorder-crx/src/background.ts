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

import type { Mode } from '@recorder/recorderTypes';
import type { CrxApplication } from 'playwright-crx';
import playwright, { crx, _debug, _setUnderTest, _isUnderTest as isUnderTest } from 'playwright-crx';
import type { CrxSettings } from './settings';
import { addSettingsChangedListener, defaultSettings, loadSettings } from './settings';
import { selfHealingService } from './selfHealing';
import { apiTestingService } from './apiTestingService';
import type { ApiRequest, ApiResponse } from './apiTestingService';

type CrxMode = Mode | 'detached';

const stoppedModes: CrxMode[] = ['none', 'standby', 'detached'];
const recordingModes: CrxMode[] = ['recording', 'assertingText', 'assertingVisibility', 'assertingValue', 'assertingSnapshot'];

// we must lazy initialize it
let crxAppPromise: Promise<CrxApplication> | undefined;

const attachedTabIds = new Set<number>();
let currentMode: CrxMode | 'detached' | undefined;
let settings: CrxSettings = defaultSettings;

// if it's in sidepanel mode, we need to open it synchronously on action click,
// so we need to fetch its value asap
const settingsInitializing = loadSettings().then(s => settings = s).catch(() => {});

addSettingsChangedListener(newSettings => {
  settings = newSettings;
  setTestIdAttributeName(newSettings.testIdAttributeName);
});

let allowsIncognitoAccess = false;
chrome.extension.isAllowedIncognitoAccess().then(allowed => {
  allowsIncognitoAccess = allowed;
});

// API Recording state
let isApiRecording = false;
const networkListeners = new Map<number, (details: chrome.webRequest.WebRequestBodyDetails) => void>();

async function changeAction(tabId: number, mode?: CrxMode | 'detached') {
  if (!mode)
    mode = attachedTabIds.has(tabId) ? currentMode : 'detached';
  else if (mode !== 'detached')
    currentMode = mode;


  // detached basically implies recorder windows was closed
  if (!mode || stoppedModes.includes(mode)) {
    await Promise.all([
      chrome.action.setTitle({ title: mode === 'none' ? 'Stopped' : 'Record', tabId }),
      chrome.action.setBadgeText({ text: '', tabId }),
    ]).catch(() => {});
    return;
  }

  const { text, title, color, bgColor } = recordingModes.includes(mode) ?
    { text: 'REC', title: 'Recording', color: 'white', bgColor: 'darkred' } :
    { text: 'INS', title: 'Inspecting', color: 'white', bgColor: 'dodgerblue' };

  await Promise.all([
    chrome.action.setTitle({ title, tabId }),
    chrome.action.setBadgeText({ text, tabId }),
    chrome.action.setBadgeTextColor({ color, tabId }),
    chrome.action.setBadgeBackgroundColor({ color: bgColor, tabId }),
  ]).catch(() => {});
}

// action state per tab is reset every time a navigation occurs
// https://bugs.chromium.org/p/chromium/issues/detail?id=1450904
chrome.tabs.onUpdated.addListener(tabId => changeAction(tabId));

async function getCrxApp(incognito: boolean) {
  if (!crxAppPromise) {
    await settingsInitializing;

    crxAppPromise = crx.start({ incognito }).then(crxApp => {
      crxApp.recorder.addListener('hide', async () => {
        await crxApp.close();
        crxAppPromise = undefined;
      });
      crxApp.recorder.addListener('modechanged', async ({ mode }) => {
        await Promise.all([...attachedTabIds].map(tabId => changeAction(tabId, mode)));
      });
      crxApp.addListener('attached', async ({ tabId }) => {
        attachedTabIds.add(tabId);
        await changeAction(tabId, crxApp.recorder.mode());
      });
      crxApp.addListener('detached', async tabId => {
        attachedTabIds.delete(tabId);
        await changeAction(tabId, 'detached');
      });
      setTestIdAttributeName(settings.testIdAttributeName);
      return crxApp;
    });
  }
  return await crxAppPromise;
}

async function attach(tab: chrome.tabs.Tab, mode?: Mode) {
  if (!tab?.id || (attachedTabIds.has(tab.id) && !mode))
    return;

  // if the tab is incognito, chek if can be started in incognito mode.
  if (tab.incognito && !allowsIncognitoAccess)
    throw new Error('Not authorized to launch in Incognito mode.');

  const sidepanel = !isUnderTest() && settings.sidepanel;

  // we need to open sidepanel before any async call
  if (sidepanel)
    await chrome.sidePanel.open({ windowId: tab.windowId });

  // ensure one attachment at a time
  chrome.action.disable();
  if (tab.url?.startsWith('chrome://')) {
    const windowId = tab.windowId;
    tab = await new Promise(resolve => {
      // we will not be able to attach to this tab, so we need to open a new one
      chrome.tabs.create({ windowId, url: 'about:blank' }).
          then(tab => {
            resolve(tab);
          }).
          catch(() => {});
    });
  }

  const crxApp = await getCrxApp(tab.incognito);

  try {

    if (crxApp.recorder.isHidden()) {
      await crxApp.recorder.show({
        mode: mode ?? 'recording',
        language: settings.targetLanguage,
        window: { type: sidepanel ? 'sidepanel' : 'popup', url: 'index.html' },
        playInIncognito: settings.playInIncognito,
      });
    }

    await crxApp.attach(tab.id!);

    if (mode)
      await crxApp.recorder.setMode(mode);
  } finally {
    chrome.action.enable();
  }
}

async function setTestIdAttributeName(testIdAttributeName: string) {
  playwright.selectors.setTestIdAttribute(testIdAttributeName);
}

chrome.action.onClicked.addListener(attach);

chrome.contextMenus.create({
  id: 'pw-recorder',
  title: 'Attach to Playwright Recorder',
  contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener(async (_, tab) => {
  if (tab)
    await attach(tab);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab.id)
    return;
  if (command === 'inspect')
    await attach(tab, 'inspecting');
  else if (command === 'record')
    await attach(tab, 'recording');
});

async function getStorageState() {
  const crxApp = await crxAppPromise;
  if (!crxApp)
    return;

  return await crxApp.context().storageState();
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.event === 'storageStateRequested') {
    getStorageState().then(sendResponse).catch(() => {});
    return true;
  }
  
  // Handle API recording messages
  if (message.type === 'startApiRecording') {
    startApiRecording();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'stopApiRecording') {
    stopApiRecording();
    sendResponse({ success: true });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(details => {
  if ((globalThis as any).__crxTest)
    return;
  if ([chrome.runtime.OnInstalledReason.INSTALL, chrome.runtime.OnInstalledReason.UPDATE].includes(details.reason))
    chrome.tabs.create({ url: `https://github.com/ruifigueira/playwright-crx/releases/tag/v${chrome.runtime.getManifest().version}` }).catch(() => {});
});

// Initialize self-healing service
selfHealingService.loadStrategies().catch(() => {});

/**
 * Start recording API requests
 */
function startApiRecording() {
  if (isApiRecording) return;
  isApiRecording = true;
  
  // Setup webRequest listeners to capture network traffic
  chrome.webRequest.onBeforeSendHeaders.addListener(
    captureRequest,
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );
  
  chrome.webRequest.onCompleted.addListener(
    captureResponse,
    { urls: ['<all_urls>'] },
    ['responseHeaders']
  );
}

/**
 * Stop recording API requests
 */
function stopApiRecording() {
  if (!isApiRecording) return;
  isApiRecording = false;
  
  chrome.webRequest.onBeforeSendHeaders.removeListener(captureRequest);
  chrome.webRequest.onCompleted.removeListener(captureResponse);
}

/**
 * Capture outgoing API request
 */
function captureRequest(details: chrome.webRequest.WebRequestHeadersDetails) {
  if (!isApiRecording) return;
  
  // Filter out non-API requests (images, fonts, etc.)
  const url = new URL(details.url);
  if (shouldIgnoreRequest(url)) return;
  
  const headers: Record<string, string> = {};
  if (details.requestHeaders) {
    details.requestHeaders.forEach((header: chrome.webRequest.HttpHeader) => {
      if (header.name && header.value) {
        headers[header.name] = header.value;
      }
    });
  }
  
  const request: ApiRequest = {
    id: `req-${details.requestId}`,
    method: details.method as any,
    url: details.url,
    headers,
    timestamp: details.timeStamp
  };
  
  apiTestingService.captureRequest(request);
}

/**
 * Capture API response
 */
function captureResponse(details: chrome.webRequest.WebResponseHeadersDetails) {
  if (!isApiRecording) return;
  
  const url = new URL(details.url);
  if (shouldIgnoreRequest(url)) return;
  
  const headers: Record<string, string> = {};
  if (details.responseHeaders) {
    details.responseHeaders.forEach((header: chrome.webRequest.HttpHeader) => {
      if (header.name && header.value) {
        headers[header.name.toLowerCase()] = header.value;
      }
    });
  }
  
  const response: ApiResponse = {
    id: `resp-${details.requestId}`,
    requestId: `req-${details.requestId}`,
    status: details.statusCode,
    statusText: getStatusText(details.statusCode),
    headers,
    responseTime: 0, // Will be calculated from timing if available
    timestamp: details.timeStamp
  };
  
  // Note: Response body is not available in webRequest API
  // We would need to use chrome.debugger or fetch API for body content
  
  apiTestingService.captureResponse(response);
}

/**
 * Check if request should be ignored
 */
function shouldIgnoreRequest(url: URL): boolean {
  // Ignore extension URLs
  if (url.protocol === 'chrome-extension:') return true;
  
  // Ignore common static resources
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  if (staticExtensions.some(ext => url.pathname.endsWith(ext))) return true;
  
  // Ignore internal chrome URLs
  if (url.hostname.includes('chrome.google.com')) return true;
  
  return false;
}

/**
 * Get HTTP status text from status code
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusTexts[statusCode] || 'Unknown';
}

// for testing
Object.assign(self, { attach, setTestIdAttributeName, getCrxApp, _debug, _setUnderTest, startApiRecording, stopApiRecording });
