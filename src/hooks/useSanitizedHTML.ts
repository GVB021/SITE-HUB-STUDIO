import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export const useSanitizedHTML = (
  html: string, 
  options: SanitizeOptions = {}
) => {
  return useMemo(() => {
    const defaultTags = ['span', 'em', 'strong', 'br'];
    const defaultAttrs = { span: ['class'] };
    
    const config: any = {
      ALLOWED_TAGS: options.allowedTags || defaultTags,
      KEEP_CONTENT: true,
    };
    
    if (options.allowedAttributes) {
      config.ALLOWED_ATTR = options.allowedAttributes;
    } else {
      config.ALLOWED_ATTR = defaultAttrs;
    }
    
    return DOMPurify.sanitize(html, config);
  }, [html, options]);
};
