const fs = require('fs');
const path = require('path');

const oldFolderPath = path.join(__dirname, '..', 'file', 'old');
const newFolderPath = path.join(__dirname, '..', 'file', 'new');

if (!fs.existsSync(newFolderPath)) { fs.mkdirSync(newFolderPath, { recursive: true }); }

// Helper function to read JSON file
async function readJsonFile(filePath) {
   try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error(`Error reading file at ${filePath}:`, error);
      throw error; // Rethrow to handle it in the calling function
   }
}

function combineUniqueClientes(clientesData, clienteData) {
   const allClientes = new Set();

   // Add client names from clientesData
   clientesData.forEach(cliente => {
      if (cliente.Cliente && cliente.Cliente.trim() !== "") {
         allClientes.add(cliente.Cliente);
      }
   });

   // Add client names from clienteData, ignoring the ID field
   clienteData.forEach(({ Cliente }) => {
      if (Cliente && Cliente.trim() !== "") {
         allClientes.add(Cliente);
      }
   });

   return Array.from(allClientes).sort().map(Cliente => ({ Cliente }));
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
   try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
   } catch (error) {
      console.error(`Error writing file at ${filePath}:`, error);
      throw error; // Rethrow to handle it in the calling function
   }
}

// Main function to process the files and merge data
async function processClientes() {
   try {
      const tblClientesPath = path.join(oldFolderPath, 'tblClientes.json');
      const tblClientePath = path.join(oldFolderPath, 'tblCliente.json');

      // Read the existing data
      let clientesData = await readJsonFile(tblClientesPath);
      let clienteData = await readJsonFile(tblClientePath);

      clienteData = clienteData.map(({ ID, ...rest }) => rest);
      const uniqueClientes = combineUniqueClientes(clientesData, clienteData);


      // Write the merged data to a new tblAvarias.json in the new/ directory
      await writeJsonFile(path.join(newFolderPath, 'tblClientes.json'), uniqueClientes);

      console.log('Clientes processing completed successfully.');
   } catch (error) {
      console.error('Error processing Clientes:', error);
   }
}

processClientes();