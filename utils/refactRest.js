const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) {
   fs.mkdirSync(newFolderPath, { recursive: true });
}

async function readJsonFile(filePath) {
   const data = await fs.promises.readFile(filePath, 'utf8');
   return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
   await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function processAndRefactorData(data, fieldName) {
   // Remove items with empty values and "ID" field, then deduplicate based on fieldName
   const uniqueValues = new Set();
   const processedData = data
      .filter(item => item[fieldName] && item[fieldName].trim())
      .map(({ ID, ...rest }) => rest[fieldName])
      .filter(value => {
         const isUnique = !uniqueValues.has(value);
         if (isUnique) uniqueValues.add(value);
         return isUnique;
      })
      .sort();

   // Convert back to array of objects with fieldName
   return processedData.map(value => ({ [fieldName]: value }));
}

async function processFiles() {
   try {
      const files = ['tblInvElectrex.json', 'tblMarca.json', 'tblMigElectrex.json'];
      const fieldNames = ['InvElectrex', 'Marca', 'MigElectrex']; // Assuming field names based on file names

      for (let i = 0; i < files.length; i++) {
         const filePath = path.join(oldFolderPath, files[i]);
         const data = await readJsonFile(filePath);
         const processedData = processAndRefactorData(data, fieldNames[i]);
         await writeJsonFile(path.join(newFolderPath, files[i]), processedData);
      }

      console.log('All specified JSON files have been processed and saved to the new directory.');
   } catch {
      console.error('Error processing JSON files:', error);
   }
}

processFiles();
