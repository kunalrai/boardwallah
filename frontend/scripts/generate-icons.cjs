const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a73e8"/>
      <stop offset="50%" stop-color="#1557b0"/>
      <stop offset="100%" stop-color="#0d47a1"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Base Background -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>
  
  <!-- Outer Glow Ring -->
  <rect x="16" y="16" width="480" height="480" rx="92" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
  
  <g filter="url(#shadow)">
    <!-- Open Book Base -->
    <path d="M100 350 C160 320, 220 330, 256 350 C292 330, 352 320, 412 350 L412 380 C352 350, 292 360, 256 380 C220 360, 160 350, 100 380 Z" fill="url(#goldGrad)" opacity="0.9"/>
    <path d="M110 330 C170 300, 225 310, 256 330 C287 310, 342 300, 402 330 L402 360 C342 330, 287 340, 256 360 C225 340, 170 330, 110 360 Z" fill="#ffffff"/>
    
    <!-- Central Divider / Spine -->
    <line x1="256" y1="330" x2="256" y2="375" stroke="#1557b0" stroke-width="4" stroke-linecap="round"/>

    <!-- Graduation Mortarboard Cap -->
    <polygon points="256,120 400,185 256,250 112,185" fill="#ffffff"/>
    <polygon points="256,132 384,185 256,238 128,185" fill="url(#goldGrad)"/>
    
    <!-- Skull Cap Underneath -->
    <path d="M176 215 L176 265 C176 300, 336 300, 336 265 L336 215 C308 232, 282 240, 256 240 C230 240, 204 232, 176 215 Z" fill="#ffffff"/>
    
    <!-- Tassel String and Charm -->
    <path d="M256 185 Q210 190 200 240 L200 280" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="200" cy="288" r="8" fill="url(#goldGrad)" stroke="#ffffff" stroke-width="3"/>
  </g>
  
  <!-- AI Gemini 4-Point Sparkle -->
  <path d="M390 100 Q390 125 365 125 Q390 125 390 150 Q390 125 415 125 Q390 125 390 100 Z" fill="url(#goldGrad)" filter="url(#shadow)"/>
  <path d="M120 120 Q120 135 105 135 Q120 135 120 150 Q120 135 135 135 Q120 135 120 120 Z" fill="#ffffff" opacity="0.85"/>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a73e8"/>
      <stop offset="50%" stop-color="#1557b0"/>
      <stop offset="100%" stop-color="#0d47a1"/>
    </linearGradient>
    <linearGradient id="goldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgGradM)"/>
  
  <g transform="translate(64, 64) scale(0.75)">
    <path d="M100 350 C160 320, 220 330, 256 350 C292 330, 352 320, 412 350 L412 380 C352 350, 292 360, 256 380 C220 360, 160 350, 100 380 Z" fill="url(#goldGradM)" opacity="0.9"/>
    <path d="M110 330 C170 300, 225 310, 256 330 C287 310, 342 300, 402 330 L402 360 C342 330, 287 340, 256 360 C225 340, 170 330, 110 360 Z" fill="#ffffff"/>
    <line x1="256" y1="330" x2="256" y2="375" stroke="#1557b0" stroke-width="4" stroke-linecap="round"/>

    <polygon points="256,120 400,185 256,250 112,185" fill="#ffffff"/>
    <polygon points="256,132 384,185 256,238 128,185" fill="url(#goldGradM)"/>
    <path d="M176 215 L176 265 C176 300, 336 300, 336 265 L336 215 C308 232, 282 240, 256 240 C230 240, 204 232, 176 215 Z" fill="#ffffff"/>
    <path d="M256 185 Q210 190 200 240 L200 280" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="200" cy="288" r="8" fill="url(#goldGradM)" stroke="#ffffff" stroke-width="3"/>
    
    <path d="M390 100 Q390 125 365 125 Q390 125 390 150 Q390 125 415 125 Q390 125 390 100 Z" fill="url(#goldGradM)"/>
    <path d="M120 120 Q120 135 105 135 Q120 135 120 150 Q120 135 135 135 Q120 135 120 120 Z" fill="#ffffff" opacity="0.85"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);

async function generatePngs() {
  const buf = Buffer.from(svgIcon);
  const bufMaskable = Buffer.from(svgMaskable);
  
  await sharp(buf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(bufMaskable).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512-maskable.png'));
  await sharp(buf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(buf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(buf).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Successfully generated all PWA icons (192, 512, maskable, apple-touch, svg)!');
}

generatePngs().catch(console.error);
