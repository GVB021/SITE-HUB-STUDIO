import { describe, it, expect } from 'vitest';
import { validateImageFile, validateImageDimensions } from './imageValidation';

describe('imageValidation', () => {
  describe('validateImageFile', () => {
    it('should accept valid JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should accept valid GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject PDF files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Tipo de arquivo inválido');
    });

    it('should reject video files', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Tipo de arquivo inválido');
    });

    it('should reject files larger than 10 MB', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Arquivo muito grande');
      expect(result.error).toContain('15.00 MB');
    });

    it('should accept files exactly at 10 MB limit', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });
      
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateImageDimensions', () => {
    it('should accept images with valid dimensions', async () => {
      global.Image = class {
        width = 1200;
        height = 800;
        onload: any = null;
        onerror: any = null;
        src = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as any;

      global.URL.createObjectURL = () => 'blob:test';
      global.URL.revokeObjectURL = () => {};
      
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = await validateImageDimensions(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject images that are too large', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      const mockImage = {
        width: 6000,
        height: 4000,
        onload: null as any,
        onerror: null as any,
        src: '',
      };

      global.Image = class {
        width = 6000;
        height = 4000;
        onload: any = null;
        onerror: any = null;
        src = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as any;

      global.URL.createObjectURL = () => 'blob:test';
      global.URL.revokeObjectURL = () => {};
      
      const result = await validateImageDimensions(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Dimensões muito grandes');
      expect(result.error).toContain('6000x4000');
    });

    it('should reject images that are too small', async () => {
      global.Image = class {
        width = 100;
        height = 100;
        onload: any = null;
        onerror: any = null;
        src = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as any;

      global.URL.createObjectURL = () => 'blob:test';
      global.URL.revokeObjectURL = () => {};
      
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = await validateImageDimensions(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Imagem muito pequena');
      expect(result.error).toContain('100x100');
    });

    it('should handle corrupted image files', async () => {
      global.Image = class {
        width = 0;
        height = 0;
        onload: any = null;
        onerror: any = null;
        src = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      } as any;

      global.URL.createObjectURL = () => 'blob:test';
      global.URL.revokeObjectURL = () => {};
      
      const file = new File([''], 'corrupted.jpg', { type: 'image/jpeg' });
      const result = await validateImageDimensions(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrompido');
    });
  });
});
