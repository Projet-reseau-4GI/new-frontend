/**
 * Composant d'affichage des exigences de mot de passe
 */

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PasswordStrengthResult } from "@/lib/password-validation"

interface PasswordRequirementsProps {
  result: PasswordStrengthResult | null
  showEmpty?: boolean
}

export function PasswordRequirements({ result, showEmpty = false }: PasswordRequirementsProps) {
  if (!result && !showEmpty) return null

  const requirements = [
    {
      label: "Minimum 8 caractères",
      met: result?.requirements.minLength ?? false,
    },
    {
      label: "Au moins une majuscule (A-Z)",
      met: result?.requirements.hasUppercase ?? false,
    },
    {
      label: "Au moins une minuscule (a-z)",
      met: result?.requirements.hasLowercase ?? false,
    },
    {
      label: "Au moins un chiffre (0-9)",
      met: result?.requirements.hasNumber ?? false,
    },
    {
      label: "Au moins un caractère spécial (@$!%*?&)",
      met: result?.requirements.hasSpecialChar ?? false,
    },
  ]

  return (
    <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Exigences du mot de passe
      </p>
      <div className="space-y-2">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              req.met ? "text-emerald-600" : "text-slate-400"
            )}
          >
            {req.met ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
