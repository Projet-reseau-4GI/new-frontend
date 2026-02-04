/**
 * Page de présentation des résultats de la vérification.
 * Affiche le statut final (succès, échec, alerte) avec des détails techniques.
 * Conforme à la charte de développement (snake_case, 4 espaces).
 *
 * @author Thomas Djotio Ndié
 * @date 30.09.25
 * @version 1.1
 */

"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Fingerprint,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  User,
  CreditCard,
  Loader2,
  MapPin,
  Briefcase,
  Ruler,
  Maximize
} from "lucide-react"
import { cn } from "@/lib/utils"
import { documentService } from "@/lib/api-client"
import Loading from "./loading"

// Constantes globales
const ID_LENGTH = 8

type VerificationResult = {
  documentType: string
  documentNumber: string
  holderName: string
  dateOfBirth: string
  issueDate: string
  expirationDate: string
  isValid: boolean
  validationMessage: string
  confidenceScore: number
  hasUncertainty: boolean
  additionalFields: Record<string, string>
  rawExtractedText: string
}

function ResultsContent() {
  const search_params = useSearchParams()
  const document_id = search_params.get("documentId")

  const [result_data, set_result_data] = useState<VerificationResult | null>(null)
  const [is_loading, set_is_loading] = useState(true)
  const [error_message, set_error_message] = useState<string | null>(null)

  useEffect(() => {
    const fetch_document_details = async () => {
      if (!document_id) {
        set_error_message("Aucun document fourni")
        set_is_loading(false)
        return
      }

      // Simuler un léger délai pour voir l'animation (optionnel, retirer en prod si nécessaire)
      // await new Promise(r => setTimeout(r, 2000))

      try {
        const cached_data = sessionStorage.getItem(`extraction_${document_id}`)
        if (cached_data) {
          const data = JSON.parse(cached_data)
          set_result_data(data as VerificationResult)
          console.log("[v0] Document details loaded from cache")
          set_is_loading(false)
          return
        }

        console.log("[v0] Fetching document details for:", document_id)
        const response = await documentService.getDetails(document_id)

        if (response && response.extraction_result) {
          // Mapping automatique si nécessaire, mais on suppose que le backend renvoie la bonne structure
          set_result_data(response.extraction_result as unknown as VerificationResult)
          console.log("[v0] Document details loaded successfully")
        } else {
          set_error_message("Résultat d'extraction non disponible (peut-être en cours de traitement)")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la récupération des résultats"
        set_error_message(message)
        console.error("[v0] Error fetching document:", err)
      } finally {
        set_is_loading(false)
      }
    }

    fetch_document_details()
  }, [document_id])

  // Utilitaire pour formater le type de document
  const format_document_type = (type: string): string => {
    if (!type) return "Document Inconnu"
    const lower = type.toLowerCase()
    if (lower.includes("cni") || lower.includes("carte") || lower.includes("id")) return "Carte Nationale d'Identité"
    if (lower.includes("passport") || lower.includes("passeport")) return "Passeport"
    if (lower.includes("permis") || lower.includes("license")) return "Permis de Conduire"
    return type.toUpperCase()
  }

  /**
   * Met en surbrillance les caractères suspects (mélange lettres/chiffres)
   */
  const highlightSuspicious = (text: string) => {
    if (!text) return text

    // Regex pour identifier les caractères souvent confondus dans un contexte mixte
    // Ex: Un '0' au milieu de lettres, ou un 'O' au milieu de chiffres
    const parts = text.split(/([01582GZSOB])/)

    return parts.map((part, i) => {
      const isSuspicious = /[01582GZSOB]/.test(part)
      if (isSuspicious) {
        return (
          <span
            key={i}
            className="bg-amber-100 text-amber-900 px-0.5 rounded border border-amber-200 cursor-help"
            title="Caractère potentiellement ambigu"
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  const get_status = (): "confirmed" | "expired" | "unclear" | "unreadable" | "invalid" => {
    if (!result_data) return "invalid"

    // Normalisation du score (gestion camelCase vs snake_case)
    const rawScore = result_data.confidenceScore ?? (result_data as any).confidence_score
    const score = typeof rawScore === 'number' ? rawScore : 0

    // Logique stricte demandée :
    // < 0.2 (20%) -> Illisible
    if (score < 0.2) {
      return "unreadable"
    }

    // 0.2 - 0.6 (20-60%) -> Incertain
    if (score >= 0.2 && score < 0.6) {
      return "unclear"
    }

    // > 0.6 (60%) -> Confirmé (Outrepasse les autres indicateurs si le score est très haut)
    if (score >= 0.6) {
      return "confirmed"
    }

    // Fallback standard
    if (result_data.isValid) {
      return "confirmed"
    }

    // Gestion des cas d'erreur
    if (result_data.expirationDate) {
      const expiration = new Date(result_data.expirationDate)
      if (expiration < new Date()) {
        return "expired"
      }
    }

    return "invalid"
  }

  // Afficher le composant Loading personnalisé pendant le chargement
  if (is_loading) {
    return <Loading />
  }

  const current_status = get_status()

  const status_config = {
    confirmed: {
      icon: CheckCircle2,
      color_class: "text-emerald-600",
      bg_class: "bg-emerald-50/80",
      border_class: "border-emerald-200",
      badge: "✔ VALIDE",
      title: "Identité Confirmée",
      desc: "L'authenticité de ce document a été validée avec succès. Toutes les vérifications de sécurité sont conformes.",
      show_details: true,
    },
    expired: {
      icon: AlertTriangle,
      color_class: "text-amber-500",
      bg_class: "bg-amber-50/80",
      border_class: "border-amber-200",
      badge: "⚠ À VÉRIFIER",
      title: "Document Expiré",
      desc: result_data
        ? `Ce document a expiré le ${new Date(result_data.expirationDate).toLocaleDateString("fr-FR")}. Sa validité ne peut être garantie.`
        : "Document expiré",
      show_details: true,
    },
    unclear: {
      icon: AlertTriangle,
      color_class: "text-orange-500",
      bg_class: "bg-orange-50/80",
      border_class: "border-orange-200",
      badge: "⚠ À VÉRIFIER",
      title: "Analyse Incertaine",
      desc: "Le document est lisible mais certains éléments sont douteux. Une vérification manuelle est recommandée.",
      show_details: true,
    },
    unreadable: {
      icon: XCircle,
      color_class: "text-red-600",
      bg_class: "bg-red-50/80",
      border_class: "border-red-200",
      badge: "❌ INVALIDE",
      title: "Document Illisible",
      desc: "La qualité de l'image est insuffisante (flou, reflets, ou trop sombre). Impossible d'extraire les données avec fiabilité.",
      show_details: false,
    },
    invalid: {
      icon: XCircle,
      color_class: "text-red-600",
      bg_class: "bg-red-50/80",
      border_class: "border-red-200",
      badge: "❌ INVALIDE",
      title: "Authentification Échouée",
      desc: "Le système a détecté des anomalies majeures. Ce document ne semble pas être authentique.",
      show_details: false,
    },
  }

  const active_config = status_config[current_status]
  const StatusIcon = active_config.icon
  const verification_id = `VRF-${Math.random().toString(36).substring(2, 2 + ID_LENGTH).toUpperCase()}`

  const format_date = (date_string: string): string => {
    if (!date_string) return "N/A"
    return new Date(date_string).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl relative z-10">
      {error_message || !result_data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto mt-20">
          <Card className="border-red-100 bg-red-50/90 backdrop-blur-md shadow-xl">
            <CardContent className="pt-6 flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Erreur de traitement</h3>
                <p className="text-slate-600 mt-2">{error_message || "Impossible de charger les résultats"}</p>
              </div>
            </CardContent>
          </Card>
          <Button asChild className="w-full h-14 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all bg-white text-slate-900 hover:bg-slate-50 border border-slate-200">
            <Link href="/upload">Retour à l'accueil</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Colonne de Gauche : Résultat Principal */}
          <div className="lg:col-span-1 space-y-6">
            <Card className={cn(
              "h-full overflow-hidden shadow-2xl transition-all duration-300 rounded-[2rem]",
              "bg-white/60 backdrop-blur-2xl border border-white/40",
              active_config.border_class
            )}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-8 relative">
                {/* Subtle gradient overlay */}
                <div className={cn("absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-br from-white via-transparent to-slate-100")} />

                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 md:w-36 md:h-36 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center relative z-10 transition-all",
                    "bg-white"
                  )}>
                    <StatusIcon className={cn("w-12 h-12 md:w-16 md:h-16", active_config.color_class)} />
                  </div>
                  {/* Animated Ring */}
                  {/* Removed complex svg for cleaner look, replacing with simple ring */}
                  <div className={cn("absolute -inset-4 rounded-full border-4 border-dashed animate-spin-slow opacity-30", active_config.color_class.replace('text-', 'border-'))} style={{ animationDuration: '10s' }} />
                </div>

                <div className="relative z-10 w-full">
                  <div className={cn("mb-6 px-6 py-2 rounded-2xl border-2 inline-flex items-center gap-2 shadow-sm",
                    active_config.bg_class,
                    active_config.border_class,
                    active_config.color_class
                  )}>
                    <span className="text-lg font-black tracking-widest">
                      {active_config.badge}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{active_config.title}</h2>
                  <div className={cn("px-4 py-1 rounded-full border inline-flex items-center gap-2",
                    result_data.confidenceScore > 0.8 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
                  )}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Confiance: {Math.round(result_data.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed text-base relative z-10 font-medium">
                  {active_config.desc || active_config.title}
                </p>

                <div className="w-full pt-6 border-t border-slate-200/50 relative z-10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ID TRANSACTION</p>
                  <p className="text-sm font-bold text-slate-700 font-mono bg-slate-100/50 py-1 px-3 rounded-lg inline-block">{verification_id}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne de Droite : Détails */}
          <div className="lg:col-span-2 space-y-6">
            {active_config.show_details ? (
              <>
                {/* Row 1: Document Info */}
                <Card className="glass border-white/60 rounded-[2rem] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Détails du Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Type de Pièce</p>
                      <p className="text-base font-bold text-slate-900">{format_document_type(result_data.documentType)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Numéro de Série</p>
                      <p className="text-base font-bold text-blue-600 font-mono tracking-wider">
                        {highlightSuspicious(result_data.documentNumber)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Délivré le</p>
                      <p className="text-sm font-semibold text-slate-700">{format_date(result_data.issueDate)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expire le</p>
                      <p className={cn("text-sm font-semibold", current_status === "expired" ? "text-amber-600" : "text-slate-700")}>
                        {format_date(result_data.expirationDate)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Validité Techn.</p>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", result_data.isValid ? "bg-emerald-500" : "bg-red-500")} />
                        <p className={cn("text-sm font-bold", result_data.isValid ? "text-emerald-700" : "text-red-700")}>
                          {result_data.isValid ? "Valide" : "Invalide"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Row 2: Holder Info */}
                <Card className="glass border-white/60 rounded-[2rem] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                      <User className="w-5 h-5 text-blue-600" />
                      Titulaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold text-xl">
                        {result_data.holderName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom Complet</p>
                        <p className="text-xl font-bold text-slate-900">
                          {highlightSuspicious(result_data.holderName)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Né(e) le</p>
                        <p className="text-sm font-bold text-slate-900">{format_date(result_data.dateOfBirth)}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-3">
                      <Fingerprint className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Données Bio.</p>
                        <p className="text-sm font-bold text-emerald-600">Extraites avec succès</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Row 3: Complementary Info */}
                {(result_data.additionalFields?.placeOfBirth || result_data.additionalFields?.occupation || result_data.additionalFields?.sex || result_data.additionalFields?.height) && (
                  <Card className="glass border-white/60 rounded-[2rem] shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Informations Complémentaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      {result_data.additionalFields.sex && (
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sexe</p>
                          <p className="text-base font-bold text-slate-900">{result_data.additionalFields.sex === "M" ? "Masculin" : result_data.additionalFields.sex === "F" ? "Féminin" : result_data.additionalFields.sex}</p>
                        </div>
                      )}
                      {result_data.additionalFields.height && (
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Ruler className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Taille</p>
                          </div>
                          <p className="text-base font-bold text-slate-900">{result_data.additionalFields.height}</p>
                        </div>
                      )}
                      {result_data.additionalFields.placeOfBirth && (
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lieu de Naissance</p>
                          </div>
                          <p className="text-base font-bold text-slate-900">{result_data.additionalFields.placeOfBirth}</p>
                        </div>
                      )}
                      {result_data.additionalFields.occupation && (
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profession</p>
                          </div>
                          <p className="text-base font-bold text-slate-900">{result_data.additionalFields.occupation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              // Error State Actions
              <div className="h-full flex flex-col justify-center gap-4">
                <Card className="glass border-white/60 rounded-[2rem] p-8 text-center space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Que faire maintenant ?</h3>
                  <p className="text-slate-500">
                    {current_status === "unclear"
                      ? "Assurez-vous d'avoir un bon éclairage et que le document est bien à plat."
                      : "Veuillez utiliser un document original en cours de validité."}
                  </p>
                  <Button
                    asChild
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Link href="/upload" className="flex items-center justify-center">
                      <RefreshCw className="mr-2 w-4 h-4" />
                      Réessayer la vérification
                    </Link>
                  </Button>
                </Card>
              </div>
            )}

            {/* Action Bar (Success) */}
            {current_status === "confirmed" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 font-bold transition-all"
                  asChild
                >
                  <Link href="/">
                    Retour au Tableau de Bord
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl transition-all"
                >
                  <Link href="/upload" className="flex items-center justify-center">
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Nouvelle Vérification
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px]" />
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-sky-300/10 blur-[80px]" />
      </div>

      <header className="border-b border-white/20 bg-white/70 backdrop-blur-md h-20 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">VerifID</span>
          </Link>
          <Button variant="ghost" asChild className="text-slate-500 hover:text-blue-600 hover:bg-white/50">
            <Link href="/">Déconnexion</Link>
          </Button>
        </div>
      </header>

      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </main>
        }
      >
        <ResultsContent />
      </Suspense>
    </div>
  )
}
