# 🤖 Configuración de RAG (Retrieval-Augmented Generation)

## Descripción

RAG permite crear un asistente de IA que responde preguntas basándose en tu base de conocimientos. El sistema utiliza embeddings vectoriales para buscar información relevante y OpenAI GPT para generar respuestas contextualizadas.

## Requisitos

1. **API Key de OpenAI** - Necesitas una cuenta en [OpenAI Platform](https://platform.openai.com/)
2. **Node.js 18+** instalado
3. **Base de conocimientos** con al menos algunos registros

## Instalación

### 1. Configurar API Key

Crea un archivo `.env` en el directorio `server/`:

```bash
cd server
cp .env.example .env
```

Edita el archivo `.env` y añade tu API key:

```env
OPENAI_API_KEY=sk-...tu_api_key_aqui...
```

### 2. Instalar dependencias (ya instaladas)

Las dependencias necesarias ya están instaladas:
- `openai` - Cliente de OpenAI
- `langchain` - Framework para aplicaciones LLM
- `@langchain/openai` - Integraciones de OpenAI para LangChain
- `hnswlib-node` - Base de datos vectorial local

### 3. Reiniciar el servidor

```bash
cd server
npm start
```

El servidor detectará automáticamente la API key y habilitará las funciones de RAG.

## Uso

### Chat con IA

1. Haz clic en el botón **🤖 Chat IA** en la interfaz principal
2. Escribe tu pregunta en el chat
3. El asistente buscará información relevante en tu base de conocimientos
4. Recibirás una respuesta contextualizada con las fuentes utilizadas

### Endpoints de API

#### Chat con RAG
```http
POST http://localhost:5000/api/rag/chat
Content-Type: application/json

{
  "query": "Tu pregunta aquí"
}
```

**Respuesta:**
```json
{
  "response": "Respuesta generada por el modelo",
  "sources": [
    {
      "id": 1,
      "titulo": "Título del conocimiento",
      "categoria": "Categoría"
    }
  ],
  "context": [
    {
      "content": "Fragmento del contexto utilizado...",
      "score": 0.85
    }
  ]
}
```

#### Búsqueda Semántica
```http
POST http://localhost:5000/api/rag/search
Content-Type: application/json

{
  "query": "Tu búsqueda",
  "k": 5
}
```

#### Reconstruir Índice
```http
POST http://localhost:5000/api/rag/rebuild-index
```

Úsalo después de añadir muchos conocimientos nuevos para actualizar el índice de búsqueda.

#### Verificar Estado
```http
GET http://localhost:5000/api/rag/status
```

**Respuesta:**
```json
{
  "available": true,
  "configured": true
}
```

## Características

### 🔍 Búsqueda Semántica
- Encuentra información relevante aunque no coincidan las palabras exactas
- Entiende sinónimos y conceptos relacionados
- Ordena resultados por relevancia

### 💬 Generación de Respuestas
- Respuestas en español natural
- Cita las fuentes utilizadas
- Contexto limitado para respuestas precisas

### 📊 Vector Store Local
- Almacenamiento eficiente con HNSWLib
- Búsquedas rápidas incluso con miles de documentos
- Se actualiza automáticamente con nuevos conocimientos

## Optimización

### Mejorar la calidad de respuestas

1. **Añade más conocimientos** - Mientras más información, mejores respuestas
2. **Usa títulos descriptivos** - Ayudan a identificar el contenido
3. **Categoriza bien** - Facilita la búsqueda y contextualización
4. **Incluye palabras clave** - Mejora la precisión de búsqueda

### Costos de OpenAI

- **Embeddings**: ~$0.00002 por 1K tokens (muy económico)
- **Chat GPT-3.5**: ~$0.0015 por 1K tokens de entrada, $0.002 por salida
- **Estimado**: ~$0.01-0.02 por conversación típica

### Límites recomendados

- Máximo 500 tokens por respuesta (configurado)
- 3-5 fragmentos de contexto por consulta
- Reconstruir índice cada 100-200 nuevos conocimientos

## Solución de Problemas

### "RAG Service no disponible"
- Verifica que el archivo `.env` existe y contiene `OPENAI_API_KEY`
- Reinicia el servidor después de añadir la API key

### "Error procesando consulta"
- Verifica que tu API key de OpenAI es válida
- Comprueba tu saldo en OpenAI Platform
- Revisa los logs del servidor para más detalles

### El índice está desactualizado
- Ejecuta la reconstrucción del índice desde el chat o API
- Esto actualizará los embeddings con los últimos conocimientos

## Seguridad

⚠️ **Importante:**
- **Nunca** compartas tu API key de OpenAI
- **Nunca** subas el archivo `.env` a git (ya está en .gitignore)
- Considera usar variables de entorno del sistema en producción
- Limita el acceso a los endpoints de RAG si es necesario

## Próximas Mejoras

- [ ] Soporte para múltiples modelos de IA
- [ ] Caché de respuestas frecuentes
- [ ] Historial de conversaciones
- [ ] Exportación de chats
- [ ] Fine-tuning con datos propios
- [ ] Integración con otros LLMs (Claude, Llama, etc.)

## Recursos

- [Documentación de OpenAI](https://platform.openai.com/docs)
- [LangChain Docs](https://js.langchain.com/)
- [Guía de Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Mejores prácticas de RAG](https://www.pinecone.io/learn/retrieval-augmented-generation/)