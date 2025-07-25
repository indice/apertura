const Service = require('node-windows').Service;
const path = require('path');

// Crear objeto de servicio
const svc = new Service({
  name: 'Apertura Server',
  description: 'Apertura - Página de inicio personalizable con servidor local',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

// Instalar el servicio
svc.on('install', function(){
  console.log('✅ Servicio Apertura instalado correctamente');
  console.log('🚀 Iniciando servicio...');
  svc.start();
});

svc.on('start', function(){
  console.log('✅ Servicio Apertura iniciado');
  console.log('🌐 Accede a: http://localhost:5000');
});

svc.on('error', function(err){
  console.error('❌ Error en el servicio:', err);
});

console.log('📦 Instalando servicio Apertura...');
svc.install();