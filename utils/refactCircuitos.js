const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath); }

async function readJsonFile(filePath) {
   const data = await fs.promises.readFile(filePath, 'utf8');
   return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
   await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

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

// Main processing function
async function processCircuitoFiles() {
   try {
      let circuitoListData = await readJsonFile(path.join(oldFolderPath, 'tblCircuitoList.json'));
      let ciData = await readJsonFile(path.join(oldFolderPath, 'tblCI.json'));

      // Remove "ID" fields and rename "Data" to "DataTime"
      circuitoListData = circuitoListData.map(({ ID, Data, ...rest }) => ({
         ...rest,
         DataTime: toISODateString(Data) || Data // Keep original if conversion fails
      }));

      // Remove "ID" from ciData and deduplicate
      ciData = ciData
         .filter(({ Circuito }) => Circuito && Circuito.trim())
         .map(({ ID, ...rest }) => rest);
      const ciSet = new Set(ciData.map(item => item.Circuito));
      ciData = Array.from(ciSet).map(Circuito => ({ Circuito }));

      // Add missing Circuito values from circuitoListData to ciData
      circuitoListData.forEach(item => {
         if (!ciSet.has(item.Circuito)) {
            ciData.push({ Circuito: item.Circuito });
            ciSet.add(item.Circuito);
         }
      });

      // Sort ciData by Circuito
      ciData.sort((a, b) => a.Circuito.localeCompare(b.Circuito));
      // Sort circuitoListData by DataTime in descending order
      circuitoListData.sort((a, b) => new Date(b.DataTime) - new Date(a.DataTime));

      // Write the refactored files
      await writeJsonFile(path.join(newFolderPath, 'tblCircuitoList.json'), circuitoListData);
      await writeJsonFile(path.join(newFolderPath, 'tblCI.json'), ciData);

      console.log('Circuito files processed successfully.');
   } catch (error) {
      console.error('Error processing Circuito files:', error);
   }
}

processCircuitoFiles();