import { create } from 'zustand';
import localforage from 'localforage';
import { courses as initialCourses, Course } from '../data/courses';

const STORAGE_LIMIT_MB = 50;

const estimateStorageSize = (data: any): number => {
  return new Blob([JSON.stringify(data)]).size;
};

const checkStorageQuota = async (newData: any): Promise<boolean> => {
  const estimatedSize = estimateStorageSize(newData);
  const limitBytes = STORAGE_LIMIT_MB * 1024 * 1024;
  
  if (estimatedSize > limitBytes) {
    throw new Error(
      `Limite de armazenamento atingido (${Math.round(estimatedSize / 1024 / 1024)} MB / ${STORAGE_LIMIT_MB} MB). ` +
      'Considere: 1) Excluir cursos antigos, 2) Usar imagens menores, 3) Migrar para CDN.'
    );
  }
  
  return true;
};

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  storageError: string | null;
  loadCourses: () => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  clearStorageError: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: true,
  storageError: null,
  
  clearStorageError: () => set({ storageError: null }),
  loadCourses: async () => {
    try {
      const storedCourses = await localforage.getItem<Course[]>('courses');
      
      if (storedCourses && storedCourses.length > 0) {
        const storedIds = new Set(storedCourses.map(c => c.id));
        const newHardcodedCourses = initialCourses.filter(c => !storedIds.has(c.id));
        
        if (newHardcodedCourses.length > 0) {
          const combinedCourses = [...storedCourses, ...newHardcodedCourses];
          await checkStorageQuota(combinedCourses);
          await localforage.setItem('courses', combinedCourses);
          set({ courses: combinedCourses, isLoading: false });
        } else {
          set({ courses: storedCourses, isLoading: false });
        }
      } else {
        await checkStorageQuota(initialCourses);
        await localforage.setItem('courses', initialCourses);
        set({ courses: initialCourses, isLoading: false });
      }
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota') || error.message?.includes('Limite')) {
        set({ 
          storageError: error.message || 'Armazenamento local cheio. Limpe dados do navegador.',
          courses: initialCourses,
          isLoading: false 
        });
      } else {
        set({ 
          courses: initialCourses, 
          isLoading: false,
          storageError: error.message 
        });
      }
    }
  },
  addCourse: async (course) => {
    try {
      const newCourses = [...get().courses, course];
      await checkStorageQuota(newCourses);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to add course:', error);
      set({ storageError: error.message });
      throw error;
    }
  },
  updateCourse: async (updatedCourse) => {
    try {
      const newCourses = get().courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
      await checkStorageQuota(newCourses);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to update course:', error);
      set({ storageError: error.message });
      throw error;
    }
  },
  deleteCourse: async (id) => {
    try {
      const newCourses = get().courses.filter(c => c.id !== id);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      set({ storageError: error.message });
      throw error;
    }
  }
}));
