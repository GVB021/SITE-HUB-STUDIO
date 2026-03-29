import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { courses } from '../data/courses';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = categoryFilter === 'All' || course.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const categories = ['All', 'Dublagem', 'Fonoaudiologia', 'Carreira'];

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-zinc-900 mb-4">Explorar Minicursos</h1>
          <p className="text-lg text-zinc-600">
            Acesse milhares de materiais de apoio gratuitos para aprimorar sua técnica vocal e impulsionar sua carreira na dublagem.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40">
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat.toLowerCase() })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  (categoryFilter.toLowerCase() === cat.toLowerCase()) || (categoryFilter === 'All' && cat === 'All')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat === 'All' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-xl leading-5 bg-white placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 text-zinc-500 font-medium">
          Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link 
                to={`/course/${course.id}`} 
                className={`group flex flex-col h-full bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  course.id === 'plano-de-carreira' ? 'border-yellow-400 ring-1 ring-yellow-400 shadow-md' : 'border-zinc-200'
                }`}
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-100">
                  <img
                    src={course.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={course.title}
                  />
                  <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {course.category}
                    </span>
                    {course.id === 'plano-de-carreira' && (
                       <span className="bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                         Destaque
                       </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-zinc-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-100">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons.length} aulas
                    </span>
                    <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-medium">
                      {course.level}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-zinc-500">Tente ajustar seus filtros ou termo de busca.</p>
            <button 
              onClick={() => { setSearchParams({}); setSearchQuery(''); }}
              className="mt-6 text-indigo-600 font-medium hover:text-indigo-700"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
