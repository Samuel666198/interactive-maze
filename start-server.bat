@echo off
setlocal
cd /d "%~dp0"
set "PORT=8018"
set "URL=http://localhost:%PORT%/"

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$root = '%~dp0';" ^
  "$port = %PORT%;" ^
  "$py = (Get-Command py -ErrorAction SilentlyContinue);" ^
  "if ($py) { Start-Process -FilePath $py.Source -ArgumentList @('-3','-m','http.server',$port.ToString(),'--directory',$root) -WindowStyle Hidden }" ^
  "else { Start-Process -FilePath 'python' -ArgumentList @('-m','http.server',$port.ToString(),'--directory',$root) -WindowStyle Hidden }"

timeout /t 1 /nobreak >nul
start "" "%URL%"
exit /b
