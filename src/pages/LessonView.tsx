import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle2, Star, Headphones, HelpCircle, Play, Pause, SkipForward, SkipBack, Presentation } from 'lucide-react';
import { courses } from '../data/courses';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const course = courses.find(c => c.id === courseId);
  if (!course) return <Navigate to="/explore" replace />;

  const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
  const lesson = course.lessons[lessonIndex];

  if (!lesson) return <Navigate to={`/course/${courseId}`} replace />;

  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

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
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={`/course/${course.id}`} className="flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Voltar para o Curso</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
            <div className="text-center flex-grow px-4 truncate">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold block truncate">
                {course.title}
              </span>
              <span className="text-sm font-medium truncate block">
                Aula {lessonIndex + 1} de {course.lessons.length}
              </span>
            </div>
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Media Players */}
        {lesson.mediaType === 'slide' && (
          <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl mb-8 relative flex items-center justify-center border border-zinc-800">
            {lesson.slideBgUrl && (
              <img 
                src={lesson.slideBgUrl} 
                alt="Slide Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-30" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 pointer-events-none"></div>
            
            <div className="relative z-10 p-8 md:p-16 text-center max-w-4xl mx-auto">
               <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">{lesson.title}</h2>
               <div className="w-24 h-1.5 bg-indigo-500 mx-auto mb-8 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
               <p className="text-xl md:text-2xl text-zinc-300 font-medium drop-shadow-md">{course.title}</p>
            </div>
            
            <div className="absolute bottom-6 right-8 text-white/40 text-sm font-bold tracking-widest uppercase">
              Voz & Carreira
            </div>
          </div>
        )}

        {lesson.mediaType === 'video' && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-8 relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
            
            {/* Fake Play Button */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 w-20 h-20 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-transform transform group-hover:scale-110 shadow-lg backdrop-blur-sm"
            >
              {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
            </button>

            {/* Fake Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-4 text-white/80 text-sm">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 rounded-full ${isPlaying ? 'w-1/3' : 'w-0'} transition-all duration-1000`}></div>
              </div>
              <span>{isPlaying ? '01:23' : '00:00'} / {lesson.duration}</span>
            </div>
          </div>
        )}

        {lesson.mediaType === 'audio' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm mb-8 flex flex-col items-center">
            <div className="w-full flex items-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <div className="flex-grow">
                <div className="flex justify-between text-sm font-medium text-zinc-500 mb-2">
                  <span>{isPlaying ? '01:23' : '00:00'}</span>
                  <span>{lesson.duration}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-indigo-500 rounded-full ${isPlaying ? 'w-1/3' : 'w-0'} transition-all duration-1000`}></div>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-zinc-400">
                  <button className="hover:text-zinc-600"><SkipBack className="w-5 h-5" /></button>
                  <button className="hover:text-zinc-600"><SkipForward className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {lesson.mediaType === 'quiz' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Quiz Interativo</h3>
            <p className="text-indigo-700 mb-6">Teste seus conhecimentos antes de prosseguir.</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Iniciar Quiz
            </button>
          </div>
        )}

        {/* Lesson Header */}
        <div className="mb-8 border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              lesson.isSpecial ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {getMediaIcon(lesson.mediaType, "w-3.5 h-3.5")}
              <span className="capitalize">
                {lesson.mediaType === 'text' ? 'Leitura' : 
                 lesson.mediaType === 'slide' ? 'Slide' : 
                 lesson.mediaType}
              </span>
            </span>
            {lesson.isSpecial && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-current" />
                Material Exclusivo
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-4">
            {lesson.title}
          </h1>
          
          <button
            onClick={() => setIsCompleted(!isCompleted)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCompleted 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-zinc-400'}`} />
            {isCompleted ? 'Aula Concluída' : 'Marcar como concluída'}
          </button>
        </div>

        {/* Lesson Content (Markdown) */}
        <div className="prose prose-zinc prose-lg max-w-none mb-16">
          <div className="markdown-body">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-200">
          {prevLesson ? (
            <Link
              to={`/course/${course.id}/lesson/${prevLesson.id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-300 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Aula Anterior
            </Link>
          ) : (
            <div className="hidden sm:block w-[160px]"></div>
          )}

          {nextLesson ? (
            <Link
              to={`/course/${course.id}/lesson/${nextLesson.id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Próxima Aula
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to={`/course/${course.id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              Finalizar Curso
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
