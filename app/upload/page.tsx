/**
 * Page de téléchargement des documents pour vérification.
 * Permet de charger le recto et le verso de la pièce d'identité (PDF, PNG, JPG).
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
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Upload, FileImage, CheckCircle2, XCircle, Info, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDocumentUpload } from "@/hooks/use-document-upload"
import Loading from "../results/loading"
import { toast } from "sonner"
import { smartCompressImage } from "@/lib/image-compression"
import { checkNetworkStability } from "@/lib/network-check"

/**
 * Composant de la page d'upload.
 * Gère les états de prévisualisation et la validation des fichiers.
 */
export default function UploadPage() {
  const router = useRouter()
  const { uploadAndAnalyze, isLoading, error, clearError } = useDocumentUpload()

  // États des fichiers (snake_case)
  const [front_file, set_front_file] = useState<File | null>(null)
  const [back_file, set_back_file] = useState<File | null>(null)
  const [front_preview, set_front_preview] = useState<string | null>(null)
  const [back_preview, set_back_preview] = useState<string | null>(null)
  const [is_loading, set_is_loading] = useState<boolean>(false)
  const [is_submitting, set_is_submitting] = useState<boolean>(false)



  /**
   * Gère le changement de fichier pour une face donnée.
   * Compresse automatiquement les images si nécessaire.
   * @param event Événement de changement d'input
   * @param side Face du document (recto ou verso)
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const rawFile = event.target.files?.[0]
    if (!rawFile) return

    const valid_types = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    if (!valid_types.includes(rawFile.type)) {
      toast.error("Format de fichier incorrect", { description: "Utilisez PNG, JPG ou PDF." })
      return
    }

    // Si c'est un PDF, on bypass le recadrage (pas supporté en browser simplement)
    if (rawFile.type === "application/pdf") {
      set_front_file(rawFile)
      set_front_preview(null)
      if (side === "back") set_back_file(rawFile)
      return
    }

    // Tout est bon, on compresse directement
    try {
      set_is_loading(true)
      const processedFile = await smartCompressImage(rawFile)

      // Vérification de la taille totale (10 Mo)
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024
      const otherFileSize = side === "front" ? (back_file?.size || 0) : (front_file?.size || 0)

      if (processedFile.size + otherFileSize > MAX_TOTAL_SIZE) {
        toast.error("Fichiers trop volumineux", {
          description: "La taille totale dépasse 10 Mo.",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (side === "front") {
          set_front_file(processedFile)
          set_front_preview(e.target?.result as string)
        } else {
          set_back_file(processedFile)
          set_back_preview(e.target?.result as string)
        }
      }
      reader.readAsDataURL(processedFile)
    } catch (err) {
      console.error("Erreur de traitement:", err)
      toast.error("Erreur", { description: "Impossible de traiter l'image." })
    } finally {
      set_is_loading(false)
    }
  }

  /**
   * Déclenche la procédure de vérification.
   */
  const handleVerifyProcedure = async () => {
    if (!front_file) return
    if (!checkNetworkStability()) {
      toast.error("Connexion instable", {
        description: "Votre connexion internet semble instable. Veuillez vérifier votre réseau avant de réessayer.",
      })
      return
    }

    clearError()
    set_is_submitting(true)

    try {
      console.log("[v0] Starting document verification...")
      const response = await uploadAndAnalyze(front_file, {
        documentType: "",
        backFile: back_file || undefined,
      })

      // Générer un ID unique ou utiliser celui du backend
      const documentId = response.document_id || `doc_${Date.now()}`

      // Stocker les résultats d'extraction en sessionStorage pour transmission vers la page de résultats
      sessionStorage.setItem(`extraction_${documentId}`, JSON.stringify(response))

      console.log("[v0] Document uploaded, document_id:", documentId)

      // Rediriger vers la page de résultats avec les données
      router.push(`/results?documentId=${documentId}`)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      set_is_submitting(false)
    }
  }

  /**
   * Supprime le fichier d'une face.
   * @param side Face à supprimer
   */
  const removeFileSelection = (side: "front" | "back") => {
    if (side === "front") {
      set_front_file(null)
      set_front_preview(null)
    } else {
      set_back_file(null)
      set_back_preview(null)
    }
  }

  if (is_submitting) {
    return <Loading />
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navigation haute sophistiquée */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span>VerifID</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Session Sécurisée
            </div>
            <Button variant="ghost" asChild className="text-slate-500 hover:text-red-600 font-medium">
              <Link href="/">Déconnexion</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
        <div className="space-y-12">
          {/* Error displayed via toast */}

          {/* En-tête de page */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Vérification de Pièce</h1>
              <p className="text-slate-500 text-base md:text-lg">Veuillez soumettre les deux faces de votre document officiel.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold",
                      step === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400 pr-2">ÉTAPE 2/3</span>
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Section Recto */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Recto du Document
              </h3>
              <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden group">
                <CardContent className="p-6">
                  <label
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full min-h-[12rem] h-auto aspect-[4/3] sm:h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
                      front_file
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20",
                    )}
                  >
                    <input
                      type="file"
                      className="sr-only"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => handleFileChange(e, "front")}
                      disabled={isLoading}
                    />

                    {front_file ? (
                      <div className="flex flex-col items-center gap-4 p-4 text-center animate-in fade-in zoom-in duration-300">
                        {front_preview ? (
                          <div className="relative group/img">
                            <img
                              src={front_preview || "/placeholder.svg"}
                              alt="Recto Preview"
                              className="max-h-60 rounded-xl shadow-lg transition-transform group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-blue-600/10 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <FileImage className="w-10 h-10 text-blue-600" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{front_file.name}</p>
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Fichier prêt
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center p-8 transition-transform group-hover:scale-105 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">Cliquez pour déposer</p>
                          <p className="text-xs text-slate-400 uppercase tracking-tighter">
                            PNG, JPG ou PDF (max 10 Mo)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                  {front_file && (
                    <button
                      onClick={() => removeFileSelection("front")}
                      className="mt-4 w-full h-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4" /> Supprimer le fichier
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section Verso */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Verso du Document <span className="text-xs text-slate-300">(optionnel)</span>
              </h3>
              <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden group">
                <CardContent className="p-6">
                  <label
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full min-h-[12rem] h-auto aspect-[4/3] sm:h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
                      back_file
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20",
                    )}
                  >
                    <input
                      type="file"
                      className="sr-only"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => handleFileChange(e, "back")}
                      disabled={isLoading}
                    />

                    {back_file ? (
                      <div className="flex flex-col items-center gap-4 p-4 text-center animate-in fade-in zoom-in duration-300">
                        {back_preview ? (
                          <div className="relative group/img">
                            <img
                              src={back_preview || "/placeholder.svg"}
                              alt="Back Preview"
                              className="max-h-60 rounded-xl shadow-lg transition-transform group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-blue-600/10 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <FileImage className="w-10 h-10 text-blue-600" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{back_file.name}</p>
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Fichier prêt
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center p-8 transition-transform group-hover:scale-105 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">Cliquez pour déposer</p>
                          <p className="text-xs text-slate-400 uppercase tracking-tighter">
                            PNG, JPG ou PDF (max 10 Mo total)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                  {back_file && (
                    <button
                      onClick={() => removeFileSelection("back")}
                      className="mt-4 w-full h-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4" /> Supprimer le fichier
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer d'action */}
          <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl shadow-slate-900/20">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                <Info className="w-4 h-4" /> Information
              </div>
              <h4 className="text-white text-xl font-bold">Prêt pour l'analyse ?</h4>
              <p className="text-slate-400 text-sm max-w-sm">
                Vos documents seront analysés par notre intelligence artificielle sécurisée.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleVerifyProcedure}
              disabled={!front_file || isLoading}
              className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105 disabled:opacity-50 disabled:grayscale"
            >
              {isLoading ? "Initialisation..." : "Lancer la vérification"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        </div>
      </main>

    </div>
  )
}
