/**
 * Utilidades para obtener favicons de URLs
 */

/**
 * Extrae el dominio de una URL
 */
export function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname
  } catch (error) {
    console.warn('Invalid URL:', url)
    return null
  }
}

/**
 * Genera URL del favicon usando diferentes servicios
 */
export function getFaviconUrl(url, service = 'google') {
  const domain = getDomainFromUrl(url)
  if (!domain) return null

  const services = {
    // Google favicon service (más confiable)
    google: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    
    // DuckDuckGo favicon service
    duckduckgo: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    
    // Favicon.io service
    faviconIO: `https://favicons.githubusercontent.com/${domain}`,
    
    // Directo del dominio
    direct: `https://${domain}/favicon.ico`
  }

  return services[service] || services.google
}

/**
 * Obtiene múltiples URLs de favicon como fallback
 */
export function getFaviconUrls(url) {
  const domain = getDomainFromUrl(url)
  if (!domain) return []

  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://${domain}/favicon.ico`,
    `https://${domain}/apple-touch-icon.png`
  ]
}

/**
 * Verifica si una imagen se puede cargar
 */
export function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    
    // Timeout después de 5 segundos
    setTimeout(() => resolve(false), 5000)
  })
}

/**
 * Obtiene el primer favicon válido de una URL
 */
export async function getValidFavicon(url) {
  const faviconUrls = getFaviconUrls(url)
  
  for (const faviconUrl of faviconUrls) {
    const isValid = await checkImageExists(faviconUrl)
    if (isValid) {
      return faviconUrl
    }
  }
  
  return null
}

/**
 * Composable para manejar favicons en Vue
 */
export function useFavicon() {
  const faviconCache = new Map()

  const getFavicon = async (url) => {
    // Verificar cache
    if (faviconCache.has(url)) {
      return faviconCache.get(url)
    }

    try {
      const faviconUrl = await getValidFavicon(url)
      faviconCache.set(url, faviconUrl)
      return faviconUrl
    } catch (error) {
      console.warn('Error getting favicon for:', url, error)
      faviconCache.set(url, null)
      return null
    }
  }

  const preloadFavicon = (url) => {
    // Precargar favicon sin esperar resultado
    getFavicon(url).catch(() => {})
  }

  const clearCache = () => {
    faviconCache.clear()
  }

  return {
    getFavicon,
    preloadFavicon,
    clearCache,
    faviconCache
  }
}

/**
 * Detecta si una URL es válida
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Normaliza una URL añadiendo https si es necesario
 */
export function normalizeUrl(url) {
  if (!url) return ''
  
  // Si ya tiene protocolo, devolverla tal como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Si no tiene protocolo, añadir https
  return `https://${url}`
}