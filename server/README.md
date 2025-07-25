# Apertura Server

Servidor Node.js para Apertura - Página de inicio personalizable que se ejecuta localmente.

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática
```bash
# Ejecuta desde la raíz del proyecto
install.bat
```

### Opción 2: Instalación Manual
```bash
# 1. Instalar dependencias
cd server
npm install

# 2. Construir cliente
cd ../client
npm run build

# 3. Iniciar servidor
cd ../server
npm start
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con recarga automática

# Producción
npm start           # Iniciar servidor
npm run build       # Construir cliente
npm run build-exe   # Crear ejecutable .exe

# Servicio Windows
npm run install-service    # Instalar como servicio
npm run uninstall-service  # Desinstalar servicio
```

## 🖥️ Como Servicio de Windows

### Instalar
```bash
cd server
node install-service.js
```

### Desinstalar
```bash
cd server
node uninstall-service.js
```

### Características del Servicio
- ✅ Se inicia automáticamente con Windows
- ✅ Se ejecuta en segundo plano
- ✅ Reinicio automático si falla
- ✅ Se ejecuta en `http://localhost:5000`

## 📁 Estructura del Servidor

```
server/
├── index.js              # Servidor principal
├── package.json           # Dependencias
├── install-service.js     # Instalador de servicio
├── uninstall-service.js   # Desinstalador de servicio
├── start.bat             # Script de inicio manual
└── build.bat             # Script de build completo
```

## 🔌 API Endpoints

### Disponibles
- `GET /api/health` - Estado del servidor
- `GET /api/config` - Configuración (preparado)
- `GET /api/widgets` - Widgets (preparado)
- `POST /api/ai/chat` - IA Chat (preparado)

### Futuras Expansiones
El servidor está preparado para:
- 🧠 **IA**: Integración con modelos de lenguaje
- 🔧 **Widgets**: Widgets personalizables
- ⚙️ **Configuración**: Sync entre dispositivos
- 📊 **Analytics**: Métricas de uso
- 🔄 **Sync**: Sincronización cloud

## 🛠️ Desarrollo

### Añadir Nueva Funcionalidad
1. Añade rutas en `setupAPI()` en `index.js`
2. Crea nuevos endpoints según necesites
3. El cliente ya está preparado para consumir APIs

### Ejemplo: Añadir Widget del Tiempo
```javascript
// En setupAPI()
this.app.get('/api/weather', async (req, res) => {
  // Lógica del widget del tiempo
  res.json({ temperature: 22, condition: 'sunny' });
});
```

## 🔒 Seguridad

- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting (futuro)
- ✅ Solo acceso local por defecto

## 📊 Monitoreo

El servidor incluye:
- Logs automáticos
- Health check endpoint
- Manejo de errores
- Cierre elegante