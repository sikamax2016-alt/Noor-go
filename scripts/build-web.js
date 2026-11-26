#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');
const files = [
  'index.html',
  'backend.js',
  'rides.js',
  'sw.js',
  'firebase-config.js',
  'manifest.webmanifest',
];

fs.mkdirSync(path.join(www, 'icons'), { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required web asset: ${file}`);
  }
  fs.copyFileSync(source, path.join(www, file));
}

for (const file of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'maskable-512.png']) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(www, 'icons', file));
}

// The Android workflow replaces this with the bundled native bridge.
// Keeping a browser-safe fallback makes local web preview reliable.
const native = path.join(root, 'native.js');
if (fs.existsSync(native)) fs.copyFileSync(native, path.join(www, 'native.js'));

console.log(`Built web assets in ${path.relative(root, www)}`);
console.log(`index.html: ${fs.statSync(path.join(www, 'index.html')).size} bytes`);
