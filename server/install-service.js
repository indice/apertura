import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar que index.js existe
const scriptPath = path.join(__dirname, 'index.js');
if (!fs.existsSync(scriptPath)) {
  console.error('❌ No se encontró index.js en:', scriptPath);
  process.exit(1);
}

// Verificar permisos de administrador
function isAdmin() {
  return process.platform === 'win32' && process.getuid && process.getuid() === 0;
}

console.log('📦 Instalando servicio Apertura...');
console.log('📁 Script del servicio:', scriptPath);

// Crear objeto de servicio
const svc = new Service({
  name: 'AperturaServer',
  description: 'Apertura - Página de inicio personalizable con servidor local',
  script: scriptPath,
  nodeOptions: [
    '--experimental-modules'
  ],
  env: [{
    name: "NODE_ENV",
    value: "production"
  }, {
    name: "PORT", 
    value: "5000"
  }],
  workingDirectory: __dirname,
  allowServiceLogon: true
});

// Event listeners
svc.on('install', function(){
  console.log('✅ Servicio AperturaServer instalado correctamente');
  console.log('🚀 Iniciando servicio...');
  
  setTimeout(() => {
    svc.start();
  }, 1000);
});

svc.on('alreadyinstalled', function(){
  console.log('⚠️  El servicio ya está instalado');
  console.log('💡 Usa uninstall-service.js para desinstalarlo primero');
});

svc.on('start', function(){
  console.log('✅ Servicio AperturaServer iniciado exitosamente');
  console.log('🌐 Accede a: http://localhost:5000');
  console.log('');
  console.log('ℹ️  El servicio se iniciará automáticamente con Windows');
  
  // Verificar que el servicio está ejecutándose
  setTimeout(() => {
    console.log('🔍 Verificando estado del servicio...');
    // El servicio debería estar ejecutándose ahora
  }, 3000);
});

svc.on('stop', function(){
  console.log('🛑 Servicio AperturaServer detenido');
});

svc.on('error', function(err){
  console.error('❌ Error en el servicio:', err.message);
  
  if (err.message.includes('Access is denied')) {
    console.error('💡 Ejecuta este script como administrador');
    console.error('   Haz clic derecho en el símbolo del sistema y selecciona "Ejecutar como administrador"');
  }
  
  if (err.message.includes('already exists')) {
    console.error('💡 El servicio ya existe. Desinstálalo primero con:');
    console.error('   node uninstall-service.js');
  }
});

svc.on('invalidinstallation', function(){
  console.error('❌ Instalación del servicio inválida');
});

// Instalar el servicio
try {
  svc.install();
} catch (error) {
  console.error('❌ Error instalando servicio:', error.message);
  process.exit(1);
}