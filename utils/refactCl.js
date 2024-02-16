const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath); }

const oldFilePath = path.join(oldFolderPath, 'tblCI.json');
const newFilePath = path.join(newFolderPath, 'tblCI.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   let ciData = JSON.parse(data);
   let processedCi = processCiData(ciData);

   writeJsonFile(newFilePath, processedCi);
});

function processCiData(ciData) {
   const circuitosSet = new Set();

   ciData.forEach(item => {
      if (item.Circuito && item.Circuito !== null) {
         circuitosSet.add(item.Circuito);
      }
   });

   // Convert Set back to Array, sort alphabetically, and map to desired structure
   return Array.from(circuitosSet)
      .sort()
      .map(circuito => ({ Circuito: circuito }));
}

function writeJsonFile(fileName, data) {
   fs.writeFile(fileName, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing ${fileName}`, err);
   });
}