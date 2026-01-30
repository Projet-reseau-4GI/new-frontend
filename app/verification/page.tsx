/**
 * Page d'attente dynamique affichée pendant l'analyse des documents.
 * Présente une animation sophistiquée et des étapes de progression.
 *
 * @author Thomas Djotio Ndié
 * @date 30.09.25
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Search, Database, Lock, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Composant de la page de vérification.
 * Simule un processus d'analyse sophistiqué avec des micro-interactions.
 */
export default function VerificationPage() {
  const router = useRouter()
  const [analysis_progress, set_analysis_progress] = useState(0)
  const [current_step_index, set_current_step_index] = useState(0)

  // Liste des étapes d'analyse (snake_case)
  const analysis_steps = [
    { label: "Extraction des données OCR", icon: Search },
    { label: "Analyse biométrique faciale", icon: Database },
    { label: "Contrôle de conformité officielle", icon: ShieldCheck },
    { label: "Génération du rapport sécurisé", icon: Lock },
  ]

  useEffect(() => {
    // Simulation de la progression de la barre
    const progress_timer = setInterval(() => {
      set_analysis_progress((prev) => {
        if (prev >= 100) {
          clearInterval(progress_timer)
          return 100
        }
        return prev + 1
      })
    }, 60)

    // Changement d'étape en fonction de la progression
    const step_timer = setInterval(() => {
      set_current_step_index((prev) => {
        if (prev < analysis_steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    // Redirection finale
    const final_redirect = setTimeout(() => {
      router.push("/results")
    }, 6500)

    return () => {
      clearInterval(progress_timer)
      clearInterval(step_timer)
      clearTimeout(final_redirect)
    }
  }, [router, analysis_steps.length])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>

        <div className="max-w-2xl w-full space-y-12 text-center">
          {/* Main Animation Container */}
          <div className="relative flex justify-center">
            <div className="relative w-48 h-48">
              {/* Spinning Outer Orbit */}
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin duration-[2000ms]"></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-blue-400 animate-spin-reverse duration-[3000ms]"></div>

              {/* Central Core */}
              <div className="absolute inset-8 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-100">
                <div className="relative">
                  <ShieldCheck className="w-16 h-16 text-blue-600 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Scanning Line Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Analyse en cours</h1>
            <p className="text-slate-500 text-lg font-medium">
              Veuillez ne pas fermer cette fenêtre, nos serveurs traitent vos documents.
            </p>
          </div>

          {/* Progress Visualizer */}
          <div className="space-y-6 w-full max-w-md mx-auto">
            <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out rounded-full relative"
                style={{ width: `${analysis_progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              <span>Progression</span>
              <span className="text-blue-600">{analysis_progress}%</span>
            </div>
          </div>

          {/* Dynamic Steps List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {analysis_steps.map((step, idx) => {
              const is_active = idx === current_step_index
              const is_completed = idx < current_step_index

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-500 flex items-center gap-4",
                    is_active
                      ? "bg-white border-blue-200 shadow-lg scale-105 z-10"
                      : is_completed
                        ? "bg-emerald-50/50 border-emerald-100 opacity-80"
                        : "bg-slate-100/50 border-transparent opacity-40 grayscale",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      is_active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : is_completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400",
                    )}
                  >
                    {is_completed ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        is_active ? "text-slate-900" : is_completed ? "text-emerald-700" : "text-slate-500",
                      )}
                    >
                      {step.label}
                    </p>
                    {is_active && (
                      <div className="flex items-center gap-1 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        <span className="text-[10px] text-blue-600 uppercase font-bold">Traitement...</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Lock className="w-4 h-4" />
          Protocole de sécurité AES-256 activé
        </div>
      </footer>
    </div>
  )
}
