const fs = require('fs');

function processFile(filePath, isLoginPage) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace colors
  content = content.replace(/text-\[\#0f5d52\]/g, 'text-brand');
  content = content.replace(/bg-\[\#0f5d52\]/g, 'bg-brand');
  content = content.replace(/border-\[\#0f5d52\]/g, 'border-brand');
  content = content.replace(/from-\[\#0f5d52\]/g, 'from-brand');
  
  content = content.replace(/text-\[\#1a7a6e\]/g, 'text-brand-mid');
  content = content.replace(/bg-\[\#1a7a6e\]/g, 'bg-brand-mid');
  content = content.replace(/to-\[\#1a7a6e\]/g, 'to-brand-mid');

  content = content.replace(/text-\[\#0a3f38\]/g, 'text-brand-dark');
  content = content.replace(/bg-\[\#0a3f38\]/g, 'bg-brand-dark');

  content = content.replace(/text-\[\#edf7f5\]/g, 'text-brand-light');
  content = content.replace(/bg-\[\#edf7f5\]/g, 'bg-brand-light');

  content = content.replace(/text-\[\#7a9490\]/g, 'text-brand-muted');

  content = content.replace(/text-\[\#d4a843\]/g, 'text-gold');
  content = content.replace(/bg-\[\#d4a843\]/g, 'bg-gold');
  
  content = content.replace(/text-\[\#c89832\]/g, 'text-gold-dark');
  content = content.replace(/bg-\[\#c89832\]/g, 'bg-gold-dark');

  // Replace font families
  content = content.replace(/style=\{\{\s*fontFamily:\s*"'Cormorant Garamond', serif"\s*\}\}\s*className="/g, 'className="font-serif ');

  if (isLoginPage) {
    // Background gradient:
    content = content.replace(
      /style=\{\{ background: "linear-gradient\(135deg, #f0f7f5 0%, #f7f4ee 50%, #eef5f2 100%\)" \}\}/g,
      ''
    );
    // Replace the wrapper class for LoginPage
    content = content.replace(
      /className="min-h-screen flex flex-col overflow-x-hidden"\s*/,
      'className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[linear-gradient(135deg,#f0f7f5_0%,#f7f4ee_50%,#eef5f2_100%)]"'
    );
    // In LoginPage, header wrapper needs absolute positioning if we centered the main wrapper
    content = content.replace(
      /<div className="px-6 py-4 md:px-8 md:py-6">/,
      '<div className="absolute top-0 left-0 px-6 py-4 md:px-8 md:py-6 z-20">'
    );
    // Remove flex-1 from form wrapper to keep centering correct
    content = content.replace(
      /<div className="flex-1 flex items-center justify-center px-4 py-8">/,
      '<div className="flex w-full items-center justify-center px-4 py-8 z-10">'
    );
  } else {
    // RegisterPage modifications
    // Replace inline styles for animations
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast1 8s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast1_8s_ease-in-out_infinite]"');
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast2 11s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast2_11s_ease-in-out_infinite]"');
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast3 9s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast3_9s_ease-in-out_infinite]"');
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast3 10s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast3_10s_ease-in-out_infinite]"');
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast2 12s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast2_12s_ease-in-out_infinite]"');
    content = content.replace(/style=\{\{\s*animation:\s*'floatFast1 9s ease-in-out infinite'\s*\}\}/g, 'className="animate-[floatFast1_9s_ease-in-out_infinite]"');
    
    // Fix existing classNames that had the style tag prepended
    content = content.replace(/className="animate-\[floatFast1_8s_ease-in-out_infinite\]"\s*className="ml-0"/g, 'className="animate-[floatFast1_8s_ease-in-out_infinite] ml-0"');
    content = content.replace(/className="animate-\[floatFast2_11s_ease-in-out_infinite\]"\s*className="ml-32"/g, 'className="animate-[floatFast2_11s_ease-in-out_infinite] ml-32"');
    content = content.replace(/className="animate-\[floatFast3_9s_ease-in-out_infinite\]"\s*className="-ml-8"/g, 'className="animate-[floatFast3_9s_ease-in-out_infinite] -ml-8"');
    
    content = content.replace(/className="animate-\[floatFast3_10s_ease-in-out_infinite\]"\s*className="-mr-8"/g, 'className="animate-[floatFast3_10s_ease-in-out_infinite] -mr-8"');
    content = content.replace(/className="animate-\[floatFast2_12s_ease-in-out_infinite\]"\s*className="mr-32"/g, 'className="animate-[floatFast2_12s_ease-in-out_infinite] mr-32"');
    content = content.replace(/className="animate-\[floatFast1_9s_ease-in-out_infinite\]"\s*className="mr-0"/g, 'className="animate-[floatFast1_9s_ease-in-out_infinite] mr-0"');

    // Update main wrapper
    content = content.replace(
      /className="min-h-screen flex flex-col relative overflow-hidden z-0 bg-\[\#faf9f6\]"/,
      'className="flex items-center justify-center min-h-screen relative overflow-hidden z-0 bg-[#faf9f6]"'
    );
    // Remove flex-1 from form wrapper
    content = content.replace(
      /className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-12 z-10 relative w-full"/,
      'className="flex flex-col items-center justify-center px-4 py-8 lg:py-12 z-10 relative w-full"'
    );
  }

  // Common replacements for arbitrary rgba
  content = content.replace(/rgba\(15,93,82,0\.1\)/g, 'rgba(15,93,82,0.1)'); // unchanged just in case

  fs.writeFileSync(filePath, content, 'utf8');
}

processFile('client/src/pages/LoginPage.jsx', true);
processFile('client/src/pages/RegisterPage.jsx', false);

console.log('Conversion completed.');
