@echo off
title Apertura - Instalador Simple de Servicio
echo.
echo ================================================
echo    APERTURA - INSTALADOR SIMPLE DE SERVICIO
echo ================================================
echo.
echo Este script usa el comando 'sc' de Windows directamente
echo para crear el servicio, evitando dependencias de node-windows.
echo.
echo ⚠️  IMPORTANTE: DEBE ejecutarse como administrador
echo.
pause

echo.
echo 1. Verificando permisos de administrador...
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ Este script requiere permisos de administrador
    echo    Haz clic derecho y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)
echo ✅ Ejecutándose como administrador

echo.
echo 2. Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 3. Navegando al directorio del servidor...
cd server
if not exist "index.js" (
    echo ❌ No se encontró index.js en el directorio server
    pause
    exit /b 1
)
echo ✅ Archivos del servidor encontrados

echo.
echo 4. Desinstalando servicio anterior (si existe)...
sc delete "AperturaServer" >nul 2>&1
echo ✅ Limpieza completada

echo.
echo 5. Instalando servicio usando método simple...
node install-service-simple.js

echo.
echo ================================================
echo    INSTALACIÓN COMPLETADA
echo ================================================
echo.
echo 📋 Para verificar el servicio:
echo    - services.msc (buscar AperturaServer)
echo    - sc query AperturaServer
echo    - node check-service.js
echo.
echo 🌐 Accede a: http://localhost:5000
echo.
pause