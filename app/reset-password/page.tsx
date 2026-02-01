/**
 * Page de réinitialisation de mot de passe.
 * Permet de saisir le code reçu par email et le nouveau mot de passe.
 */
"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Lock, ArrowLeft, Loader2, AlertCircle, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authService } from "@/lib/api-client"
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from "@/lib/password-validation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultEmail = searchParams.get("email") || ""

    const [email, setEmail] = useState(defaultEmail)
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState(validatePasswordStrength(""))

    // Update validation when password changes
    useEffect(() => {
        setPasswordValidation(validatePasswordStrength(newPassword))
    }, [newPassword])

    // Update email if URL param changes
    useEffect(() => {
        if (defaultEmail && !email) {
            setEmail(defaultEmail)
        }
    }, [defaultEmail])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!passwordValidation.isValid) {
            const msg = "Le mot de passe ne respecte pas les critères de sécurité."
            setError(msg)
            toast.error("Mot de passe invalide", { description: msg })
            setIsLoading(false)
            return
        }

        try {
            await authService.resetPassword({
                email,
                code,
                newPassword
            })
            setSuccess(true)
            toast.success("Mot de passe modifié", { description: "Vous pouvez maintenant vous connecter." })
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            console.error("Reset password error:", err)
            const msg = err.message || "Une erreur est survenue lors de la réinitialisation."
            setError(msg)
            toast.error("Échec de réinitialisation", { description: msg })
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <Card className="border-white/40 shadow-2xl shadow-green-500/20 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
                    <CardContent className="pt-12 pb-12 px-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">Mot de passe réinitialisé !</h2>
                            <p className="text-slate-500">Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.</p>
                        </div>
                        <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => router.push("/login")}>
                            Aller à la connexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nouveau mot de passe</h1>
                <p className="text-slate-500">Saisissez le code reçu et votre nouveau mot de passe</p>
            </div>

            <Card className="border-white/40 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
                <CardHeader className="pt-8 pb-4">
                    <CardTitle className="sr-only">Formulaire de réinitialisation</CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12 rounded-xl border-slate-200 bg-slate-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Code de vérification
                            </Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Ex: 123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 hover:bg-white font-mono tracking-widest text-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Nouveau mot de passe
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 hover:bg-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Indicateur de force du mot de passe */}
                            {newPassword && (
                                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-500">Force du mot de passe</span>
                                        <span className={cn("text-xs font-bold", getPasswordStrengthColor(passwordValidation.score))}>
                                            {getPasswordStrengthLabel(passwordValidation.score)}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-1.5 w-full">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={cn(
                                                    "h-full rounded-full flex-1 transition-all duration-300",
                                                    level <= passwordValidation.score
                                                        ? getPasswordStrengthColor(passwordValidation.score).replace("text-", "bg-")
                                                        : "bg-slate-100"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <ul className="grid grid-cols-2 gap-1 mt-2">
                                        {passwordValidation.missingRequirements.map((req, index) => (
                                            <li key={index} className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                                {req}
                                            </li>
                                        ))}
                                        {passwordValidation.requirements.minLength && (
                                            <li className="text-[10px] text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Min. 8 caractères
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !passwordValidation.isValid}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Réinitialiser"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
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
                <Suspense fallback={<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />}>
                    <ResetPasswordContent />
                </Suspense>
            </main>
        </div>
    )
}
