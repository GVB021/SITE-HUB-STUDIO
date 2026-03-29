import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSanitizedHTML } from './useSanitizedHTML';

describe('useSanitizedHTML', () => {
  it('should remove script tags', () => {
    const maliciousHTML = 'Hello <script>alert("XSS")</script> World';
    
    const { result } = renderHook(() => useSanitizedHTML(maliciousHTML));
    
    expect(result.current).not.toContain('<script>');
    expect(result.current).not.toContain('alert');
    expect(result.current).toContain('Hello');
    expect(result.current).toContain('World');
  });

  it('should preserve allowed tags like span', () => {
    const html = 'Your voice, your <span class="text-indigo-400">career</span>';
    
    const { result } = renderHook(() => useSanitizedHTML(html, {
      allowedTags: ['span', 'em', 'strong'],
      allowedAttributes: { span: ['class'] }
    }));
    
    expect(result.current).toContain('<span');
    expect(result.current).toContain('career</span>');
    expect(result.current).toContain('Your voice');
  });

  it('should preserve em and strong tags', () => {
    const html = 'This is <em>italic</em> and <strong>bold</strong> text';
    
    const { result } = renderHook(() => useSanitizedHTML(html));
    
    expect(result.current).toContain('<em>italic</em>');
    expect(result.current).toContain('<strong>bold</strong>');
  });

  it('should remove dangerous tags like iframe', () => {
    const html = 'Content <iframe src="http://evil.com"></iframe> here';
    
    const { result } = renderHook(() => useSanitizedHTML(html));
    
    expect(result.current).not.toContain('<iframe');
    expect(result.current).not.toContain('evil.com');
    expect(result.current).toContain('Content');
    expect(result.current).toContain('here');
  });

  it('should remove on* event handlers', () => {
    const html = '<span onclick="alert(\'XSS\')">Click me</span>';
    
    const { result } = renderHook(() => useSanitizedHTML(html));
    
    expect(result.current).not.toContain('onclick');
    expect(result.current).not.toContain('alert');
    expect(result.current).toContain('Click me');
  });

  it('should remove javascript: URLs', () => {
    const html = '<a href="javascript:alert(\'XSS\')">Link</a>';
    
    const { result } = renderHook(() => useSanitizedHTML(html));
    
    expect(result.current).not.toContain('javascript:');
    expect(result.current).not.toContain('alert');
  });

  it('should preserve br tags', () => {
    const html = 'Line 1<br>Line 2<br>Line 3';
    
    const { result } = renderHook(() => useSanitizedHTML(html));
    
    expect(result.current).toContain('<br>');
    expect(result.current).toContain('Line 1');
    expect(result.current).toContain('Line 2');
  });

  it('should use custom allowed tags when provided', () => {
    const html = '<div>Div content</div><span>Span content</span><p>Para content</p>';
    
    const { result } = renderHook(() => useSanitizedHTML(html, {
      allowedTags: ['div', 'p'],
      allowedAttributes: {}
    }));
    
    expect(result.current).toContain('<div>');
    expect(result.current).toContain('<p>');
    expect(result.current).not.toContain('<span>');
  });

  it('should update when HTML changes', () => {
    const { result, rerender } = renderHook(
      ({ html }) => useSanitizedHTML(html),
      { initialProps: { html: 'Initial <script>bad</script>' } }
    );
    
    expect(result.current).toContain('Initial');
    expect(result.current).not.toContain('script');
    
    rerender({ html: 'Updated <strong>text</strong>' });
    
    expect(result.current).toContain('Updated');
    expect(result.current).toContain('<strong>');
  });

  it('should handle empty strings', () => {
    const { result } = renderHook(() => useSanitizedHTML(''));
    
    expect(result.current).toBe('');
  });

  it('should handle plain text without HTML', () => {
    const plainText = 'Just plain text with no HTML tags';
    
    const { result } = renderHook(() => useSanitizedHTML(plainText));
    
    expect(result.current).toBe(plainText);
  });
});
