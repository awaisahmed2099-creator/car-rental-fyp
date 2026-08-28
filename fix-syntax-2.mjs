import fs from 'fs';

const filesToUpdate = [
  './src/components/admin/AddPackageModal.tsx',
];

let changedFilesCount = 0;

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix the broken step indicator template string (second pattern that might exist)
  content = content.replace(/'bg-gray-200 dark:bg-gray-700'\}><\/div>/g, "'bg-gray-200 dark:bg-gray-700'}`}></div>");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`Total files fixed: ${changedFilesCount}`);
