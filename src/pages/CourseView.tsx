import { useParams, Link, Navigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, ChevronLeft, Star, FileText, Headphones, HelpCircle, Presentation } from 'lucide-react';
import { courses } from '../data/courses';

export default function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <Navigate to="/explore" replace />;
  }

  const isCareerPlan = course.id === 'plano-de-carreira';

  const getMediaIcon = (type: string, className: string) => {
    switch (type) {
      case 'video': return <PlayCircle className={className} />;
      case 'audio': return <Headphones className={className} />;
      case 'quiz': return <HelpCircle className={className} />;
      case 'slide': return <Presentation className={className} />;
      case 'text':
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Course Header */}
      <div className="bg-zinc-900 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/explore" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para Explorar
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="w-full md:w-1/3 shrink-0">
              <div className={`aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-2xl ${isCareerPlan ? 'ring-4 ring-yellow-400/50' : ''}`}>
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {course.level}
                </span>
                {isCareerPlan && (
                  <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Destaque
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-zinc-300 mb-8 leading-relaxed max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.lessons.length} Aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Acesso Ilimitado</span>
                </div>
              </div>

              {course.lessons.length > 0 && (
                <Link
                  to={`/course/${course.id}/lesson/${course.lessons[0].id}`}
                  className="inline-flex items-center justify-center bg-white text-zinc-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-100 transition-colors shadow-lg"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  Iniciar Curso
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Conteúdo do Curso</h2>
        
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-100">
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to={`/course/${course.id}/lesson/${lesson.id}`}
                className={`flex items-center p-4 sm:p-6 hover:bg-zinc-50 transition-colors group ${
                  lesson.isSpecial ? 'bg-yellow-50/50 hover:bg-yellow-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mr-4 sm:mr-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    lesson.isSpecial 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                  } transition-colors`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base sm:text-lg font-semibold truncate ${
                      lesson.isSpecial ? 'text-yellow-900' : 'text-zinc-900'
                    }`}>
                      {lesson.title}
                    </h3>
                    {lesson.isSpecial && (
                      <span className="shrink-0 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Contatos
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-zinc-500 gap-4">
                    <span className="flex items-center gap-1">
                      {getMediaIcon(lesson.mediaType, "w-4 h-4")}
                      <span className="capitalize">
                        {lesson.mediaType === 'text' ? 'Leitura' : 
                         lesson.mediaType === 'slide' ? 'Slide' : 
                         lesson.mediaType}
                      </span> • {lesson.duration}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    lesson.isSpecial ? 'border-yellow-300 text-yellow-600' : 'border-zinc-200 text-zinc-400 group-hover:border-indigo-300 group-hover:text-indigo-600'
                  } transition-colors`}>
                    <PlayCircle className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
