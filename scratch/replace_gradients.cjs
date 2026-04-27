const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');

const replacements = [
  { regex: /bg-gradient-to-br\s+from-primary\s+to-primary-container/g, replacement: 'bg-primary' },
  { regex: /bg-gradient-to-r\s+from-primary\s+to-primary-container/g, replacement: 'bg-primary' },
  { regex: /bg-gradient-to-r\s+from-secondary\s+to-primary/g, replacement: 'bg-primary' },
  { regex: /bg-gradient-to-r\s+from-primary\s+to-secondary/g, replacement: 'bg-primary' },
  { regex: /bg-gradient-to-br\s+from-primary\s+to-secondary/g, replacement: 'bg-primary' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({regex, replacement}) => {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
