const fs = require('fs');
const path = require('path');

const replacements = [
    [/violet-/g, 'blue-'],
    [/pink-/g, 'cyan-'],
    [/purple-/g, 'blue-'],
    [/bg-\[\#5f4bb6\]/g, 'bg-[#1e3a8a]'],
    [/from-\[\#5f4bb6\]/g, 'from-[#1e3a8a]'],
    [/to-\[\#4c3b9c\]/g, 'to-[#1e40af]'],
    [/bg-\[\#ff7eb3\]/g, 'bg-[#06b6d4]'],
    [/\#7C3AED/gi, '#2563eb'], // violet-600 to blue-600
    [/\#9333EA/gi, '#3b82f6'], // purple-600 to blue-500
    [/\#EC4899/gi, '#06b6d4'], // pink-500 to cyan-500
    [/\#ff7eb3/gi, '#22d3ee'], // pinkish to cyan-400
    [/var\(--violet-light\)/g, 'var(--blue-light)'],
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            for (const [regex, replacement] of replacements) {
                newContent = newContent.replace(regex, replacement);
            }
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDirectory('./app');
processDirectory('./components');
console.log("Done");
