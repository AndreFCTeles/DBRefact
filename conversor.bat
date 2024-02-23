@echo off
echo Starting CSV to JSON conversion...
call node utils\csv-json.js
echo Conversion complete.

echo Starting JSON refactoring...
call node utils\refactRepairList.js > logs\outputRL.txt 2>&1
call node utils\refactAvarias.js > logs\outputAva.txt 2>&1
del /F "file\new\avarias\tblAvaria.json"
call node utils\refactClientes.js > logs\outputCli.txt 2>&1
call node utils\refactCircuitos.js > logs\outputCir.txt 2>&1
call node utils\refactRest.js > logs\outputRest.txt 2>&1
echo Refactoring complete.

echo Moving processed files from old to new...
copy "file\old\tblMaquinas.json" "file\new\"
copy "file\old\tblModelosElectrex.json" "file\new\"
copy "file\old\tblTipos.json" "file\new\"
copy "file\old\tblExtras.json" "file\new\"

echo All processes complete.
pause