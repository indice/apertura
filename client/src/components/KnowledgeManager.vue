<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="knowledge-manager-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">📚 Gestión de Conocimientos</h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>

      <div class="knowledge-manager-content">
        <!-- Barra de herramientas -->
        <div class="toolbar">
          <div class="search-section">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar conocimientos..."
              class="search-input"
            />
            <select v-model="selectedCategoryFilter" class="category-filter">
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="toolbar-actions">
            <button @click="showImporter = true" class="btn btn-secondary">
              📥 Importar
            </button>
            <button @click="showAddKnowledge = true" class="btn btn-primary">
              + Nuevo Conocimiento
            </button>
          </div>
        </div>

        <!-- Lista de conocimientos -->
        <div class="knowledge-list">
          <div
            v-for="knowledge in filteredKnowledge"
            :key="knowledge.id"
            class="knowledge-item"
          >
            <div class="knowledge-header">
              <h3 v-if="knowledge.titulo" class="knowledge-title">
                {{ knowledge.titulo }}
              </h3>
              <div class="knowledge-actions">
                <button
                  @click="editKnowledge(knowledge)"
                  class="btn-small btn-secondary"
                >
                  ✏️
                </button>
                <button
                  @click="deleteKnowledge(knowledge.id)"
                  class="btn-small btn-danger"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div class="knowledge-meta">
              <span v-if="knowledge.categoria" class="knowledge-category">
                📂 {{ knowledge.categoria }}
              </span>
              <span class="knowledge-date">
                📅 {{ formatDate(knowledge.created_at) }}
              </span>
            </div>

            <div class="knowledge-content">
              <p class="knowledge-excerpt">
                {{ getExcerpt(knowledge.contenido) }}
              </p>
              <button
                v-if="knowledge.contenido && knowledge.contenido.length > 150"
                @click="showFullContent(knowledge)"
                class="btn-see-more"
              >
                Ver más →
              </button>
            </div>

            <div v-if="knowledge.pclave" class="knowledge-tags">
              <span
                v-for="tag in getTagsArray(knowledge.pclave)"
                :key="tag"
                class="knowledge-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div v-if="knowledge.imgs" class="knowledge-images">
              <img
                v-for="(img, index) in getImagesArray(knowledge.imgs)"
                :key="index"
                :src="`http://localhost:5000${img}`"
                :alt="`Imagen ${index + 1}`"
                class="knowledge-thumbnail"
                @click="showImage(`http://localhost:5000${img}`)"
              />
            </div>

            <div v-if="knowledge.urls" class="knowledge-urls">
              <a
                v-for="(url, index) in getUrlsArray(knowledge.urls)"
                :key="index"
                :href="url"
                target="_blank"
                class="knowledge-url"
              >
                🔗 {{ getDomainFromUrl(url) }}
              </a>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-if="filteredKnowledge.length === 0" class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No hay conocimientos</h3>
            <p>
              {{ searchQuery || selectedCategoryFilter
                ? 'No se encontraron conocimientos que coincidan con tu búsqueda.'
                : 'Comienza agregando tu primer conocimiento.'
              }}
            </p>
            <button @click="showAddKnowledge = true" class="btn btn-primary">
              + Añadir Conocimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Modal para importar datos -->
  <KnowledgeImporter
    v-if="showImporter"
    @close="showImporter = false"
    @imported="handleImported"
  />

  <!-- Modal para mostrar imagen -->
  <div v-if="showImageModal" class="image-modal-overlay" @click="showImageModal = false">
    <div class="image-modal" @click.stop>
      <img :src="selectedImage" alt="Imagen ampliada" class="modal-image" />
      <button @click="showImageModal = false" class="image-modal-close">✕</button>
    </div>
  </div>

  <!-- Modal para mostrar contenido completo -->
  <div v-if="showContentModal" class="content-modal-overlay" @click="showContentModal = false">
    <div class="content-modal" @click.stop>
      <div class="content-modal-header">
        <h2 v-if="selectedKnowledge?.titulo" class="content-modal-title">{{ selectedKnowledge.titulo }}</h2>
        <button @click="showContentModal = false" class="content-modal-close">✕</button>
      </div>
      <div class="content-modal-body">
        <div v-if="selectedKnowledge?.categoria" class="content-modal-meta">
          <span class="knowledge-category">📂 {{ selectedKnowledge.categoria }}</span>
          <span class="knowledge-date">📅 {{ formatDate(selectedKnowledge.created_at) }}</span>
        </div>
        <div class="content-modal-content">
          <p>{{ selectedKnowledge?.contenido }}</p>
        </div>
        <div v-if="selectedKnowledge?.pclave" class="content-modal-tags">
          <span
            v-for="tag in getTagsArray(selectedKnowledge.pclave)"
            :key="tag"
            class="knowledge-tag"
          >
            {{ tag }}
          </span>
        </div>
        <div v-if="selectedKnowledge?.imgs" class="content-modal-images">
          <img
            v-for="(img, index) in getImagesArray(selectedKnowledge.imgs)"
            :key="index"
            :src="`http://localhost:5000${img}`"
            :alt="`Imagen ${index + 1}`"
            class="content-modal-image"
            @click="showImage(`http://localhost:5000${img}`)"
          />
        </div>
        <div v-if="selectedKnowledge?.urls" class="content-modal-urls">
          <a
            v-for="(url, index) in getUrlsArray(selectedKnowledge.urls)"
            :key="index"
            :href="url"
            target="_blank"
            class="knowledge-url"
          >
            🔗 {{ getDomainFromUrl(url) }}
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para añadir/editar conocimiento (usando Teleport) -->
  <Teleport to="body">
    <KnowledgeModal
      v-if="showAddKnowledge"
      :editing-knowledge="editingKnowledge"
      @close="closeKnowledgeModal"
      @save="handleKnowledgeSave"
    />
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import KnowledgeModal from './KnowledgeModal.vue'
import KnowledgeImporter from './KnowledgeImporter.vue'

