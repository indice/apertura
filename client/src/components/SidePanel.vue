<template>
  <div 
    v-if="isOpen" 
    class="side-panel-overlay"
    @click="$emit('close')"
  >
    <div 
      class="side-panel"
      :style="{ background: desktop.background }"
      @click.stop
    >
      <div class="side-panel-overlay-content"></div>
      <div class="side-panel-header">
        <h2 class="side-panel-title">Configuración</h2>
        <button 
          @click="$emit('close')"
          class="close-button"
        >
          ✕
        </button>
      </div>

      <div class="side-panel-content">
        <!-- Configuración del escritorio actual -->
        <div class="config-section">
          <h3 class="config-title">Escritorio Actual</h3>
          
          <div class="form-group">
            <label class="form-label">Nombre del escritorio</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              @input="updateDesktop"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Color de fondo</label>
            <div class="color-grid">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                @click="setBackground(color)"
                :class="{ active: form.background === color }"
                class="color-button"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
            <div class="color-input-group">
              <input
                v-model="customColorInput"
                type="text"
                class="form-input"
                placeholder="Ej: 2B2A33 o #2B2A33"
                @input="handleCustomColorInput"
                style="flex: 1; margin-right: 8px;"
              />
              <input
                v-model="form.background"
                type="color"
                class="form-input"
                style="height: 48px; width: 60px;"
                @input="updateDesktop"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Gradientes</label>
            <div class="gradient-grid">
              <button
                v-for="gradient in presetGradients"
                :key="gradient.value"
                type="button"
                @click="setBackground(gradient.value)"
                :class="{ active: form.background === gradient.value }"
                class="gradient-button"
                :style="{ background: gradient.value }"
              >
                {{ gradient.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Configuración de navegación -->
        <div class="config-section">
          <h3 class="config-title">Navegación</h3>
          
          <div class="form-group">
            <label class="form-checkbox-wrapper">
              <input
                v-model="navigationSettings.browserNavigation"
                type="checkbox"
                class="form-checkbox"
                @change="updateNavigationSettings"
              />
              <span class="form-checkbox-label">
                Usar botones atrás/adelante del navegador para cambiar escritorios
              </span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-checkbox-wrapper">
              <input
                v-model="navigationSettings.keyboardNavigation"
                type="checkbox"
                class="form-checkbox"
                @change="updateNavigationSettings"
              />
              <span class="form-checkbox-label">
                Navegación con teclas de flecha (← →)
              </span>
            </label>
          </div>

        </div>

        <!-- Gestión de escritorios -->
        <div class="config-section">
          <div class="config-section-header">
            <h3 class="config-title">Gestión de Escritorios</h3>
            <button
              @click="$emit('add-desktop')"
              class="btn btn-primary btn-small"
            >
              + Escritorio
            </button>
          </div>
          
          <div class="desktop-list">
            <div
              v-for="(desktop, index) in allDesktops"
              :key="desktop.id"
              class="desktop-item"
              :class="{ active: currentDesktopIndex === index }"
            >
              <div 
                class="desktop-preview"
                :style="{ background: desktop.background }"
              ></div>
              <span class="desktop-name">{{ desktop.name }}</span>
              <div class="desktop-actions">
                <button
                  @click="switchToDesktop(index)"
                  class="btn-small btn-primary"
                  :disabled="currentDesktopIndex === index"
                >
                  Ir
                </button>
                <button
                  v-if="allDesktops.length > 1"
                  @click="removeDesktop(index)"
                  class="btn-small btn-danger"
                  :disabled="currentDesktopIndex === index"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'SidePanel',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    desktop: {
      type: Object,
      required: true
    },
    allDesktops: {
      type: Array,
      required: true
    },
    currentDesktopIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['close', 'update', 'switch-desktop', 'remove-desktop', 'add-desktop', 'update-navigation'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      background: '#1e293b'
    })

    const customColorInput = ref('')

    const navigationSettings = ref({
      browserNavigation: false,
      keyboardNavigation: true
    })

    const presetColors = [
      '#1e293b', '#0f172a', '#1f2937', '#374151',
      '#7c2d12', '#991b1b', '#7c3aed', '#2563eb',
      '#059669', '#0891b2', '#dc2626', '#ea580c',
      '#4338ca', '#7c2d12', '#be123c', '#0d9488',
      '#ca8a04', '#9333ea', '#e11d48', '#15803d'
    ]

    const presetGradients = [
      {
        name: 'Océano',
        value: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
      },
      {
        name: 'Sunset',
        value: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        name: 'Bosque',
        value: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        name: 'Fuego',
        value: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)'
      },
      {
        name: 'Noche',
        value: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)'
      },
      {
        name: 'Espacio',
        value: 'linear-gradient(45deg, #434343 0%, #000000 100%)'
      }
    ]

    const isValidHexColor = (color) => {
      const hexRegex = /^#?[0-9A-Fa-f]{6}$/
      return hexRegex.test(color)
    }

    const handleCustomColorInput = () => {
      let color = customColorInput.value.trim()
      
      if (color && !color.startsWith('#')) {
        color = '#' + color
      }
      
      if (isValidHexColor(color)) {
        form.value.background = color
        updateDesktop()
      }
    }

    const setBackground = (background) => {
      form.value.background = background
      updateDesktop()
    }

    const updateDesktop = () => {
      emit('update', { ...form.value })
    }

    const updateNavigationSettings = () => {
      emit('update-navigation', { ...navigationSettings.value })
    }

    const switchToDesktop = (index) => {
      emit('switch-desktop', index)
    }

    const removeDesktop = (index) => {
      if (confirm('¿Estás seguro de que quieres eliminar este escritorio?')) {
        emit('remove-desktop', index)
      }
    }


    const loadNavigationSettings = () => {
      const saved = localStorage.getItem('apertura-navigation-settings')
      if (saved) {
        const data = JSON.parse(saved)
        navigationSettings.value = { ...navigationSettings.value, ...data }
      }
    }

    const saveNavigationSettings = () => {
      localStorage.setItem('apertura-navigation-settings', JSON.stringify(navigationSettings.value))
    }

    watch(() => props.desktop, (newDesktop) => {
      if (newDesktop) {
        form.value.name = newDesktop.name
        form.value.background = newDesktop.background
      }
    }, { immediate: true })

    watch(navigationSettings, () => {
      saveNavigationSettings()
    }, { deep: true })

    onMounted(() => {
      loadNavigationSettings()
    })

    return {
      form,
      customColorInput,
      navigationSettings,
      presetColors,
      presetGradients,
      handleCustomColorInput,
      setBackground,
      updateDesktop,
      updateNavigationSettings,
      switchToDesktop,
      removeDesktop
    }
  }
}
</script>