import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Brain, Lock, Zap, ArrowRight, ArrowLeft, Search, FileText, LayoutDashboard } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/70 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">VerifID</span>
          </Link>

          <Button variant="ghost" asChild className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[100px] opacity-40" />
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-blue-100 shadow-sm">
              <Brain className="w-4 h-4" />
              Intelligence Artificielle de Pointe
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
              La sécurité documentaire <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">réinventée par l'IA</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
              VerifID n'est pas qu'un simple outil de validation. C'est une forteresse numérique capable de détecter les fraudes les plus sophistiquées en quelques secondes, garantissant l'authenticité de chaque interaction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl hover:shadow-blue-500/25 transition-all text-lg">
                <Link href="/upload">Commencer une vérification</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 font-bold transition-all text-lg">
                <Link href="#how-it-works">Comment ça marche ?</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Pourquoi choisir VerifID ?</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Une technologie conçue pour les entreprises exigeantes et les utilisateurs soucieux de leur sécurité.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Vitesse Éclair",
                  desc: "Analyse complète en moins de 5 secondes. Ne faites plus attendre vos utilisateurs.",
                  color: "blue",
                },
                {
                  icon: Brain,
                  title: "Analyse Heuristique",
                  desc: "Notre IA détecte les incohérences invisibles à l'œil nu : polices modifiées, hologrammes altérés et métadonnées suspectes.",
                  color: "violet",
                },
                {
                  icon: Lock,
                  title: "Confidentialité Totale",
                  desc: "Vos données sont chiffrées de bout en bout. Aucune image n'est stockée une fois l'analyse terminée.",
                  color: "emerald",
                },
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Un processus simple et transparent</h2>
                <div className="space-y-8">
                  {[
                    {
                      step: "01",
                      title: "Téléchargement Sécurisé",
                      desc: "Envoyez une photo de votre pièce d'identité (CNI, Passeport, Permis). Le transfert est chiffré.",
                      icon: FileText
                    },
                    {
                      step: "02",
                      title: "Extraction & Analyse",
                      desc: "Nos algorithmes OCR extraient les données textuelles tandis que l'IA vérifie l'intégrité visuelle du document.",
                      icon: Search
                    },
                    {
                      step: "03",
                      title: "Résultat Certifié",
                      desc: "Obtenez un rapport détaillé avec un score de confiance et la liste des points de contrôle validés.",
                      icon: ShieldCheck
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400 bg-white">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-4 py-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                {/* Abstract visual representation of the app */}
                <div className="aspect-square rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 absolute inset-0 blur-3xl opacity-50" />
                <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                      <div className="h-3 w-20 bg-slate-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 flex items-center justify-center text-slate-300">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-5/6 bg-slate-100 rounded" />
                      <div className="h-3 w-4/6 bg-slate-100 rounded" />
                    </div>
                    <div className="pt-4 flex gap-2">
                      <div className="flex-1 h-10 bg-blue-600 rounded-lg" />
                      <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à sécuriser vos processus ?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Rejoignez les milliers d'utilisateurs qui font confiance à VerifID pour leurs besoins de vérification d'identité.
            </p>
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 font-bold text-lg shadow-2xl transition-all hover:scale-105">
              <Link href="/upload">
                Lancer une démonstration gratuite
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>VerifID</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 VerifID Security Systems. Tous droits réservés.
          </div>
          <div className="flex gap-6 text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Conditions</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
