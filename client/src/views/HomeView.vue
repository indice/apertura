<template>
  <div class="app-container">
    <!-- Header con botones de acción -->
    <header class="header">
      <div class="header-buttons">
        <button
          @click="openAddLink(currentDesktopIndex)"
          class="btn btn-glass"
        >
          + Añadir enlace
        </button>
        <button
          @click="showSettings = true"
          class="btn btn-glass"
        >
          ⚙️ Configurar
        </button>
      </div>
    </header>

    <!-- Contenedor de slides -->
    <div class="slides-container">
      <div 
        class="slides-wrapper"
        :style="{ transform: `translateX(-${currentDesktopIndex * 100}%)` }"
      >
        <!-- Cada escritorio como un slide -->
        <div
          v-for="(desktop, index) in desktops"
          :key="desktop.id"
          class="slide"
          :style="{ background: desktop.background }"
        >
          <div class="desktop-content">
            <div class="desktop-header">
              <h1 class="desktop-title">{{ desktop.name }}</h1>
              <p class="desktop-subtitle">Tu página de inicio personalizada</p>
            </div>

            <!-- Grid de enlaces con drag and drop -->
            <Draggable
              :list="desktop.links"
              :group="{ name: 'links', pull: true, put: true }"
              item-key="id"
              class="links-grid"
              @change="onLinkDrop($event, index)"
            >
              <template #item="{ element: link }">
                <div
                  class="link-card"
                  @contextmenu="showContextMenu($event, link, index)"
                >
                  <a
                    :href="link.url"
                    target="_blank"
                    class="link-item"
                    @click="handleLinkClick($event, link)"
                  >
                    <div class="link-icon">
                      <img 
                        v-if="link.faviconUrl" 
                        :src="link.faviconUrl" 
                        @error="handleIconError(link)"
                        :alt="`${link.name} favicon`"
                        class="favicon-img"
                      />
                      <span v-else class="emoji-icon">{{ link.icon || '🔗' }}</span>
                    </div>
                    <div class="link-name">{{ link.name }}</div>
                  </a>
                </div>
              </template>
            </Draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación -->
    <div class="navigation">
      <div class="nav-container">
        <!-- Botón anterior -->
        <button
          v-if="currentDesktopIndex > 0"
          @click="previousDesktop"
          class="nav-button"
        >
          ‹
        </button>
        
        <!-- Indicadores de puntos -->
        <div class="nav-dots">
          <button
            v-for="(desktop, index) in desktops"
            :key="desktop.id"
            @click="goToDesktop(index)"
            :class="{ active: currentDesktopIndex === index }"
            class="nav-dot"
          ></button>
        </div>
        
        <!-- Botón siguiente -->
        <button
          v-if="currentDesktopIndex < desktops.length - 1"
          @click="nextDesktop"
          class="nav-button"
        >
          ›
        </button>
      </div>
    </div>

    <!-- Modal para añadir enlace -->
    <LinkModal
      v-if="showAddLink"
      :editing-link="editingLink"
      @close="showAddLink = false"
      @add="addLink"
    />

    <!-- Modal para añadir escritorio -->
    <DesktopModal
      v-if="showAddDesktop"
      @close="showAddDesktop = false"
      @add="addDesktop"
    />

    <!-- Panel de configuración -->
    <SidePanel
      :is-open="showSettings"
      :desktop="currentDesktop"
      :all-desktops="desktops"
      :current-desktop-index="currentDesktopIndex"
      @close="showSettings = false"
      @update="updateDesktop"
      @switch-desktop="goToDesktop"
      @remove-desktop="removeDesktop"
      @add-desktop="showAddDesktop = true"
      @update-navigation="updateNavigationSettings"
    />

    <!-- Menú contextual -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ 
        left: contextMenu.x + 'px', 
        top: contextMenu.y + 'px' 
      }"
      @click.stop
    >
      <button 
        @click="editLink"
        class="context-menu-item"
      >
        ✏️ Editar
      </button>
      <div 
        v-if="desktops.length > 1"
        class="context-menu-submenu"
      >
        <button 
          @click="toggleMoveSubmenu"
          class="context-menu-item context-menu-submenu-trigger"
        >
          📁 Mover a...
          <span class="submenu-arrow">
            {{ contextMenu.showMoveSubmenu ? '▼' : '▶' }}
          </span>
        </button>
        <div 
          v-if="contextMenu.showMoveSubmenu"
          class="context-submenu"
        >
          <button 
            v-for="(desktop, index) in desktops"
            :key="desktop.id"
            @click="moveLink(index)"
            :disabled="index === contextMenu.desktopIndex"
            class="context-menu-item"
            :class="{ 
              'context-menu-item--disabled': index === contextMenu.desktopIndex
            }"
          >
            {{ desktop.name }}
            <span v-if="index === contextMenu.desktopIndex" class="current-indicator">
              (actual)
            </span>
          </button>
        </div>
      </div>
      <button 
        @click="deleteLink"
        class="context-menu-item context-menu-item--danger"
      >
        🗑️ Eliminar
      </button>
    </div>

    <!-- Overlay para cerrar menú contextual -->
    <div
      v-if="contextMenu.show"
      class="context-menu-overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useDesktopsStore } from '../stores/desktops'
