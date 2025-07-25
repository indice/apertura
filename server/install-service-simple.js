import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Instalando servicio usando sc.exe (Windows Service Control)...');

const serviceName = 'AperturaServer';
const serviceDisplayName = 'Apertura Server';
const serviceDescription = 'Apertura - Página de inicio personalizable con servidor local';
const nodePath = process.execPath; // Ruta a node.exe
const scriptPath = path.join(__dirname, 'index.js');

console.log('📋 Configuración:');
console.log('- Servicio:', serviceName);
console.log('- Node.exe:', nodePath);
console.log('- Script:', scriptPath);

// Comando para crear el servicio
const createCommand = `sc create "${serviceName}" binPath= "\\"${nodePath}\\" \\"${scriptPath}\\"" DisplayName= "${serviceDisplayName}" start= auto`;

console.log('\n📦 Creando servicio...');
console.log('Comando:', createCommand);

const createProcess = spawn('cmd', ['/c', createCommand], {
  stdio: 'inherit',
  shell: true
});

createProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Servicio creado exitosamente');
    
    // Configurar descripción
    const descCommand = `sc description "${serviceName}" "${serviceDescription}"`;
    console.log('\n📝 Configurando descripción...');
    
    const descProcess = spawn('cmd', ['/c', descCommand], {
      stdio: 'inherit',
      shell: true
    });
    
    descProcess.on('close', (descCode) => {
      if (descCode === 0) {
        console.log('✅ Descripción configurada');
      }
      
      // Iniciar el servicio
      console.log('\n🚀 Iniciando servicio...');
      const startCommand = `sc start "${serviceName}"`;
      
      const startProcess = spawn('cmd', ['/c', startCommand], {
        stdio: 'inherit',
        shell: true
      });
      
      startProcess.on('close', (startCode) => {
        console.log('\n📊 Estado final:');
        if (startCode === 0) {
          console.log('✅ Servicio iniciado correctamente');
        } else {
          console.log('⚠️  El servicio fue creado pero no se pudo iniciar');
          console.log('   Puedes iniciarlo manualmente con: sc start ' + serviceName);
        }
        
        // Mostrar estado del servicio
        console.log('\n🔍 Verificando estado...');
        const queryCommand = `sc query "${serviceName}"`;
        
        const queryProcess = spawn('cmd', ['/c', queryCommand], {
          stdio: 'inherit',
          shell: true
        });
        
        queryProcess.on('close', () => {
          console.log('\n✅ Instalación completada');
          console.log('🌐 Accede a: http://localhost:5000');
          console.log('\n📋 Comandos útiles:');
          console.log(`- Ver estado: sc query "${serviceName}"`);
          console.log(`- Iniciar: sc start "${serviceName}"`);
          console.log(`- Detener: sc stop "${serviceName}"`);
          console.log(`- Desinstalar: sc delete "${serviceName}"`);
        });
      });
    });
    
  } else {
    console.error('\n❌ Error creando el servicio (código:', code, ')');
    console.error('\n💡 Asegúrate de:');
    console.error('1. Ejecutar como administrador');
    console.error('2. No tener el servicio ya instalado');
    console.error('3. Usar el nombre correcto del servicio');
  }
});