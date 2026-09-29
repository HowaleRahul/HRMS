const fs = require('fs');
let file = 'client/src/index.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/#root\s*\{[^}]*\}/g, '#root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }');
content = content.replace(/body\s*\{\s*margin:\s*0;\s*\}/g, `body { margin: 0; padding: 0; min-height: 100vh; background-color: #F9FAFB; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #101828; overflow-x: hidden; }`);

fs.writeFileSync(file, content);
