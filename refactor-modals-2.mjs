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
  // Target any input-like class list that has bg-gray-50 dark:bg-[#0a0a0f] or bg-white dark:bg-[#1a1a24]
  const inputRegex1 = /className="w-full px-4 py-2 bg-gray-[0-9]+ dark:bg-\[\#0a0a0f\] border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  const inputRegex2 = /className="w-full px-4 py-2 bg-white dark:bg-\[\#1a1a24\] border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  const inputRegex3 = /className="flex-1 px-4 py-2 bg-gray-[0-9]+ dark:bg-\[\#0a0a0f\] border border-gray-[0-9]+ dark:border-\[\#2a2a3a\] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white shadow-sm"/g;
  
  const newInputClasses = `className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white shadow-sm"`;
  const newFlexInputClasses = `className="flex-1 px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white shadow-sm"`;
  
  content = content.replace(inputRegex1, newInputClasses);
  content = content.replace(inputRegex2, newInputClasses);
  content = content.replace(inputRegex3, newFlexInputClasses);


  // 2. Cancel / Previous Buttons
  const btn1 = /className="px-6 py-2 border border-gray-200 dark:border-\[\#2a2a3a\] rounded-lg font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-\[\#1a1a24\] hover:bg-\[\#2a2a3a\] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"/g;
  const newBtn = `className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:border dark:border-[#2a2a3a]"`;
  content = content.replace(btn1, newBtn);

  // The step indicator line in AddPackageModal / EditPackageModal
  const stepInd = /bg-\[\#2a2a3a\]/g;
  content = content.replace(stepInd, "bg-gray-200 dark:bg-gray-700");


  // Let's run a generic search for the rest of inputs in AddCarModal / EditCarModal that we might have missed
  // w-full px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-300 ...
  // Wait, the previous script changed AddCarModal's inputs. 
  // Let's force replace them with the exact string requested if they exist in AddCarModal.
  const prevScriptInput = /className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white border border-gray-[0-9]+ text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-[0-9]+ dark:bg-\[\#0a0a0f\] dark:border-\[\#2a2a3a\] dark:text-white shadow-sm"/g;
  content = content.replace(prevScriptInput, newInputClasses);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFilesCount}`);
