const fs = require('fs');
let content = fs.readFileSync('src/pages/FreelancerProfile.jsx', 'utf8');

// 1. Remove Left Sidebar
const sidebarStart = content.indexOf('{/* Left Sticky Sidebar (Glassmorphic) */}');
const rightContainerStart = content.indexOf('{/* Right Scrollable Content Container */}');
if (sidebarStart !== -1 && rightContainerStart !== -1) {
    content = content.substring(0, sidebarStart) + content.substring(rightContainerStart);
}

// 2. Change main container
content = content.replace(/\{?\/\* Right Scrollable Content Container \*\/\}?[\s\n]*<div className="w-full flex-1 min-h-\[600px\] relative">[\s\n]*<AnimatePresence mode="wait">/, 
    '{/* Main Form Container - Centered */}\n                <div className="w-full max-w-4xl mx-auto space-y-12">');

// 3. Remove conditional wrappers and Next/Back buttons
// We can use a regex loop to remove the `{activeSection === '...' && (` and the trailing `)}`
// Personal
content = content.replace(/\{activeSection === 'personal' && \([\s\n]*<motion\.section/g, '<motion.section');
content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">[\s\n]*<button type="button" onClick=\{[^}]+\} className="[^"]+">Next: Skills & Pricing →<\/button>[\s\n]*<\/div>[\s\n]*<\/motion\.section>[\s\n]*\)\}/g, '</motion.section>');

// Skills
content = content.replace(/\{activeSection === 'skills' && \([\s\n]*<motion\.section/g, '<motion.section');
content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">[\s\S]*?<\/div>[\s\n]*<\/motion\.section>[\s\n]*\)\}/g, '</motion.section>');

// Portfolio
content = content.replace(/\{activeSection === 'portfolio' && \([\s\n]*<motion\.section/g, '<motion.section');

// Experience
content = content.replace(/\{activeSection === 'experience' && \([\s\n]*<motion\.section/g, '<motion.section');
content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-800 flex justify-start">[\s\S]*?<\/div>[\s\n]*<\/motion\.section>[\s\n]*\)\}\n\s*<\/AnimatePresence>/g, '</motion.section>');

fs.writeFileSync('src/pages/FreelancerProfile.jsx', content);
console.log('Sidebar removed and layout reverted to centered scroll format.');
