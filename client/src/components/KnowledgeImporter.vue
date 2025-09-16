<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="importer-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">📥 Importar Conocimientos</h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>

      <div class="importer-content">
        <!-- Opción 1: JSON -->
        <div class="import-section">
          <h3>🔧 Importar desde JSON</h3>
          <p class="section-description">
            Pega un array JSON con tus conocimientos. Cada objeto debe tener: contenido (obligatorio), titulo, categoria, pclave, urls.
          </p>

          <div class="json-example">
            <details>
              <summary>📋 Ver ejemplo de formato JSON</summary>
              <pre class="example-code">{{jsonExample}}</pre>
            </details>
          </div>

          <textarea
            v-model="jsonInput"
            class="json-textarea"
            rows="8"
            placeholder="Pega aquí tu JSON..."
          ></textarea>

          <div class="form-actions">
            <button
              @click="parseJsonAndPreview"
              class="btn btn-secondary"
              :disabled="!jsonInput.trim()"
            >
              🔍 Previsualizar
            </button>
          </div>
        </div>

        <!-- Opción 2: CSV -->
        <div class="import-section">
          <h3>📊 Importar desde CSV</h3>
          <p class="section-description">
            Formato: titulo,contenido,categoria,pclave,urls (separados por comas, encerrar en comillas si contienen comas)
          </p>

          <div class="csv-example">
            <details>
              <summary>📋 Ver ejemplo de formato CSV</summary>
              <pre class="example-code">{{csvExample}}</pre>
            </details>
          </div>

          <textarea
            v-model="csvInput"
            class="csv-textarea"
            rows="6"
            placeholder="Pega aquí tu CSV..."
          ></textarea>

          <div class="form-actions">
            <button
              @click="parseCsvAndPreview"
              class="btn btn-secondary"
              :disabled="!csvInput.trim()"
            >
              🔍 Previsualizar
            </button>
          </div>
        </div>

        <!-- Opción 3: Texto libre -->
        <div class="import-section">
          <h3>📝 Importar desde texto libre</h3>
          <p class="section-description">
            Cada párrafo separado por línea vacía se convertirá en un conocimiento.
            Primera línea = título, resto = contenido.
          </p>

          <textarea
            v-model="textInput"
            class="text-textarea"
            rows="6"
            placeholder="Pega aquí tu texto libre..."
          ></textarea>

          <div class="form-group">
            <label class="form-label">Categoría por defecto</label>
            <input
              v-model="defaultCategory"
              type="text"
              class="form-input"
              placeholder="Ej: General"
            />
          </div>

          <div class="form-actions">
            <button
              @click="parseTextAndPreview"
              class="btn btn-secondary"
              :disabled="!textInput.trim()"
            >
              🔍 Previsualizar
            </button>
          </div>
        </div>

        <!-- Previsualización -->
        <div v-if="previewData.length > 0" class="preview-section">
          <h3>👁️ Previsualización ({{ previewData.length }} elementos)</h3>

          <div class="preview-options">
            <label class="checkbox-wrapper">
              <input v-model="skipDuplicates" type="checkbox" />
              <span>Omitir duplicados basados en título y contenido</span>
            </label>
          </div>

          <div class="preview-list">
            <div
              v-for="(item, index) in previewData.slice(0, 5)"
              :key="index"
              class="preview-item"
            >
              <div class="preview-header">
                <strong>{{ item.titulo || 'Sin título' }}</strong>
                <span v-if="item.categoria" class="preview-category">📂 {{ item.categoria }}</span>
              </div>
              <div class="preview-content">
                {{ item.contenido.substring(0, 100) }}{{ item.contenido.length > 100 ? '...' : '' }}
              </div>
              <div v-if="item.pclave" class="preview-tags">
                <span
                  v-for="tag in item.pclave.split(',').slice(0, 3)"
                  :key="tag"
                  class="preview-tag"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>

            <div v-if="previewData.length > 5" class="preview-more">
              ... y {{ previewData.length - 5 }} elementos más
            </div>
          </div>

          <div class="import-actions">
            <button @click="clearPreview" class="btn btn-secondary">
              🗑️ Limpiar
            </button>
            <button
              @click="importData"
              class="btn btn-primary"
              :disabled="importing"
            >
              <span v-if="importing">⏳ Importando...</span>
              <span v-else>📥 Importar {{ previewData.length }} elementos</span>
            </button>
          </div>
        </div>

        <!-- Resultado de importación -->
        <div v-if="importResult" class="result-section">
          <div class="result-message" :class="importResult.success ? 'success' : 'error'">
            {{ importResult.message }}
          </div>

          <div v-if="importResult.success && importResult.details" class="result-details">
            <p>✅ Importados: {{ importResult.details.imported }}</p>
            <p v-if="importResult.details.duplicates > 0">
              ⚠️ Duplicados omitidos: {{ importResult.details.duplicates }}
            </p>
            <p v-if="importResult.details.errors > 0">
              ❌ Errores: {{ importResult.details.errors }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'KnowledgeImporter',
  emits: ['close', 'imported'],
  setup(_, { emit }) {
    const jsonInput = ref('')
    const csvInput = ref('')
    const textInput = ref('')
    const defaultCategory = ref('General')
    const previewData = ref([])
    const skipDuplicates = ref(true)
    const importing = ref(false)
    const importResult = ref(null)

    const jsonExample = JSON.stringify([
      {
        titulo: "Vue 3 Composición API",
        contenido: "La Composición API permite organizar el código por funcionalidad lógica...",
        categoria: "Frontend",
        pclave: "vue3, composition-api, javascript",
        urls: "https://vuejs.org/guide/extras/composition-api-faq.html"
      },
      {
        titulo: null,
        contenido: "Comando útil para git: git stash para guardar cambios temporalmente",
        categoria: "Git",
        pclave: "git, stash, comandos",
        urls: null
      }
    ], null, 2)

    const csvExample = `"Vue 3 Setup","Instalar Vue 3 con npm create vue@latest","Frontend","vue, setup, installation","https://vuejs.org"
,"Comando git útil","git stash guarda cambios temporalmente","Git","git, stash",""`

    // Parsear JSON
    const parseJsonAndPreview = () => {
      try {
        const parsed = JSON.parse(jsonInput.value)
        if (!Array.isArray(parsed)) {
          throw new Error('El JSON debe ser un array de objetos')
        }

        const processed = parsed.map((item, index) => {
          if (!item.contenido) {
            throw new Error(`Elemento ${index + 1}: 'contenido' es obligatorio`)
          }
          return {
            titulo: item.titulo || null,
            contenido: item.contenido,
            categoria: item.categoria || null,
            pclave: item.pclave || null,
            urls: item.urls || null
          }
        })

        previewData.value = processed
        importResult.value = null
      } catch (error) {
        alert(`Error parseando JSON: ${error.message}`)
      }
    }

    // Parsear CSV
    const parseCsvAndPreview = () => {
      try {
        const lines = csvInput.value.trim().split('\n')
        const processed = []

        lines.forEach((line, index) => {
          if (!line.trim()) return

          // Simple CSV parser (maneja comillas)
          const fields = parseCSVLine(line)

          if (fields.length < 2) {
            throw new Error(`Línea ${index + 1}: Se requieren al menos titulo y contenido`)
          }

          if (!fields[1].trim()) {
            throw new Error(`Línea ${index + 1}: 'contenido' no puede estar vacío`)
          }

          processed.push({
            titulo: fields[0]?.trim() || null,
            contenido: fields[1]?.trim(),
            categoria: fields[2]?.trim() || null,
            pclave: fields[3]?.trim() || null,
            urls: fields[4]?.trim() || null
          })
        })

        previewData.value = processed
        importResult.value = null
      } catch (error) {
        alert(`Error parseando CSV: ${error.message}`)
      }
    }

    // Función auxiliar para parsear línea CSV
    const parseCSVLine = (line) => {
      const fields = []
      let field = ''
      let inQuotes = false
      let i = 0

      while (i < line.length) {
        const char = line[i]

        if (char === '"' && !inQuotes) {
          inQuotes = true
        } else if (char === '"' && inQuotes) {
          if (line[i + 1] === '"') {
            field += '"'
            i++
          } else {
            inQuotes = false
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(field)
          field = ''
        } else {
          field += char
        }
        i++
      }

      fields.push(field)
      return fields
    }

    // Parsear texto libre
    const parseTextAndPreview = () => {
      try {
        const paragraphs = textInput.value.trim().split('\n\n')
        const processed = []

        paragraphs.forEach((paragraph, index) => {
          if (!paragraph.trim()) return

          const lines = paragraph.trim().split('\n')
          const titulo = lines[0].trim()
          const contenido = lines.length > 1
            ? lines.slice(1).join('\n').trim()
            : titulo

          if (!contenido) {
            throw new Error(`Párrafo ${index + 1}: contenido vacío`)
          }

          processed.push({
            titulo: lines.length > 1 ? titulo : null,
            contenido: contenido,
            categoria: defaultCategory.value || null,
            pclave: null,
            urls: null
          })
        })

        previewData.value = processed
        importResult.value = null
      } catch (error) {
        alert(`Error parseando texto: ${error.message}`)
      }
    }

    const clearPreview = () => {
      previewData.value = []
      importResult.value = null
    }

    const importData = async () => {
      if (previewData.value.length === 0) return

      importing.value = true
      importResult.value = null

      try {
        const response = await fetch('http://localhost:5000/api/knowledge/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: previewData.value,
            skipDuplicates: skipDuplicates.value
          })
        })

        const result = await response.json()

        if (response.ok) {
          importResult.value = {
            success: true,
            message: `¡Importación exitosa!`,
            details: result
          }

          // Limpiar después de importación exitosa
          setTimeout(() => {
            emit('imported')
            clearPreview()
            jsonInput.value = ''
            csvInput.value = ''
            textInput.value = ''
          }, 2000)
        } else {
          importResult.value = {
            success: false,
            message: `Error en la importación: ${result.error}`
          }
        }
      } catch (error) {
        importResult.value = {
          success: false,
          message: `Error de conexión: ${error.message}`
        }
      } finally {
        importing.value = false
      }
    }

    return {
      jsonInput,
      csvInput,
      textInput,
      defaultCategory,
      previewData,
      skipDuplicates,
      importing,
      importResult,
      jsonExample,
      csvExample,
      parseJsonAndPreview,
      parseCsvAndPreview,
      parseTextAndPreview,
      clearPreview,
      importData
    }
  }
}
</script>