import LinkModal from '../components/LinkModal.vue'
import DesktopModal from '../components/DesktopModal.vue'
import SidePanel from '../components/SidePanel.vue'
import Draggable from 'vuedraggable' // <-- Importa vuedraggable

export default {
  name: 'HomeView',
  components: {
    LinkModal,
    DesktopModal,
    SidePanel,
    Draggable // <-- Añade Draggable
  },
  setup() {
    const store = useDesktopsStore()
    const showAddLink = ref(false)
    const showAddDesktop = ref(false)
    const showSettings = ref(false)
    const targetDesktopIndex = ref(0)
    const editingLink = ref(null)
    
    // Menú contextual
    const contextMenu = ref({
      show: false,
      x: 0,
      y: 0,
      link: null,
      desktopIndex: null,
      showMoveSubmenu: false
    })

    const currentDesktop = computed(() => store.getCurrentDesktop)
    const desktops = computed(() => store.getAllDesktops)
    const currentDesktopIndex = computed(() => store.currentDesktop)

    const goToDesktop = (index) => {
      store.setCurrentDesktop(index)
      store.saveToLocalStorage()
    }

    const nextDesktop = () => {
      if (store.currentDesktop < desktops.value.length - 1) {
        goToDesktop(store.currentDesktop + 1)
      }
    }

    const previousDesktop = () => {
      if (store.currentDesktop > 0) {
        goToDesktop(store.currentDesktop - 1)
      }
    }

    const openAddLink = (desktopIndex) => {
      targetDesktopIndex.value = desktopIndex
      showAddLink.value = true
    }

    const addLink = (link) => {
      if (editingLink.value) {
        // Editando enlace existente
        const linkIndex = store.desktops[targetDesktopIndex.value].links.findIndex(l => l.id === editingLink.value.id)
        if (linkIndex > -1) {
          store.desktops[targetDesktopIndex.value].links[linkIndex] = {
            ...link,
            id: editingLink.value.id
          }
          store.saveToLocalStorage()
        }
        editingLink.value = null
      } else {
        // Añadiendo nuevo enlace
        store.addLink(targetDesktopIndex.value, link)
        store.saveToLocalStorage()
      }
      showAddLink.value = false
    }

    const removeLink = (desktopIndex, linkId) => {
      store.removeLink(desktopIndex, linkId)
      store.saveToLocalStorage()
    }

    const addDesktop = (desktop) => {
      store.addDesktop(desktop)
      store.saveToLocalStorage()
      showAddDesktop.value = false
    }

    const updateDesktop = (updates) => {
      store.updateDesktop(store.currentDesktop, updates)
      store.saveToLocalStorage()
    }

    const removeDesktop = (index) => {
      store.removeDesktop(index)
      store.saveToLocalStorage()
    }

    const updateNavigationSettings = (settings) => {
      // Guardar configuración de navegación y configurar listeners
      if (settings.browserNavigation) {
        setupBrowserNavigation()
      } else {
        removeBrowserNavigation()
      }
      
      if (settings.keyboardNavigation) {
        setupKeyboardNavigation()
      } else {
        removeKeyboardNavigation()
      }
    }

    const handleIconError = (link) => {
      // Si falla cargar el favicon, remover la URL del favicon
      // para que se muestre el emoji fallback
      const desktopIndex = store.currentDesktop
      const linkIndex = store.desktops[desktopIndex].links.findIndex(l => l.id === link.id)
      if (linkIndex > -1) {
        store.desktops[desktopIndex].links[linkIndex].faviconUrl = null
        store.saveToLocalStorage()
      }
    }

    // Manejo del menú contextual
    const showContextMenu = (event, link, desktopIndex) => {
      event.preventDefault()
      contextMenu.value = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        link: link,
        desktopIndex: desktopIndex,
        showMoveSubmenu: false
      }
    }

    const hideContextMenu = () => {
      contextMenu.value.show = false
      contextMenu.value.showMoveSubmenu = false
    }

    const toggleMoveSubmenu = () => {
      const newState = !contextMenu.value.showMoveSubmenu
      console.log(`📁 ${newState ? 'Abriendo' : 'Cerrando'} submenú de mover`)
      contextMenu.value.showMoveSubmenu = newState
    }

    const handleLinkClick = (event, link) => {
      // Si hay menú contextual abierto, cerrarlo
      if (contextMenu.value.show) {
        event.preventDefault()
        hideContextMenu()
      }
    }

    const editLink = () => {
      editingLink.value = contextMenu.value.link
      targetDesktopIndex.value = contextMenu.value.desktopIndex
      showAddLink.value = true
      hideContextMenu()
    }

    const deleteLink = () => {
      removeLink(contextMenu.value.desktopIndex, contextMenu.value.link.id)
      hideContextMenu()
    }

    const moveLink = (targetDesktopIndex) => {
      console.log('🔄 Intentando mover enlace:', {
        targetDesktopIndex,
        sourceDesktopIndex: contextMenu.value.desktopIndex,
        link: contextMenu.value.link,
        desktopsCount: desktops.value.length
      })
      
      if (targetDesktopIndex === contextMenu.value.desktopIndex) {
        console.log('❌ No se puede mover: mismo escritorio')
        return
      }
      
      const link = contextMenu.value.link
      const sourceDesktopIndex = contextMenu.value.desktopIndex
      
      try {
        // Añadir enlace al escritorio destino
        console.log('➕ Añadiendo enlace al escritorio destino:', targetDesktopIndex)
        store.addLink(targetDesktopIndex, link)
        
        // Remover enlace del escritorio origen
        console.log('➖ Removiendo enlace del escritorio origen:', sourceDesktopIndex)
        store.removeLink(sourceDesktopIndex, link.id)
        
        store.saveToLocalStorage()
        console.log('✅ Enlace movido exitosamente')
        hideContextMenu()
      } catch (error) {
        console.error('❌ Error moviendo enlace:', error)
      }
    }

    // Drag and drop entre escritorios
    const onLinkDrop = (event, desktopIndex) => {
      // Si el enlace viene de otro escritorio
      if (event.added) {
        const { element } = event.added
        // Remueve el enlace del escritorio origen
        desktops.value.forEach((desk, idx) => {
          if (idx !== desktopIndex) {
            const i = desk.links.findIndex(l => l.id === element.id)
            if (i > -1) {
              store.desktops[idx].links.splice(i, 1)
            }
          }
        })
        // Añade el enlace al escritorio destino (ya lo hace vuedraggable)
        store.saveToLocalStorage()
      }
      // Si solo se reordenó dentro del mismo escritorio
      if (event.moved) {
        store.saveToLocalStorage()
      }
    }

    // Variables para navegación
    let popstateHandler = null
    let keydownHandler = null

    // Navegación con botones del navegador
    const setupBrowserNavigation = () => {
      if (popstateHandler) return // Ya está configurado
      
      console.log('🌐 Configurando navegación del navegador...')
      
      // Limpiar historial existente y crear uno nuevo
      const currentUrl = window.location.href.split('#')[0] // Remover hash si existe
      
      // Reemplazar el estado actual
      window.history.replaceState({ desktopIndex: 0 }, '', currentUrl)
      
      // Crear una entrada de historial para cada escritorio
      desktops.value.forEach((desktop, index) => {
        if (index > 0) { // No crear para el primero (ya está en replaceState)
          const state = { desktopIndex: index }
          const url = `${currentUrl}#desktop-${index}`
          window.history.pushState(state, '', url)
          console.log(`📋 Creada entrada de historial para: ${desktop.name} (índice ${index})`)
        }
      })
      
      // Volver al escritorio actual
      const currentDesktopIndex = store.currentDesktop
      if (currentDesktopIndex > 0) {
        // Navegar hacia atrás hasta el escritorio actual
        const stepsBack = desktops.value.length - 1 - currentDesktopIndex
        if (stepsBack > 0) {
          window.history.go(-stepsBack)
        }
      }
      
      popstateHandler = (event) => {
        if (event.state && typeof event.state.desktopIndex === 'number') {
          const targetIndex = event.state.desktopIndex
          console.log(`🔄 Navegando a escritorio ${targetIndex} via historial del navegador`)
          if (targetIndex >= 0 && targetIndex < desktops.value.length) {
            store.setCurrentDesktop(targetIndex)
            store.saveToLocalStorage()
          }
        }
      }
      
      window.addEventListener('popstate', popstateHandler)
      console.log('✅ Navegación del navegador configurada')
    }

    const removeBrowserNavigation = () => {
      if (popstateHandler) {
        window.removeEventListener('popstate', popstateHandler)
        popstateHandler = null
      }
    }

    // Navegación con teclado
    const setupKeyboardNavigation = () => {
      if (keydownHandler) return // Ya está configurado
      
      keydownHandler = (event) => {
        // Solo si no estamos escribiendo en un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return
        }
        
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          previousDesktop()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          nextDesktop()
        }
      }
      
      document.addEventListener('keydown', keydownHandler)
    }

    const removeKeyboardNavigation = () => {
      if (keydownHandler) {
        document.removeEventListener('keydown', keydownHandler)
        keydownHandler = null
      }
    }


    // Modificar goToDesktop para funcionar con navegación del navegador
    const originalGoToDesktop = goToDesktop
    const enhancedGoToDesktop = (index) => {
      originalGoToDesktop(index)
      
      // Si la navegación del navegador está habilitada, navegar en el historial
      const navigationSettings = JSON.parse(localStorage.getItem('apertura-navigation-settings') || '{}')
      if (navigationSettings.browserNavigation) {
        // En lugar de crear nuevas entradas, navegar por el historial existente
        const currentIndex = store.currentDesktop
        const stepsToMove = currentIndex - index
        
        if (stepsToMove !== 0) {
          console.log(`🔄 Navegando ${stepsToMove} pasos en el historial (de ${currentIndex} a ${index})`)
          window.history.go(stepsToMove)
        }
      }
    }

    onMounted(() => {
      store.loadFromLocalStorage()
      
      // Cargar configuración de navegación y configurar listeners
      const savedSettings = localStorage.getItem('apertura-navigation-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        updateNavigationSettings(settings)
      } else {
        // Configuración por defecto: navegación con teclado habilitada
        updateNavigationSettings({ 
          keyboardNavigation: true, 
          browserNavigation: false
        })
      }
      
      // Cerrar menú contextual al hacer click en cualquier lugar
      document.addEventListener('click', hideContextMenu)
    })

    onBeforeUnmount(() => {
      // Limpiar todos los event listeners
      removeBrowserNavigation()
      removeKeyboardNavigation()
      document.removeEventListener('click', hideContextMenu)
    })

    return {
      currentDesktop,
      desktops,
      currentDesktopIndex,
      showAddLink,
      showAddDesktop,
      showSettings,
      contextMenu,
      editingLink,
      goToDesktop: enhancedGoToDesktop,
      nextDesktop,
      previousDesktop,
      openAddLink,
      addLink,
      removeLink,
      addDesktop,
      updateDesktop,
      removeDesktop,
      updateNavigationSettings,
      handleIconError,
      showContextMenu,
      hideContextMenu,
      toggleMoveSubmenu,
      handleLinkClick,
      editLink,
      deleteLink,
      moveLink,
      onLinkDrop
    }
  }
}
</script>