<template>
  <div class="app-container">
    <!-- Header con botones de acción -->
    <header class="header">
      <div class="header-buttons">
        <button
          @click="showAddDesktop = true"
          class="btn btn-glass"
        >
          + Escritorio
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

            <!-- Grid de enlaces -->
            <div class="links-grid">
              <div
                v-for="link in desktop.links"
                :key="link.id"
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

              <!-- Botón para añadir enlace -->
              <button
                @click="openAddLink(index)"
                class="link-item link-add"
              >
                <div class="link-icon">+</div>
                <div class="link-name">Añadir enlace</div>
              </button>
            </div>
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

    <!-- Modal de configuración -->
    <SettingsModal
      v-if="showSettings"
      :desktop="currentDesktop"
      @close="showSettings = false"
      @update="updateDesktop"
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
          class="context-menu-item"
        >
          📁 Mover a...
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
            :class="{ 'context-menu-item--disabled': index === contextMenu.desktopIndex }"
          >
            {{ desktop.name }}
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
import { computed, ref, onMounted } from 'vue'
import { useDesktopsStore } from '../stores/desktops'
import LinkModal from '../components/LinkModal.vue'
import DesktopModal from '../components/DesktopModal.vue'
import SettingsModal from '../components/SettingsModal.vue'

export default {
  name: 'HomeView',
  components: {
    LinkModal,
    DesktopModal,
    SettingsModal
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
      showSettings.value = false
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
      contextMenu.value.showMoveSubmenu = !contextMenu.value.showMoveSubmenu
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
      if (targetDesktopIndex === contextMenu.value.desktopIndex) return
      
      const link = contextMenu.value.link
      const sourceDesktopIndex = contextMenu.value.desktopIndex
      
      // Añadir enlace al escritorio destino
      store.addLink(targetDesktopIndex, link)
      
      // Remover enlace del escritorio origen
      store.removeLink(sourceDesktopIndex, link.id)
      
      store.saveToLocalStorage()
      hideContextMenu()
    }

    onMounted(() => {
      store.loadFromLocalStorage()
      
      // Cerrar menú contextual al hacer click en cualquier lugar
      document.addEventListener('click', hideContextMenu)
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
      goToDesktop,
      nextDesktop,
      previousDesktop,
      openAddLink,
      addLink,
      removeLink,
      addDesktop,
      updateDesktop,
      handleIconError,
      showContextMenu,
      hideContextMenu,
      toggleMoveSubmenu,
      handleLinkClick,
      editLink,
      deleteLink,
      moveLink
    }
  }
}
</script>