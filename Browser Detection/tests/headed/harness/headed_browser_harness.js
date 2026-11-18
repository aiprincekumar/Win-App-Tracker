/**
 * @file headed_browser_harness.js
 * Headed Chrome browser automation harness via Chrome DevTools Protocol (CDP).
 * Strictly < 160 lines, < 8 KB, function length <= 50 lines, nesting depth <= 4, UTF-8 BOM.
 */
'use strict';

const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const CFT_PATH = 'C:\\Users\\Atul Verma\\.agent-browser\\browsers\\chrome-158.0.8127.36\\chrome.exe';
const CHROME_PATH = fs.existsSync(CFT_PATH) ? CFT_PATH : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEFAULT_EXT_ID = 'opiinjipkdkeolidiofmhncoegmaijmm';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCdpReady(port, maxRetries = 25) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return true;
    } catch (_) {}
    await sleep(200);
  }
  throw new Error(`CDP endpoint failed to respond on port ${port}`);
}

async function discoverExtensionId(port) {
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const sw = targets.find(t => t.type === 'service_worker' && t.url && t.url.includes('opiinjipkdkeolidiofmhncoegmaijmm'));
      if (sw) return DEFAULT_EXT_ID;
      const anySw = targets.find(t => t.type === 'service_worker' && t.url && t.url.includes('background.js') && !t.url.includes('admccjkmockfdflocgggjfgdacdodkdf'));
      if (anySw) {
        const m = anySw.url.match(/chrome-extension:\/\/([a-z0-9]+)\//);
        if (m && m[1]) return m[1];
      }
    } catch (_) {}
    await sleep(250);
  }
  return DEFAULT_EXT_ID;
}

function launchHeadedChrome(options = {}) {
  const extPath = options.extensionPath || path.resolve(__dirname, '../../..');
  const port = options.port || 9222;
  const tempDir = path.join(os.tmpdir(), `sentinel_headed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const args = [
    `--remote-debugging-port=${port}`,
    `--disable-extensions-except=${extPath}`,
    `--load-extension=${extPath}`,
    `--user-data-dir=${tempDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--start-maximized',
    'about:blank'
  ];

  const chromeProc = spawn(CHROME_PATH, args, { stdio: 'ignore', detached: false });
  return { chromeProc, port, tempDir, extPath };
}

function connectCdpSession(debuggerUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(debuggerUrl);
    let msgId = 0;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const cb = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) cb.reject(new Error(data.error.message));
        else cb.resolve(data.result);
      }
    };

    const send = (method, params = {}) => new Promise((res, rej) => {
      const id = ++msgId;
      callbacks.set(id, { resolve: res, reject: rej });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res?.result?.value;
    };

    ws.onopen = () => resolve({ ws, send, evaluate, close: () => ws.close() });
    ws.onerror = (err) => reject(err);
  });
}

async function openPageAndConnect(port, url) {
  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await listRes.json();
  let pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    const newRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
    pageTarget = await newRes.json();
  }

  const session = await connectCdpSession(pageTarget.webSocketDebuggerUrl);
  await session.send('Page.enable');
  await session.send('Page.navigate', { url });
  await sleep(1500);
  return { session };
}

async function teardownHarness(harness) {
  if (harness.chromeProc && harness.chromeProc.pid) {
    try {
      execSync(`taskkill /F /T /PID ${harness.chromeProc.pid} >nul 2>&1`);
    } catch (_) {
      try { harness.chromeProc.kill('SIGKILL'); } catch (_) {}
    }
  }
  await sleep(400);
  if (harness.tempDir) {
    try { fs.rmSync(harness.tempDir, { recursive: true, force: true }); } catch (_) {}
  }
}

module.exports = {
  CHROME_PATH,
  sleep,
  waitForCdpReady,
  discoverExtensionId,
  launchHeadedChrome,
  connectCdpSession,
  openPageAndConnect,
  teardownHarness
};
