import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFile = path.join(__dirname, 'sabiduria-knowledge.json');

console.log('📥 Iniciando importación a la base de conocimientos...');

try {
  // Leer el archivo JSON
  const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  console.log(`📊 Total de elementos a importar: ${jsonData.length}`);

  // Función para hacer la petición HTTP
  const importBatch = async (batch, batchNumber, totalBatches) => {
    try {
      const response = await fetch('http://localhost:5000/api/knowledge/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: batch,
          skipDuplicates: true
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Lote ${batchNumber}/${totalBatches}: ${result.imported} importados, ${result.duplicates} duplicados, ${result.errors} errores`);
        return result;
      } else {
        console.error(`❌ Error en lote ${batchNumber}:`, result.error);
        return { imported: 0, duplicates: 0, errors: batch.length };
      }
    } catch (error) {
      console.error(`❌ Error de conexión en lote ${batchNumber}:`, error.message);
      return { imported: 0, duplicates: 0, errors: batch.length };
    }
  };

  // Dividir en lotes de 50 elementos para evitar timeouts
  const BATCH_SIZE = 50;
  const batches = [];

  for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
    batches.push(jsonData.slice(i, i + BATCH_SIZE));
  }

  console.log(`🔄 Procesando en ${batches.length} lotes de máximo ${BATCH_SIZE} elementos...`);

  // Procesar lotes
  let totalImported = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;

  for (let i = 0; i < batches.length; i++) {
    const result = await importBatch(batches[i], i + 1, batches.length);
    totalImported += result.imported || 0;
    totalDuplicates += result.duplicates || 0;
    totalErrors += result.errors || 0;

    // Pausa pequeña entre lotes para no sobrecargar
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Mostrar resumen final
  console.log('\n📊 === RESUMEN FINAL ===');
  console.log(`✅ Total importados: ${totalImported}`);
  console.log(`⚠️ Total duplicados: ${totalDuplicates}`);
  console.log(`❌ Total errores: ${totalErrors}`);
  console.log(`📁 Total procesados: ${totalImported + totalDuplicates + totalErrors}`);

  if (totalImported > 0) {
    console.log('\n🎉 ¡Importación completada con éxito!');
    console.log('💡 Ahora puedes acceder a la interfaz web y usar el botón "📚 Conocimientos" para ver todos tus datos.');
  }

} catch (error) {
  console.error('❌ Error leyendo archivo JSON:', error.message);
  console.log('\n💡 Asegúrate de que:');
  console.log('1. El archivo sabiduria-knowledge.json existe');
  console.log('2. El servidor está ejecutándose en http://localhost:5000');
  console.log('3. El archivo JSON tiene un formato válido');
}