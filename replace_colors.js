const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  [/bg-orange-500/g, 'bg-primary'],
  [/hover:bg-orange-600/g, 'hover:bg-secondary'],
  [/text-orange-500/g, 'text-primary'],
  [/text-orange-600/g, 'text-primary'],
  [/text-orange-700/g, 'text-primary'],
  [/text-orange-800/g, 'text-primary'],
  [/text-orange-200/g, 'text-accent'],
  [/hover:text-orange-500/g, 'hover:text-primary'],
  [/hover:text-orange-600/g, 'hover:text-primary'],
  [/border-orange-500/g, 'border-primary'],
  [/hover:border-orange-500/g, 'hover:border-primary'],
  [/border-orange-100/g, 'border-[var(--color-border)]'],
  [/bg-orange-50/g, 'bg-[var(--color-soft-bg)]'],
  [/focus:ring-orange-[0-9]{3}/g, 'focus:ring-primary'],
  [/text-yellow-400/g, 'text-accent'],
  [/text-yellow-500/g, 'text-accent'],
  [/bg-yellow-400/g, 'bg-accent'],
  [/bg-yellow-500/g, 'bg-accent'],
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
      }
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Color replacement complete.');
