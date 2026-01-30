"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { validatePasswordStrength, getPasswordStrengthColor } from "@/lib/password-validation"
import { PasswordRequirements } from "@/components/password-requirements"

export default function SignupPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Valider le mot de passe lors de sa saisie
  const passwordValidation = password ? validatePasswordStrength(password) : null

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccessMessage("")
    setPasswordError("")

    if (!firstName || !lastName || !email || !password) {
      console.warn("[v0] All fields are required")
      return
    }

    // Vérifier la force du mot de passe
    const validation = validatePasswordStrength(password)
    if (!validation.isValid) {
      const message = `Le mot de passe ne respecte pas les exigences:\n${validation.missingRequirements.join("\n")}`
      setPasswordError(message)
      console.warn("[v0] Password validation failed:", validation.missingRequirements)
      return
    }

    try {
      console.log("[v0] Registering user with strong password...")
      await register({
        firstName,
        lastName,
        email,
        password,
      })

      // Afficher le message de succès
      setSuccessMessage(
        `Inscription réussie! Redirection vers la page de connexion...`
      )
      console.log("[v0] Registration successful")

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      console.error("[v0] Registration failed:", err)
    }
  }

  const handleGoogleSignup = async () => {
    clearError()
    setPasswordError("")
    console.log("[v0] Initiating Google OAuth signup")

    try {
      const { authService } = await import("@/lib/api-client")
      const { authorizationUrl } = await authService.getGoogleAuthUrl()

      if (authorizationUrl) {
        window.location.href = authorizationUrl
      }
    } catch (err) {
      console.error("[v0] Google OAuth failed:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      <header className="border-b border-white/20 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">VerifID</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <Card className="w-full max-w-md border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>Inscrivez-vous pour commencer la vérification de vos documents</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {successMessage && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {passwordError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 whitespace-pre-line">{passwordError}</div>
              </div>
            )}

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Thomas"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Djotio"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="thomasdjotio@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="*******"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError("")
                  }}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50"
                />
              </div>

              {password && <PasswordRequirements result={passwordValidation} />}

              <Button type="submit" className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Création en cours...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-slate-500 backdrop-blur-sm">Ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium transition-all"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
