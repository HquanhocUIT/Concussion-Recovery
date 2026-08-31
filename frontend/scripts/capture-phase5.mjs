import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = process.env.CAPTURE_URL || 'http://127.0.0.1:3000';
const variant = process.argv[2] || 'after';
const outputDir = path.resolve('..', 'docs', 'screenshots', 'phase5', variant);
const debugPort = 9333;
const viewportWidth = Number(process.env.VIEWPORT_WIDTH || 1440);
const viewportHeight = Number(process.env.VIEWPORT_HEIGHT || 1000);

await mkdir(outputDir, { recursive: true });
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--force-device-scale-factor=1', `--window-size=${viewportWidth},${viewportHeight}`,
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${path.resolve('..', '.phase5-browser-profile')}`,
  baseUrl,
], { stdio: 'ignore' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let websocketUrl;
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    const pages = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
    websocketUrl = pages.find((page) => page.type === 'page' && page.url.startsWith(baseUrl))?.webSocketDebuggerUrl;
    if (websocketUrl) break;
  } catch { /* Browser is still starting. */ }
  await delay(250);
}
if (!websocketUrl) {
  browser.kill('SIGKILL');
  throw new Error('Could not connect to the browser DevTools endpoint.');
}

const socket = new WebSocket(websocketUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
const capture = async (name) => {
  await delay(700);
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(data, 'base64'));
};
const clickButton = async (labels) => {
  const result = await evaluate(`(() => {
    const labels = ${JSON.stringify(labels)};
    const button = [...document.querySelectorAll('button')].find((item) =>
      labels.some((label) => item.textContent.trim().includes(label) || item.getAttribute('aria-label') === label)
    );
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!result.result.value) throw new Error(`Button not found: ${labels.join(', ')}`);
};

try {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
  await delay(1400);
  await capture('01-landing');
  await clickButton(['Start Daily Check-in', 'Bắt đầu Check-in hôm nay']);
  await capture('02-consent');
  await clickButton(['I Agree & Start', 'Tôi đồng ý']);
  await capture('03-motivation');
  await clickButton(['Start check-in', 'Bắt đầu check-in']);
  await capture('04-check-in');
  const metrics = await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('button')];
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      buttons: buttons.length,
      unnamedButtons: buttons.filter((button) => !button.textContent.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')).length,
    };
  })()`);
  process.stdout.write(`Captured ${variant} screens in ${outputDir} (viewport ${metrics.result.value.width}px, scrollWidth ${metrics.result.value.scrollWidth}px, ${metrics.result.value.buttons} buttons, ${metrics.result.value.unnamedButtons} unnamed)\n`);
} finally {
  socket.close();
  browser.kill();
}
