import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Star, BookOpen, Users, Mic2 } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSanitizedHTML } from '../hooks/useSanitizedHTML';

export default function Home() {
  const courses = useCourseStore(state => state.courses);
  const settings = useSettingsStore(state => state.settings);
  
  const sanitizedHeroTitle = useSanitizedHTML(settings.heroTitle, {
    allowedTags: ['span', 'em', 'strong'],
    allowedAttributes: { span: ['class'] }
  });
  
  const featuredCourse = courses.find(c => c.id === settings.featuredCourseId) || courses[0];
  const recentCourses = courses.filter(c => c.id !== featuredCourse?.id).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-indigo-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src={settings.heroImageUrl}
            className="w-full h-full object-cover"
            alt="Estúdio de Gravação"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: sanitizedHeroTitle }} />
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Começar Agora
              </Link>
              <Link
                to="/course/plano-de-carreira"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2"
              >
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                Plano de Carreira
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">+100</div>
              <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Minicursos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Gratuito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Acesso Livre</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">3</div>
              <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Áreas de Foco</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Career Plan */}
      {featuredCourse && (
        <section className="py-20 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold mb-6">
                  <Star className="w-4 h-4 fill-current" />
                  {settings.featuredTitle}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                  {featuredCourse.title}
                </h2>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  {featuredCourse.description}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1 rounded-full text-indigo-600 mt-1">
                      <Mic2 className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-700">Aprenda a montar seu Voice Reel profissional.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1 rounded-full text-indigo-600 mt-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-700">Comportamento e ética dentro do estúdio.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1 rounded-full text-indigo-600 mt-1">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-700 font-semibold">Lista exclusiva de contatos de estúdios para cadastro.</span>
                  </li>
                </ul>
                <Link
                  to={`/course/${featuredCourse.id}`}
                  className="inline-flex items-center justify-center bg-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
                >
                  Acessar Plano de Carreira
                </Link>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                  <img
                    src={featuredCourse.imageUrl}
                    className="w-full h-full object-cover"
                    alt="Plano de Carreira"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 pointer-events-none">
                    <div className="text-white">
                      <div className="font-bold text-xl mb-2">{settings.featuredTitle}</div>
                      <div className="text-white/80 text-sm">{settings.featuredSubtitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Adicionados Recentemente</h2>
              <p className="text-zinc-600">Explore os últimos minicursos de dublagem e fonoaudiologia.</p>
            </div>
            <Link to="/explore" className="hidden md:inline-flex text-indigo-600 font-medium hover:text-indigo-700">
              Ver todos os cursos &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden bg-zinc-100">
                  <img
                    src={course.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={course.title}
                  />
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm text-zinc-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-zinc-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-zinc-500 mt-auto pt-4 border-t border-zinc-100">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons.length} aulas
                    </span>
                    <span className="font-medium text-indigo-600">Acessar &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/explore" className="inline-flex text-indigo-600 font-medium hover:text-indigo-700">
              Ver todos os cursos &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
