import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear objeto de servicio (mismo que en install)
const svc = new Service({
  name: 'Apertura Server',
  description: 'Apertura - Página de inicio personalizable con servidor local',
  script: path.join(__dirname, 'index.js')
});

// Desinstalar el servicio
svc.on('uninstall', function(){
  console.log('✅ Servicio Apertura desinstalado correctamente');
  console.log('🛑 El servicio ya no se ejecutará al inicio de Windows');
});

svc.on('error', function(err){
  console.error('❌ Error desinstalando el servicio:', err);
});

console.log('🗑️  Desinstalando servicio Apertura...');
svc.uninstall();