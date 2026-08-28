import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  './src/components/admin/AddCarModal.tsx',
  './src/components/admin/EditCarModal.tsx',
  './src/components/admin/AddPackageModal.tsx',
  './src/components/admin/EditPackageModal.tsx',
  './src/components/admin/BookingDetailModal.tsx',
  './src/components/admin/ConfirmDialog.tsx',
];

let changedFilesCount = 0;

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Inputs, Textareas, Select fields
  // In the current code they have classes like:
  // w-full px-4 py-2 border border-gray-200 dark:border-[#2a2a3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white shadow-sm bg-gray-50 dark:bg-[#0a0a0f]
  // We can replace the background, border and focus classes broadly for inputs.
  
  // Replace current input classes with the new standardized string requested by the user
  const oldInputRegex = /className="w-full px-4 py-2 border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white[^"]*"/g;
  const newInputClasses = `className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white shadow-sm"`;
  content = content.replace(oldInputRegex, newInputClasses);

  // For selects that might be different
  const oldSelectRegex = /className="w-full px-4 py-2 border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white bg-white dark:bg-\[\#1a1a24\] shadow-sm"/g;
  content = content.replace(oldSelectRegex, newInputClasses);

  // Also replace any generic input classes that might not have matched
  const flexInputRegex = /className="flex-1 px-4 py-2 border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white shadow-sm"/g;
  const newFlexInputClasses = `className="flex-1 px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white shadow-sm"`;
  content = content.replace(flexInputRegex, newFlexInputClasses);


  // 2. Secondary/Cancel/Previous Buttons
  // Previous button in modals: bg-gray-200 ...
  const previousBtnRegex = /className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:text-gray-600 dark:text-gray-400 disabled:cursor-not-allowed font-medium transition-all shadow-sm"/g;
  const newPreviousBtnClasses = `className="px-4 py-2 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:border dark:border-[#2a2a3a]"`
  content = content.replace(previousBtnRegex, newPreviousBtnClasses);

  const cancelBtnRegex = /className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"/g;
  const newCancelBtnClasses = `className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:border dark:border-[#2a2a3a]"`
  content = content.replace(cancelBtnRegex, newCancelBtnClasses);
  
  // Another variation of Cancel/Close buttons in ConfirmDialog etc
  const altCancelBtnRegex = /className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"/g;
  const newAltCancelBtnClasses = `className="px-4 py-2 rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:border dark:border-[#2a2a3a]"`
  content = content.replace(altCancelBtnRegex, newAltCancelBtnClasses);

  // 3. Progress Bar / Step Indicators
  // bg-gray-200 -> bg-gray-200 dark:bg-gray-700
  // Note: specific to step indicator in AddCarModal / EditCarModal
  content = content.replace(/bg-gray-200'\}\`\}\><\/div>/g, "bg-gray-200 dark:bg-gray-700'}></div>");


  // 4. Inactive/Suggested features
  // bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200
  content = content.replace(/bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200/g, "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1a1a24] dark:text-gray-300 dark:hover:bg-white/5 dark:border dark:border-[#2a2a3a]");


  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFilesCount}`);
