const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');
const oldFilePath = path.join(oldFolderPath, 'tblModelosElectrex.json');
const newFilePath = path.join(newFolderPath, 'tblModelosElectrex.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   const oldModelosElectrexList = JSON.parse(data);
   const newModelosElectrexList = transformModelosElectrex(oldModelosElectrexList);

   writeJsonFile(newFilePath, newModelosElectrexList);
});

function transformModelosElectrex(oldModelosElectrexList) {
   const ModeloElectrexEntries = Object.entries(oldModelosElectrexList[0]);
   let id = 0;

   return ModeloElectrexEntries.map(([key, value]) => ({
      ID: id++,
      ModeloElectrex: value
   }));
}

function writeJsonFile(filePath, data) {
   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing to file`, err);
   });
}
