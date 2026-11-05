import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 512x512 SVG with Bagh Chal board grid + Tiger face + Goat motif
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451A03" />
      <stop offset="60%" stop-color="#261005" />
      <stop offset="100%" stop-color="#140702" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="tigerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="50%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#9A3412" />
    </linearGradient>
    <linearGradient id="goatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Outer Ornate Nepali Mandala Ring -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-dasharray="8 6" opacity="0.6" />
  <circle cx="256" cy="256" r="226" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.8" />
  <circle cx="256" cy="256" r="218" fill="none" stroke="#78350F" stroke-width="1.5" />

  <!-- Carved Wooden Board Frame -->
  <rect x="76" y="76" width="360" height="360" rx="28" fill="#2E1005" stroke="url(#goldGrad)" stroke-width="6" filter="url(#glow)"/>
  <rect x="88" y="88" width="336" height="336" rx="20" fill="#3B1506" stroke="#92400E" stroke-width="2" />

  <!-- Bagh Chal Grid Lines -->
  <!-- Outer Grid -->
  <rect x="116" y="116" width="280" height="280" fill="none" stroke="#D97706" stroke-width="4" opacity="0.85" />
  <!-- Internal grid lines -->
  <line x1="186" y1="116" x2="186" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />
  <line x1="256" y1="116" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />
  <line x1="326" y1="116" x2="326" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />

  <line x1="116" y1="186" x2="396" y2="186" stroke="#D97706" stroke-width="3" opacity="0.75" />
  <line x1="116" y1="256" x2="396" y2="256" stroke="#D97706" stroke-width="3" opacity="0.75" />
  <line x1="116" y1="326" x2="396" y2="326" stroke="#D97706" stroke-width="3" opacity="0.75" />

  <!-- Diagonal lines -->
  <!-- Main diagonals -->
  <line x1="116" y1="116" x2="396" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />
  <line x1="396" y1="116" x2="116" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />

  <!-- Inscribed diamond diagonals -->
  <line x1="256" y1="116" x2="116" y2="256" stroke="#D97706" stroke-width="3" opacity="0.7" />
  <line x1="256" y1="116" x2="396" y2="256" stroke="#D97706" stroke-width="3" opacity="0.7" />
  <line x1="116" y1="256" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />
  <line x1="396" y1="256" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />

  <!-- Corner Tiger Medallions (4 Corners) -->
  <!-- Top Left Tiger -->
  <circle cx="116" cy="116" r="16" fill="url(#tigerGrad)" stroke="#FDE68A" stroke-width="2.5" filter="url(#glow)"/>
  <!-- Top Right Tiger -->
  <circle cx="396" cy="116" r="16" fill="url(#tigerGrad)" stroke="#FDE68A" stroke-width="2.5" filter="url(#glow)"/>
  <!-- Bottom Left Tiger -->
  <circle cx="116" cy="396" r="16" fill="url(#tigerGrad)" stroke="#FDE68A" stroke-width="2.5" filter="url(#glow)"/>
  <!-- Bottom Right Tiger -->
  <circle cx="396" cy="396" r="16" fill="url(#tigerGrad)" stroke="#FDE68A" stroke-width="2.5" filter="url(#glow)"/>

  <!-- Center Emblem (Tiger & Goat Clash) -->
  <circle cx="256" cy="256" r="54" fill="#1C0A03" stroke="url(#goldGrad)" stroke-width="4" filter="url(#glow)"/>
  
  <!-- Stylized Tiger Claw & Goat Horn Emblem in Center -->
  <path d="M 230 240 C 220 220, 240 210, 256 222 C 272 210, 292 220, 282 240 C 275 252, 265 264, 256 274 C 247 264, 237 252, 230 240 Z" fill="url(#tigerGrad)"/>
  <!-- Horn curls -->
  <path d="M 235 235 C 225 215, 205 220, 215 235 C 222 245, 235 245, 235 235 Z" fill="url(#goatGrad)"/>
  <path d="M 277 235 C 287 215, 307 220, 297 235 C 290 245, 277 245, 277 235 Z" fill="url(#goatGrad)"/>
  <circle cx="256" cy="250" r="6" fill="#FDE68A"/>

  <!-- Sanskrit/Nepali Title Text Arc -->
  <text x="256" y="475" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="#FDE68A" letter-spacing="4">BAGH CHAL</text>
  <text x="256" y="52" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="20" fill="#D97706" letter-spacing="6">बाघचाल · NEPAL</text>
