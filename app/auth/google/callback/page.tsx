/**
 * Page de callback pour l'authentification Google.
 * Gère le code de retour OAuth et échange le token.
 */
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/api-client"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Authentification en cours...")

    useEffect(() => {
        if (error) {
            setStatus("error")
            setMessage("Accès refusé par Google.")
            toast.error("Erreur d'authentification", { description: "Accès refusé par Google." })
            setTimeout(() => router.push("/login"), 3000)
            return
        }

        if (!code) {
            setStatus("error")
            setMessage("Aucun code d'authentification trouvé.")
            return
        }

        const exchangeCode = async () => {
            try {
                console.log("[v0] Exchanging Google code for token...")
                // Le backend s'attend à recevoir le code
                await authService.handleGoogleCallback(code)

                setStatus("success")
                setMessage("Connexion réussie ! Redirection...")
                toast.success("Connexion réussie", { description: "Bienvenue sur VerifID." })

                // Court délai pour l'UX
                setTimeout(() => {
                    router.push("/upload")
                }, 1500)

            } catch (err: any) {
                console.error("[v0] Token exchange failed:", err)
                setStatus("error")
                // Afficher le message d'erreur spécifique renvoyé par le backend ou le client
                const errorMessage = err?.message || "Échec de la validation du compte Google."
                setMessage(errorMessage)
                toast.error("Erreur de connexion", { description: errorMessage })

                // Délai plus long pour laisser le temps de lire l'erreur
                setTimeout(() => router.push("/login"), 5000)
            }
        }

        exchangeCode()
    }, [code, error, router])

    return (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
                {status === "loading" && (
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center relative">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                )}
                {status === "success" && (
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                    </div>
                )}
                {status === "error" && (
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600 animate-pulse" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">
                    {status === "loading" && "Vérification..."}
                    {status === "success" && "Succès !"}
                    {status === "error" && "Erreur"}
                </h1>
                <p className="text-slate-500 font-medium">{message}</p>
            </div>
        </div>
    )
}

export default function GoogleCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <Suspense fallback={<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />}>
                <CallbackContent />
            </Suspense>
        </div>
    )
}
