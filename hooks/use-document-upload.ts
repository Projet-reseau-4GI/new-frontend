/**
 * Hook personnalisé pour gérer l'upload et l'analyse de documents
 */

"use client"

import { useState } from "react"
import { documentService } from "@/lib/api-client"
import { toast } from "sonner"

interface ExtractionResult {
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

interface UploadResponse {
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

interface UseDocumentUploadReturn {
  isLoading: boolean
  error: string | null
  documentId: string | null
  extractionResult: ExtractionResult | null
  uploadAndAnalyze: (
    frontFile: File,
    options?: {
      documentType?: string
      backFile?: File
    },
  ) => Promise<UploadResponse>
  clearError: () => void
  reset: () => void
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)

  const handleError = (err: unknown) => {
    let message = "Une erreur est survenue lors de l'upload"
    if (err instanceof Error) {
      message = err.message
      console.error("[v0] Document upload error:", message)
    }
    setError(message)
    toast.error("Erreur d'upload", { description: message })
  }

  const uploadAndAnalyze = async (
    frontFile: File,
    options?: {
      documentType?: string
      backFile?: File
    },
  ): Promise<UploadResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting document upload and analysis")

      const response = await documentService.uploadAndAnalyze(frontFile, options)

      // La réponse contient directement les résultats d'extraction
      setExtractionResult({
        documentType: response.documentType,
        documentNumber: response.documentNumber,
        holderName: response.holderName,
        dateOfBirth: response.dateOfBirth,
        issueDate: response.issueDate,
        expirationDate: response.expirationDate,
        isValid: response.isValid,
        validationMessage: response.validationMessage,
        confidenceScore: response.confidenceScore,
        hasUncertainty: response.hasUncertainty,
        additionalFields: response.additionalFields,
        rawExtractedText: response.rawExtractedText,
      })

      // Générer un document_id si pas fourni par le backend
      const docId = response.document_id || `doc_${Date.now()}`
      setDocumentId(docId)

      console.log("[v0] Document analysis complete, document_id:", docId)

      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const reset = () => {
    setError(null)
    setDocumentId(null)
    setExtractionResult(null)
  }

  return {
    isLoading,
    error,
    documentId,
    extractionResult,
    uploadAndAnalyze,
    clearError,
    reset,
  }
}
