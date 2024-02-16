const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');
const oldFilePath = path.join(oldFolderPath, 'tblClientes.json');
const newFilePath = path.join(newFolderPath, 'tblClientes.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   const oldClientList = JSON.parse(data);
   const newClientList = transformClients(oldClientList);

   writeJsonFile(newFilePath, newClientList);
});

function transformClients(oldClientList) {
   const clientEntries = Object.entries(oldClientList[0]);
   return clientEntries.map(([key, value], index) => ({
      ID: index,
      Nome: value,
      Empresa: null,
      País: null,
      Morada: null,
      Contactos: [{
         Nome: null,
         Tel: null,
         Obs: null,
         Email: null
      }]
   }));
}

function writeJsonFile(filePath, data) {
   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing to file`, err);
   });
}
