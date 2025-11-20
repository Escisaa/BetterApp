// Script to create icon.png from SVG
// Run: node create-icon-script.js
const fs = require('fs');
const path = require('path');

// SVG content matching Logo.tsx but scaled to 512x512
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="64" y="64" width="384" height="384" rx="96" fill="url(#gradient)"/>
  <circle cx="256" cy="256" r="128" stroke="white" stroke-width="32" fill="none" opacity="0.9"/>
  <circle cx="256" cy="256" r="64" fill="white" opacity="0.7"/>
  <rect x="320" y="128" width="64" height="64" rx="16" fill="white" opacity="0.8"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
</svg>`;

// Save SVG first
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgContent);
console.log('✅ Created icon.svg');
console.log('📝 Next: Convert SVG to PNG at 512x512px');
console.log('   Option 1: Use https://cloudconvert.com/svg-to-png');
console.log('   Option 2: Use ImageMagick: convert -size 512x512 icon.svg icon.png');