export default {
  name: 'KnowledgeManager',
  components: {
    KnowledgeModal,
    KnowledgeImporter
  },
  emits: ['close'],
  setup(props, { emit }) {
    const knowledgeList = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategoryFilter = ref('')
    const showAddKnowledge = ref(false)
    const showImporter = ref(false)
    const editingKnowledge = ref(null)
    const showImageModal = ref(false)
    const selectedImage = ref('')
    const showContentModal = ref(false)
    const selectedKnowledge = ref(null)

    // Cargar conocimientos
    const loadKnowledge = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/knowledge')
        if (response.ok) {
          knowledgeList.value = await response.json()
        }
      } catch (error) {
        console.error('Error cargando conocimientos:', error)
      }
    }

    // Cargar categorías
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

    // Filtrar conocimientos
    const filteredKnowledge = computed(() => {
      let filtered = knowledgeList.value

      // Filtrar por búsqueda
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(k =>
          (k.titulo && k.titulo.toLowerCase().includes(query)) ||
          (k.contenido && k.contenido.toLowerCase().includes(query)) ||
          (k.pclave && k.pclave.toLowerCase().includes(query))
        )
      }

      // Filtrar por categoría
      if (selectedCategoryFilter.value) {
        filtered = filtered.filter(k => k.categoria === selectedCategoryFilter.value)
      }

      return filtered
    })

    // Utilidades
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    const getExcerpt = (content, maxLength = 150) => {
      if (!content) return ''
      return content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content
    }

    const getTagsArray = (tags) => {
      if (!tags) return []
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    const getImagesArray = (imgs) => {
      if (!imgs) return []
      return imgs.split(',').map(img => img.trim()).filter(img => img)
    }

    const getUrlsArray = (urls) => {
      if (!urls) return []
      return urls.split(',').map(url => url.trim()).filter(url => url)
    }

    const getDomainFromUrl = (url) => {
      try {
        return new URL(url).hostname
      } catch {
        return url
      }
    }

    // Acciones
    const editKnowledge = (knowledge) => {
      editingKnowledge.value = knowledge
      showAddKnowledge.value = true
    }

    const deleteKnowledge = async (id) => {
      if (!confirm('¿Estás seguro de que quieres eliminar este conocimiento?')) {
        return
      }

      try {
        const response = await fetch(`http://localhost:5000/api/knowledge/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadKnowledge()
          await loadCategories()
        } else {
          alert('Error eliminando conocimiento')
        }
      } catch (error) {
        console.error('Error eliminando conocimiento:', error)
        alert('Error eliminando conocimiento')
      }
    }

    const closeKnowledgeModal = () => {
      showAddKnowledge.value = false
      editingKnowledge.value = null
    }

    const handleKnowledgeSave = async () => {
      await loadKnowledge()
      await loadCategories()
    }

    const handleImported = async () => {
      await loadKnowledge()
      await loadCategories()
      showImporter.value = false
    }

    const showImage = (imageUrl) => {
      selectedImage.value = imageUrl
      showImageModal.value = true
    }

    const showFullContent = (knowledge) => {
      selectedKnowledge.value = knowledge
      showContentModal.value = true
    }

    onMounted(() => {
      loadKnowledge()
      loadCategories()
    })

    return {
      knowledgeList,
      categories,
      searchQuery,
      selectedCategoryFilter,
      showAddKnowledge,
      showImporter,
      editingKnowledge,
      showImageModal,
      selectedImage,
      showContentModal,
      selectedKnowledge,
      filteredKnowledge,
      formatDate,
      getExcerpt,
      getTagsArray,
      getImagesArray,
      getUrlsArray,
      getDomainFromUrl,
      editKnowledge,
      deleteKnowledge,
      closeKnowledgeModal,
      handleKnowledgeSave,
      handleImported,
      showImage,
      showFullContent
    }
  }
}
</script>

<style scoped>
.knowledge-manager-modal {
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
}

.knowledge-manager-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 16px;
}

.search-section {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.category-filter {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  min-width: 150px;
}

.category-filter option {
  background: #1f2937;
  color: white;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.knowledge-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.knowledge-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.knowledge-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.knowledge-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.knowledge-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.knowledge-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
}

.knowledge-category {
  color: #60a5fa;
}

.knowledge-date {
  color: rgba(255, 255, 255, 0.6);
}

.knowledge-content {
  margin-bottom: 12px;
}

.knowledge-excerpt {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.knowledge-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.knowledge-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.knowledge-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.knowledge-thumbnail:hover {
  opacity: 0.8;
}

.knowledge-urls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.knowledge-url {
  color: #34d399;
  text-decoration: none;
  font-size: 13px;
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  transition: background 0.2s;
}

.knowledge-url:hover {
  background: rgba(16, 185, 129, 0.2);
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: white;
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.btn-small {
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Modal de imagen */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Botón Ver más */
.btn-see-more {
  color: #60a5fa;
  background: transparent;
  border: none;
  padding: 4px 8px;
  margin-top: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-see-more:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* Modal de contenido completo */
.content-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.content-modal {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.content-modal-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.content-modal-close {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.content-modal-close:hover {
  color: white;
}

.content-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-modal-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 14px;
}

.content-modal-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  font-size: 15px;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.content-modal-content p {
  margin: 0;
}

.content-modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.content-modal-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.content-modal-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.content-modal-image:hover {
  opacity: 0.8;
}

.content-modal-urls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

</style>