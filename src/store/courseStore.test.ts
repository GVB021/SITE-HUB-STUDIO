import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCourseStore } from './courseStore';
import localforage from 'localforage';

vi.mock('localforage');

describe('courseStore', () => {
  beforeEach(() => {
    const store = useCourseStore.getState();
    useCourseStore.setState({
      courses: [],
      isLoading: true,
      storageError: null,
    });
    vi.clearAllMocks();
  });

  describe('loadCourses', () => {
    it('should load courses from localforage', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Test Course',
          description: 'Test Description',
          category: 'Dublagem' as const,
          imageUrl: 'test.jpg',
          level: 'Iniciante' as const,
          lessons: [],
        },
      ];

      vi.mocked(localforage.getItem).mockResolvedValue(mockCourses);

      await useCourseStore.getState().loadCourses();

      expect(useCourseStore.getState().courses.length).toBeGreaterThan(0);
      expect(useCourseStore.getState().isLoading).toBe(false);
    });

    it('should initialize with default courses if none stored', async () => {
      vi.mocked(localforage.getItem).mockResolvedValue(null);
      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useCourseStore.getState().loadCourses();

      expect(useCourseStore.getState().courses.length).toBeGreaterThan(0);
      expect(useCourseStore.getState().isLoading).toBe(false);
    });

    it('should handle quota exceeded error', async () => {
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      
      vi.mocked(localforage.getItem).mockRejectedValue(quotaError);

      await useCourseStore.getState().loadCourses();

      expect(useCourseStore.getState().storageError).toBeTruthy();
      expect(useCourseStore.getState().isLoading).toBe(false);
    });

    it('should merge new hardcoded courses with stored ones', async () => {
      const storedCourses = [
        {
          id: 'custom-course',
          title: 'Custom Course',
          description: 'Custom',
          category: 'Carreira' as const,
          imageUrl: 'custom.jpg',
          level: 'Avançado' as const,
          lessons: [],
        },
      ];

      vi.mocked(localforage.getItem).mockResolvedValue(storedCourses);
      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useCourseStore.getState().loadCourses();

      const courses = useCourseStore.getState().courses;
      expect(courses.length).toBeGreaterThan(1);
    });
  });

  describe('addCourse', () => {
    it('should add a new course', async () => {
      const newCourse = {
        id: 'new-course',
        title: 'New Course',
        description: 'Description',
        category: 'Dublagem' as const,
        imageUrl: 'new.jpg',
        level: 'Intermediário' as const,
        lessons: [],
      };

      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      useCourseStore.setState({ courses: [] });

      await useCourseStore.getState().addCourse(newCourse);

      const courses = useCourseStore.getState().courses;
      expect(courses).toContainEqual(newCourse);
      expect(courses.length).toBe(1);
    });

    it('should throw error if storage limit exceeded', async () => {
      const hugeCourse = {
        id: 'huge-course',
        title: 'Huge Course',
        description: 'x'.repeat(60 * 1024 * 1024),
        category: 'Dublagem' as const,
        imageUrl: 'huge.jpg',
        level: 'Iniciante' as const,
        lessons: [],
      };

      useCourseStore.setState({ courses: [] });

      await expect(
        useCourseStore.getState().addCourse(hugeCourse)
      ).rejects.toThrow('Limite de armazenamento');
    });
  });

  describe('updateCourse', () => {
    it('should update an existing course', async () => {
      const initialCourse = {
        id: 'course-1',
        title: 'Original Title',
        description: 'Original',
        category: 'Dublagem' as const,
        imageUrl: 'original.jpg',
        level: 'Iniciante' as const,
        lessons: [],
      };

      const updatedCourse = {
        ...initialCourse,
        title: 'Updated Title',
        description: 'Updated Description',
      };

      useCourseStore.setState({ courses: [initialCourse] });
      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useCourseStore.getState().updateCourse(updatedCourse);

      const courses = useCourseStore.getState().courses;
      expect(courses[0].title).toBe('Updated Title');
      expect(courses[0].description).toBe('Updated Description');
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course by id', async () => {
      const courses = [
        {
          id: 'course-1',
          title: 'Course 1',
          description: 'Desc 1',
          category: 'Dublagem' as const,
          imageUrl: 'img1.jpg',
          level: 'Iniciante' as const,
          lessons: [],
        },
        {
          id: 'course-2',
          title: 'Course 2',
          description: 'Desc 2',
          category: 'Carreira' as const,
          imageUrl: 'img2.jpg',
          level: 'Avançado' as const,
          lessons: [],
        },
      ];

      useCourseStore.setState({ courses });
      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useCourseStore.getState().deleteCourse('course-1');

      const remainingCourses = useCourseStore.getState().courses;
      expect(remainingCourses.length).toBe(1);
      expect(remainingCourses[0].id).toBe('course-2');
    });
  });

  describe('clearStorageError', () => {
    it('should clear storage error', () => {
      useCourseStore.setState({ storageError: 'Test error' });

      useCourseStore.getState().clearStorageError();

      expect(useCourseStore.getState().storageError).toBeNull();
    });
  });
});
