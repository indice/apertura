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
    }
  }
})