"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ShieldCheck,
    Upload,
    FileImage,
    CheckCircle2,
    ArrowRight,
    MousePointer2,
    Database,
    Search,
    Loader2,
    User,
    CreditCard,
    Calendar,
    Fingerprint,
    RefreshCw,
    PlayCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Definition of Demo steps
type DemoStep = "init" | "moving_to_upload_recto" | "uploading_recto" | "moving_to_upload_verso" | "uploading_verso" | "moving_to_verify" | "verifying" | "results"

export default function DemoPage() {
    const [step, setStep] = useState<DemoStep>("init")
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 80 }) // Vw, vh percentages
    const [hasStarted, setHasStarted] = useState(false)

    // Auto-play the demo sequence
    useEffect(() => {
        if (!hasStarted) return;

        let timers: NodeJS.Timeout[] = []

        // Optional Background Audio (subtle ambient/corporate style)
        // using a free reliable placeholder
        const audio = new Audio("https://cdn.pixabay.com/audio/2022/10/25/audio_5152a51052.mp3")
        audio.volume = 0.15 // keep it soft
        audio.loop = true

        // Browsers block autoplay without user interaction, but since they clicked "Vidéo", it might work.
        // We catch the promise to prevent console errors if it's blocked.
        audio.play().catch(e => console.log("Autoplay blocked by browser. User must interact first."))

        const runDemo = () => {
            // Reset
            setStep("init")
            setCursorPos({ x: 50, y: 80 })

            // 1. Move to upload recto button
            timers.push(setTimeout(() => {
                setStep("moving_to_upload_recto")
                setCursorPos({ x: 25, y: 45 }) // roughly over the front upload area
            }, 1500))

            // 2. Simulate Recto Upload Click and Process
            timers.push(setTimeout(() => {
                setStep("uploading_recto")
            }, 3000))

            // 3. Move to upload verso button
            timers.push(setTimeout(() => {
                setStep("moving_to_upload_verso")
                setCursorPos({ x: 75, y: 45 }) // roughly over the trailing upload area
            }, 5000))

            // 4. Simulate Verso Upload Click and Process
            timers.push(setTimeout(() => {
                setStep("uploading_verso")
            }, 6500))

            // 5. Move to Verify button
            timers.push(setTimeout(() => {
                setStep("moving_to_verify")
                setCursorPos({ x: 75, y: 70 }) // roughly over the "Lancer la vérification" button
            }, 8500))

            // 6. Click Verify, show "analyse" loading
            timers.push(setTimeout(() => {
                setStep("verifying")
                setCursorPos({ x: -10, y: -10 }) // move cursor out of screen
            }, 10500))

            // 7. Show final results exactly after 30 seconds
            timers.push(setTimeout(() => {
                setStep("results")
            }, 40500))
        }

        runDemo()

        return () => {
            audio.pause()
            audio.currentTime = 0
            timers.forEach(t => clearTimeout(t))
        }
    }, [hasStarted])

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">

            {/* Decorative background equivalent to results page */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px]" />
            </div>

            <header className="border-b border-white/20 bg-white/70 backdrop-blur-md h-20 relative z-50">
                <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">VerifID</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Démonstration Interactive
                        </div>
                        <Button variant="ghost" asChild className="text-slate-500 hover:text-blue-600">
                            <Link href="/about">Quitter</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Container rendering different mock pages based on step */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8 relative z-10 flex flex-col items-center">

                {!hasStarted ? (
                    <div className="flex-1 flex items-center justify-center w-full min-h-[60vh] animate-in zoom-in duration-500">
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
                                <PlayCircle className="w-12 h-12 text-blue-600 ml-1" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-extrabold text-slate-900">Démo Interactive</h1>
                                <p className="text-xl text-slate-500 max-w-md mx-auto">Lancez la vidéo pour vivre l'expérience de vérification.</p>
                            </div>
                            <Button
                                onClick={() => setHasStarted(true)}
                                size="lg"
                                className="h-16 px-10 rounded-full text-lg shadow-2xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all text-white font-bold"
                            >
                                <PlayCircle className="w-6 h-6 mr-3" />
                                Démarrer la démo
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* State 1: Upload Mimic */}
                        {(step === "init" || step === "moving_to_upload_recto" || step === "uploading_recto" || step === "moving_to_upload_verso" || step === "uploading_verso" || step === "moving_to_verify") && (
                            <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vérification de Pièce</h1>
                                    <p className="text-slate-500">Veuillez soumettre les deux faces de votre document officiel.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <Card className={cn(
                                        "border-slate-100 shadow-xl rounded-3xl overflow-hidden transition-all duration-300",
                                        (step === "uploading_recto" || step === "moving_to_upload_verso" || step === "uploading_verso" || step === "moving_to_verify") ? "border-blue-600 bg-blue-50/30" : "bg-white"
                                    )}>
                                        <CardContent className="p-6">
                                            <div className={cn(
                                                "flex flex-col items-center justify-center min-h-[16rem] border-2 border-dashed rounded-2xl transition-all duration-300",
                                                (step === "uploading_recto" || step === "moving_to_upload_verso" || step === "uploading_verso" || step === "moving_to_verify") ? "border-blue-600" : "border-slate-200"
                                            )}>
                                                {(step === "uploading_recto" || step === "moving_to_upload_verso" || step === "uploading_verso" || step === "moving_to_verify") ? (
                                                    <div className="flex flex-col items-center gap-4 p-4 text-center animate-in zoom-in duration-300">
                                                        <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                            <FileImage className="w-10 h-10 text-blue-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-900 truncate">cni_fr_recto_xyz.jpg</p>
                                                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                                                                <CheckCircle2 className="w-3 h-3" /> Fichier prêt
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4 text-center p-8">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 transition-all",
                                                            step === "moving_to_upload_recto" && "bg-blue-50 ring-4 ring-blue-100 scale-110"
                                                        )}>
                                                            <Upload className="w-8 h-8" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-900">Cliquez pour déposer</p>
                                                            <p className="text-xs text-slate-400 uppercase tracking-tighter">PNG, JPG ou PDF (max 10 Mo)</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(
                                        "border-slate-100 shadow-xl rounded-3xl overflow-hidden transition-all duration-300",
                                        (step === "uploading_verso" || step === "moving_to_verify") ? "border-blue-600 bg-blue-50/30" : "bg-white opacity-60 hover:opacity-100"
                                    )}>
                                        <CardContent className={cn(
                                            "p-6 flex flex-col items-center justify-center min-h-[16rem] border-2 border-dashed rounded-2xl transition-all duration-300",
                                            (step === "uploading_verso" || step === "moving_to_verify") ? "border-blue-600" : "border-slate-200"
                                        )}>
                                            {(step === "uploading_verso" || step === "moving_to_verify") ? (
                                                <div className="flex flex-col items-center gap-4 p-4 text-center animate-in zoom-in duration-300">
                                                    <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                        <FileImage className="w-10 h-10 text-blue-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 truncate">cni_fr_verso_xyz.jpg</p>
                                                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                                                            <CheckCircle2 className="w-3 h-3" /> Fichier prêt
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 transition-all",
                                                        step === "moving_to_upload_verso" && "bg-blue-50 ring-4 ring-blue-100 scale-110 text-blue-600"
                                                    )}>
                                                        <Upload className="w-8 h-8" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-400">Verso optionnel</p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl transition-all">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h4 className="text-white text-xl font-bold">Prêt pour l'analyse ?</h4>
                                        <p className="text-slate-400 text-sm max-w-sm">Vos documents seront analysés par notre IA.</p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className={cn(
                                            "h-16 px-12 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all",
                                            (step === "uploading_verso" || step === "moving_to_verify")
                                                ? "bg-blue-600 text-white hover:scale-105 hover:bg-blue-500 cursor-pointer"
                                                : "bg-slate-800 text-slate-500"
                                        )}
                                    >
                                        Lancer la vérification
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* State 2: Verification Loading Mimic */}
                        {step === "verifying" && (
                            <div className="max-w-2xl w-full space-y-12 text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="relative flex justify-center">
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin duration-[2000ms]"></div>
                                        <div className="absolute inset-4 rounded-full border-b-2 border-blue-400 animate-spin-reverse duration-[3000ms]"></div>
                                        <div className="absolute inset-8 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-100">
                                            <ShieldCheck className="w-16 h-16 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-4xl font-extrabold text-slate-900">Analyse en cours</h1>
                                    <p className="text-slate-500 text-lg">Extraction OCR & Analyse Biométrique...</p>
                                </div>

                                <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-xl font-semibold text-blue-600 animate-pulse">
                                        Veuillez patienter pendant que nous analysons votre pièce...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* State 3: Results Mimic */}
                        {step === "results" && (
                            <div className="grid lg:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="h-full overflow-hidden shadow-2xl rounded-[2rem] bg-white/60 backdrop-blur-2xl border-emerald-200">
                                        <CardContent className="p-8 flex flex-col items-center text-center justify-center space-y-8 h-full relative">
                                            <div className="w-32 h-32 rounded-full shadow-lg flex items-center justify-center bg-white z-10">
                                                <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />

                                            <div className="relative z-10 w-full">
                                                <div className="mb-6 px-6 py-2 rounded-2xl border-2 inline-flex items-center gap-2 bg-emerald-50/80 border-emerald-200 text-emerald-600">
                                                    <span className="text-lg font-black tracking-widest">✔ VALIDE</span>
                                                </div>
                                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Identité Confirmée</h2>
                                                <div className="px-4 py-1 rounded-full border inline-flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700">
                                                    <span className="w-2 h-2 rounded-full bg-current" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Confiance: 95%</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-medium">L'authenticité de ce document a été validée avec succès.</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="glass border-white/60 rounded-[2rem] shadow-lg">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                                <User className="w-5 h-5 text-blue-600" /> Profil Extrait
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold text-xl">D</div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom Complet</p>
                                                    <p className="text-xl font-bold text-slate-900">Thomas DJOTIO</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">Type</p>
                                                <p className="text-base font-bold text-slate-900">Carte Nationale d'Identité</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">Numéro</p>
                                                <p className="text-base font-bold text-blue-600 font-mono tracking-wider">112233445</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="flex gap-4">
                                        <Button onClick={() => window.location.reload()} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold shadow-xl">
                                            <RefreshCw className="mr-2 w-4 h-4" /> Rejouer la démo
                                        </Button>
                                        <Button asChild className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl">
                                            <Link href="/login">Essayer pour de vrai !</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

            </main>

            {/* Simulated Cursor - Overlay */}
            {(step === "moving_to_upload_recto" || step === "uploading_recto" || step === "moving_to_upload_verso" || step === "uploading_verso" || step === "moving_to_verify") && (
                <div
                    className="fixed pointer-events-none z-[100] transition-all ease-in-out flex items-center justify-center"
                    style={{
                        left: `${cursorPos.x}vw`,
                        top: `${cursorPos.y}vh`,
                        width: '40px',
                        height: '40px',
                        transitionDuration: '1500ms' // smooth glide
                    }}
                >
                    {/* A simple SVG mouse cursor filling to look native */}
                    <div className={cn("relative", (step === "uploading_recto" || step === "uploading_verso" || step === "moving_to_verify") && "scale-90 opacity-70")}>
                        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg filter">
                            <path d="M23.0188 12.8753L1.92135 1.49257C0.771901 0.872621 0 1.94042 0 3.3101V32.7441C0 34.1137 0.771901 35.1815 1.92135 34.5616L11.5161 29.3871L17.8016 35.6105C18.6796 36.4799 20.0886 36.4799 20.9665 35.6105L23.239 33.3601C24.117 32.4907 24.117 31.0954 23.239 30.226L16.9202 23.9749L23.0188 19.3364C23.9318 18.642 23.9515 17.0652 23.0188 16.3117L23.0188 12.8753Z" fill="black" stroke="white" strokeWidth="2.5" />
                        </svg>
                        {(step === "uploading_recto" || step === "uploading_verso") && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-blue-500/50 animate-ping"></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
