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

  // 1. Modal Backdrop
  const backdropRegex = /className="fixed inset-0 bg-black[^"]*flex items-center justify-center[^"]*"/g;
  content = content.replace(backdropRegex, 'className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"');
  
  // also handle ConfirmDialog which might not have p-4
  const confirmBackdropRegex = /className="fixed inset-0 z-50 flex items-center justify-center bg-black\/40 backdrop-blur-sm p-4"/g;
  if (file.includes('ConfirmDialog')) {
      content = content.replace(confirmBackdropRegex, 'className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"');
  }

  // 2. Input Fields
  // Replace the previously set string:
  const oldInputRegex = /className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-[0-9]+ dark:bg-\[\#0a0a0f\] dark:border-\[\#2a2a3a\] dark:text-white shadow-sm"/g;
  const exactInputString = 'className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none transition-colors dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white"';
  content = content.replace(oldInputRegex, exactInputString);

  // Replace flex-1 previously set string
  const oldFlexInputRegex = /className="flex-1 px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-[0-9]+ dark:bg-\[\#0a0a0f\] dark:border-\[\#2a2a3a\] dark:text-white shadow-sm"/g;
  const exactFlexInputString = 'className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none transition-colors dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white"';
  content = content.replace(oldFlexInputRegex, exactFlexInputString);

  // In case there are inputs still untouched, replace their classes
  const genericInputRegex = /className="w-full px-4 py-2 bg-gray-50 dark:bg-\[\#0a0a0f\] border border-gray-200 dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  content = content.replace(genericInputRegex, exactInputString);
  
  const genericInputRegex2 = /className="w-full px-4 py-2 bg-white dark:bg-\[\#1a1a24\] border border-gray-200 dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  content = content.replace(genericInputRegex2, exactInputString);

  const genericFlexRegex = /className="flex-1 px-4 py-2 bg-gray-50 dark:bg-\[\#0a0a0f\] border border-gray-200 dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  content = content.replace(genericFlexRegex, exactFlexInputString);

  // Label Texts
  // Make sure labels use text-gray-700 dark:text-gray-300
  // Some labels might be text-gray-600 or dark:text-gray-400
  const labelRegex = /className="block text-sm font-medium text-gray-700 dark:text-gray-300[^"]*"/g;
  // This is already correct for most. Let's make sure it's applied.
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFilesCount}`);
