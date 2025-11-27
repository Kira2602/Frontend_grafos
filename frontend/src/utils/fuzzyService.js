/**
 * Servicio para interactuar con el backend de Lógica Difusa
 * Maneja todas las peticiones HTTP relacionadas con MATLAB Fuzzy Logic Designer
 */

// URL base del backend Flask
const API_BASE_URL = 'http://localhost:5000'

/**
 * Manejo de errores centralizado
 * @param {Error} error - Error capturado
 * @returns {Object} Objeto con información del error
 */
const handleError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    return {
      success: false,
      message: error.response.data.error || 'Error en el servidor',
      status: error.response.status
    }
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    return {
      success: false,
      message: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
      status: 0
    }
  } else {
    // Algo sucedió al configurar la petición
    return {
      success: false,
      message: error.message || 'Error desconocido',
      status: -1
    }
  }
}

/**
 * Lanza MATLAB Fuzzy Logic Designer con el sistema predeterminado
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const launchDefaultFuzzy = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/launch_fuzzy`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al lanzar el sistema predeterminado',
        status: response.status
      }
    }

    return {
      success: true,
      message: data.message || 'Sistema de lógica difusa lanzado correctamente',
      systemName: data.loaded_system,
      source: data.source,
      status: response.status
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Lanza MATLAB Fuzzy Logic Designer con un archivo FIS personalizado
 * @param {File} fisFile - Archivo .fis a cargar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const launchCustomFuzzy = async (fisFile) => {
  try {
    const formData = new FormData()
    formData.append('file', fisFile)

    const response = await fetch(`${API_BASE_URL}/launch_fuzzy`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al cargar el archivo FIS',
        status: response.status
      }
    }

    return {
      success: true,
      message: data.message || 'Sistema de lógica difusa lanzado correctamente',
      systemName: data.loaded_system,
      source: data.source,
      status: response.status
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Prueba la conexión con el backend MATLAB
 * @returns {Promise<Object>} Resultado de la prueba
 */
export const testMatlabConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test_matlab`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al probar la conexión con MATLAB',
        status: response.status
      }
    }

    return {
      success: true,
      message: 'Conexión con MATLAB establecida correctamente',
      result: data.matlab_result,
      status: response.status
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Valida que un archivo sea de tipo .fis
 * @param {File} file - Archivo a validar
 * @returns {Object} Resultado de la validación
 */
export const validateFisFile = (file) => {
  if (!file) {
    return {
      valid: false,
      message: 'No se proporcionó ningún archivo'
    }
  }

  const fileName = file.name.toLowerCase()
  
  if (!fileName.endsWith('.fis')) {
    return {
      valid: false,
      message: 'El archivo debe tener extensión .fis'
    }
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
    }
  }

  return {
    valid: true,
    message: 'Archivo válido'
  }
}

export default {
  launchDefaultFuzzy,
  launchCustomFuzzy,
  testMatlabConnection,
  validateFisFile
}
