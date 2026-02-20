/**
 * Page d'accueil principale de l'application de vérification d'identité.
 * Cette page présente les fonctionnalités clés et permet d'accéder à l'authentification.
 *
 * @author Thomas Djotio Ndié
 * @date 30.09.25
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Lock, Zap, ArrowRight, CheckCircle2, Twitter, Facebook, Instagram } from "lucide-react"

/**
 * Composant de la page d'accueil.
 * Respecte les contraintes de design sophistiqué blanc et bleu.
 */
export default function HomePage() {
  const app_name = "VerifID"
  const hero_title = "Vérification d'Identité Nouvelle Génération"

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      {/* Header sophistiqué avec bordure subtile */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex items-center justify-center bg-white rounded-full p-2 border border-slate-100 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{app_name}</span>
          </div>

          <nav className="flex items-center gap-4 md:gap-8">
            <Button
              asChild
              className="flex bg-slate-950 hover:bg-slate-900 text-white rounded-full px-4 md:px-8 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Link href="/about">À propos</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 md:px-8 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Link href="/login">Connexion</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32">
          <div className="container relative mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50/80 backdrop-blur-sm text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Lock className="w-3 h-3" />
                Standard de Sécurité Bancaire
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {hero_title}
              </h1>

              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Automatisez la validation des documents officiels avec une précision inégalée. Sécurisé, rapide et
                conforme aux normes internationales.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-10 text-lg rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:to-slate-700 text-white shadow-xl transition-all hover:translate-y-[-2px]"
                >
                  <Link href="/login" className="flex items-center gap-2">
                    Démarrer maintenant
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Vérification Rapide",
                  desc: "Analyse OCR et biométrique en moins d'une minute pour une expérience utilisateur fluide.",
                  icon: Zap,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  title: "Protection Avancée",
                  desc: "Chiffrement de bout en bout et détection de fraude assistée par IA.",
                  icon: Lock,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Haute Précision",
                  desc: "Taux d'erreur inférieur à 3% sur les documents officiels internationaux.",
                  icon: CheckCircle2,
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            {app_name}
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {app_name}. Conçu par {app_name} Team.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors" title="Twitter / X">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors" title="Facebook">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors" title="Instagram">
              <Instagram className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
