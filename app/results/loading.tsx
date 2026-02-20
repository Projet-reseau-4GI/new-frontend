/**
 * Component for displaying a dynamic loading screen during document verification.
 * Follows the visual charter with premium animations and status updates.
 *
 * @author Thomas Djotio Ndié
 * @date 30.09.25
 * @version 1.0
 */

"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck, Scan, FileSearch, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const loading_steps = [
  { text: "Analyse du document en cours...", icon: Scan },
]

export default function Loading() {
  const [current_step, set_current_step] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      set_current_step((prev) => (prev + 1) % loading_steps.length)
    }, 2000)

    // Clean up timer on unmount
    // Nettoyage de l'intervalle
    return () => clearInterval(timer)
  }, [])

  const CurrentIcon = loading_steps[current_step].icon

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration with premium blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 mx-auto text-center glass rounded-[2.5rem]">
        {/* Main loading circle */}
        <div className="relative w-32 h-32 mb-12">
          {/* Rotating outer rings */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-indigo-50" />
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-indigo-500 border-b-transparent border-l-transparent animate-spin duration-reverse" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CurrentIcon className="w-10 h-10 text-blue-600 transition-all duration-500 animate-in fade-in zoom-in" />
          </div>
        </div>

        {/* Text Status */}
        <div className="space-y-4 h-24">
          <h2 className="text-2xl font-bold text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {loading_steps[current_step].text}
          </h2>
          <p className="text-slate-500 text-sm">
            Veuillez patienter pendant que nous analysons votre pièce d'identité en toute sécurité...
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2 mt-8">
          {loading_steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === current_step ? "bg-blue-600 w-6" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>

      <footer className="absolute bottom-8 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
          Traitement Sécurisé VerifID
        </p>
      </footer>
    </div>
  )
}
