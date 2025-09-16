import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo Excel
const excelPath = path.join(__dirname, '../public/sabiduria.xlsx');
const outputPath = path.join(__dirname, 'sabiduria-knowledge.json');

console.log('🔄 Convirtiendo Excel a JSON para base de conocimientos...');

const knowledgeData = [];
let totalProcessed = 0;
let skipped = 0;

try {
  const workbook = XLSX.readFile(excelPath);

  // Función para limpiar texto
  const cleanText = (text) => {
    if (!text) return '';
    return String(text).trim().replace(/\s+/g, ' ');
  };

  // Función para limpiar palabras clave
  const cleanKeywords = (keywords) => {
    if (!keywords) return '';
    return String(keywords)
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .join(', ');
  };

  // Procesar hoja "Sabiduría" (la más completa)
  console.log('\n📚 Procesando hoja "Sabiduría"...');
  if (workbook.SheetNames.includes('Sabiduría')) {
    const worksheet = workbook.Sheets['Sabiduría'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach((row, index) => {
      const descripcion = cleanText(row.Descripcion);
      if (descripcion && descripcion.length > 10) {
        knowledgeData.push({
          titulo: null, // Las descripciones son muy largas para títulos
          contenido: descripcion,
          categoria: 'Sabiduría',
          pclave: cleanKeywords(row['Palabras clave']),
          urls: null
        });
        totalProcessed++;
      } else {
        skipped++;
      }
    });
  }

  // Procesar hoja "Ciencia"
  console.log('🔬 Procesando hoja "Ciencia"...');
  if (workbook.SheetNames.includes('Ciencia')) {
    const worksheet = workbook.Sheets['Ciencia'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach((row, index) => {
      const contenido = cleanText(row.Columna1);
      const descripcionExtra = cleanText(row.Columna13);
      const url1 = cleanText(row.Columna12);
      const url2 = cleanText(row.Columna2);

      if (contenido && contenido.length > 10) {
        // Combinar contenido principal con descripción extra si existe
        const contenidoFinal = descripcionExtra && descripcionExtra.length > contenido.length
          ? descripcionExtra
          : contenido;

        // Combinar URLs si existen ambas
        const urls = [url1, url2].filter(url => url && url.startsWith('http')).join(', ') || null;

        knowledgeData.push({
          titulo: contenido.length < 100 ? contenido : null,
          contenido: contenidoFinal,
          categoria: 'Ciencia',
          pclave: null,
          urls: urls
        });
        totalProcessed++;
      } else {
        skipped++;
      }
    });
  }

  // Procesar hoja "Liberalismo"
  console.log('🏛️ Procesando hoja "Liberalismo"...');
  if (workbook.SheetNames.includes('Liberalismo')) {
    const worksheet = workbook.Sheets['Liberalismo'];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellC = worksheet[XLSX.utils.encode_cell({c: 2, r: R})]; // Columna C
      const cellD = worksheet[XLSX.utils.encode_cell({c: 3, r: R})]; // Columna D
      const cellE = worksheet[XLSX.utils.encode_cell({c: 4, r: R})]; // Columna E

      const contenido = cleanText(cellC?.v);
      const palabrasClave = cleanText(cellD?.v);
      const url = cleanText(cellE?.v);

      if (contenido && contenido.length > 20) {
        knowledgeData.push({
          titulo: null,
          contenido: contenido,
          categoria: 'Liberalismo',
          pclave: cleanKeywords(palabrasClave),
          urls: (url && url.startsWith('http')) ? url : null
        });
        totalProcessed++;
      } else if (contenido) {
        skipped++;
      }
    }
  }

  // Procesar hoja "Psicología"
  console.log('🧠 Procesando hoja "Psicología"...');
  if (workbook.SheetNames.includes('Psicología')) {
    const worksheet = workbook.Sheets['Psicología'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach((row, index) => {
      const contenido = cleanText(row.Columna2);
      const categoria = cleanText(row.Columna3);

      if (contenido && contenido.length > 10) {
        knowledgeData.push({
          titulo: null,
          contenido: contenido,
          categoria: categoria || 'Psicología',
          pclave: null,
          urls: null
        });
        totalProcessed++;
      } else {
        skipped++;
      }
    });
  }

  // Procesar hoja "internet"
  console.log('🌐 Procesando hoja "internet"...');
  if (workbook.SheetNames.includes('internet')) {
    const worksheet = workbook.Sheets['internet'];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellB = worksheet[XLSX.utils.encode_cell({c: 1, r: R})]; // Columna B
      const cellC = worksheet[XLSX.utils.encode_cell({c: 2, r: R})]; // Columna C

      const contenido = cleanText(cellB?.v);
      const palabrasClave = cleanText(cellC?.v);

      if (contenido && contenido.length > 20) {
        knowledgeData.push({
          titulo: null,
          contenido: contenido,
          categoria: 'Internet',
          pclave: cleanKeywords(palabrasClave),
          urls: null
        });
        totalProcessed++;
      } else if (contenido) {
        skipped++;
      }
    }
  }

  // Procesar hoja "Frases célebres"
  console.log('💬 Procesando hoja "Frases célebres"...');
  if (workbook.SheetNames.includes('Frases célebres')) {
    const worksheet = workbook.Sheets['Frases célebres'];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellB = worksheet[XLSX.utils.encode_cell({c: 1, r: R})]; // Columna B
      const contenido = cleanText(cellB?.v);

      if (contenido && contenido.length > 5) {
        knowledgeData.push({
          titulo: null,
          contenido: contenido,
          categoria: 'Frases célebres',
          pclave: 'frases, humor, célebres',
          urls: null
        });
        totalProcessed++;
      } else {
        skipped++;
      }
    }
  }

  // Procesar hoja "Feminismo, idealismo, comunismo"
  console.log('⚖️ Procesando hoja "Feminismo, idealismo, comunismo"...');
  if (workbook.SheetNames.includes('Feminismo, idealismo, comunismo')) {
    const worksheet = workbook.Sheets['Feminismo, idealismo, comunismo'];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellB = worksheet[XLSX.utils.encode_cell({c: 1, r: R})]; // Columna B
      const cellC = worksheet[XLSX.utils.encode_cell({c: 2, r: R})]; // Columna C

      const contenido = cleanText(cellB?.v);
      const palabrasClave = cleanText(cellC?.v);

      if (contenido && contenido.length > 20) {
        knowledgeData.push({
          titulo: null,
          contenido: contenido,
          categoria: 'Feminismo e Ideología',
          pclave: cleanKeywords(palabrasClave),
          urls: null
        });
        totalProcessed++;
      } else if (contenido) {
        skipped++;
      }
    }
  }

  // Procesar otras hojas importantes
  const otherSheets = ['FULLSTACK', 'Vaciles Buenos', 'Biología', 'Love-Podcast',
                      'Calentamiento Global', 'Debatir', 'BitCoin'];

  otherSheets.forEach(sheetName => {
    if (workbook.SheetNames.includes(sheetName)) {
      console.log(`🔍 Procesando hoja "${sheetName}"...`);
      const worksheet = workbook.Sheets[sheetName];

      try {
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        jsonData.forEach((row, index) => {
          // Buscar el primer campo no vacío con contenido sustancial
          const contenido = row.find(cell =>
            cell && String(cell).trim().length > 20
          );

          if (contenido) {
            const cleanedContent = cleanText(contenido);
            if (cleanedContent.length > 20) {
              knowledgeData.push({
                titulo: null,
                contenido: cleanedContent,
                categoria: sheetName,
                pclave: null,
                urls: null
              });
              totalProcessed++;
            }
          }
        });
      } catch (error) {
        console.log(`⚠️ Error procesando hoja "${sheetName}": ${error.message}`);
      }
    }
  });

  // Guardar el JSON
  console.log('\n💾 Guardando archivo JSON...');
  fs.writeFileSync(outputPath, JSON.stringify(knowledgeData, null, 2), 'utf8');

  // Mostrar estadísticas
  console.log('\n📊 === ESTADÍSTICAS ===');
  console.log(`✅ Total procesados: ${totalProcessed}`);
  console.log(`⏭️ Omitidos (contenido insuficiente): ${skipped}`);
  console.log(`📁 Archivo generado: ${outputPath}`);

  // Mostrar resumen por categorías
  console.log('\n📋 Resumen por categorías:');
  const categoryCounts = {};
  knowledgeData.forEach(item => {
    const cat = item.categoria || 'Sin categoría';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([categoria, count]) => {
      console.log(`  ${categoria}: ${count} elementos`);
    });

  console.log('\n🎯 El archivo JSON está listo para importar a la base de conocimientos!');
  console.log(`📍 Ubicación: ${outputPath}`);

} catch (error) {
  console.error('❌ Error:', error.message);
}