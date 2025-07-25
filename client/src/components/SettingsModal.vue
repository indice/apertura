<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Configurar Escritorio</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">
            Nombre del escritorio
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Fondo del escritorio
          </label>
          
          <!-- Colores predefinidos -->
          <div style="margin-bottom: 1rem;">
            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Colores predefinidos:</p>
            <div class="color-grid">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                @click="form.background = color"
                :class="{ active: form.background === color }"
                class="color-button"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>

          <!-- Selector de color personalizado -->
          <div style="margin-bottom: 1rem;">
            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Color personalizado:</p>
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
              />
            </div>
          </div>

          <!-- Gradientes predefinidos -->
          <div>
            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Gradientes:</p>
            <div class="gradient-grid">
              <button
                v-for="gradient in presetGradients"
                :key="gradient.value"
                type="button"
                @click="form.background = gradient.value"
                :class="{ active: form.background === gradient.value }"
                class="gradient-button"
                :style="{ background: gradient.value }"
              >
                {{ gradient.name }}
              </button>
            </div>
          </div>
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
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SettingsModal',
  props: {
    desktop: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      background: '#1e293b'
    })

    const customColorInput = ref('')

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
      }
    }

    const handleSubmit = () => {
      emit('update', { ...form.value })
    }

    onMounted(() => {
      form.value.name = props.desktop.name
      form.value.background = props.desktop.background
    })

    return {
      form,
      customColorInput,
      presetColors,
      presetGradients,
      handleCustomColorInput,
      handleSubmit
    }
  }
}
</script>