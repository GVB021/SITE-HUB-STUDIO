import { useState, useEffect, useRef } from 'react';
import { Menu, X, Play, Mic, Video, Cloud, Shield, Users, BarChart3, Clock, ChevronRight } from 'lucide-react';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">HubDub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors">Funcionalidades</a>
              <a href="#pricing" className="text-neutral-600 hover:text-neutral-900 transition-colors">Preços</a>
              <a href="#about" className="text-neutral-600 hover:text-neutral-900 transition-colors">Sobre</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors">
                Entrar
              </button>
              <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-md hover:-translate-y-0.5">
                Começar grátis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-neutral-200">
              <div className="flex flex-col space-y-4 mt-4">
                <a href="#features" className="text-neutral-600 hover:text-neutral-900">Funcionalidades</a>
                <a href="#pricing" className="text-neutral-600 hover:text-neutral-900">Preços</a>
                <a href="#about" className="text-neutral-600 hover:text-neutral-900">Sobre</a>
                <button className="px-4 py-2 text-neutral-700 hover:text-neutral-900">Entrar</button>
                <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  Começar grátis
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div ref={addToRefs} className="opacity-0">
              <p className="text-sm font-medium text-primary-600 tracking-wide uppercase mb-4">
                Plataforma profissional de dublagem remota
              </p>
            </div>
            
            <div ref={addToRefs} className="opacity-0">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight mb-6">
                Dublagem remota.<br />
                <span className="text-primary-500">Sem compromissos.</span>
              </h1>
            </div>

            <div ref={addToRefs} className="opacity-0">
              <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Estúdios profissionais conectados em tempo real. Grave, direcione e exporte
                <br />com a qualidade que seu projeto merece, de qualquer lugar do mundo.
              </p>
            </div>

            <div ref={addToRefs} className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium">
                Começar grátis
              </button>
              <button className="px-8 py-4 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all font-medium flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Ver demonstração
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div ref={addToRefs} className="opacity-0 mt-16 max-w-5xl mx-auto">
            <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200 shadow-lg">
              <div className="bg-white rounded-xl p-6">
                {/* Mock Room Interface */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-neutral-500">Studio Room</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-900 rounded-lg aspect-video flex items-center justify-center">
                    <Video className="w-12 h-12 text-neutral-600" />
                  </div>
                  <div className="bg-neutral-100 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-neutral-300 rounded w-3/4"></div>
                      <div className="h-2 bg-neutral-300 rounded w-1/2"></div>
                      <div className="h-2 bg-neutral-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-accent-100 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-success-100 rounded-full border-2 border-white"></div>
                  </div>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">
                    Gravar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="py-12 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-lg text-neutral-600">Confiado por estúdios profissionais</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-32 h-12 bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={addToRefs} className="opacity-0 text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Tudo que um estúdio precisa
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Ferramentas profissionais para dublagem remota com qualidade de estúdio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Sincronia Absoluta",
                description: "Video runs at the same frame for everyone. Timing perfeito entre diretor e dubladores."
              },
              {
                icon: <Cloud className="w-6 h-6" />,
                title: "Takes na Nuvem",
                description: "Audio vai para o servidor instantaneamente depois de gravar. Nunca perca uma gravação."
              },
              {
                icon: <Mic className="w-6 h-6" />,
                title: "Room Integrada",
                description: "Video, script e chamada em uma tela só. Interface limpa e focada na gravação."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "HubAlign",
                description: "Timelines prontas para editores. Exporte takes sincronizados com timecodes precisos."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Seguro e Confiável",
                description: "Testado em Wi-Fi reais. Conexão estável mesmo em redes comuns."
              },
              {
                icon: <Video className="w-6 h-6" />,
                title: "Multi-usuário",
                description: "Diretores, dubladores e engenheiros na mesma sessão. Colaboração em tempo real."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                ref={addToRefs}
                className="opacity-0 bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div ref={addToRefs} className="opacity-0 text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-neutral-600">
              Configure e grave em minutos, não horas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                number: "1",
                title: "Crie sua sessão",
                description: "Configure sua sala de gravação com video, script e participantes. Convide sua equipe."
              },
              {
                number: "2", 
                title: "Entre na Room",
                description: "Acesse pelo navegador. Sem instalar nada. Funciona em qualquer dispositivo com camera."
              },
              {
                number: "3",
                title: "Grave e exporte",
                description: "Grave em tempo real com sincronia perfeita. Exporte takes prontos para edição."
              }
            ].map((step, index) => (
              <div 
                key={index}
                ref={addToRefs}
                className="opacity-0 text-center"
              >
                <div className="text-6xl font-bold text-primary-500 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={addToRefs}
            className="opacity-0 bg-neutral-900 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Pronto para gravar?
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Configure seu estúdio em menos de 5 minutos e comece a dublar remotamente hoje mesmo
            </p>
            <button className="px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium text-lg">
              Começar agora
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-neutral-900">HubDub</span>
              </div>
              <p className="text-neutral-600 text-sm">
                Plataforma profissional de dublagem remota
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-neutral-900">Preços</a></li>
                <li><a href="#" className="hover:text-neutral-900">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900">Sobre nós</a></li>
                <li><a href="#" className="hover:text-neutral-900">Blog</a></li>
                <li><a href="#" className="hover:text-neutral-900">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900">Privacidade</a></li>
                <li><a href="#" className="hover:text-neutral-900">Termos</a></li>
                <li><a href="#" className="hover:text-neutral-900">Segurança</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
            © 2024 HubDub. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
