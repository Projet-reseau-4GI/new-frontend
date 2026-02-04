"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Shield, Mail, AlertCircle, Loader2, CheckCircle2, RefreshCw } from "lucide-react"
import { authService, APIError } from "@/lib/api-client"
import { toast } from "sonner"

function VerifyOtpContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [timer, setTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        if (!email) {
            toast.error("Email manquant", { description: "Veuillez retourner à l'inscription." })
            router.push("/signup")
        }
    }, [email, router])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        } else {
            setCanResend(true)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (otp.length !== 6) return

        setIsLoading(true)
        setError(null)

        try {
            console.log(`[v0] Verifying email with OTP ${otp} for ${email}`)
            await authService.verifyEmail(email, otp)

            setIsSuccess(true)
            toast.success("Compte vérifié !", { description: "Votre compte a été activé avec succès." })

            setTimeout(() => {
                router.push("/upload")
            }, 2000)
        } catch (err) {
            console.error("[v0] OTP verification failed:", err)
            let message = "Code invalide ou expiré."
            if (err instanceof APIError) {
                message = err.message
            }
            setError(message)
            toast.error("Échec de la vérification", { description: message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (!canResend) return

        setIsLoading(true)
        try {
            console.log(`[v0] Resending verification code to ${email}`)
            await authService.resendVerification(email)

            setTimer(60)
            setCanResend(false)
            toast.success("Code renvoyé", { description: "Vérifiez votre boîte mail." })
        } catch (err) {
            toast.error("Erreur", { description: "Impossible de renvoyer le code." })
        } finally {
            setIsLoading(false)
        }
    }

    // Effect to auto-submit when 6 digits are entered
    useEffect(() => {
        if (otp.length === 6) {
            handleVerify()
        }
    }, [otp])

    return (
        <Card className="w-full max-w-md border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <CardHeader className="space-y-2 text-center pt-8">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Vérification par email</CardTitle>
                <CardDescription>
                    Nous avons envoyé un code de 6 chiffres à <br />
                    <span className="font-semibold text-slate-900">{email}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pb-10">
                {isSuccess ? (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <p className="text-emerald-700 font-bold">Vérification réussie !</p>
                        <p className="text-sm text-slate-500">Redirection ...</p>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="flex flex-col items-center gap-6">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(val) => {
                                    setOtp(val)
                                    setError(null)
                                }}
                                disabled={isLoading}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium animate-shake">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-xl disabled:opacity-50"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Vérification...
                                    </>
                                ) : (
                                    "Vérifier le code"
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-2">
                                    Vous n'avez pas reçu le code ?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={!canResend || isLoading}
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 disabled:text-slate-400 transition-colors"
                                >
                                    {canResend ? (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Renvoyer le code
                                        </>
                                    ) : (
                                        `Renvoyer dans ${timer}s`
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

export default function VerifyOtpPage() {
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
                <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-blue-600" />}>
                    <VerifyOtpContent />
                </Suspense>
            </main>
        </div>
    )
}
