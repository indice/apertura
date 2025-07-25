import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verificando estado del servicio AperturaServer...\n');

// Verificar si el servicio existe usando sc query
async function checkServiceExists() {
  try {
    const { stdout } = await execAsync('sc query AperturaServer');
    console.log('✅ Servicio encontrado con sc query:');
    console.log(stdout);
    return true;
  } catch (error) {
    console.log('❌ Servicio no encontrado con sc query');
    console.log('Error:', error.message);
    return false;
  }
}

// Verificar usando node-windows
function checkWithNodeWindows() {
  return new Promise((resolve) => {
    const svc = new Service({
      name: 'AperturaServer',
      description: 'Apertura - Página de inicio personalizable con servidor local',
      script: path.join(__dirname, 'index.js')
    });

    console.log('\n📋 Configuración del servicio:');
    console.log('- Nombre:', svc.name);
    console.log('- Script:', svc.script);
    console.log('- Descripción:', svc.description);

    // Intentar obtener información del servicio
    svc.on('error', (err) => {
      console.log('\n❌ Error con node-windows:', err.message);
      resolve(false);
    });

    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
}

// Función principal
async function main() {
  console.log('1️⃣ Verificando con Windows Service Control Manager...');
  const existsInSCM = await checkServiceExists();

  console.log('\n2️⃣ Verificando con node-windows...');
  await checkWithNodeWindows();

  console.log('\n3️⃣ Verificando procesos de Node.js...');
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
    const processes = stdout.split('\n').filter(line => line.includes('node.exe'));
    
    if (processes.length > 0) {
      console.log('✅ Procesos Node.js encontrados:');
      processes.forEach(process => console.log(process));
    } else {
      console.log('❌ No hay procesos Node.js ejecutándose');
    }
  } catch (error) {
    console.log('❌ Error verificando procesos:', error.message);
  }

  console.log('\n4️⃣ Verificando puerto 5000...');
  try {
    const { stdout } = await execAsync('netstat -an | findstr :5000');
    if (stdout.trim()) {
      console.log('✅ Puerto 5000 en uso:');
      console.log(stdout);
    } else {
      console.log('❌ Puerto 5000 no está en uso');
    }
  } catch (error) {
    console.log('❌ Puerto 5000 no está en uso');
  }

  console.log('\n📝 Resumen:');
  console.log('- Servicio en SCM:', existsInSCM ? '✅' : '❌');
  console.log('- Script existe:', path.join(__dirname, 'index.js'));
  
  if (!existsInSCM) {
    console.log('\n💡 Recomendaciones:');
    console.log('1. Ejecutar install-service.js como administrador');
    console.log('2. Verificar que node-windows esté instalado correctamente');
    console.log('3. Comprobar permisos de usuario para crear servicios');
  }
}

main().catch(console.error);