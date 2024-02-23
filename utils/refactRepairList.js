const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

// Ensure the new directory exists
if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath, { recursive: true }); }

// Helper function to read JSON file
async function readJsonFile(filePath) {
   const data = await fs.promises.readFile(filePath, 'utf8');
   return JSON.parse(data);
}

// Convert date strings to a consistent ISO format, handling various formats
function toISODateString(dateStr) {
   // Directly replace '-' or '/' with '-' for the date, ensuring consistency
   let datePart = dateStr.substring(0, 10).replace(/\/|\-/g, '-');
   // Rearrange the date parts to match ISO format (YYYY-MM-DD)
   let parts = datePart.split('-');
   let isoDate = `${parts[2]}-${parts[1]}-${parts[0]}` + dateStr.substring(10);

   // Validate the conversion result to ensure it represents a valid date
   if (!isNaN(new Date(isoDate).getTime())) {
      return isoDate;
   } else {
      console.log(`Invalid Date Format: ${dateStr}`);
      return null;
   }
}

// Refactor JSON structure, handling invalid dates
function refactorJsonData(data) {
   return data.map(item => {
      // Extract and prepare avarias and extras
      const avarias = [], extras = [];
      for (let i = 1; i <= 30; i++) if (item[`Avaria${i}`]) avarias.push(item[`Avaria${i}`]);
      for (let i = 1; i <= 3; i++) if (item[`Extra${i}`]) extras.push(item[`Extra${i}`]);

      // Convert the date, logging any issues without excluding the item
      const dateTimeISO = toISODateString(item.DataTime);

      return {
         Maquina: item.Maquina,
         NumMaquina: item.NumMaquina,
         Marca: item.Marca,
         OrdemReparacao: parseInt(item.OrdemReparacao, 10),
         Actualizada: item.Actualizada || null,
         Observacoes: item.Observacoes,
         DataTime: dateTimeISO ? new Date(dateTimeISO).toISOString() : undefined, // Use undefined to exclude invalid dates
         Acessorios: item.Acessorios || null,
         Tipo: item.Tipo || null,
         ModeloElectrex: item.ModeloElectrex || null,
         IntExt: item.IntExt || null,
         Utilizador: item.Utilizador || null,
         Cliente: item.Cliente || null,
         Avarias: avarias.length ? avarias : null,
         Extras: extras.length ? extras : null,
      };
   }).filter(item => item !== null); // This keeps all items, including those with date issues
}

// Use JavaScript's built-in sort to avoid stack overflow
function sortData(data, key, sortOrder = 'asc') {
   return data.sort((a, b) => {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
   });
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
   await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Normalize and hash a value for comparison
function normalizeAndHash(value) {
   const normalized = value.toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "");
   return crypto.createHash('md5').update(normalized).digest('hex');
}

// Extract and process additional datasets
function extractDatasets(data) {
   const datasets = {
      Avarias: new Set(),
      Extras: new Set(),
      Clientes: new Set(),
      Maquinas: new Set(),
      Tipos: new Set(),
      ModelosElectrex: new Set()
   };

   data.forEach(item => {
      if (item.Avarias) item.Avarias.forEach(avaria => datasets.Avarias.add(avaria));
      if (item.Extras) item.Extras.forEach(extra => datasets.Extras.add(extra));
      if (item.Cliente) datasets.Clientes.add(item.Cliente);
      if (item.Maquina) datasets.Maquinas.add(item.Maquina);
      if (item.Tipo) datasets.Tipos.add(item.Tipo);
      if (item.ModeloElectrex) datasets.ModelosElectrex.add(item.ModeloElectrex);
   });

   // Convert sets to arrays, sort them, and map to the desired structure
   Object.keys(datasets).forEach(key => {
      // For most datasets, remove the last character to match the singular form
      let fieldName;
      if (key === 'ModelosElectrex') { fieldName = 'ModeloElectrex'; } // Keep the original field name for ModeloElectrex
      else { fieldName = key.slice(0, -1); } // Remove the last character for others

      const uniqueItems = removeDuplicates(Array.from(datasets[key]), fieldName);
      datasets[key] = uniqueItems.sort().map(value => ({ [fieldName]: value }));
   });

   return datasets;
}

// Remove duplicates from datasets
function removeDuplicates(items, fieldName) {
   const hashSet = new Set();
   const uniqueItems = [];
   const duplicatesLog = [];

   items.forEach(value => {
      const hash = normalizeAndHash(value);
      if (!hashSet.has(hash)) {
         hashSet.add(hash);
         uniqueItems.push(value);
      } else {
         duplicatesLog.push(value); // Log the duplicate for review
      }
   });

   // Optionally, log duplicates to a file or console
   console.log(`Duplicates in ${fieldName}:`, duplicatesLog);
   // fs.writeFileSync('duplicatesLog.json', JSON.stringify(duplicatesLog, null, 2));

   return uniqueItems;
}

// Main function to process the JSON file
async function processJsonFile() {
   try {
      const oldFilePath = path.join(oldFolderPath, 'tblRepairList.json');
      const data = await readJsonFile(oldFilePath);
      const refactoredData = refactorJsonData(data);

      // Sorting the main data by DataTime
      const sortedData = sortData(refactoredData, 'DataTime', 'desc');
      await writeJsonFile(path.join(newFolderPath, 'tblRepairList.json'), sortedData);

      // Extracting and processing additional datasets
      const datasets = extractDatasets(sortedData);
      for (const [key, value] of Object.entries(datasets)) {
         // await writeJsonFile(path.join(newFolderPath, `tbl${key}.json`), value);
         const sortedDataset = sortData(value, 'fieldName'); // Assuming 'fieldName' is the key for sorting, adjust as necessary
         await writeJsonFile(path.join(oldFolderPath, `tbl${key}.json`), sortedDataset);
      }

      console.log('All processing completed successfully.');
   } catch (error) {
      console.error('Error processing JSON file:', error);
   }
}

processJsonFile();
