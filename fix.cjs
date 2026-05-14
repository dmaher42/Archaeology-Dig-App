/* global require */
const fs = require('fs');
const path = 'src/index.css';
let content = fs.readFileSync(path, 'utf8');

// First replace the sticky definition at line 694 to remove sticky positioning
content = content.replace(
  /position:\s*sticky;\s*bottom:\s*0\.75rem;\s*padding:\s*0\.85rem\s*0\s*0\.15rem;\s*background:\s*linear-gradient[^;]+;\s*z-index:\s*3;/,
  '/* Removed sticky positioning to fix overlap */\n  padding-bottom: 0.5rem;'
);

// Next update the !important rules at the end of the file
const target1 = `  display: flex !important;\r
  flex-wrap: wrap !important;\r
  gap: 0.65rem !important;\r
  align-items: center !important;\r
  justify-content: flex-start !important;\r
  padding-top: 0.9rem !important;\r
  border-top: 1px solid rgba(0, 0, 0, 0.1) !important;`;

const target2 = `  display: flex !important;\n  flex-wrap: wrap !important;\n  gap: 0.65rem !important;\n  align-items: center !important;\n  justify-content: flex-start !important;\n  padding-top: 0.9rem !important;\n  border-top: 1px solid rgba(0, 0, 0, 0.1) !important;`;

const replacement = `  display: flex !important;
  flex-direction: column !important;
  gap: 0.8rem !important;
  align-items: stretch !important;
  justify-content: center !important;
  padding-top: 1.2rem !important;
  margin-top: 1.5rem !important;
  border-top: 1px dashed rgba(0, 0, 0, 0.15) !important;
  position: relative !important;
  background: transparent !important;
  z-index: 10 !important;`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement.replace(/\n/g, '\r\n'));
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement);
}

// Ensure the buttons look correct by removing min-width constraints or adjusting padding if needed
// Let's add a rule so the buttons don't get too wide on large screens but stretch neatly
content += `\n\n.bureau-case-actions .btn { max-width: 400px; margin: 0 auto; width: 100%; }\n`;

fs.writeFileSync(path, content);
console.log('Done');
