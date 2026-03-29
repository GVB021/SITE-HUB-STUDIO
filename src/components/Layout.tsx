import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Explorar Cursos', path: '/explore' },
    { name: 'Plano de Carreira', path: '/course/plano-de-carreira' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-indigo-950">Voz & Carreira</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-indigo-600'
                      : 'text-zinc-600 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-zinc-500 hover:text-zinc-700 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-xl text-white">Voz & Carreira</span>
              </div>
              <p className="text-sm">
                Material de apoio gratuito com milhares de minicursos de dublagem, fonoaudiologia e desenvolvimento de carreira.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Categorias</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/explore?category=dublagem" className="hover:text-white transition-colors">Dublagem</Link></li>
                <li><Link to="/explore?category=fonoaudiologia" className="hover:text-white transition-colors">Fonoaudiologia</Link></li>
                <li><Link to="/explore?category=carreira" className="hover:text-white transition-colors">Carreira e Mercado</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Acesso Livre</h3>
              <p className="text-sm mb-4">
                Nossa plataforma é 100% gratuita e não exige cadastro. Acreditamos na democratização do conhecimento para futuros dubladores.
              </p>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} Voz & Carreira. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
