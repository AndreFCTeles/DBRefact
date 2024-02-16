const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');
const oldFilePath = path.join(oldFolderPath, 'tblTipos.json');
const newFilePath = path.join(newFolderPath, 'tblTipos.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }

   const oldTiposList = JSON.parse(data);
   const newTiposList = transformTipos(oldTiposList);

   writeJsonFile(newFilePath, newTiposList);
});

function transformTipos(oldTiposList) {
   const TipoEntries = Object.entries(oldTiposList[0]);
   let id = 0;

   return TipoEntries.map(([key, value]) => ({
      ID: id++,
      Tipo: value
   }));
}

function writeJsonFile(filePath, data) {
   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing to file`, err);
   });
}
