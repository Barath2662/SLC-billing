const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');

const backendRoot = path.resolve(__dirname, '..');
const localCacheDir = path.join(backendRoot, '.cache', 'puppeteer');
const renderCacheDir = '/opt/render/.cache/puppeteer';
const cacheDir = process.env.RENDER === 'true'
  ? (process.env.PUPPETEER_CACHE_DIR || renderCacheDir)
  : (process.env.PUPPETEER_CACHE_DIR || localCacheDir);
process.env.PUPPETEER_CACHE_DIR = cacheDir;

const hasChrome = () => {
  try {
    const executablePath = puppeteer.executablePath();
    return Boolean(executablePath) && fs.existsSync(executablePath);
  } catch (err) {
    return false;
  }
};

if (hasChrome()) {
  console.log('[chrome] Browser already available.');
  process.exit(0);
}

console.log('[chrome] Browser not found. Installing Chrome for Puppeteer...');
execSync(`npx puppeteer browsers install chrome --path "${cacheDir}"`, {
  cwd: backendRoot,
  stdio: 'inherit',
  env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir },
});

if (!hasChrome()) {
  throw new Error('[chrome] Chrome install finished but executable is still missing.');
}

console.log('[chrome] Chrome installed successfully.');
