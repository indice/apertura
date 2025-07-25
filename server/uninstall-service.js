import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🗑️  Desinstalando servicio AperturaServer...');

// Crear objeto de servicio (mismo nombre que en install)
const svc = new Service({
  name: 'AperturaServer',
  description: 'Apertura - Página de inicio personalizable con servidor local',
  script: path.join(__dirname, 'index.js')
});

// Event listeners
svc.on('uninstall', function(){
  console.log('✅ Servicio AperturaServer desinstalado correctamente');
  console.log('🛑 El servicio ya no se ejecutará al inicio de Windows');
});

svc.on('doesnotexist', function(){
  console.log('⚠️  El servicio AperturaServer no existe o ya fue desinstalado');
});

svc.on('error', function(err){
  console.error('❌ Error desinstalando el servicio:', err.message);
  
  if (err.message.includes('Access is denied')) {
    console.error('💡 Ejecuta este script como administrador');
    console.error('   Haz clic derecho en el símbolo del sistema y selecciona "Ejecutar como administrador"');
  }
});

// Desinstalar el servicio
try {
  svc.uninstall();
} catch (error) {
  console.error('❌ Error desinstalando servicio:', error.message);
  process.exit(1);
}