const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvfolder = path.join(__dirname, '..', 'file', 'csv');
const oldFolder = path.join(__dirname, '..', 'file', 'old');

fs.readdir(csvfolder, (err, files) => {
   if (err) {
      console.error('Error reading the csv folder:', err);
      return;
   }

   files.forEach(file => {
      if (path.extname(file) === '.csv') {
         const results = [];
         fs.createReadStream(path.join(csvfolder, file))
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => {
               // Convert ISO date strings to Date objects
               /*
               for (const key in data) {
                  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(data[key])) {
                     data[key] = new Date(data[key]);
                  }
               }
               */
               const transformedData = transformForMongoDB(data);
               results.push(transformedData);
            })
            .on('end', () => {
               fs.writeFile(path.join(oldFolder, file.replace('.csv', '.json')), JSON.stringify(results, null, 2), (err) => {
                  if (err) { console.error('Error writing JSON to file:', err); }
                  else { console.log(`Successfully converted ${file} to JSON.`); }
               });
            });
      }
   });
});

function transformForMongoDB(data) {
   const transformed = {};
   Object.keys(data).forEach(key => {
      let value = data[key];
      transformed[key.trim()] = value; // Trim keys to remove any leading/trailing whitespace
   });
   return transformed;
}