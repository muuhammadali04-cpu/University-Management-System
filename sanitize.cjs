const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);

files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.vue')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Remove persist: true from stores
    if (file.includes('store') && file.endsWith('.js')) {
      content = content.replace(/,\s*persist:\s*true/g, '');
      content = content.replace(/persist:\s*true/g, '');
    }

    // 2. Remove HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // 3. Remove JS block comments (/* */)
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // 4. Remove JS line comments (//), careful not to break http://
    // This looks for // that is not preceded by : (like https://)
    content = content.replace(/(?<!:)\/\/.*/g, '');

    fs.writeFileSync(file, content);
  }
});

console.log('Sanitization complete!');
