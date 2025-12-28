/**
 * App Icon Generator Script
 * 
 * This script generates app icons for Stylio using sharp or canvas.
 * 
 * Prerequisites:
 *   npm install sharp
 * 
 * Usage:
 *   node scripts/generate-icons.js
 * 
 * Alternative: Create icons manually with these specifications:
 * 
 * 1. icon.png (1024x1024px)
 *    - Purple gradient background (#8B5CF6 to #7C3AED)
 *    - White scissors icon in center
 *    - Used for iOS app icon
 * 
 * 2. adaptive-icon.png (1024x1024px)
 *    - Transparent background
 *    - White scissors icon centered
 *    - Used for Android adaptive icons (system adds background)
 * 
 * 3. splash.png (1284x2778px)
 *    - Purple gradient background
 *    - App logo in center
 *    - "Stylio" text below logo
 * 
 * 4. favicon.png (48x48px)
 *    - Same as icon but smaller
 *    - Used for web
 * 
 * Recommended Tools for Icon Creation:
 * - Figma (free): figma.com
 * - Canva (free): canva.com
 * - Adobe Express (free): adobe.com/express
 * - App Icon Generator: appicon.co
 * 
 * Icon Design Guidelines:
 * - Use brand color: #8B5CF6 (primary purple)
 * - Keep design simple and recognizable at small sizes
 * - Use contrasting white icon on purple background
 * - Add subtle gradient for depth: #8B5CF6 → #7C3AED
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Creating placeholder icons with instructions...');
  createPlaceholderGuide();
  process.exit(0);
}

const BRAND_COLOR = '#8B5CF6';
const BRAND_DARK = '#7C3AED';

async function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Create a simple gradient background with scissors icon
  const iconSVG = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLOR}"/>
          <stop offset="100%" style="stop-color:${BRAND_DARK}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)" rx="200"/>
      <g transform="translate(512, 512) scale(2)">
        <path fill="white" d="M14.5 4.5c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM18.5 11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM6.5 11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z"/>
        <path fill="white" d="M10.5 8.5L6 20h4l6-15-5.5 3.5z"/>
      </g>
    </svg>
  `;

  // Adaptive icon (transparent background)
  const adaptiveIconSVG = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(256, 256)">
        <g transform="scale(4)">
          <circle cx="64" cy="64" r="24" fill="none" stroke="white" stroke-width="4"/>
          <circle cx="64" cy="64" r="8" fill="white"/>
          <path d="M80 48 L96 64 L80 80" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M48 48 L32 64 L48 80" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>
  `;

  try {
    // Generate icon.png
    await sharp(Buffer.from(iconSVG))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ Generated icon.png');

    // Generate adaptive-icon.png
    await sharp(Buffer.from(adaptiveIconSVG))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ Generated adaptive-icon.png');

    // Generate favicon.png
    await sharp(Buffer.from(iconSVG))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ Generated favicon.png');

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error.message);
    createPlaceholderGuide();
  }
}

function createPlaceholderGuide() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    APP ICON CREATION GUIDE                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  To create your Stylio app icons, follow these steps:        ║
║                                                              ║
║  1. Go to https://www.canva.com or https://figma.com         ║
║                                                              ║
║  2. Create the following icons with these specs:             ║
║                                                              ║
║     icon.png (1024x1024)                                     ║
║     ├─ Background: Gradient #8B5CF6 → #7C3AED               ║
║     ├─ Icon: White scissors or beauty-related icon           ║
║     └─ Round corners for iOS                                 ║
║                                                              ║
║     adaptive-icon.png (1024x1024)                            ║
║     ├─ Background: Transparent                               ║
║     └─ Icon: White scissors (centered, 60% of canvas)        ║
║                                                              ║
║     splash.png (1284x2778)                                   ║
║     ├─ Background: Gradient #8B5CF6 → #7C3AED               ║
║     ├─ Logo: Centered                                        ║
║     └─ Text: "Stylio" below logo                             ║
║                                                              ║
║     favicon.png (48x48)                                      ║
║     └─ Same as icon.png but smaller                          ║
║                                                              ║
║  3. Place generated icons in: mobile/assets/                 ║
║                                                              ║
║  Quick Option: Use https://appicon.co for automatic sizes    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

generateIcons();

