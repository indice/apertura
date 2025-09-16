import express from 'express';
import RAGService from './rag-service.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let ragService = null;

// Inicializar RAG Service
const initRAGService = async () => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY no configurada. RAG no estará disponible.');
      return false;
    }

    ragService = new RAGService(apiKey);
    await ragService.initializeVectorStore();
    console.log('✅ RAG Service inicializado');
    return true;
  } catch (error) {
    console.error('Error inicializando RAG Service:', error);
    return false;
  }
};

// Middleware para verificar que RAG está disponible
const requireRAG = (req, res, next) => {
  if (!ragService) {
    return res.status(503).json({
      error: 'RAG Service no disponible. Configure OPENAI_API_KEY en el archivo .env'
    });
  }
  next();
};

// Endpoint para chat con RAG
router.post('/chat', requireRAG, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query es requerido' });
    }

    const result = await ragService.chat(query);
    res.json(result);
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({
      error: 'Error procesando consulta',
      details: error.message
    });
  }
});

// Endpoint para búsqueda semántica
router.post('/search', requireRAG, async (req, res) => {
  try {
    const { query, k = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query es requerido' });
    }

    const results = await ragService.search(query, k);
    res.json({ results });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      error: 'Error en búsqueda',
      details: error.message
    });
  }
});

// Endpoint para reconstruir índice
router.post('/rebuild-index', requireRAG, async (req, res) => {
  try {
    await ragService.rebuildVectorStore();
    res.json({ message: 'Índice reconstruido exitosamente' });
  } catch (error) {
    console.error('Error reconstruyendo índice:', error);
    res.status(500).json({
      error: 'Error reconstruyendo índice',
      details: error.message
    });
  }
});

// Endpoint para verificar estado
router.get('/status', (req, res) => {
  res.json({
    available: !!ragService,
    configured: !!process.env.OPENAI_API_KEY
  });
});

export { router as ragRoutes, initRAGService };