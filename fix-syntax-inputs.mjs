import fs from 'fs';

const filesToUpdate = [
  './src/components/admin/AddCarModal.tsx',
  './src/components/admin/EditCarModal.tsx',
  './src/components/admin/AddPackageModal.tsx',
  './src/components/admin/EditPackageModal.tsx',
  './src/components/admin/BookingDetailModal.tsx',
  './src/components/admin/ConfirmDialog.tsx',
];

const errorString = 'onChange={(e) = className="bg-white text-gray-900 border border-gray-300 dark:bg-[#0a0a0f] dark:text-white dark:border-[#2a2a3a] placeholder:text-gray-400 dark:placeholder:text-gray-500"> ';
const correctString = 'onChange={(e) => ';

const errorString2 = 'onChange={(e) = className="bg-white text-gray-900 border border-gray-300 dark:bg-[#0a0a0f] dark:text-white dark:border-[#2a2a3a] placeholder:text-gray-400 dark:placeholder:text-gray-500">';
const correctString2 = 'onChange={(e) =>';

let changedFilesCount = 0;

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix the syntax errors
  content = content.replaceAll(errorString, correctString);
  content = content.replaceAll(errorString2, correctString2);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated syntax in: ${file}`);
  }
});

console.log(`Total syntax fixes applied: ${changedFilesCount}`);
