const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_DIMENSION = 5000;
const MIN_DIMENSION = 200;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): ValidationResult => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo inválido. Use: JPEG, PNG, WebP ou GIF`
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande (${sizeMB} MB). Máximo: 10 MB`
    };
  }
  
  return { isValid: true };
};

export const validateImageDimensions = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        resolve({
          isValid: false,
          error: `Dimensões muito grandes (${img.width}x${img.height}). Máximo: ${MAX_DIMENSION}px`
        });
      } else if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        resolve({
          isValid: false,
          error: `Imagem muito pequena (${img.width}x${img.height}). Mínimo: ${MIN_DIMENSION}x${MIN_DIMENSION}px`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Arquivo de imagem corrompido ou inválido'
      });
    };
    
    img.src = url;
  });
};
