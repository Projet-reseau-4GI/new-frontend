/**
 * Utilitaires pour la validation des mots de passe
 */

export interface PasswordStrengthResult {
  isValid: boolean
  score: number
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
  missingRequirements: string[]
}

/**
 * Valide la force d'un mot de passe selon les critères:
 * - Minimum 8 caractères
 * - Au moins une majuscule
 * - Au moins une minuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial (!@#$%^&*)
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  }

  const missingRequirements: string[] = []

  if (!requirements.minLength) {
    missingRequirements.push("Minimum 8 caractères")
  }
  if (!requirements.hasUppercase) {
    missingRequirements.push("Au moins une majuscule (A-Z)")
  }
  if (!requirements.hasLowercase) {
    missingRequirements.push("Au moins une minuscule (a-z)")
  }
  if (!requirements.hasNumber) {
    missingRequirements.push("Au moins un chiffre (0-9)")
  }
  if (!requirements.hasSpecialChar) {
    missingRequirements.push("Au moins un caractère spécial (@$!%*?&)")
  }

  const score = Object.values(requirements).filter(Boolean).length

  return {
    isValid: Object.values(requirements).every(Boolean),
    score,
    requirements,
    missingRequirements,
  }
}

/**
 * Récupère la couleur basée sur le score de force
 */
export function getPasswordStrengthColor(score: number): string {
  if (score === 5) return "text-emerald-600"
  if (score >= 4) return "text-blue-600"
  if (score >= 3) return "text-yellow-600"
  return "text-red-600"
}

/**
 * Récupère le label de force du mot de passe
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score === 0) return "Très faible"
  if (score === 1) return "Faible"
  if (score === 2) return "Moyen"
  if (score === 3) return "Bon"
  if (score === 4) return "Très bon"
  return "Excellent"
}
