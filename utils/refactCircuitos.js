const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath); }

const oldFilePath = path.join(oldFolderPath, 'tblCircuitoList.json');
const newFilePath = path.join(newFolderPath, 'tblCircuitoList.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   let circuitos = JSON.parse(data);
   circuitos.forEach(transformCircuitoItem);
   circuitos = quickSort(circuitos);

   writeJsonFile(newFilePath, circuitos);
});

function transformCircuitoItem(item) {
   item._id = item._id.$oid;
   if (item.Numero.$numberLong) { item.Numero = parseInt(item.Numero.$numberLong, 10); }
   item.DataTime = item.Data.$date;
   item.Origem = item.Orig;
   item.Observacoes = item.Obs;
   item.Estado = item.Reparacao;
   delete item.ID;
   delete item.Data;
   delete item.Orig;
   delete item.Obs;
   delete item.Reparacao;
}

function quickSort(arr) {
   if (arr.length < 2) return arr;
   let pivot = arr[Math.floor(Math.random() * arr.length)];
   let left = [];
   let right = [];
   let equal = [];

   for (let element of arr) {
      if (element.DataTime < pivot.DataTime) left.push(element);
      else if (element.DataTime > pivot.DataTime) right.push(element);
      else equal.push(element);
   }
   return [...quickSort(left), ...equal, ...quickSort(right)];
}

function writeJsonFile(fileName, data) {
   fs.writeFile(newFilePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing ${fileName}`, err);
   });
}
