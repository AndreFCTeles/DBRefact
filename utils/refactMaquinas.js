const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');
const oldFilePath = path.join(oldFolderPath, 'tblMaquinas.json');
const newFilePath = path.join(newFolderPath, 'tblMaquinas.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   const oldMaquinasList = JSON.parse(data);
   const newMaquinasList = transformMaquinas(oldMaquinasList);

   writeJsonFile(newFilePath, newMaquinasList);
});

function transformMaquinas(oldMaquinasList) {
   const maquinaEntries = Object.entries(oldMaquinasList[0]);
   let uniqueMaquinas = new Set();
   let id = 0;

   maquinaEntries.forEach(([key, value]) => {
      const transformedValue = value.replace(/\s/g, '').toUpperCase(); // Remove spaces and convert to upper case
      uniqueMaquinas.add(transformedValue);// Add to set to ensure uniqueness
   });

   return Array.from(uniqueMaquinas).map(maquina => ({
      ID: id++,
      Maquina: maquina
   }));
}

function writeJsonFile(filePath, data) {
   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing to file`, err);
   });
}
