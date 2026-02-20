import { fetchWithRetry } from "./fetch-with-retry"

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
  timeout?: number
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
    const response = await fetchWithRetry(url, {
      ...init,
      headers: requestHeaders,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorCode = data.code || "UNKNOWN_ERROR"
      let errorMessage = data.message

      // Si pas de message du backend, utiliser des messages génériques
      if (!errorMessage) {
        if (response.status === 413) {
          errorMessage = "Le fichier est trop volumineux. La taille totale ne doit pas dépasser 10 Mo."
        } else if (response.status === 500) {
          errorMessage = "Une erreur serveur interne est survenue. Veuillez réessayer plus tard."
        } else if (response.status === 404) {
          errorMessage = "La ressource demandée est introuvable."
        } else {
          errorMessage = `Erreur HTTP ${response.status}`
        }
      }

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

    // Stocker le token et l'ID utilisateur
    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }
    if (response.user?.id) {
      localStorage.setItem("user_id", response.user.id)
    }

    return response
  },



  /**
   * Vérifier un code OTP pour l'email
   * POST /api/auth/verify-email
   */
  verifyEmail: async (email: string, code: string) => {
    const response = await apiRequest<{
      message: string
      token?: string
    }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      withAuth: false,
    })

    if (response.token) {
      localStorage.setItem("auth_token", response.token)
      // On tente de récupérer l'ID utilisateur via le service ou le token
      try {
        const token = response.token
        const parts = token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
          const userId = payload.sub || payload.user_id || payload.id || payload.uid
          if (userId) localStorage.setItem("user_id", userId)
        }
      } catch (e) {
        console.warn("[v0] Could not auto-extract userId after verification")
      }
    }

    return response
  },

  /**
   * Renvoyer le code de vérification
   * POST /api/auth/resend-verification
   */
  resendVerification: async (email: string) => {
    const response = await apiRequest<{
      message: string
    }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      withAuth: false,
    })
    return response
  },

  /**
   * Vérifier un code OTP (générique)
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
      // extraction userId
      try {
        const payload = JSON.parse(atob(response.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
        const userId = payload.sub || payload.user_id || payload.id || payload.uid
        if (userId) localStorage.setItem("user_id", userId)
      } catch (e) { }
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
   * Réinitialiser le mot de passe
   * POST /api/auth/reset-password
   */
  resetPassword: async (data: {
    email: string
    code: string
    newPassword: string
  }) => {
    const response = await apiRequest<{
      message: string
    }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
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
      // First try to get userId from storage
      userId = localStorage.getItem("user_id")

      if (!userId) {
        // Fallback: try to decode from token
        const token = localStorage.getItem("auth_token")
        if (token) {
          console.log("[v0] Decoding token to find userId...")
          const parts = token.split(".")
          if (parts.length === 3) {
            // Support standard Base64 and Base64Url
            const base64Url = parts[1]
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
            const jsonPayload = atob(base64)
            const payload = JSON.parse(jsonPayload)

            userId = payload.sub || payload.user_id || payload.id || payload.uid
            console.log("[v0] Extracted userId from token:", userId)

            if (userId) {
              localStorage.setItem("user_id", userId)
            }
          }
        }
      }
    } catch (e) {
      console.warn("[v0] Could not extract userId from token:", e)
    }

    if (!userId) {
      console.error("[v0] No userId found in localStorage or token")
      throw new APIError(401, "NO_USER_ID", "Session expirée ou invalide. Veuillez vous reconnecter.")
    }

    const formData = new FormData()

    // 1. Front File (Premier comme dans le curl)
    const frontBlob = file.slice(0, file.size, file.type)
    const frontExt = file.type.split('/')[1] || 'jpg'
    const frontName = `front_document_${Date.now()}.${frontExt}`
    formData.append("frontFile", frontBlob, frontName)
    console.log("[v0] FormData: Added frontFile (1/4)", frontName)

    // 2. Back File (Deuxième comme dans le curl)
    if (options?.backFile) {
      const backBlob = options.backFile.slice(0, options.backFile.size, options.backFile.type)
      const backExt = options.backFile.type.split('/')[1] || 'jpg'
      const backName = `back_document_${Date.now()}.${backExt}`
      formData.append("backFile", backBlob, backName)
      console.log("[v0] FormData: Added backFile (2/4)", backName)
    }

    // 3. Piece Type (Troisième comme dans le curl, même si vide)
    let typeToSend = ""
    if (options?.documentType) {
      const lower = options.documentType.toLowerCase().trim()
      if (lower.includes("pass") || lower === "passport") typeToSend = "PASSPORT"
      else if (lower.includes("cni") || lower.includes("carte") || lower.includes("id")) typeToSend = "CNI"
      else if (lower.includes("permis") || lower.includes("driv")) typeToSend = "PERMIS"
    }
    formData.append("pieceType", typeToSend)
    console.log("[v0] FormData: Added pieceType (3/4)", `"${typeToSend}"`)

    // 4. User ID (Dernier comme dans le curl)
    formData.append("userId", userId)
    console.log("[v0] FormData: Added userId (4/4)", userId)

    const url = `${API_BASE_URL}/documents/upload-analyze`
    const token = localStorage.getItem("auth_token")

    console.log("[v0] Uploading document with userId:", userId)

    try {
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        timeout: 300000, // 5 minutes (Backend OCR can be slow)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorCode = data.code || "UPLOAD_FAILED"
        const errorMessage = data.message || `HTTP ${response.status}`
        console.error(`[v0] Upload Error: ${errorCode} - ${errorMessage}`)
        throw new APIError(response.status, errorCode, errorMessage)
      }

      console.log("[v0] Document uploaded successfully, raw response:", data)

      // Le backend renvoie une structure avec 'extractedData'
      // Structure attendue:
      // {
      //   id: number,
      //   documentType: string,
      //   extractedData: { holderName: string, ... },
      //   status: string
      // }

      const extractedData = data.extractedData || data || {}

      return {
        documentType: data.documentType || options?.documentType || "UNKNOWN",
        documentNumber: extractedData.documentNumber || "",
        holderName: extractedData.holderName || "",
        dateOfBirth: extractedData.dateOfBirth || "",
        issueDate: extractedData.issueDate || "",
        expirationDate: extractedData.expirationDate || "",
        isValid: data.status === "COMPLETED" || data.status === "VALID" || data.isValid === true, // Adapter selon le status réel
        validationMessage: extractedData.validationMessage || data.validationMessage || (data.status === "COMPLETED" ? "Document valide" : "Document à vérifier"),
        confidenceScore: data.confidenceScore ?? extractedData.confidenceScore ?? 0.95,
        hasUncertainty: data.hasUncertainty ?? extractedData.hasUncertainty ?? false,
        additionalFields: data.additionalFields || extractedData.additionalFields || extractedData, // On garde tout le reste ici
        rawExtractedText: data.rawExtractedText || extractedData.rawExtractedText || "",
      } as {
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
  upload: async (file: File, pieceType: string) => {
    // Récupérer l'ID utilisateur
    let userId = localStorage.getItem("user_id")

    if (!userId) {
      // Tentative de récupération via le token
      try {
        const token = localStorage.getItem("auth_token")
        if (token) {
          const parts = token.split(".")
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
            userId = payload.sub || payload.user_id || payload.id || payload.uid
            if (userId) localStorage.setItem("user_id", userId)
          }
        }
      } catch (e) {
        console.warn("[v0] Could not extract userId from token for upload:", e)
      }
    }

    if (!userId) {
      throw new APIError(401, "NO_USER_ID", "Session expirée ou invalide. Veuillez vous reconnecter.")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("pieceType", pieceType)
    formData.append("userId", userId)

    const url = `${API_BASE_URL}/documents/upload`
    const token = localStorage.getItem("auth_token")

    try {
      const response = await fetchWithRetry(url, {
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
        id: string
        pieceType: string
        fileName: string
        fileSize: number
        userId: string
        fileType: string
        uploadDate: string
        status: string
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      const message = error instanceof Error ? error.message : "Erreur d'upload"
      throw new APIError(0, "NETWORK_ERROR", message)
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