</svg>
`;

// Maskable version with safe-zone margin (padding)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451A03" />
      <stop offset="60%" stop-color="#261005" />
      <stop offset="100%" stop-color="#140702" />
    </radialGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="tigerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="50%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#9A3412" />
    </linearGradient>
    <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Full-bleed background for maskable safe margin -->
  <rect width="512" height="512" fill="url(#bgGrad2)" />

  <g transform="translate(51, 51) scale(0.8)">
    <!-- Ornate Nepali Mandala Ring -->
    <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldGrad2)" stroke-width="4" stroke-dasharray="8 6" opacity="0.6" />
    <circle cx="256" cy="256" r="226" fill="none" stroke="url(#goldGrad2)" stroke-width="2" opacity="0.8" />

    <!-- Carved Wooden Board Frame -->
    <rect x="76" y="76" width="360" height="360" rx="28" fill="#2E1005" stroke="url(#goldGrad2)" stroke-width="6" filter="url(#glow2)"/>
    <rect x="88" y="88" width="336" height="336" rx="20" fill="#3B1506" stroke="#92400E" stroke-width="2" />

    <!-- Bagh Chal Grid Lines -->
    <rect x="116" y="116" width="280" height="280" fill="none" stroke="#D97706" stroke-width="4" opacity="0.85" />
    <line x1="186" y1="116" x2="186" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />
    <line x1="256" y1="116" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />
    <line x1="326" y1="116" x2="326" y2="396" stroke="#D97706" stroke-width="3" opacity="0.75" />

    <line x1="116" y1="186" x2="396" y2="186" stroke="#D97706" stroke-width="3" opacity="0.75" />
    <line x1="116" y1="256" x2="396" y2="256" stroke="#D97706" stroke-width="3" opacity="0.75" />
    <line x1="116" y1="326" x2="396" y2="326" stroke="#D97706" stroke-width="3" opacity="0.75" />

    <line x1="116" y1="116" x2="396" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />
    <line x1="396" y1="116" x2="116" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />

    <line x1="256" y1="116" x2="116" y2="256" stroke="#D97706" stroke-width="3" opacity="0.7" />
    <line x1="256" y1="116" x2="396" y2="256" stroke="#D97706" stroke-width="3" opacity="0.7" />
    <line x1="116" y1="256" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />
    <line x1="396" y1="256" x2="256" y2="396" stroke="#D97706" stroke-width="3" opacity="0.7" />

    <circle cx="116" cy="116" r="16" fill="url(#tigerGrad2)" stroke="#FDE68A" stroke-width="2.5"/>
    <circle cx="396" cy="116" r="16" fill="url(#tigerGrad2)" stroke="#FDE68A" stroke-width="2.5"/>
    <circle cx="116" cy="396" r="16" fill="url(#tigerGrad2)" stroke="#FDE68A" stroke-width="2.5"/>
    <circle cx="396" cy="396" r="16" fill="url(#tigerGrad2)" stroke="#FDE68A" stroke-width="2.5"/>

    <circle cx="256" cy="256" r="54" fill="#1C0A03" stroke="url(#goldGrad2)" stroke-width="4"/>
    <path d="M 230 240 C 220 220, 240 210, 256 222 C 272 210, 292 220, 282 240 C 275 252, 265 264, 256 274 C 247 264, 237 252, 230 240 Z" fill="url(#tigerGrad2)"/>
    <circle cx="256" cy="250" r="6" fill="#FDE68A"/>
    <text x="256" y="475" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="#FDE68A" letter-spacing="4">BAGH CHAL</text>
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon.trim());

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable with safe margin
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // favicon 32x32 png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('PWA icons created successfully in public/');
}

generate().catch(console.error);