<style scoped>
.importer-modal {
  width: 95vw;
  max-width: 900px;
  max-height: 90vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
}

.importer-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.import-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.import-section:last-child {
  border-bottom: none;
}

.import-section h3 {
  color: white;
  margin-bottom: 8px;
  font-size: 18px;
}

.section-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.json-example, .csv-example {
  margin-bottom: 16px;
}

.json-example summary, .csv-example summary {
  color: #60a5fa;
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 8px;
}

.example-code {
  background: rgba(0, 0, 0, 0.3);
  color: #e5e7eb;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.json-textarea, .csv-textarea, .text-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  margin-bottom: 12px;
}

.json-textarea::placeholder, .csv-textarea::placeholder, .text-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.preview-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.preview-section h3 {
  color: white;
  margin-bottom: 16px;
}

.preview-options {
  margin-bottom: 16px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.preview-list {
  max-height: 300px;
  overflow-y: auto;
}

.preview-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-header strong {
  color: white;
}

.preview-category {
  font-size: 12px;
  color: #60a5fa;
}

.preview-content {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  line-height: 1.4;
}

.preview-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.preview-more {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 12px;
  font-style: italic;
}

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
}

.result-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.result-message {
  font-weight: 600;
  margin-bottom: 12px;
}

.result-message.success {
  color: #34d399;
}

.result-message.error {
  color: #ef4444;
}

.result-details p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.8);
}
</style>