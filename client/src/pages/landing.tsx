import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Mic, BarChart3, Cloud, Radio, Shield, Users, Check } from "lucide-react";

// Fade-in animation hook using Intersection Observer
function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useFadeInOnScroll();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-12">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-gray-900" />
            <span className="text-lg font-semibold text-gray-900">HubDub</span>
          </Link>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Preços
            </button>
            <button
              onClick={() => scrollToSection("cta")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sobre
            </button>
          </div>

          {/* Right: CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
                Entrar
              </button>
            </Link>
            <Link to="/auth/signup">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Começar grátis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="min-h-screen bg-white flex items-center">
        <div className="max-w-4xl mx-auto text-center px-6 py-20">
          <FadeInSection>
            {/* Badge */}
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              Plataforma profissional de dublagem
            </span>

            {/* H1 */}
            <h1 className="text-6xl font-bold text-gray-900 leading-tight mt-4">
              Dublagem remota.
              <br />
              Sem fronteiras.
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
              Sincronize vídeo, roteiro e comunicação em uma única sala.
              Grave, aprove e exporte sem sair do navegador.
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link to="/auth/signup">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Começar grátis
                </button>
              </Link>
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="border border-gray-300 px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver como funciona
              </button>
            </div>
          </FadeInSection>

          {/* App Mockup */}
          <FadeInSection delay={200} className="mt-12">
            <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white max-w-2xl mx-auto">
              {/* Mockup Top Bar */}
              <div className="bg-gray-900 h-8 flex items-center px-3 gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white text-xs">HubDub</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-3 h-3 rounded-full border border-gray-500" />
                  <div className="w-3 h-3 rounded-full border border-gray-500" />
                </div>
              </div>

              {/* Mockup Content */}
              <div className="grid grid-cols-[160px_1fr_1fr] h-48">
                {/* Left Sidebar */}
                <div className="bg-gray-900 text-white text-xs p-2">
                  <div className="text-gray-400 text-xs mb-2 px-1">Room</div>
                  <div className="space-y-1">
                    <div className="px-2 py-1 rounded bg-blue-600 text-white">Sessão</div>
                    <div className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300">Roteiro</div>
                    <div className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300">Tomadas</div>
                    <div className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300">Ferramentas</div>
                    <div className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300">Notas</div>
                    <div className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300">Settings</div>
                  </div>
                </div>

                {/* Center */}
                <div className="bg-white p-2 border-r border-gray-100">
                  <div className="bg-gray-800 rounded w-full h-24 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  </div>
                </div>

                {/* Right */}
                <div className="bg-white p-2">
                  <div className="text-xs font-bold text-gray-900 mb-2">Funcionalidades</div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Sincronia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Roteiro Integrado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Room Integrada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>HubAlign</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="bg-gray-50 py-8 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <p className="text-sm text-gray-500 text-center mb-6">
              Usado por estúdios profissionais em todo o Brasil
            </p>
            <div className="flex items-center justify-center gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg h-8 w-24"
                />
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center">
              <span className="text-xs tracking-widest text-blue-600 uppercase">FEATURES</span>
              <h2 className="text-5xl font-bold text-gray-900 mt-2">
                Tudo que um estúdio precisa
              </h2>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
                title: "Sincronia Absoluta",
                description: "Sincronize vídeo, áudio e roteiro com precisão de frame. Acompanhe cada tomada em tempo real.",
              },
              {
                icon: <Cloud className="w-5 h-5 text-blue-600" />,
                title: "Takes na Nuvem",
                description: "Armazene, organize e acesse todas as suas gravações de qualquer lugar. Backup automático.",
              },
              {
                icon: <Radio className="w-5 h-5 text-blue-600" />,
                title: "Room Integrada",
                description: "Sala virtual completa com comunicação em tempo real, controle de diretor e participação remota.",
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
                title: "HubAlign",
                description: "Dashboard completo para gerenciar produções, sessões, dubladores e aprovações em um só lugar.",
              },
              {
                icon: <Shield className="w-5 h-5 text-blue-600" />,
                title: "Seguro e Confiável",
                description: "Criptografia de ponta a ponta, controle de acesso granular e conformidade com LGPD.",
              },
              {
                icon: <Users className="w-5 h-5 text-blue-600" />,
                title: "Multi-usuário",
                description: "Trabalhe em equipe com diretores, dubladores e técnicos simultaneamente na mesma sessão.",
              },
            ].map((feature, index) => (
              <FadeInSection key={index} delay={index * 100}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm mt-2">{feature.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-xs tracking-widest text-blue-600 uppercase">COMO FUNCIONA</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">
                Simples do início ao fim
              </h2>
            </div>
          </FadeInSection>

          <div className="space-y-24">
            {/* Step 01 */}
            <FadeInSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <span className="text-6xl font-bold text-gray-200">01</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">Crie sua sessão</h3>
                  <p className="text-gray-500 mt-3">
                    Configure uma nova sessão de dublagem em minutos. Importe seu vídeo,
                    carregue o roteiro e convide sua equipe. Tudo pronto para começar.
                  </p>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="rounded-2xl bg-white shadow-sm border aspect-video flex items-center justify-center">
                    <div className="text-gray-300 text-sm">Mockup: Criação de sessão</div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Step 02 */}
            <FadeInSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-1">
                  <div className="rounded-2xl bg-white shadow-sm border aspect-video flex items-center justify-center">
                    <div className="text-gray-300 text-sm">Mockup: Recording Room</div>
                  </div>
                </div>
                <div className="order-2">
                  <span className="text-6xl font-bold text-gray-200">02</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">Entre na Room</h3>
                  <p className="text-gray-500 mt-3">
                    Acesse nossa sala virtual profissional com vídeo sincronizado,
                    roteiro interativo e controles de gravação. Diretores e dubladores
                    trabalham juntos em tempo real.
                  </p>
                </div>
              </div>
            </FadeInSection>

            {/* Step 03 */}
            <FadeInSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <span className="text-6xl font-bold text-gray-200">03</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">Grave e exporte</h3>
                  <p className="text-gray-500 mt-3">
                    Grave suas tomadas com qualidade profissional. Revise, aprove ou
                    solicite regravações. Exporte o áudio final mixado pronto para entrega.
                  </p>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="rounded-2xl bg-white shadow-sm border aspect-video flex items-center justify-center">
                    <div className="text-gray-300 text-sm">Mockup: Exportação</div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section id="cta" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <FadeInSection>
            <div className="bg-gray-900 rounded-3xl p-16 text-center">
              <span className="text-xs text-gray-500 tracking-widest uppercase">CTA FINAL</span>
              <h2 className="text-5xl font-bold text-white mt-4">
                Pronto para gravar?
              </h2>
              <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                Sincronize vídeo, roteiro e comunicação em uma única sala.
                Grave, aprove e exporte sem sair do navegador.
              </p>
              <Link to="/auth/signup">
                <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold mt-8 hover:bg-gray-100 transition-colors">
                  Começar agora
                </button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left: Logo & Tagline */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <Mic className="w-5 h-5 text-gray-900" />
                <span className="text-lg font-semibold text-gray-900">HubDub</span>
              </Link>
              <p className="text-gray-400 text-sm">
                HubDub, a professional remote real-time dubbing platform.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection("features")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Funcionalidades</button></li>
                <li><button onClick={() => scrollToSection("como-funciona")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Como funciona</button></li>
                <li><span className="text-sm text-gray-500">Preços</span></li>
                <li><span className="text-sm text-gray-500">Integrações</span></li>
                <li><span className="text-sm text-gray-500">API</span></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-500">Sobre</span></li>
                <li><span className="text-sm text-gray-500">Blog</span></li>
                <li><span className="text-sm text-gray-500">Carreiras</span></li>
                <li><span className="text-sm text-gray-500">Contato</span></li>
                <li><span className="text-sm text-gray-500">Parceiros</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-500">Privacidade</span></li>
                <li><span className="text-sm text-gray-500">Termos</span></li>
                <li><span className="text-sm text-gray-500">LGPD</span></li>
                <li><span className="text-sm text-gray-500">Cookies</span></li>
                <li><span className="text-sm text-gray-500">Licenças</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-12 pt-8 text-center">
            <p className="text-xs text-gray-400">
              Copyright © HubDub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
