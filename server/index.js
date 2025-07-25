const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const open = require('open');

class AperturaServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupAPI();
  }

  setupMiddleware() {
    // Seguridad básica
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
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

    // Servir archivos estáticos del cliente
    const clientPath = path.join(__dirname, '../client/dist');
    this.app.use(express.static(clientPath));

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
        version: '1.0.0'
      });
    });

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

    // API para IA (futuro)
    this.app.post('/api/ai/chat', (req, res) => {
      res.json({ 
        message: 'API de IA disponible',
        response: 'Funcionalidad de IA pendiente de implementar'
      });
    });

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

module.exports = AperturaServer;