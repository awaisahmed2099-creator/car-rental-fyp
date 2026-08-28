import fs from 'fs';

const filesToUpdate = [
  './src/components/admin/AddCarModal.tsx',
  './src/components/admin/EditCarModal.tsx',
  './src/components/admin/AddPackageModal.tsx',
  './src/components/admin/EditPackageModal.tsx',
  './src/components/admin/BookingDetailModal.tsx',
  './src/components/admin/ConfirmDialog.tsx',
];

const removeClasses = [
  'bg-white', 'dark:bg-[#0a0a0f]', 'dark:bg-[#1a1a24]', 'bg-gray-50', 'bg-gray-900', 'bg-[#1a1a24]', 'bg-[#0a0a0f]',
  'border-gray-200', 'border-gray-300', 'dark:border-[#2a2a3a]',
  'text-gray-900', 'text-gray-800', 'dark:text-white',
  'placeholder:text-gray-400', 'dark:placeholder:text-gray-500',
  'focus:border-transparent', 'focus:border-orange-500' // let's clean up existing border focuses if any
];

const targetClasses = 'bg-white text-gray-900 border border-gray-300 dark:bg-[#0a0a0f] dark:text-white dark:border-[#2a2a3a] placeholder:text-gray-400 dark:placeholder:text-gray-500';

let changedFilesCount = 0;

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex to match <input ...>, <select ...>, <textarea ...>
  // We use a replacer function to modify the className inside them.
  const tagRegex = /<(input|select|textarea)([^>]+)>/g;

  content = content.replace(tagRegex, (match, tag, attributes) => {
    // skip checkboxes, radios, hidden/file inputs
    if (attributes.includes('type="checkbox"') || attributes.includes('type="radio"') || attributes.includes('type="file"') || attributes.includes('type="hidden"')) {
      return match;
    }

    // find className="......."
    const classRegex = /className="([^"]+)"/;
    if (!classRegex.test(attributes)) {
      // if no className, add it
      return `<${tag}${attributes} className="${targetClasses}">`;
    }

    const newAttributes = attributes.replace(classRegex, (classMatch, classNames) => {
      let classes = classNames.split(/\s+/).filter(c => c.trim() !== '');

      // Remove unwanted color classes
      classes = classes.filter(c => !removeClasses.includes(c));

      // Add target classes
      const newClassStr = classes.join(' ') + ' ' + targetClasses;
      
      // Some inputs need rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none transition-colors
      // If they are missing some of these layout/utility classes, we can add them, but for now we just append the exact string user asked for colors.
      
      return `className="${newClassStr}"`;
    });

    return `<${tag}${newAttributes}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFilesCount}`);
