const Service = require('node-windows').Service;
const path = require('path');

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