import React, { useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import { useSettingsStore, AppSettings } from '../store/settingsStore';
import { Course, Lesson, MediaType } from '../data/courses';
import { Plus, Trash2, Image as ImageIcon, Save, X, LayoutTemplate, BookOpen, AlertTriangle } from 'lucide-react';
import { validateImageFile, validateImageDimensions } from '../utils/imageValidation';
import { LoginRateLimiter } from '../utils/rateLimiter';
import { nanoid } from 'nanoid';

const rateLimiter = new LoginRateLimiter();

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Utility function to compress images before saving to localforage
const compressImage = (file: File, maxWidth: number = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.7 quality to save space
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'settings'>('courses');
  const [isLoading, setIsLoading] = useState(false);
  
  const { courses, addCourse, updateCourse, deleteCourse, storageError, clearStorageError } = useCourseStore();
  const { settings, updateSettings } = useSettingsStore();
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSettings, setEditingSettings] = useState<AppSettings | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimiter.isLocked()) {
      const minutesRemaining = rateLimiter.getLockoutRemaining();
      alert(`Muitas tentativas incorretas. Tente novamente em ${minutesRemaining} minutos.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const hashedInput = await hashPassword(password);
      const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5';
      
      if (hashedInput === expectedHash) {
        rateLimiter.clearAttempts();
        setIsAuthenticated(true);
        setPassword('');
      } else {
        rateLimiter.recordAttempt();
        const remaining = rateLimiter.getRemainingAttempts();
        
        if (remaining === 0) {
          alert('Conta bloqueada por 15 minutos devido a múltiplas tentativas incorretas.');
        } else {
          alert(`Senha incorreta. ${remaining} tentativa(s) restante(s).`);
        }
      }
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      alert('Erro de autenticação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    e.target.value = '';
    
    try {
      const fileValidation = validateImageFile(file);
      if (!fileValidation.isValid) {
        alert(fileValidation.error);
        return;
      }
      
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.isValid) {
        alert(dimensionValidation.error);
        return;
      }
      
      const compressedBase64 = await compressImage(file);
      
      const base64SizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
      if (base64SizeKB > 500) {
        alert(`Imagem comprimida ainda muito grande (${base64SizeKB} KB). Use uma imagem menor ou de menor qualidade.`);
        return;
      }
      
      callback(compressedBase64);
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Erro ao processar a imagem. Tente outro arquivo.");
    }
  };

  const createNewCourse = () => {
    const newCourse: Course = {
      id: `course-${nanoid(10)}`,
      title: 'Novo Curso',
      description: '',
      category: 'Carreira',
      imageUrl: 'https://images.unsplash.com/photo-1516280440502-65f536af1214?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      level: 'Iniciante',
      lessons: []
    };
    setEditingCourse(newCourse);
  };

  const addLesson = () => {
    if (!editingCourse) return;
    const newLesson: Lesson = {
      id: `lesson-${nanoid(10)}`,
      title: 'Nova Aula',
      duration: '10 min',
      content: '',
      mediaType: 'slide',
      slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    };
    setEditingCourse({
      ...editingCourse,
      lessons: [...editingCourse.lessons, newLesson]
    });
  };

  const saveCourse = async () => {
    if (!editingCourse) return;
    
    if (!editingCourse.title.trim()) {
      alert('O título do curso não pode estar vazio.');
      return;
    }
    
    if (!editingCourse.description.trim()) {
      alert('A descrição do curso não pode estar vazia.');
      return;
    }
    
    try {
      const exists = courses.some(c => c.id === editingCourse.id);
      if (exists) {
        await updateCourse(editingCourse);
      } else {
        await addCourse(editingCourse);
      }
      alert('Curso salvo com sucesso!');
      setEditingCourse(null);
    } catch (error: any) {
      alert('Erro ao salvar curso: ' + error.message);
    }
  };

  const saveSettings = async () => {
    if (editingSettings) {
      await updateSettings(editingSettings);
      alert('Configurações salvas com sucesso!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Painel Administrativo</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha Master</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite a senha"
            />
          </div>
          {rateLimiter.isLocked() && (
            <div className="text-red-600 text-sm text-center mb-4">
              🔒 Conta bloqueada por {rateLimiter.getLockoutRemaining()} minutos
            </div>
          )}
          <button 
            type="submit" 
            disabled={rateLimiter.isLocked() || isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificando...' : rateLimiter.isLocked() ? 'Bloqueado' : 'Acessar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {storageError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-600 text-sm flex-grow">
            <p className="font-bold mb-1">⚠️ Erro de Armazenamento</p>
            <p>{storageError}</p>
            <button 
              onClick={clearStorageError}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'courses' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <BookOpen className="w-4 h-4" /> Cursos
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              setEditingSettings(settings);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'settings' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutTemplate className="w-4 h-4" /> Página Inicial
          </button>
        </div>
      </div>

      {activeTab === 'settings' && editingSettings ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Editar Página Inicial</h2>
            <button onClick={saveSettings} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Save className="w-5 h-5" /> Salvar Alterações
            </button>
          </div>

          <div className="space-y-8">
            {/* Hero Section */}
            <div>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">Seção Principal (Hero)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal (Suporta HTML, ex: &lt;span class="text-indigo-400"&gt;carreira&lt;/span&gt;)</label>
                  <input
                    type="text"
                    value={editingSettings.heroTitle}
                    onChange={e => setEditingSettings({...editingSettings, heroTitle: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                  <textarea
                    value={editingSettings.heroSubtitle}
                    onChange={e => setEditingSettings({...editingSettings, heroSubtitle: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg h-24"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo (Hero)</label>
                  <div className="flex items-center gap-4">
                    <img src={editingSettings.heroImageUrl} alt="Hero" className="w-48 h-24 object-cover rounded-lg border" />
                    <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                      <ImageIcon className="w-5 h-5" /> Fazer Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => setEditingSettings({...editingSettings, heroImageUrl: base64}))} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">Seção de Destaque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título do Destaque (Badge)</label>
                  <input
                    type="text"
                    value={editingSettings.featuredTitle}
                    onChange={e => setEditingSettings({...editingSettings, featuredTitle: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo do Destaque (Imagem)</label>
                  <input
                    type="text"
                    value={editingSettings.featuredSubtitle}
                    onChange={e => setEditingSettings({...editingSettings, featuredSubtitle: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Curso em Destaque</label>
                  <select
                    value={editingSettings.featuredCourseId}
                    onChange={e => setEditingSettings({...editingSettings, featuredCourseId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'courses' && editingCourse ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Editando Curso</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditingCourse(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <button onClick={saveCourse} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Save className="w-5 h-5" /> Salvar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título do Curso</label>
              <input
                type="text"
                value={editingCourse.title}
                onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={editingCourse.category}
                onChange={e => setEditingCourse({...editingCourse, category: e.target.value as any})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Dublagem">Dublagem</option>
                <option value="Fonoaudiologia">Fonoaudiologia</option>
                <option value="Carreira">Carreira</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={editingCourse.description}
                onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg h-24"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumb do Curso (Imagem Principal)</label>
              <div className="flex items-center gap-4">
                <img src={editingCourse.imageUrl} alt="Thumb" className="w-32 h-20 object-cover rounded-lg border" />
                <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                  <ImageIcon className="w-5 h-5" /> Fazer Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => setEditingCourse({...editingCourse, imageUrl: base64}))} />
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Aulas ({editingCourse.lessons.length})</h3>
              <button onClick={addLesson} className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg">
                <Plus className="w-4 h-4" /> Adicionar Aula
              </button>
            </div>

            <div className="space-y-6">
              {editingCourse.lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-4 border rounded-lg bg-gray-50 relative">
                  <button 
                    onClick={() => {
                      const hasContent = lesson.content.length > 50;
                      const message = hasContent
                        ? `Tem certeza que deseja excluir a aula "${lesson.title}"? Ela contém ${lesson.content.length} caracteres de conteúdo.`
                        : `Excluir a aula "${lesson.title}"?`;
                      
                      if (confirm(message)) {
                        const newLessons = [...editingCourse.lessons];
                        newLessons.splice(index, 1);
                        setEditingCourse({...editingCourse, lessons: newLessons});
                      }
                    }}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    aria-label={`Excluir aula ${lesson.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-12">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título da Aula</label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].title = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].duration = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (Markdown suportado)</label>
                      <textarea
                        value={lesson.content}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].content = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg h-32"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Slide</label>
                      <div className="flex items-center gap-4">
                        <img src={lesson.slideBgUrl} alt="Slide" className="w-32 h-20 object-cover rounded-lg border" />
                        <label className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                          <ImageIcon className="w-4 h-4" /> Fazer Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => {
                            const newLessons = [...editingCourse.lessons];
                            newLessons[index].slideBgUrl = base64;
                            setEditingCourse({...editingCourse, lessons: newLessons});
                          })} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full flex justify-end mb-4">
            <button
              onClick={createNewCourse}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" /> Novo Curso
            </button>
          </div>
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{course.lessons.length} aulas</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCourse(course)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => {
                      if (course.id === settings.featuredCourseId) {
                        alert(
                          '⚠️ Este curso está definido como DESTAQUE na página inicial.\n\n' +
                          'Para excluí-lo, primeiro vá em "Página Inicial" e escolha outro curso como destaque.'
                        );
                        return;
                      }
                      
                      const lessonCount = course.lessons.length;
                      const message = lessonCount > 0
                        ? `Tem certeza que deseja excluir "${course.title}"?\n\nEste curso possui ${lessonCount} aula(s) que serão perdidas permanentemente.`
                        : `Excluir o curso "${course.title}"?`;
                      
                      if (confirm(message)) {
                        deleteCourse(course.id);
                      }
                    }} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
