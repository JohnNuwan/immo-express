const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  if (file.endsWith('.html')) {
    let content = fs.readFileSync(fullPath = path.join(publicDir, file), 'utf8');
    let modified = false;

    if (!content.includes('js/components.js')) {
      content = content.replace('</head>', '  <script src="js/components.js" defer></script>\n</head>');
      modified = true;
    }
    if (!content.includes('js/app.js')) {
      content = content.replace('</head>', '  <script src="js/app.js" defer></script>\n</head>');
      modified = true;
    }
    if (!content.includes('js/auth.js')) {
      content = content.replace('</head>', '  <script src="js/auth.js" defer></script>\n</head>');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated scripts in ${file}`);
    }
  }
});
