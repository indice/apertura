import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import Database from './database.js';
import { ragRoutes, initRAGService } from './rag-routes.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AperturaServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.db = new Database();
    this.init();
  }

  async init() {
    await this.db.init();
    await this.setupMiddleware();
    this.setupRoutes();
    this.setupAPI();

    // Inicializar servicio RAG
    await initRAGService();
  }

  async setupMiddleware() {
    // Seguridad básica
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:", "https:"],
          manifestSrc: ["'self'"]
        }
      }
    }));

    // Compresión
    this.app.use(compression());

    // CORS para desarrollo
    this.app.use(cors());

    // Parser JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Configuración de multer para subida de archivos
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'));
        }
      }
    });

    // Crear directorio de uploads si no existe
    const fs = await import('fs');
    const uploadDir = path.join(__dirname, 'uploads');
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Directorio uploads creado:', uploadDir);
      }
    } catch (error) {
      console.error('⚠️  Error creando directorio uploads:', error);
    }

    // Servir archivos estáticos del cliente
    const clientPath = path.join(__dirname, '../client/dist');
    this.app.use(express.static(clientPath));

    // Servir archivos de uploads
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    console.log('📁 Sirviendo archivos desde:', clientPath);
  }

  setupRoutes() {
    // Ruta principal - siempre servir index.html para SPA
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });

    // Todas las rutas no-API redirigen al index.html (SPA routing)
    this.app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  setupAPI() {
    // API base
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.3.1'
      });
    });

    // === KNOWLEDGE BASE API ===

    // === RUTAS ESPECÍFICAS PRIMERO ===

    // Obtener categorías
    this.app.get('/api/knowledge/categories', async (req, res) => {
      try {
        const categories = await this.db.getCategories();
        res.json(categories);
      } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({ error: 'Error obteniendo categorías' });
      }
    });

    // Buscar conocimientos
    this.app.get('/api/knowledge/search/:query', async (req, res) => {
      try {
        const results = await this.db.searchKnowledge(req.params.query);
        res.json(results);
      } catch (error) {
        console.error('Error buscando conocimientos:', error);
        res.status(500).json({ error: 'Error buscando conocimientos' });
      }
    });

    // Obtener conocimientos por categoría
    this.app.get('/api/knowledge/category/:categoria', async (req, res) => {
      try {
        const knowledge = await this.db.getKnowledgeByCategory(req.params.categoria);
        res.json(knowledge);
      } catch (error) {
        console.error('Error obteniendo conocimientos por categoría:', error);
        res.status(500).json({ error: 'Error obteniendo conocimientos por categoría' });
      }
    });

    // === RUTAS GENERALES DESPUÉS ===

    // Obtener todos los conocimientos
    this.app.get('/api/knowledge', async (req, res) => {
      try {
        const knowledge = await this.db.getAllKnowledge();
        res.json(knowledge);
      } catch (error) {
        console.error('Error obteniendo conocimientos:', error);
        res.status(500).json({ error: 'Error obteniendo conocimientos' });
      }
    });

    // Obtener un conocimiento por ID
    this.app.get('/api/knowledge/:id', async (req, res) => {
      try {
        const knowledge = await this.db.getKnowledgeById(req.params.id);
        if (!knowledge) {
          return res.status(404).json({ error: 'Conocimiento no encontrado' });
        }
        res.json(knowledge);
      } catch (error) {
        console.error('Error obteniendo conocimiento:', error);
        res.status(500).json({ error: 'Error obteniendo conocimiento' });
      }
    });

    // Crear nuevo conocimiento (con subida de imágenes)
    this.app.post('/api/knowledge', this.upload.array('imgs', 5), async (req, res) => {
      try {
        const { titulo, contenido, categoria, pclave, urls } = req.body;

        // Procesar archivos subidos
        const imgs = req.files ? req.files.map(file => `/uploads/${file.filename}`).join(',') : '';

        const knowledgeData = {
          titulo: titulo || null,
          contenido,
          categoria: categoria || null,
          pclave: pclave || null,
          urls: urls || null,
          imgs
        };

        const newKnowledge = await this.db.addKnowledge(knowledgeData);
        res.status(201).json(newKnowledge);
      } catch (error) {
        console.error('Error creando conocimiento:', error);
        res.status(500).json({ error: 'Error creando conocimiento: ' + error.message });
      }
    });

    // Actualizar conocimiento
    this.app.put('/api/knowledge/:id', this.upload.array('imgs', 5), async (req, res) => {
      try {
        const { titulo, contenido, categoria, pclave, urls } = req.body;

        // Procesar archivos subidos (si los hay)
        const imgs = req.files && req.files.length > 0
          ? req.files.map(file => `/uploads/${file.filename}`).join(',')
          : req.body.existingImgs || '';

        const knowledgeData = {
          titulo: titulo || null,
          contenido,
          categoria: categoria || null,
          pclave: pclave || null,
          urls: urls || null,
          imgs
        };

        const updatedKnowledge = await this.db.updateKnowledge(req.params.id, knowledgeData);
        if (updatedKnowledge.changes === 0) {
          return res.status(404).json({ error: 'Conocimiento no encontrado' });
        }
        res.json(updatedKnowledge);
      } catch (error) {
        console.error('Error actualizando conocimiento:', error);
        res.status(500).json({ error: 'Error actualizando conocimiento: ' + error.message });
      }
    });

    // Eliminar conocimiento
    this.app.delete('/api/knowledge/:id', async (req, res) => {
      try {
        const result = await this.db.deleteKnowledge(req.params.id);
        if (result.changes === 0) {
          return res.status(404).json({ error: 'Conocimiento no encontrado' });
        }
        res.json({ message: 'Conocimiento eliminado correctamente' });
      } catch (error) {
        console.error('Error eliminando conocimiento:', error);
        res.status(500).json({ error: 'Error eliminando conocimiento' });
      }
    });

    // Importación masiva de conocimientos
    this.app.post('/api/knowledge/bulk', async (req, res) => {
      try {
        const { data, skipDuplicates } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ error: 'Se requiere un array de datos no vacío' });
        }

        let imported = 0;
        let duplicates = 0;
        let errors = 0;
        const errorDetails = [];

        // Obtener conocimientos existentes si se quieren omitir duplicados
        let existingKnowledge = [];
        if (skipDuplicates) {
          existingKnowledge = await this.db.getAllKnowledge();
        }

        for (let i = 0; i < data.length; i++) {
          try {
            const item = data[i];

            // Validar datos obligatorios
            if (!item.contenido || !item.contenido.trim()) {
              errors++;
              errorDetails.push(`Elemento ${i + 1}: 'contenido' es obligatorio`);
              continue;
            }

            // Verificar duplicados
            if (skipDuplicates) {
              const isDuplicate = existingKnowledge.some(existing => {
                const titleMatch = (existing.titulo || '').toLowerCase() === (item.titulo || '').toLowerCase();
                const contentMatch = existing.contenido.toLowerCase().trim() === item.contenido.toLowerCase().trim();
                return titleMatch && contentMatch;
              });

              if (isDuplicate) {
                duplicates++;
                continue;
              }
            }

            // Procesar el item
            const knowledgeData = {
              titulo: item.titulo?.trim() || null,
              contenido: item.contenido.trim(),
              categoria: item.categoria?.trim() || null,
              pclave: item.pclave?.trim() || null,
              urls: item.urls?.trim() || null,
              imgs: '' // No se soportan imágenes en bulk import
            };

            await this.db.addKnowledge(knowledgeData);
            imported++;

          } catch (itemError) {
            errors++;
            errorDetails.push(`Elemento ${i + 1}: ${itemError.message}`);
          }
        }

        const response = {
          imported,
          duplicates,
          errors,
          total: data.length
        };

        if (errorDetails.length > 0 && errorDetails.length <= 10) {
          response.errorDetails = errorDetails;
        }

        console.log(`📥 Importación masiva completada: ${imported} importados, ${duplicates} duplicados, ${errors} errores`);

        res.json(response);

      } catch (error) {
        console.error('Error en importación masiva:', error);
        res.status(500).json({ error: 'Error en importación masiva: ' + error.message });
      }
    });

    // === OTRAS APIs ===

    // API para configuración (futuro)
    this.app.get('/api/config', (req, res) => {
      res.json({ message: 'API de configuración disponible' });
    });

    // API para widgets (futuro)
    this.app.get('/api/widgets', (req, res) => {
      res.json({
        message: 'API de widgets disponible',
        widgets: []
      });
    });

    // === RAG API ===
    this.app.use('/api/rag', ragRoutes);

    // Manejo de errores API
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({ error: 'Endpoint no encontrado' });
    });
  }

  async start() {
    try {
      const server = this.app.listen(this.port, 'localhost', () => {
        console.log(`🚀 Apertura Server ejecutándose en:`);
        console.log(`   Local: http://localhost:${this.port}`);
        console.log(`   PID: ${process.pid}`);
        console.log(`   Tiempo: ${new Date().toLocaleString()}`);
        
        // Abrir navegador automáticamente
        this.openBrowser();
      });

      // Manejo de cierre elegante
      process.on('SIGTERM', () => {
        console.log('🛑 Cerrando servidor...');
        server.close(() => {
          console.log('✅ Servidor cerrado correctamente');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('🛑 Cerrando servidor...');
        server.close(() => {
          console.log('✅ Servidor cerrado correctamente');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  async openBrowser() {
    try {
      // Esperar un poco para que el servidor esté listo
      setTimeout(async () => {
        await open(`http://localhost:${this.port}`);
        console.log('🌐 Navegador abierto automáticamente');
      }, 1000);
    } catch (error) {
      console.log('⚠️  No se pudo abrir el navegador automáticamente');
      console.log(`   Abre manualmente: http://localhost:${this.port}`);
    }
  }
}

// Iniciar servidor
const server = new AperturaServer();
server.start();

export default AperturaServer;