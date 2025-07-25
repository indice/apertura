<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="text-xl font-bold text-white">📂 Importar / Exportar</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div class="modal-body space-y-6">
        <!-- Exportar -->
        <div class="section">
          <h3 class="text-lg font-semibold text-white mb-3">📤 Exportar Configuración</h3>
          <p class="text-gray-300 text-sm mb-4">
            Descarga un archivo JSON con todos tus escritorios, enlaces y configuraciones.
          </p>
          <button 
            @click="exportConfig"
            class="btn-primary w-full"
          >
            📥 Descargar Configuración
          </button>
        </div>

        <div class="divider"></div>

        <!-- Importar -->
        <div class="section">
          <h3 class="text-lg font-semibold text-white mb-3">📤 Importar Configuración</h3>
          <p class="text-gray-300 text-sm mb-4">
            Selecciona un archivo JSON de configuración para restaurar tus escritorios.
          </p>
          
          <div class="space-y-4">
            <!-- Input de archivo -->
            <div class="file-input-wrapper">
              <input 
                ref="fileInput"
                type="file" 
                accept=".json"
                @change="handleFileSelect"
                id="config-file"
                class="hidden"
              >
              <label 
                for="config-file" 
                class="file-input-label"
                :class="{ 'file-selected': selectedFile }"
              >
                <span v-if="!selectedFile">📁 Seleccionar archivo JSON</span>
                <span v-else>📄 {{ selectedFile.name }}</span>
              </label>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-2">
              <button 
                @click="importConfig"
                :disabled="!selectedFile || importing"
                class="btn-success flex-1"
              >
                <span v-if="importing">⏳ Importando...</span>
                <span v-else>📤 Importar</span>
              </button>
              
              <button 
                @click="clearFile"
                :disabled="!selectedFile"
                class="btn-secondary px-4"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Reset -->
        <div class="section">
          <h3 class="text-lg font-semibold text-white mb-3">🔄 Restablecer</h3>
          <p class="text-gray-300 text-sm mb-4">
            Elimina toda la configuración y vuelve a la configuración por defecto.
          </p>
          <button 
            @click="showResetConfirm = true"
            class="btn-danger w-full"
          >
            ⚠️ Restablecer a Valores por Defecto
          </button>
        </div>

        <!-- Mensajes -->
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>

      <!-- Confirmación de reset -->
      <div v-if="showResetConfirm" class="reset-confirm-overlay" @click="showResetConfirm = false">
        <div class="reset-confirm-modal" @click.stop>
          <h3 class="text-lg font-bold text-white mb-4">⚠️ Confirmar Reset</h3>
          <p class="text-gray-300 mb-6">
            Esta acción eliminará todos tus escritorios, enlaces y configuraciones. 
            <strong>No se puede deshacer.</strong>
          </p>
          <div class="flex gap-3">
            <button @click="resetConfig" class="btn-danger flex-1">
              🗑️ Sí, Restablecer
            </button>
            <button @click="showResetConfirm = false" class="btn-secondary flex-1">
              ❌ Cancelar  
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDesktopsStore } from '../stores/desktops.js'

export default {
  name: 'ImportExportModal',
  emits: ['close'],
  data() {
    return {
      selectedFile: null,
      importing: false,
      message: '',
      messageType: '',
      showResetConfirm: false
    }
  },
  setup() {
    const store = useDesktopsStore()
    return { store }
  },
  methods: {
    exportConfig() {
      try {
        const config = this.store.exportConfiguration()
        this.showMessage('✅ Configuración exportada correctamente', 'success')
      } catch (error) {
        this.showMessage(`❌ Error exportando: ${error.message}`, 'error')
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          this.selectedFile = file
          this.clearMessage()
        } else {
          this.showMessage('❌ Por favor selecciona un archivo JSON válido', 'error')
          this.clearFile()
        }
      }
    },

    async importConfig() {
      if (!this.selectedFile) return

      this.importing = true
      this.clearMessage()

      try {
        const result = await this.store.importConfiguration(this.selectedFile)
        
        if (result.success) {
          this.showMessage(`✅ ${result.message}`, 'success')
          // Limpiar después de importar exitosamente
          setTimeout(() => {
            this.$emit('close')
          }, 2000)
        } else {
          this.showMessage(`❌ ${result.message}`, 'error')
        }
      } catch (error) {
        this.showMessage(`❌ Error inesperado: ${error.message}`, 'error')
      } finally {
        this.importing = false
      }
    },

    async resetConfig() {
      try {
        this.store.resetToDefault()
        this.showResetConfirm = false
        this.showMessage('✅ Configuración restablecida a valores por defecto', 'success')
        
        // Cerrar modal después de reset
        setTimeout(() => {
          this.$emit('close')
        }, 2000)
      } catch (error) {
        this.showMessage(`❌ Error restableciendo: ${error.message}`, 'error')
      }
    },

    clearFile() {
      this.selectedFile = null
      this.$refs.fileInput.value = ''
      this.clearMessage()
    },

    showMessage(text, type) {
      this.message = text
      this.messageType = type
      
      // Auto-limpiar mensajes de éxito
      if (type === 'success') {
        setTimeout(() => {
          this.clearMessage()
        }, 5000)
      }
    },

    clearMessage() {
      this.message = ''
      this.messageType = ''
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content {
  background: #1e293b;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #334155;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #334155;
}

.modal-body {
  padding: 20px;
}

.section {
  padding: 16px;
  background: #0f172a;
  border-radius: 8px;
  border: 1px solid #334155;
}

.divider {
  height: 1px;
  background: #334155;
  margin: 16px 0;
}

.file-input-wrapper {
  position: relative;
}

.file-input-label {
  display: block;
  padding: 12px 16px;
  background: #334155;
  border: 2px dashed #64748b;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #cbd5e1;
}

.file-input-label:hover {
  background: #475569;
  border-color: #94a3b8;
}

.file-input-label.file-selected {
  background: #065f46;
  border-color: #10b981;
  color: #d1fae5;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-success:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-secondary:disabled {
  background: #374151;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.message.success {
  background: #065f46;
  color: #d1fae5;
  border: 1px solid #10b981;
}

.message.error {
  background: #7f1d1d;
  color: #fecaca;
  border: 1px solid #dc2626;
}

.reset-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.reset-confirm-modal {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid #334155;
}
</style>