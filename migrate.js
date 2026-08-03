const fs = require('fs');
const path = require('path');

const files = [
  'client/src/pages/RegisterPage.jsx',
  'client/src/pages/LoginPage.jsx',
  'client/src/pages/ProfileSetupPage.jsx',
  'client/src/pages/ProfileViewPage.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors
  content = content.replace(/text-brand/g, 'text-primary');
  content = content.replace(/bg-brand-light/g, 'bg-primary-very-light');
  content = content.replace(/bg-brand/g, 'bg-primary');
  content = content.replace(/border-brand/g, 'border-primary');
  content = content.replace(/accent-brand/g, 'accent-primary');
  content = content.replace(/focus:ring-brand/g, 'focus:ring-primary');
  
  content = content.replace(/text-\[#0f5d52\]/g, 'text-primary');
  content = content.replace(/bg-\[#0f5d52\]/g, 'bg-primary');
  content = content.replace(/#0f5d52/g, 'primary'); // For icons

  content = content.replace(/text-\[#1a2e2b\]/g, 'text-text-primary');
  content = content.replace(/text-\[#6b8a86\]/g, 'text-text-secondary');
  content = content.replace(/text-\[#52706c\]/g, 'text-text-secondary');
  content = content.replace(/text-\[#4a6360\]/g, 'text-text-secondary');
  
  content = content.replace(/text-slate-800|text-slate-700|text-slate-900/g, 'text-text-primary');
  content = content.replace(/text-slate-500|text-slate-600/g, 'text-text-secondary');
  content = content.replace(/text-slate-400/g, 'text-text-muted');

  content = content.replace(/bg-\[#faf9f6\]/g, 'bg-background');
  content = content.replace(/bg-\[#f8f6f2\]/g, 'bg-background');
  content = content.replace(/bg-slate-50/g, 'bg-background');
  content = content.replace(/bg-white/g, 'bg-card');

  content = content.replace(/border-slate-200|border-\[#e8ebe9\]/g, 'border-border-light');
  content = content.replace(/border-\[#c8e6e0\]/g, 'border-primary-light');
  
  content = content.replace(/hover:bg-\[#0d4d44\]/g, 'hover:bg-primary-hover');
  content = content.replace(/hover:text-\[#0d4d44\]/g, 'hover:text-primary-hover');
  
  // Specific Buttons / Inputs
  content = content.replace(/focus:border-brand focus:shadow-\[.*?\]/g, 'focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors');
  content = content.replace(/focus:border-primary focus:shadow-\[.*?\]/g, 'focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors');
  content = content.replace(/focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100/g, 'focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors');
  
  content = content.replace(/bg-brand hover:bg-\[#0d4d44\] shadow-\[.*?\]/g, 'bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all');
  content = content.replace(/bg-primary hover:bg-primary-hover shadow-\[.*?\]/g, 'bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all');

  // General Shadows
  content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');
  
  // Remove heavy borders on images in RegisterPage
  content = content.replace(/border-\[6px\] border-card/g, 'border border-border-light shadow-sm');
  content = content.replace(/border-\[5px\] border-card/g, 'border border-border-light shadow-sm');
  content = content.replace(/border-\[6px\] border-white/g, 'border border-border-light shadow-sm');
  content = content.replace(/border-\[5px\] border-white/g, 'border border-border-light shadow-sm');
  
  // Typography additions where missing
  content = content.replace(/font-serif text-\[.*?\] font-bold text-text-primary/g, (match) => match + ' text-text-primary font-bold');
  
  // Specific gradients in LoginPage & ProfileViewPage
  content = content.replace(/bg-gradient-to-br from-brand to-brand-mid/g, 'bg-primary');
  content = content.replace(/bg-gradient-to-br from-primary to-brand-mid/g, 'bg-primary');
  content = content.replace(/hover:from-\[#0d4d44\] hover:to-\[#156359\]/g, 'hover:bg-primary-hover');
  content = content.replace(/bg-\[linear-gradient(.*?)\]/g, 'bg-background');

  // More specific ProfileSetupPage replaces
  content = content.replace(/text-emerald-700/g, 'text-primary');
  content = content.replace(/text-emerald-600/g, 'text-primary');
  content = content.replace(/border-emerald-600/g, 'border-primary');
  content = content.replace(/bg-emerald-600/g, 'bg-primary');
  content = content.replace(/bg-emerald-50/g, 'bg-primary-very-light');
  content = content.replace(/border-emerald-500/g, 'border-primary-light');
  content = content.replace(/bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-700\/20/g, 'bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
