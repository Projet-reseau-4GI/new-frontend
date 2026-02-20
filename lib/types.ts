/**
 * Types et interfaces partagées pour toute l'application
 *
 * @author Thomas Djotio Ndié
 * @date 24.01.26
 */

// ========================
// Authentification
// ========================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at?: string
}

export interface AuthResponse {
  message: string
  token?: string
  user?: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

// ========================
// Documents
// ========================

export interface ExtractionResult {
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

export type DocumentAnalysisResponse = ExtractionResult


export interface Document {
  id: string
  user_id: string
  document_type?: string
  status: "pending" | "processed" | "failed"
  extraction_result?: ExtractionResult
  created_at: string
}

export interface UploadResponse {
  document_id: string
  status: string
  extraction_result?: ExtractionResult
}

export interface UploadRequest {
  front_document: File
  back_document?: File
  document_type?: string
}

// ========================
// API Errors
// ========================

export interface APIErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ========================
// Verification Status
// ========================

export type VerificationStatus = "confirmed" | "expired" | "unclear" | "invalid"

export interface VerificationResult {
  status: VerificationStatus
  data: ExtractionResult
  verificationId: string
  timestamp: string
}

// ========================
// UI States
// ========================

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface UploadState extends LoadingState {
  documentId: string | null
  extractionResult: ExtractionResult | null
}

export interface AuthState extends LoadingState {
  isAuthenticated: boolean
  user: User | null
}

// ========================
// Form Data
// ========================

export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginFormData {
  email: string
  password: string
}

// ========================
// API Client Config
// ========================

export interface RequestOptions extends RequestInit {
  withAuth?: boolean
  timeout?: number
}

export interface APIRequestConfig {
  baseURL: string
  timeout: number
  retries: number
}
