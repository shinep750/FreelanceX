const fs = require('fs');
let f = fs.readFileSync('src/pages/FreelancerProfile.jsx', 'utf8');

// 1. Remove Intersection Observer
f = f.replace(/\/\/ Intersection Observer to update active nav tab based on scroll position[\s\S]*?return \(\) => observer\.disconnect\(\);\n    \}, \[\]\);/, '// Intersection Observer removed in favor of Tab layout');

// 2. Adjust scrollToSection
f = f.replace(/const scrollToSection = \(id\) => \{[\s\S]*?    \};/, 'const scrollToSection = (id) => { setActiveSection(id); window.scrollTo({ top: 0, behavior: "smooth" }); };');

// 3. Layout adjustments
f = f.replace(/md:w-72/g, 'lg:w-64');
f = f.replace(/rounded-\[2rem\]/g, 'rounded-2xl');
f = f.replace(/p-8 md:p-10/g, 'p-6 md:p-8');
f = f.replace(/<div className="w-full flex-1 space-y-12">/, '<div className="w-full flex-1 min-h-[600px] relative">\n                        <AnimatePresence mode="wait">');

// 4. Wrap sections
f = f.replace(/\{\/\* \[SECTION 1: Personal Details\] \*\/\}/, '{activeSection === "personal" && (\n                            <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>\n                                {/* [SECTION 1: Personal Details] */}');

f = f.replace(/\{\/\* \[SECTION 2: Skills & Pricing\] \*\/\}/, '                <div className="mt-8 flex justify-end"><button type="button" onClick={() => scrollToSection("skills")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md">Next: Skills & Pricing →</button></div>\n                            </motion.div>\n                        )}\n\n                        {activeSection === "skills" && (\n                            <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>\n                                {/* [SECTION 2: Skills & Pricing] */}');

f = f.replace(/\{\/\* \[SECTION 3: Portfolio & CV\] \*\/\}/, '                <div className="mt-8 flex justify-between"><button type="button" onClick={() => scrollToSection("personal")} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">← Back</button><button type="button" onClick={() => scrollToSection("portfolio")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md">Next: Portfolio & CV →</button></div>\n                            </motion.div>\n                        )}\n\n                        {activeSection === "portfolio" && (\n                            <motion.div key="portfolio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>\n                                {/* [SECTION 3: Portfolio & CV] */}');

f = f.replace(/\{\/\* \[SECTION 4: Experience\] \*\/\}/, '                 <div className="mt-8 flex justify-between"><button type="button" onClick={() => scrollToSection("skills")} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">← Back</button><button type="button" onClick={() => scrollToSection("experience")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md">Next: Work Experience →</button></div>\n                            </motion.div>\n                        )}\n\n                        {activeSection === "experience" && (\n                            <motion.div key="experience" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>\n                                {/* [SECTION 4: Experience] */}');

f = f.replace(/<\/section>\s*<\/div>\s*<\/div>\s*\{\/\* Bottom Floating Action Bar/, '</section>\n               <div className="mt-8 flex justify-start"><button type="button" onClick={() => scrollToSection("portfolio")} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">← Back</button></div>\n                            </motion.div>\n                        )}\n                        </AnimatePresence>\n                    </div>\n            </div >\n\n            {/* Bottom Floating Action Bar');

fs.writeFileSync('src/pages/FreelancerProfile.jsx', f);
console.log('Refactoring complete.');
