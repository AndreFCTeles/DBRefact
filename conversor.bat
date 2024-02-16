@echo off
echo Starting CSV to JSON conversion...
call node utils\csv-json.js

echo Starting JSON refactoring...
call node utils\refactRepairList.js
call node utils\refactAvarias.js
call node utils\refactMaquinas.js
call node utils\refactCircuitos.js
call node utils\refactCI.js
call node utils\refactClientes.js
call node utils\refactME.js
call node utils\refactTipos.js
REM Add additional calls to other refactorer scripts as needed

echo All processes complete.
