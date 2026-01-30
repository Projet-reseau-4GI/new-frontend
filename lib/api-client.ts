/**
 * Client API centralisé pour toutes les communications avec le backend.
 * Utilise les routes proxy Next.js pour contourner les restrictions CORS.
 *
 * @author Thomas Djotio Ndié
 * @date 24.01.26
 */

const API_BASE_URL = "/api"

/**
 * Types d'erreurs API
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

/**
 * Configuration des options de requête
 */
interface RequestOptions extends RequestInit {
  withAuth?: boolean
}

/**
 * Effectue une requête API avec gestion centralisée des erreurs et de l'auth
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    withAuth = true,
    headers = {},
    ...init
  } = options

  const url = `${API_BASE_URL}${endpoint}`
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  // Ajouter le token d'authentification si disponible
  if (withAuth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

  console.log(`[v0] API Request: ${init.method || "GET"} ${endpoint}`)

  try {
    const response = await fetch(url, {
      ...init,
      headers: requestHeaders,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorCode = data.code || "UNKNOWN_ERROR"
      const errorMessage = data.message || `HTTP ${response.status}`
      console.error(`[v0] API Error: ${errorCode} - ${errorMessage}`)
      throw new APIError(response.status, errorCode, errorMessage)
    }

    console.log(`[v0] API Success: ${endpoint}`)
    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Erreur réseau"
    console.error(`[v0] Network Error: ${message}`)
    throw new APIError(0, "NETWORK_ERROR", message)
  }
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Inscription utilisateur
   * POST /api/auth/register
   */
  register: async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    const response = await apiRequest<{
      message: string
      userId?: string
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }),
      withAuth: false,
    })
    return response
  },

  /**
   * Connexion utilisateur
   * POST /api/auth/login
   */
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      message: string
      token: string
      user?: {
        id: string
        email: string
        first_name: string
        last_name: string
      }
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      withAuth: false,
    })

    // Stocker le token
    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }

    return response
  },

  /**
   * Récupérer l'URL de connexion Google
   * GET /api/auth/google/url
   */
  getGoogleAuthUrl: async () => {
    const response = await apiRequest<{
      authorizationUrl: string
    }>("/auth/google/url", {
      method: "GET",
      withAuth: false,
    })
    return response
  },

  /**
   * Callback Google après authentification
   * POST /api/auth/google/callback
   */
  handleGoogleCallback: async (code: string) => {
    const response = await apiRequest<{
      message: string
      token: string
      user?: {
        id: string
        email: string
        first_name: string
        last_name: string
      }
    }>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
      withAuth: false,
    })

    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }

    return response
  },

  /**
   * Vérifier un code OTP
   * POST /api/auth/verify-code
   */
  verifyCode: async (email: string, code: string) => {
    const response = await apiRequest<{
      message: string
      token?: string
    }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      withAuth: false,
    })

    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }

    return response
  },

  /**
   * Demander un reset de mot de passe
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string) => {
    const response = await apiRequest<{
      message: string
    }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      withAuth: false,
    })
    return response
  },

  /**
   * Stocker le token localement
   */
  setToken: (token: string) => {
    localStorage.setItem("auth_token", token)
  },

  /**
   * Récupérer le token stocké
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  },

  /**
   * Supprimer le token (déconnexion)
   */
  clearToken: () => {
    localStorage.removeItem("auth_token")
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("auth_token")
  },
}

/**
 * Service de gestion des utilisateurs
 */
export const userService = {
  /**
   * Trouver un utilisateur par email
   * GET /api/users/find-id
   */
  findByEmail: async (email: string) => {
    const response = await apiRequest<{
      userId: string
    }>(`/users/find-id?email=${encodeURIComponent(email)}`, {
      method: "GET",
      withAuth: true,
    })
    return response
  },
}

/**
 * Service de gestion des documents
 */
