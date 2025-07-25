import { defineStore } from 'pinia'

export const useDesktopsStore = defineStore('desktops', {
  state: () => ({
    currentDesktop: 0,
    desktops: [
      {
        id: 0,
        name: 'Trabajo',
        background: '#1e293b',
        links: []
      },
      {
        id: 1,
        name: 'Ocio',
        background: '#0f172a',
        links: []
      }
    ]
  }),

  getters: {
    getCurrentDesktop: (state) => {
      return state.desktops[state.currentDesktop]
    },
    getAllDesktops: (state) => state.desktops
  },

  actions: {
    setCurrentDesktop(index) {
      this.currentDesktop = index
    },

    addDesktop(desktop) {
      const newDesktop = {
        id: Date.now(),
        name: desktop.name || 'Nuevo Escritorio',
        background: desktop.background || '#1e293b',
        links: []
      }
      this.desktops.push(newDesktop)
    },

    removeDesktop(index) {
      if (this.desktops.length > 1) {
        this.desktops.splice(index, 1)
        if (this.currentDesktop >= this.desktops.length) {
          this.currentDesktop = this.desktops.length - 1
        }
      }
    },

    updateDesktop(index, updates) {
      if (this.desktops[index]) {
        Object.assign(this.desktops[index], updates)
      }
    },

    addLink(desktopIndex, link) {
      if (this.desktops[desktopIndex]) {
        this.desktops[desktopIndex].links.push({
          id: Date.now(),
          ...link
        })
      }
    },

    removeLink(desktopIndex, linkId) {
      if (this.desktops[desktopIndex]) {
        const linkIndex = this.desktops[desktopIndex].links.findIndex(link => link.id === linkId)
        if (linkIndex > -1) {
          this.desktops[desktopIndex].links.splice(linkIndex, 1)
        }
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('apertura-desktops', JSON.stringify({
        currentDesktop: this.currentDesktop,
        desktops: this.desktops
      }))
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('apertura-desktops')
      if (saved) {
        const data = JSON.parse(saved)
        this.currentDesktop = data.currentDesktop || 0
        this.desktops = data.desktops || this.desktops
      }
    },

    // Exportar configuración
    exportConfiguration() {
      const config = {
        version: '1.1.0',
        timestamp: new Date().toISOString(),
        data: {
          currentDesktop: this.currentDesktop,
          desktops: this.desktops
        }
      }
      
      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `apertura-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return config
    },

    // Importar configuración
    async importConfiguration(file) {
      try {
        const text = await file.text()
        const config = JSON.parse(text)
        
        // Validar estructura
        if (!config.data || !config.data.desktops) {
          throw new Error('Archivo de configuración inválido')
        }
        
        // Validar versión (opcional, para futuras compatibilidades)
        if (config.version && config.version !== '1.1.0') {
          console.warn(`Importando configuración de versión ${config.version}`)
        }
        
        // Validar que cada escritorio tenga la estructura correcta
        for (const desktop of config.data.desktops) {
          if (!desktop.id || !desktop.name || !Array.isArray(desktop.links)) {
            throw new Error('Estructura de escritorio inválida')
          }
        }
        
        // Importar datos
        this.desktops = config.data.desktops
        this.currentDesktop = Math.min(
          config.data.currentDesktop || 0,
          this.desktops.length - 1
        )
        
        // Guardar en localStorage
        this.saveToLocalStorage()
        
        return {
          success: true,
          message: `Configuración importada: ${config.data.desktops.length} escritorios`,
          timestamp: config.timestamp
        }
        
      } catch (error) {
        return {
          success: false,
          message: `Error importando configuración: ${error.message}`
        }
      }
    },

    // Resetear a configuración por defecto
    resetToDefault() {
      this.currentDesktop = 0
      this.desktops = [
        {
          id: 0,
          name: 'Trabajo',
          background: '#1e293b',
          links: []
        },
        {
          id: 1,
          name: 'Ocio',
          background: '#0f172a',
          links: []
        }
      ]
      this.saveToLocalStorage()
    }
  }
})