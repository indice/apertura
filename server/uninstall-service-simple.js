import { spawn } from 'child_process';

console.log('🗑️  Desinstalando servicio AperturaServer...');

const serviceName = 'AperturaServer';

// Primero detener el servicio si está ejecutándose
console.log('🛑 Deteniendo servicio...');
const stopCommand = `sc stop "${serviceName}"`;

const stopProcess = spawn('cmd', ['/c', stopCommand], {
  stdio: 'inherit',
  shell: true
});

stopProcess.on('close', (stopCode) => {
  if (stopCode === 0) {
    console.log('✅ Servicio detenido');
  } else {
    console.log('⚠️  El servicio ya estaba detenido o no existe');
  }
  
  // Eliminar el servicio
  console.log('\n🗑️  Eliminando servicio...');
  const deleteCommand = `sc delete "${serviceName}"`;
  
  const deleteProcess = spawn('cmd', ['/c', deleteCommand], {
    stdio: 'inherit',
    shell: true
  });
  
  deleteProcess.on('close', (deleteCode) => {
    if (deleteCode === 0) {
      console.log('\n✅ Servicio AperturaServer desinstalado correctamente');
      console.log('🛑 El servicio ya no se ejecutará al inicio de Windows');
    } else {
      console.error('\n❌ Error eliminando el servicio');
      console.error('💡 Posibles causas:');
      console.error('1. El servicio no existe');
      console.error('2. Permisos insuficientes (ejecutar como administrador)');
      console.error('3. El servicio está en uso');
    }
    
    // Verificar que se eliminó
    console.log('\n🔍 Verificando eliminación...');
    const queryCommand = `sc query "${serviceName}"`;
    
    const queryProcess = spawn('cmd', ['/c', queryCommand], {
      stdio: 'pipe'
    });
    
    queryProcess.on('close', (queryCode) => {
      if (queryCode !== 0) {
        console.log('✅ Confirmado: El servicio fue eliminado correctamente');
      } else {
        console.log('⚠️  El servicio aún existe en el sistema');
      }
    });
  });
});