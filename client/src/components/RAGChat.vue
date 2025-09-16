<template>
  <div class="rag-chat-container">
    <div class="chat-header">
      <h3>🤖 Asistente IA</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">🎓</div>
        <h4>¡Hola! Soy tu asistente basado en conocimientos</h4>
        <p>Puedo responder preguntas basándome en la información almacenada en tu base de conocimientos.</p>
        <div class="example-questions">
          <p>Prueba preguntando algo como:</p>
          <button
            v-for="example in exampleQuestions"
            :key="example"
            @click="sendMessage(example)"
            class="example-question"
          >
            {{ example }}
          </button>
        </div>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>

          <div v-if="message.sources && message.sources.length > 0" class="message-sources">
            <div class="sources-header">📚 Fuentes:</div>
            <div
              v-for="source in message.sources"
              :key="source.id"
              class="source-item"
              @click="viewSource(source)"
            >
              <span v-if="source.titulo" class="source-title">{{ source.titulo }}</span>
              <span class="source-category">{{ source.categoria || 'General' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="message assistant loading">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <div v-if="!isConfigured" class="config-warning">
      <p>⚠️ RAG no está configurado. Añade tu OPENAI_API_KEY en el archivo .env del servidor.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="chat-input-form">
      <input
        v-model="inputMessage"
        type="text"
        placeholder="Escribe tu pregunta..."
        class="chat-input"
        :disabled="isLoading || !isConfigured"
      />
      <button
        type="submit"
        class="send-button"
        :disabled="!inputMessage.trim() || isLoading || !isConfigured"
      >
        <span v-if="!isLoading">➤</span>
        <span v-else>⏳</span>
      </button>
    </form>

    <!-- Modal para ver fuente completa -->
    <div v-if="showSourceModal" class="source-modal-overlay" @click="closeSourceModal">
      <div class="source-modal" @click.stop>
        <div class="source-modal-header">
          <h3>{{ selectedSource?.titulo || 'Fuente de Conocimiento' }}</h3>
          <button @click="closeSourceModal" class="source-modal-close">×</button>
        </div>
        <div class="source-modal-body">
          <div class="source-modal-meta">
            <span v-if="selectedSource?.categoria" class="source-meta-item">
              📂 {{ selectedSource.categoria }}
            </span>
            <span class="source-meta-item">
              #{{ selectedSource?.id }}
            </span>
          </div>
          <div class="source-content">
            <p>{{ selectedSource?.contenido || 'Contenido no disponible' }}</p>
          </div>
          <button @click="closeSourceModal" class="source-modal-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'RAGChat',
  emits: ['close'],
  setup() {
    const messages = ref([])
    const inputMessage = ref('')
    const isLoading = ref(false)
    const isConfigured = ref(true)
    const messagesContainer = ref(null)

    const exampleQuestions = [
      "¿Qué información tienes sobre programación?",
      "Resume los conocimientos más importantes",
      "¿Cuáles son las categorías disponibles?"
    ]

    const checkRAGStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rag/status')
        const data = await response.json()
        isConfigured.value = data.available
      } catch (error) {
        console.error('Error verificando estado de RAG:', error)
        isConfigured.value = false
      }
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const sendMessage = async (text = null) => {
      const messageText = text || inputMessage.value.trim()
      if (!messageText || isLoading.value || !isConfigured.value) return

      // Agregar mensaje del usuario
      messages.value.push({
        role: 'user',
        content: messageText
      })

      inputMessage.value = ''
      isLoading.value = true
      await scrollToBottom()

      try {
        const response = await fetch('http://localhost:5000/api/rag/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: messageText })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error en el servidor')
        }

        const data = await response.json()

        // Agregar respuesta del asistente
        messages.value.push({
          role: 'assistant',
          content: data.response,
          sources: data.sources
        })

      } catch (error) {
        console.error('Error:', error)
        messages.value.push({
          role: 'assistant',
          content: `Lo siento, ocurrió un error: ${error.message}`,
          isError: true
        })

        // Si el error es de configuración, actualizar estado
        if (error.message.includes('OPENAI_API_KEY')) {
          isConfigured.value = false
        }
      } finally {
        isLoading.value = false
        await scrollToBottom()
      }
    }

    const handleSubmit = () => {
      sendMessage()
    }

    const showSourceModal = ref(false)
    const selectedSource = ref(null)

    const viewSource = (source) => {
      selectedSource.value = source
      showSourceModal.value = true
    }

    const closeSourceModal = () => {
      showSourceModal.value = false
      selectedSource.value = null
    }

    onMounted(() => {
      checkRAGStatus()
    })

    return {
      messages,
      inputMessage,
      isLoading,
      isConfigured,
      messagesContainer,
      exampleQuestions,
      showSourceModal,
      selectedSource,
      sendMessage,
      handleSubmit,
      viewSource,
      closeSourceModal
    }
  }
}
</script>

<style scoped>
.rag-chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border-radius: 12px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header h3 {
  color: white;
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-message h4 {
  color: white;
  margin-bottom: 8px;
  font-size: 20px;
}

.welcome-message p {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.7);
}

.example-questions {
  margin-top: 24px;
}

.example-questions p {
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.example-question {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 8px auto;
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.example-question:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}

.message {
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: rgba(99, 102, 241, 0.2);
  color: white;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-sources {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sources-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.source-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 4px 4px 4px 0;
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.source-item:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

.source-title {
  color: #34d399;
}

.source-category {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}

.loading .typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.config-warning {
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid rgba(239, 68, 68, 0.2);
}

.config-warning p {
  color: #f87171;
  margin: 0;
  font-size: 14px;
}

.chat-input-form {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.chat-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.5);
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  padding: 0 20px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar personalizado */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Modal de fuente */
.source-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.source-modal {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.source-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.source-modal-header h3 {
  color: white;
  margin: 0;
  font-size: 18px;
}

.source-modal-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.source-modal-close:hover {
  color: white;
}

.source-modal-body {
  padding: 20px;
}

.source-modal-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.source-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  color: #a5b4fc;
  font-size: 12px;
}

.source-content {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
}

.source-content p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.source-content::-webkit-scrollbar {
  width: 6px;
}

.source-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.source-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.source-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.source-modal-button {
  width: 100%;
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.source-modal-button:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}
</style>