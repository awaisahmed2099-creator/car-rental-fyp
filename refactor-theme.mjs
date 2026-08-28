import fs from 'fs';
import path from 'path';

const dirs = [
  './src/app/admin',
  './src/components/admin'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

let files = [];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = getAllFiles(dir, files);
  }
});

let changedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/bg-\[\#0a0a0f\]/g, "bg-gray-50 dark:bg-[#0a0a0f]");
  content = content.replace(/bg-\[\#1a1a24\]/g, "bg-white dark:bg-[#1a1a24]");
  content = content.replace(/bg-\[\#111118\]/g, "bg-white dark:bg-[#111118]");
  content = content.replace(/hover:bg-\[\#111118\]/g, "hover:bg-gray-100 dark:hover:bg-[#111118]");
  content = content.replace(/hover:bg-\[\#0a0a0f\]/g, "hover:bg-gray-100 dark:hover:bg-[#0a0a0f]");
  
  // Borders
  content = content.replace(/border-\[\#2a2a3a\]/g, "border-gray-200 dark:border-[#2a2a3a]");
  content = content.replace(/border-\[\#3a3a4a\]/g, "border-gray-300 dark:border-[#3a3a4a]");

  // Rings
  content = content.replace(/ring-\[\#111118\]/g, "ring-white dark:ring-[#111118]");

  // Text Colors (Careful not to replace in orange buttons or specific scenarios)
  // Let's use regex that ensures we aren't messing up specific buttons
  // But actually, replacing `text-white` with `text-gray-900 dark:text-white` might be too aggressive globally.
  // We can do it where `text-white` is preceded by space, and not inside a button that has bg-orange-500.
  // A safer approach is to replace `text-white` with `text-gray-900 dark:text-white` and then fix the buttons.
  content = content.replace(/(?<!bg-\w+-\d+\s+)(?<!bg-\w+-\d+\/10\s+)text-white(?!.*bg-orange-500)/g, "text-gray-900 dark:text-white");
  
  content = content.replace(/text-gray-400/g, "text-gray-600 dark:text-gray-400");
  content = content.replace(/text-gray-300/g, "text-gray-700 dark:text-gray-300");
  content = content.replace(/text-gray-500/g, "text-gray-500 dark:text-gray-500"); // Keep gray-500 neutral or tweak if needed

  // Fix buttons that might have been hit:
  // e.g. bg-orange-500 text-gray-900 dark:text-white -> bg-orange-500 text-white
  content = content.replace(/bg-orange-500([^>]*?)text-gray-900 dark:text-white/g, "bg-orange-500$1text-white");
  content = content.replace(/bg-red-600([^>]*?)text-gray-900 dark:text-white/g, "bg-red-600$1text-white");
  content = content.replace(/bg-blue-600([^>]*?)text-gray-900 dark:text-white/g, "bg-blue-600$1text-white");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFilesCount}`);
