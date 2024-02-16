const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath); }

const oldFilePath = path.join(oldFolderPath, 'tblRepairList.json');

fs.readFile(oldFilePath, 'utf8', (err, data) => {
   if (err) {
      console.error("Error reading the file", err);
      return;
   }
   const repairList = JSON.parse(data);

   const avarias = new Map();
   const extras = new Map();
   const clientes = new Map();
   const maquinas = new Map();
   const tipos = new Map();
   const modelosElectrex = new Map();

   repairList.forEach(item => { transformItem(item, avarias, extras, clientes, maquinas, tipos, modelosElectrex, true); });

   const avariasMapping = createSortedJson('tblAvarias.json', avarias);
   const extrasMapping = createSortedJson('tblExtras.json', extras);
   const clientesMapping = createSortedJson('tblClientes.json', clientes);
   const maquinasMapping = createSortedJson('tblMaquinas.json', maquinas);
   const tiposMapping = createSortedJson('tblTipos.json', tipos);
   const modelosElectrexMapping = createSortedJson('tblModelosElectrex.json', modelosElectrex);

   repairList.forEach(item => {
      updateItemWithReferences(item, avariasMapping, extrasMapping, clientesMapping, maquinasMapping, tiposMapping, modelosElectrexMapping);
      removeOldAvariaExtraFields(item);
   });

   writeJsonFile('tblRepairList.json', repairList);
});

function transformItem(item, avarias, extras, clientes, maquinas, tipos, modelosElectrex) {
   //item._id = item._id.$oid;
   item.DataTime = item.DataTime.$date;
   item.Actualizada = item.Actualizada === "Sim";
   item.Acessorios = item.Acessorios === "não" || item.Acessorios === null ? "nenhum" : item.Acessorios;

   collectDynamicValues(item, 'Avaria', avarias);
   collectDynamicValues(item, 'Extra', extras);
   collectSingleValue(item, 'Cliente', clientes);
   collectSingleValue(item, 'Maquina', maquinas);
   collectSingleValue(item, 'Tipo', tipos);
   collectSingleValue(item, 'ModeloElectrex', modelosElectrex);
}

function collectDynamicValues(item, fieldName, map) {
   Object.keys(item).forEach(key => {
      if (key.startsWith(fieldName) && item[key] != null) {
         const value = item[key];
         if (!map.has(value)) { map.set(value, `${fieldName}${map.size + 1}`); }
         item[key] = map.get(value);
      }
   });
}

function collectSingleValue(item, fieldName, map) {
   if (item[fieldName] != null) {
      const value = item[fieldName];
      if (!map.has(value)) { map.set(value, `${fieldName}${map.size + 1}`); }
      item[fieldName] = map.get(value);
   }
}

function quickSort(arr) {
   if (arr.length < 2) return arr;
   let pivot = arr[Math.floor(Math.random() * arr.length)];
   let left = [];
   let right = [];
   let equal = [];

   for (let element of arr) {
      if (element < pivot) left.push(element);
      else if (element > pivot) right.push(element);
      else equal.push(element);
   }

   return [...quickSort(left), ...equal, ...quickSort(right)];
}

function createSortedJson(fileName, map) {
   const sortedValues = quickSort(Array.from(map.keys()));
   let orderedObject = {};
   let valueToKeyMap = new Map();

   sortedValues.forEach((value, index) => {
      const key = `${fileName.replace('tbl', '').replace('.json', '')}${index + 1}`;
      orderedObject[key] = value;
      valueToKeyMap.set(value, key);
   });

   writeJsonFile(fileName, [orderedObject]);
   return valueToKeyMap;
}

function updateItemWithReferences(item, avariasMapping, extrasMapping, clientesMapping, maquinasMapping, tiposMapping, modelosElectrexMapping) {
   item.Avarias = collectReferences(item, 'Avaria', avariasMapping);
   item.Extras = collectReferences(item, 'Extra', extrasMapping);
   if (item.Cliente && clientesMapping.has(item.Cliente)) {
      item.Cliente = clientesMapping.get(item.Cliente);
   }
   if (item.Maquina && maquinasMapping.has(item.Maquina)) {
      item.Maquina = maquinasMapping.get(item.Maquina);
   }
   if (item.Tipo && tiposMapping.has(item.Tipo)) {
      item.Tipo = tiposMapping.get(item.Tipo);
   }
   if (item.ModeloElectrex && modelosElectrexMapping.has(item.ModeloElectrex)) {
      item.ModeloElectrex = modelosElectrexMapping.get(item.ModeloElectrex);
   }
}

function collectReferences(item, fieldName) {
   let references = [];
   Object.keys(item).forEach(key => {
      if (key.startsWith(fieldName) && item[key] != null) { references.push(item[key]); }
   });
   return references.length > 0 ? references : null;
}

function writeJsonFile(fileName, data) {
   const newFilePath = path.join(newFolderPath, fileName);
   fs.writeFile(newFilePath, JSON.stringify(data, null, 2), err => {
      if (err) console.error(`Error writing ${fileName}`, err);
   });
}

function removeOldAvariaExtraFields(item) {
   for (let i = 1; i <= 30; i++) {
      delete item[`Avaria${i}`];
      delete item[`Extra${i}`];
   }
}