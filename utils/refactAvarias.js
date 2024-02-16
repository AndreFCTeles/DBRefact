const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');
const oldFilePath = path.join(oldFolderPath, 'tblAvarias.json');
const newFilePath = path.join(newFolderPath, 'tblAvarias.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }

   const oldAvariasList = JSON.parse(data);
   const newAvariasList = transformAvarias(oldAvariasList);

   writeJsonFile(newFilePath, newAvariasList);
});

function transformAvarias(oldAvariasList) {
   const avariaEntries = Object.entries(oldAvariasList[0]);
   return avariaEntries.map(([key, value]) => {
      if (key.startsWith('Avarias')) {
         return { Avaria: value };
      }
   }).filter(Boolean); // Filter out any undefined entries (in case there are keys that don't start with 'Avarias')
}

function writeJsonFile(filePath, data) {
   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing to file`, err);
   });
}
