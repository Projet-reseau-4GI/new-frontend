/**
 * Page de connexion de l'application VerifID.
 * Permet l'authentification via email/mot de passe ou via fournisseurs OAuth (Google, GitHub).
 *
 * @author Thomas Djotio Ndié
 * @date 30.09.25
 */
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Mail, Chrome, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

/**
 * Composant principal de la page de connexion.
 * Utilise des composants UI modernes et respecte les contraintes de style snake_case.
 */
export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [user_email, set_user_email] = useState("")
  const [user_password, set_user_password] = useState("")
  const [show_password, set_show_password] = useState(false)

  /**
   * Gère la soumission du formulaire de connexion par e-mail.
   * @param event Événement de soumission du formulaire
   */
  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()

    if (!user_email || !user_password) {
      console.warn("[v0] Email and password are required")
      return
    }

    try {
      console.log("[v0] Attempting login...")
      await login(user_email, user_password)
      console.log("[v0] Login successful, redirecting...")
      router.push("/upload")
    } catch (err) {
      console.error("[v0] Login failed:", err)
      // Le message d'erreur est déjà géré par le hook useAuth
    }
  }

  /**
   * Gère la connexion via Google OAuth.
   */
  const handleGoogleLogin = async () => {
    clearError()
    console.log("[v0] Initiating Google OAuth flow")

    try {
      // Récupérer l'URL d'authentification Google
      const { authService } = await import("@/lib/api-client")
      const { authorizationUrl } = await authService.getGoogleAuthUrl()

      if (authorizationUrl) {
        // Rediriger vers Google
        window.location.href = authorizationUrl
      }
    } catch (err) {
      console.error("[v0] Google OAuth failed:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      {/* Header minimaliste */}
      <header className="w-full h-20 flex items-center px-6 md:px-12 relative z-10">
        <Link href="/" className="group flex items-center gap-2 text-slate-900 transition-colors hover:text-blue-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 hover:bg-white/80">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4 transform rotate-3 transition-transform hover:rotate-0">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ravi de vous revoir</h1>
            <p className="text-slate-500">Connectez-vous pour sécuriser votre identité</p>
          </div>

          <Card className="border-white/40 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="sr-only">Formulaire de connexion</CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-8 space-y-6">
              {/* Error displayed via toast */}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Adresse mail
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@entreprise.com"
                      value={user_email}
                      onChange={(e) => set_user_email(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mot de passe
                    </Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                      Oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show_password ? "text" : "password"}
                      placeholder="••••••••"
                      value={user_password}
                      onChange={(e) => set_user_password(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 hover:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => set_show_password(!show_password)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={show_password ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {show_password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
                  <span className="bg-white/80 backdrop-blur-sm px-4">Accès rapide</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group bg-white/50"
                >
                  <Chrome className="mr-2 h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">Google</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500">
            Nouveau sur la plateforme ?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-bold transition-colors">
              Créer un accès
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
