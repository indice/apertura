<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Añadir Escritorio</h2>
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
            placeholder="Ej: Personal"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Color de fondo
          </label>
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
          <div class="color-input-group">
            <input
              v-model="customColorInput"
              type="text"
              class="form-input"
              placeholder="Ej: d1d5db o #d1d5db"
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
            class="btn btn-success"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DesktopModal',
  emits: ['close', 'add'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      background: '#1e293b'
    })

    const customColorInput = ref('')

    const presetColors = [
      '#1e293b', '#0f172a', '#1f2937', '#374151',
      '#7c2d12', '#991b1b', '#7c3aed', '#2563eb',
      '#059669', '#0891b2', '#dc2626', '#ea580c'
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
      if (form.value.name) {
        emit('add', { ...form.value })
      }
    }

    return {
      form,
      customColorInput,
      presetColors,
      handleCustomColorInput,
      handleSubmit
    }
  }
}
</script>