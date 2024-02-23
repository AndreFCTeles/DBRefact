const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new', 'avarias');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath, { recursive: true }); }

// Helper function to read JSON file
async function readJsonFile(filePath) {
   try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error(`Error reading file at ${filePath}:`, error);
      throw error; // Rethrow to handle it in the calling function
   }
}

// Refactor tblDefectList.json and remove specified fields
function refactorDefectList(data) {
   return data.map(({ ID, NumAvaria, ...rest }) => rest);
}

function combineUniqueDefects(avariasData, defectListData) {
   const allDefects = new Set();

   // Add defects from avariasData
   avariasData.forEach(item => {
      if (item.Avaria && item.Avaria.trim() !== "") {
         allDefects.add(item.Avaria);
      }
   });

   // Add defects from defectListData
   defectListData.forEach(item => {
      Object.values(item).forEach(value => {
         if (value && value.trim() !== "") {
            allDefects.add(value);
         }
      });
   });

   return Array.from(allDefects).sort();
}

function extractCategorizedDefects(defectListData) {
   const categories = {};

   defectListData.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
         if (!categories[key]) {
            categories[key] = new Set();
         }
         if (value.trim() !== "") {
            categories[key].add(value);
         }
      });
   });

   // Convert sets to arrays and sort
   Object.keys(categories).forEach(key => {
      categories[key] = Array.from(categories[key]).sort();
   });

   return categories;
}

async function writeCategorizedDefects(categorizedDefects) {
   for (const [category, defects] of Object.entries(categorizedDefects)) {
      await writeJsonFile(path.join(newFolderPath, `tbl${category}.json`), defects.map(defect => ({ [category]: defect })));
   }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
   try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
   } catch (error) {
      console.error(`Error writing file at ${filePath}:`, error);
      throw error; // Rethrow to handle it in the calling function
   }
}

// Main function to process the files and merge data
async function processAvarias() {
   try {
      const tblAvariasPath = path.join(oldFolderPath, 'tblAvarias.json');
      const tblDefectListPath = path.join(oldFolderPath, 'tblDefectList.json');

      // Read the existing data
      let avariasData = await readJsonFile(tblAvariasPath);
      let defectListData = await readJsonFile(tblDefectListPath);

      defectListData = refactorDefectList(defectListData);
      const uniqueDefects = combineUniqueDefects(avariasData, defectListData);

      // Write the merged data to a new tblAvarias.json in the new/ directory
      await writeJsonFile(
         path.join(newFolderPath, 'tblAvarias.json'), uniqueDefects.map(defect => ({ Avaria: defect }))
      );

      const categorizedDefects = extractCategorizedDefects(defectListData);
      await writeCategorizedDefects(categorizedDefects);

      console.log('Avarias processing completed successfully.');
   } catch (error) {
      console.error('Error processing Avarias:', error);
   }
}

processAvarias();