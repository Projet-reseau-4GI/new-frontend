/**
 * Page de demande de réinitialisation de mot de passe.
 * Permet à l'utilisateur de saisir son email pour recevoir un code de vérification.
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
import { ShieldCheck, Mail, ArrowLeft, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { authService } from "@/lib/api-client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            console.log("Submitting forgot password request for:", email)
            await authService.forgotPassword(email)
            toast.success("Email envoyé", { description: "Vérifiez votre boîte mail pour le code." })
            // Rediriger vers la page de réinitialisation avec l'email en paramètre
            router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        } catch (err: any) {
            console.error("Forgot password error:", err)
            setError(err.message || "Une erreur est survenue. Veuillez réessayer.")
            toast.error("Erreur", { description: err.message || "Impossible d'envoyer l'email." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden font-sans">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px]" />
            </div>

            {/* Header */}
            <header className="w-full h-20 flex items-center px-6 md:px-12 relative z-10">
                <Link href="/login" className="group flex items-center gap-2 text-slate-900 transition-colors hover:text-blue-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 hover:bg-white/80">
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Retour à la connexion</span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
                <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mot de passe oublié ?</h1>
                        <p className="text-slate-500">Entrez votre email pour recevoir votre code de réinitialisation</p>
                    </div>

                    <Card className="border-white/40 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
                        <CardHeader className="pt-8 pb-4">
                            <CardTitle className="sr-only">Récupération de mot de passe</CardTitle>
                        </CardHeader>

                        <CardContent className="px-8 pb-8 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le code"}
                                    {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
