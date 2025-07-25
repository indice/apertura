<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ editingLink ? 'Editar Enlace' : 'Añadir Enlace' }}</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">
            Nombre del enlace
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Ej: Google"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            URL
          </label>
          <input
            v-model="form.url"
            type="url"
            required
            class="form-input"
            placeholder="https://www.google.com"
            @blur="handleUrlChange"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Icono
          </label>
          <div class="icon-preview">
            <div class="icon-display">
              <img 
                v-if="faviconUrl && !iconError" 
                :src="faviconUrl" 
                @error="iconError = true"
                @load="iconError = false"
                alt="Favicon"
                class="favicon-img"
              />
              <span v-else class="emoji-fallback">{{ form.icon || '🔗' }}</span>
            </div>
            <div class="icon-controls">
              <button 
                type="button" 
                @click="loadFavicon" 
                :disabled="loadingFavicon || !form.url"
                class="btn btn-secondary btn-small"
              >
                {{ loadingFavicon ? 'Cargando...' : 'Obtener favicon' }}
              </button>
              <input
                v-model="form.customIconUrl"
                type="url"
                class="form-input"
                placeholder="https://ejemplo.com/icono.png"
                @blur="handleCustomIconChange"
              />
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="form-input"
              />
              <input
                v-model="form.icon"
                type="text"
                class="form-input icon-input"
                placeholder="🔗"
                maxlength="2"
              />
            </div>
          </div>
          <p class="form-help">Puedes obtener el favicon automáticamente, usar una URL de imagen personalizada, subir una imagen local o usar un emoji</p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loadingFavicon"
          >
            {{ editingLink ? 'Guardar' : 'Añadir' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useFavicon, normalizeUrl, isValidUrl } from '../utils/favicon'

export default {
  name: 'LinkModal',
  emits: ['close', 'add'],
  props: {
    editingLink: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const form = ref({
      name: '',
      url: '',
      icon: '🔗',
      customIconUrl: ''
    })

    const faviconUrl = ref('')
    const loadingFavicon = ref(false)
    const iconError = ref(false)
    const { getFavicon } = useFavicon()

    const loadFavicon = async () => {
      if (!form.value.url || !isValidUrl(form.value.url)) return

      loadingFavicon.value = true
      iconError.value = false
      
      try {
        const normalizedUrl = normalizeUrl(form.value.url)
        const favicon = await getFavicon(normalizedUrl)
        
        if (favicon) {
          faviconUrl.value = favicon
          // Limpiar el campo de emoji si se encuentra favicon
          form.value.icon = ''
        } else {
          iconError.value = true
        }
      } catch (error) {
        console.warn('Error loading favicon:', error)
        iconError.value = true
      } finally {
        loadingFavicon.value = false
      }
    }

    const handleUrlChange = () => {
      // Auto-cargar favicon cuando se introduce una URL
      if (form.value.url && isValidUrl(form.value.url)) {
        loadFavicon()
      }
    }

    const handleCustomIconChange = () => {
      // Si se introduce una URL de icono personalizada, usarla
      if (form.value.customIconUrl && isValidUrl(form.value.customIconUrl)) {
        faviconUrl.value = form.value.customIconUrl
        iconError.value = false
        form.value.icon = '' // Limpiar emoji
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          // Convertir imagen a base64 y usarla como favicon
          faviconUrl.value = e.target.result
          iconError.value = false
          form.value.icon = '' // Limpiar emoji
          form.value.customIconUrl = '' // Limpiar URL personalizada
        }
        reader.readAsDataURL(file)
      }
    }

    const handleSubmit = () => {
      if (form.value.name && form.value.url) {
        const linkData = {
          name: form.value.name,
          url: normalizeUrl(form.value.url),
          icon: form.value.icon || '🔗',
          faviconUrl: faviconUrl.value || null
        }
        
        emit('add', linkData)
        
        // Reset form
        form.value = {
          name: '',
          url: '',
          icon: '🔗',
          customIconUrl: ''
        }
        faviconUrl.value = ''
        iconError.value = false
      }
    }

    // Llenar formulario si estamos editando
    watch(() => props.editingLink, (editingLink) => {
      if (editingLink) {
        form.value = {
          name: editingLink.name,
          url: editingLink.url,
          icon: editingLink.icon || '🔗',
          customIconUrl: editingLink.customIconUrl || ''
        }
        faviconUrl.value = editingLink.faviconUrl || ''
      }
    }, { immediate: true })

    // Watch URL changes to auto-suggest name
    watch(() => form.value.url, (newUrl) => {
      if (newUrl && !form.value.name && isValidUrl(newUrl)) {
        try {
          const url = new URL(normalizeUrl(newUrl))
          const domain = url.hostname.replace('www.', '')
          // Capitalizar primera letra del dominio como sugerencia de nombre
          form.value.name = domain.charAt(0).toUpperCase() + domain.slice(1).split('.')[0]
        } catch (error) {
          // Ignorar errores de parsing
        }
      }
    })

    return {
      form,
      faviconUrl,
      loadingFavicon,
      iconError,
      loadFavicon,
      handleUrlChange,
      handleCustomIconChange,
      handleFileUpload,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.icon-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background-color: #f9fafb;
}

.icon-display {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background-color: white;
}

.favicon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.emoji-fallback {
  font-size: 1.25rem;
}

.icon-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.icon-input {
  font-size: 0.875rem;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .icon-preview {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .icon-controls {
    align-items: center;
  }
}
</style>