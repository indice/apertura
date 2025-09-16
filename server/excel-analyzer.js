import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo Excel
const excelPath = path.join(__dirname, '../public/sabiduria.xlsx');

console.log('📊 Analizando archivo Excel:', excelPath);

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(excelPath);

  console.log('\n📋 Hojas disponibles:', workbook.SheetNames);

  // Analizar cada hoja
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n🔍 === HOJA ${index + 1}: "${sheetName}" ===`);

    const worksheet = workbook.Sheets[sheetName];

    // Obtener rango de datos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log(`📏 Rango: ${XLSX.utils.encode_range(range)} (${range.e.r + 1} filas, ${range.e.c + 1} columnas)`);

    // Mostrar las primeras 5 filas para ver la estructura
    console.log('\n📄 Primeras filas (muestra):');

    for (let R = range.s.r; R <= Math.min(range.s.r + 4, range.e.r); ++R) {
      const row = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
        const cell = worksheet[cellAddress];
        const cellValue = cell ? cell.v : '';
        row.push(`[${XLSX.utils.encode_col(C)}] ${cellValue}`);
      }
      console.log(`  Fila ${R + 1}: ${row.join(' | ')}`);
    }

    // Mostrar algunas filas del medio si hay muchas
    if (range.e.r > 10) {
      console.log('  ...');
      const midStart = Math.floor(range.e.r / 2) - 1;
      for (let R = midStart; R <= midStart + 2 && R <= range.e.r; ++R) {
        const row = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
          const cell = worksheet[cellAddress];
          const cellValue = cell ? cell.v : '';
          row.push(`[${XLSX.utils.encode_col(C)}] ${cellValue}`);
        }
        console.log(`  Fila ${R + 1}: ${row.join(' | ')}`);
      }
    }

    // Mostrar las últimas filas
    if (range.e.r > 5) {
      console.log('  ...');
      for (let R = Math.max(range.e.r - 2, range.s.r + 5); R <= range.e.r; ++R) {
        const row = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
          const cell = worksheet[cellAddress];
          const cellValue = cell ? cell.v : '';
          row.push(`[${XLSX.utils.encode_col(C)}] ${cellValue}`);
        }
        console.log(`  Fila ${R + 1}: ${row.join(' | ')}`);
      }
    }

    // Intentar convertir a JSON para ver la estructura general
    console.log('\n🔄 Intentando conversión automática a JSON...');
    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      console.log(`✅ Convertido: ${jsonData.length} filas`);
      console.log('📝 Ejemplo de estructura:');
      console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
    } catch (jsonError) {
      console.log('❌ Error en conversión automática:', jsonError.message);
    }

    console.log('\n' + '='.repeat(60));
  });

} catch (error) {
  console.error('❌ Error leyendo el archivo:', error.message);
  console.log('\n💡 Sugerencias:');
  console.log('- Verifica que el archivo existe en:', excelPath);
  console.log('- Asegúrate que no esté abierto en Excel');
  console.log('- Verifica que el archivo no esté corrupto');
}

console.log('\n🎯 Una vez que veas la estructura, puedo ayudarte a:');
console.log('1. Crear un mapeo personalizado para cada tipo de dato');
console.log('2. Limpiar y estructurar los datos inconsistentes');
console.log('3. Generar el JSON en el formato correcto para la base de conocimientos');