export const documentService = {
  /**
   * Uploader et analyser un document
   * POST /api/documents/upload-analyze (multipart/form-data)
   */
  uploadAndAnalyze: async (
    file: File,
    options?: {
      documentType?: string
      backFile?: File
    },
  ) => {
    // Récupérer l'ID utilisateur depuis le token JWT
    let userId: string | null = null
    try {
      // First try to get userId from storage (set after login)
      userId = localStorage.getItem("user_id")

      if (!userId) {
        // Fallback: try to decode from token
        const token = localStorage.getItem("auth_token")
        if (token) {
          // Décoder le JWT pour extraire le user ID (partie payload)
          const parts = token.split(".")
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            userId = payload.sub || payload.user_id || payload.id
          }
        }
      }
    } catch (e) {
      console.warn("[v0] Could not extract userId from token:", e)
    }

    if (!userId) {
      throw new APIError(401, "NO_USER_ID", "User ID not available. Please login again.")
    }

    const formData = new FormData()
    formData.append("frontFile", file)
    formData.append("userId", userId)

    if (options?.backFile) {
      formData.append("backFile", options.backFile)
    }

    if (options?.documentType) {
      let typeToSend = options.documentType
      const lower = options.documentType.toLowerCase()

      // Try mapping to standard uppercase ENUM style
      if (lower.includes("passeport")) typeToSend = "PASSPORT"
      else if (lower.includes("cni") || lower.includes("carte")) typeToSend = "CNI" // CNI often kept as is or ID_CARD
      else if (lower.includes("permis")) typeToSend = "DRIVER_LICENSE"

      console.log(`[v0] Mapping document type '${options.documentType}' to '${typeToSend}'`)
      formData.append("pieceType", typeToSend)
    }

    const url = `${API_BASE_URL}/documents/upload-analyze`
    const token = localStorage.getItem("auth_token")

    console.log("[v0] Uploading document with userId:", userId)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorCode = data.code || "UPLOAD_FAILED"
        const errorMessage = data.message || `HTTP ${response.status}`
        console.error(`[v0] Upload Error: ${errorCode} - ${errorMessage}`)
        throw new APIError(response.status, errorCode, errorMessage)
      }

      console.log("[v0] Document uploaded successfully")
      return data as {
        documentType: string
        documentNumber: string
        holderName: string
        dateOfBirth: string
        issueDate: string
        expirationDate: string
        isValid: boolean
        validationMessage: string
        confidenceScore: number
        hasUncertainty: boolean
        additionalFields: Record<string, string>
        rawExtractedText: string
        document_id?: string
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }

      const message = error instanceof Error ? error.message : "Erreur d'upload"
      console.error(`[v0] Upload Network Error: ${message}`)
      throw new APIError(0, "NETWORK_ERROR", message)
    }
  },

  /**
   * Uploader un document
   * POST /api/documents/upload
   */
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const url = `${API_BASE_URL}/documents/upload`
    const token = localStorage.getItem("auth_token")

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new APIError(response.status, data.code || "UPLOAD_FAILED", data.message || "Upload failed")
      }

      return data as {
        document_id: string
        document_url: string
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(0, "NETWORK_ERROR", "Upload failed")
    }
  },

  /**
   * Analyser un document
   * POST /api/documents/{documentId}/analyze
   */
  analyze: async (documentId: string) => {
    const response = await apiRequest<{
      extraction_result: {
        documentType: string
        documentNumber: string
        holderName: string
        dateOfBirth: string
        issueDate: string
        expirationDate: string
        isValid: boolean
        validationMessage: string
        confidenceScore: number
        hasUncertainty: boolean
        additionalFields: Record<string, string>
        rawExtractedText: string
      }
    }>(`/documents/${documentId}/analyze`, {
      method: "POST",
      withAuth: true,
    })
    return response
  },

  /**
   * Récupérer les détails d'un document
   * GET /api/documents/{documentId}
   */
  getDetails: async (documentId: string) => {
    const response = await apiRequest<{
      id: string
      user_id: string
      document_type?: string
      status: string
      extraction_result?: Record<string, unknown>
      created_at: string
    }>(`/documents/${documentId}`, {
      method: "GET",
      withAuth: true,
    })
    return response
  },
}

export default {
  apiRequest,
  authService,
  userService,
  documentService,
}
