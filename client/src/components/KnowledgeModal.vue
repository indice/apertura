<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ editingKnowledge ? '✏️ Editar Conocimiento' : '📚 Nuevo Conocimiento' }}
        </h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-content">
        <!-- Título (opcional) -->
        <div class="form-group">
          <label class="form-label">
            Título <span class="form-optional">(opcional)</span>
          </label>
          <input
            v-model="form.titulo"
            type="text"
            class="form-input"
            placeholder="Ej: Configuración de Vue 3"
          />
        </div>

        <!-- Contenido (obligatorio) -->
        <div class="form-group">
          <label class="form-label">
            Contenido <span class="form-required">*</span>
          </label>
          <textarea
            v-model="form.contenido"
            class="form-textarea"
            rows="8"
            placeholder="Describe aquí el conocimiento que quieres almacenar..."
            required
          ></textarea>
        </div>

        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <div class="category-input-group">
            <select v-model="selectedCategory" class="form-select">
              <option value="">Nueva categoría...</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <input
              v-if="selectedCategory === ''"
              v-model="form.categoria"
              type="text"
              class="form-input category-custom"
              placeholder="Nombre de nueva categoría"
            />
          </div>
        </div>

        <!-- Palabras clave -->
        <div class="form-group">
          <label class="form-label">
            Palabras Clave <span class="form-optional">(separadas por comas)</span>
          </label>
          <input
            v-model="form.pclave"
            type="text"
            class="form-input"
            placeholder="vue, javascript, frontend, configuracion"
          />
        </div>

        <!-- URLs -->
        <div class="form-group">
          <label class="form-label">
            URLs Relacionadas <span class="form-optional">(separadas por comas)</span>
          </label>
          <input
            v-model="form.urls"
            type="text"
            class="form-input"
            placeholder="https://vuejs.org, https://github.com/vuejs/vue"
          />
        </div>

        <!-- Subida de imágenes -->
        <div class="form-group">
          <label class="form-label">
            Imágenes <span class="form-optional">(máximo 5 archivos)</span>
          </label>
          <div class="file-input-container">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
              id="knowledge-files"
            />
            <label for="knowledge-files" class="file-input-label">
              📎 Seleccionar imágenes
            </label>
          </div>

          <!-- Preview de archivos seleccionados -->
          <div v-if="selectedFiles.length > 0" class="file-preview">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview-item">
              <img v-if="file.preview" :src="file.preview" :alt="file.name" class="file-preview-image" />
              <div class="file-preview-info">
                <span class="file-preview-name">{{ file.name }}</span>
                <button type="button" @click="removeFile(index)" class="file-remove-button">🗑️</button>
              </div>
            </div>
          </div>

          <!-- Imágenes existentes (al editar) -->
          <div v-if="editingKnowledge && existingImages.length > 0" class="existing-images">
            <h4>Imágenes actuales:</h4>
            <div class="existing-images-grid">
              <div v-for="(img, index) in existingImages" :key="index" class="existing-image-item">
                <img :src="`http://localhost:5000${img}`" :alt="`Imagen ${index + 1}`" class="existing-image" />
                <button type="button" @click="removeExistingImage(index)" class="file-remove-button">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!form.contenido.trim()">
            {{ editingKnowledge ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'

export default {
  name: 'KnowledgeModal',
  props: {
    editingKnowledge: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const categories = ref([])
    const selectedCategory = ref('')
    const selectedFiles = ref([])
    const existingImages = ref([])

    const form = reactive({
      titulo: '',
      contenido: '',
      categoria: '',
      pclave: '',
      urls: ''
    })

    // Cargar categorías existentes
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/knowledge/categories')
        if (response.ok) {
          categories.value = await response.json()
        }
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    }

    // Watch para actualizar la categoría cuando se selecciona una existente
    watch(selectedCategory, (newValue) => {
      if (newValue && newValue !== '') {
        form.categoria = newValue
      }
    })

    // Manejar selección de archivos
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      if (files.length > 5) {
        alert('Máximo 5 archivos permitidos')
        return
      }

      selectedFiles.value = files.map(file => {
        const preview = URL.createObjectURL(file)
        return { file, name: file.name, preview }
      })
    }

    // Remover archivo seleccionado
    const removeFile = (index) => {
      URL.revokeObjectURL(selectedFiles.value[index].preview)
      selectedFiles.value.splice(index, 1)
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // Remover imagen existente
    const removeExistingImage = (index) => {
      existingImages.value.splice(index, 1)
    }

    // Enviar formulario
    const handleSubmit = async () => {
      if (!form.contenido.trim()) {
        alert('El contenido es obligatorio')
        return
      }

      try {
        const formData = new FormData()

        // Añadir datos del formulario
        formData.append('titulo', form.titulo)
        formData.append('contenido', form.contenido)
        formData.append('categoria', form.categoria)
        formData.append('pclave', form.pclave)
        formData.append('urls', form.urls)

        // Añadir imágenes existentes (al editar)
        if (props.editingKnowledge && existingImages.value.length > 0) {
          formData.append('existingImgs', existingImages.value.join(','))
        }

        // Añadir archivos nuevos
        selectedFiles.value.forEach(({ file }) => {
          formData.append('imgs', file)
        })

        const url = props.editingKnowledge
          ? `http://localhost:5000/api/knowledge/${props.editingKnowledge.id}`
          : 'http://localhost:5000/api/knowledge'

        const method = props.editingKnowledge ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method: method,
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          emit('save', result)
          emit('close')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error}`)
        }
      } catch (error) {
        console.error('Error guardando conocimiento:', error)
        alert('Error guardando conocimiento')
      }
    }

    // Función para cargar datos de edición
    const loadEditingData = () => {
      if (props.editingKnowledge) {
        const knowledge = props.editingKnowledge
        console.log('📝 Cargando datos de edición:', knowledge)

        form.titulo = knowledge.titulo || ''
        form.contenido = knowledge.contenido || ''
        form.categoria = knowledge.categoria || ''
        form.pclave = knowledge.pclave || ''
        form.urls = knowledge.urls || ''

        if (knowledge.categoria) {
          selectedCategory.value = knowledge.categoria
        }

        // Cargar imágenes existentes
        if (knowledge.imgs) {
          existingImages.value = knowledge.imgs.split(',').filter(img => img.trim())
        }
      }
    }

    // Watch para cambios en editingKnowledge
    watch(() => props.editingKnowledge, (newValue) => {
      if (newValue) {
        loadEditingData()
      }
    }, { immediate: true })

    // Inicializar formulario si estamos editando
    onMounted(() => {
      loadCategories()
      loadEditingData()
    })

    return {
      form,
      categories,
      selectedCategory,
      selectedFiles,
      existingImages,
      fileInput,
      handleFileSelect,
      removeFile,
      removeExistingImage,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Modal base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
}

.modal {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  width: 90vw;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Form elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.category-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-select {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-select option {
  background: #1f2937;
  color: white;
}

.category-custom {
  flex: 1;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1.5;
}

.form-textarea:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-optional {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: normal;
}

.form-required {
  color: #ef4444;
  font-size: 12px;
  font-weight: normal;
}

.file-input-container {
  position: relative;
}

.file-input {
  display: none;
}

.file-input-label {
  display: inline-block;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.file-input-label:hover {
  background: rgba(255, 255, 255, 0.2);
}

.file-preview {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.file-preview-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-preview-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-preview-name {
  color: white;
  font-size: 14px;
}

.file-remove-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.file-remove-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.existing-images h4 {
  color: white;
  margin: 16px 0 8px 0;
  font-size: 14px;
}

.existing-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.existing-image-item {
  position: relative;
}

.existing-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.existing-image-item .file-remove-button {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>