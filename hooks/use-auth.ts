/**
 * Hook personnalisé pour gérer l'authentification
 * Fournit accès aux services d'auth avec gestion d'erreurs
 */

"use client"

import { useState } from "react"
import { authService, APIError } from "@/lib/api-client"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<void>
  login: (email: string, password: string) => Promise<any>
  logout: () => void
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message)
      console.error("[v0] Auth error:", err.message)
    } else {
      setError("Une erreur est survenue")
    }
  }

  const register = async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.register(data)
      console.log("[v0] Registration successful")
    } catch (err) {
      if (err instanceof APIError && err.status === 409) {
        setError("Cette adresse mail est déjà associée à un compte.")
      } else {
        handleError(err)
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(email, password)

      // Fetch user ID immediately after login
      try {
        const { userService } = await import("@/lib/api-client")
        const userDetails = await userService.findByEmail(email)
        if (userDetails && userDetails.userId) {
          localStorage.setItem("user_id", userDetails.userId)
          console.log("[v0] User ID retrieved and stored:", userDetails.userId)
        }
      } catch (idError) {
        console.warn("[v0] Could not retrieve user ID after login:", idError)
        // We don't block login if ID fetch fails, but upload might fail later
      }

      console.log("[v0] Login successful")
      return response
    } catch (err) {
      if (err instanceof APIError && (err.status === 401 || err.status === 403)) {
        setError("adresse mail et/ou mot de passe incorrect(s)")
      } else {
        handleError(err)
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.clearToken()
    setError(null)
    console.log("[v0] User logged out")
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isLoading,
    error,
    isAuthenticated: authService.isAuthenticated(),
    register,
    login,
    logout,
    clearError,
  }
}
