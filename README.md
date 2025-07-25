# 🌅 Apertura

Una página de inicio web minimalista, personalizable y extensible diseñada para reemplazar la página de inicio por defecto de tu navegador. Con soporte para múltiples escritorios, drag & drop, y un servidor local completo.

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

</div>

## 📋 Índice

- [🌅 Apertura](#-apertura)
  - [📋 Índice](#-índice)
  - [✨ Características](#-características)
  - [🎯 ¿Para qué es?](#-para-qué-es)
  - [🚀 Instalación Rápida](#-instalación-rápida)
  - [🛠️ Stack Tecnológico](#️-stack-tecnológico)
  - [📁 Estructura del Proyecto](#-estructura-del-proyecto)
  - [⚙️ Configuración Manual](#️-configuración-manual)
  - [🎮 Uso](#-uso)
  - [🔌 API](#-api)
  - [🎨 Personalización](#-personalización)
  - [🔮 Roadmap](#-roadmap)
  - [🤝 Contribuir](#-contribuir)
  - [📄 Licencia](#-licencia)

## ✨ Características

### 🖥️ **Escritorios Múltiples**
- Sistema de escritorios independientes (Trabajo, Ocio, Proyectos, etc.)
- Navegación intuitiva con flechas y puntos indicadores
- Drag & drop para reordenar escritorios

### 🎨 **Personalización Completa**
- Fondos personalizables por escritorio (colores sólidos y gradientes)
- Paleta de colores predefinida
- Input de color personalizado
- Interfaz adaptable y responsive

### 🔗 **Gestión de Enlaces**
- Añadir enlaces con favicons automáticos
- Drag & drop para reordenar enlaces
- Mover enlaces entre escritorios
- Menú contextual con opciones avanzadas

### 🖱️ **Navegación Avanzada**
- Navegación con teclado (teclas ← →)
- Navegación con botones del navegador (Mouse4/Mouse5)
- Historial de navegación integrado

### 💾 **Almacenamiento Local**
- Datos guardados en localStorage
- Sin necesidad de cuenta o registro
- Totalmente privado y offline

### 🖥️ **Servidor Local**
- Servidor Node.js completo incluido
- Ejecutable como servicio de Windows
- Puerto 5000 por defecto
- API REST preparada para expansiones

## 🎯 ¿Para qué es?

Apertura está diseñada para usuarios que quieren:

- **🏠 Reemplazar la página de inicio** del navegador con algo más útil y personalizado
- **📊 Organizar enlaces** por categorías (trabajo, ocio, herramientas, etc.)
- **⚡ Acceso rápido** a sitios web frecuentes con una interfaz limpia
- **🎨 Personalización visual** que se adapte a sus gustos
- **🔒 Privacidad total** sin sincronización en la nube (opcional)
- **🚀 Extensibilidad** para futuras funcionalidades (IA, widgets, etc.)

## 🚀 Instalación Rápida

### Prerequisitos
- [Node.js](https://nodejs.org/) (v16 o superior)
- Windows 10/11 (para servicio automático)

### Opción 1: Instalación Automática (Recomendada)

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/apertura.git
cd apertura

# 2. Ejecuta el instalador
install.bat
```

El instalador se encargará de:
- ✅ Instalar dependencias del cliente y servidor
- ✅ Construir la aplicación para producción
- ✅ Configurar el servicio de Windows (opcional)
- ✅ Abrir la aplicación en tu navegador

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias del cliente
cd client
npm install
npm run build

# 2. Instalar dependencias del servidor
cd ../server
npm install

# 3. Iniciar servidor
npm start
```

### 📱 Acceso
Una vez instalado, accede a: **http://localhost:5000**

## 🛠️ Stack Tecnológico

### Frontend
- **⚡ Vite** - Build tool y dev server ultrarrápido
- **🎨 Vue 3** - Framework progresivo para interfaces
- **💎 Tailwind CSS** - Framework CSS utility-first
- **📦 Pinia** - State management para Vue
- **🧭 Vue Router** - Enrutador oficial de Vue
- **🖱️ VueDraggable** - Componentes drag & drop

### Backend
- **🟢 Node.js** - Runtime de JavaScript
- **🚂 Express** - Framework web minimalista
- **🔒 Helmet** - Middleware de seguridad
- **🌐 CORS** - Cross-Origin Resource Sharing
- **📦 Compression** - Compresión gzip

### Herramientas
- **🔧 node-windows** - Servicios de Windows
- **📦 pkg** - Generador de ejecutables
- **🔄 nodemon** - Recarga automática en desarrollo

## 📁 Estructura del Proyecto

```
apertura/
├── 📁 client/                    # Aplicación Vue.js
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes Vue
│   │   ├── 📁 views/             # Vistas principales
│   │   ├── 📁 stores/            # Stores de Pinia
│   │   └── 📁 assets/            # Recursos estáticos
│   ├── 📄 package.json
│   └── ⚙️ vite.config.js
├── 📁 server/                    # Servidor Node.js
│   ├── 📄 index.js               # Servidor principal
│   ├── 📄 install-service.js     # Instalador de servicio
│   ├── 📄 package.json
│   └── 📄 README.md
├── 📄 install.bat                # Instalador automático
└── 📄 README.md                  # Este archivo
```

## ⚙️ Configuración Manual

### Como Aplicación de Escritorio

```bash
# Instalar como servicio de Windows
cd server
node install-service.js

# Desinstalar servicio
node uninstall-service.js
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Cliente con hot-reload
npm run dev          # Servidor con nodemon

# Producción
npm run build        # Construir cliente
npm start           # Iniciar servidor
npm run build-exe   # Crear ejecutable

# Servicio
npm run install-service      # Instalar como servicio
npm run uninstall-service    # Desinstalar servicio
```

### Variables de Entorno

```bash
PORT=5000           # Puerto del servidor (default: 5000)
NODE_ENV=production # Entorno de ejecución
```

## 🎮 Uso

### 🖥️ **Gestión de Escritorios**
1. **Crear**: Click en "⚙️ Configurar" → "➕ Escritorio"
2. **Reordenar**: Arrastra los escritorios por el handle `⋮⋮`
3. **Navegar**: Usa las flechas, puntos, o botones del mouse
4. **Personalizar**: Cambia nombre y fondo de cada escritorio

### 🔗 **Gestión de Enlaces**
1. **Añadir**: Click en "➕ Añadir enlace" en el header
2. **Reordenar**: Arrastra los enlaces a la posición deseada
3. **Mover**: Arrastra enlaces entre escritorios diferentes
4. **Editar**: Click derecho → "✏️ Editar"
5. **Eliminar**: Click derecho → "🗑️ Eliminar"

### 🖱️ **Navegación**
- **Teclado**: `←` `→` para cambiar escritorios
- **Mouse**: Botones laterales del mouse (si están configurados)
- **Navegador**: Botones atrás/adelante (si está habilitado)
- **Touch**: Gestos táctiles en dispositivos móviles

## 🔌 API

El servidor incluye una API REST preparada para expansiones:

### Endpoints Disponibles

```bash
GET  /api/health      # Estado del servidor
GET  /api/config      # Configuración (preparado)
GET  /api/widgets     # Widgets (preparado)
POST /api/ai/chat     # Chat IA (preparado)
```

### Ejemplo de Uso

```javascript
// Verificar estado del servidor
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Respuesta:
// {
//   "status": "ok",
//   "timestamp": "2024-01-01T12:00:00.000Z",
//   "version": "1.0.0"
// }
```

## 🎨 Personalización

### 🎨 **Temas de Color**
- Paleta predefinida de 20 colores
- Input de color personalizado
- Soporte para códigos hex (#ff0000)
- 6 gradientes prediseñados

### 🖼️ **Fondos**
- Colores sólidos
- Gradientes lineales
- Fácil extensión para imágenes (futuro)

### 🔧 **Configuración**
- Navegación con teclado (on/off)
- Navegación con navegador (on/off)
- Configuración persistente en localStorage

## 🔮 Roadmap

### v1.1 - Widgets
- [ ] Widget del clima
- [ ] Widget de noticias
- [ ] Widget de reloj
- [ ] Widget de notas

### v1.2 - IA
- [ ] Asistente virtual integrado
- [ ] Sugerencias de enlaces
- [ ] Búsqueda inteligente
- [ ] Comandos por voz

### v1.3 - Sync
- [ ] Sincronización en la nube
- [ ] Múltiples dispositivos
- [ ] Backup automático
- [ ] Import/Export de configuración

### v1.4 - Extensiones
- [ ] Sistema de plugins
- [ ] Temas personalizables
- [ ] Widgets de terceros
- [ ] API pública

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres contribuir:

1. **Fork** del repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -am 'Añadir nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abre** un Pull Request

### 🐛 Reportar Bugs
Usa el [sistema de issues](https://github.com/tu-usuario/apertura/issues) para reportar bugs o solicitar features.

### 💡 Ideas y Sugerencias
¿Tienes una idea genial? ¡Compártela en las [discussions](https://github.com/tu-usuario/apertura/discussions)!

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**¿Te gusta Apertura?** ⭐ Dale una estrella al repositorio

Hecho con ❤️ y ☕ por [Tu nombre](https://github.com/tu-usuario)

</div>