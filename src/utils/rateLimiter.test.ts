import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoginRateLimiter } from './rateLimiter';

describe('LoginRateLimiter', () => {
  let rateLimiter: LoginRateLimiter;
  
  beforeEach(() => {
    localStorage.clear();
    rateLimiter = new LoginRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with no attempts', () => {
    expect(rateLimiter.getRemainingAttempts()).toBe(5);
    expect(rateLimiter.isLocked()).toBe(false);
  });

  it('should record login attempts', () => {
    rateLimiter.recordAttempt();
    expect(rateLimiter.getRemainingAttempts()).toBe(4);
    
    rateLimiter.recordAttempt();
    expect(rateLimiter.getRemainingAttempts()).toBe(3);
  });

  it('should lock after 5 failed attempts', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.recordAttempt();
    }
    
    expect(rateLimiter.isLocked()).toBe(true);
    expect(rateLimiter.getRemainingAttempts()).toBe(0);
  });

  it('should unlock after 15 minutes', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.recordAttempt();
    }
    
    expect(rateLimiter.isLocked()).toBe(true);
    
    vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
    
    expect(rateLimiter.isLocked()).toBe(false);
  });

  it('should calculate correct lockout time remaining', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.recordAttempt();
    }
    
    expect(rateLimiter.getLockoutRemaining()).toBeGreaterThan(14);
    expect(rateLimiter.getLockoutRemaining()).toBeLessThanOrEqual(15);
    
    vi.advanceTimersByTime(5 * 60 * 1000);
    
    expect(rateLimiter.getLockoutRemaining()).toBeGreaterThan(9);
    expect(rateLimiter.getLockoutRemaining()).toBeLessThanOrEqual(10);
  });

  it('should clear attempts after successful login', () => {
    rateLimiter.recordAttempt();
    rateLimiter.recordAttempt();
    rateLimiter.recordAttempt();
    
    expect(rateLimiter.getRemainingAttempts()).toBe(2);
    
    rateLimiter.clearAttempts();
    
    expect(rateLimiter.getRemainingAttempts()).toBe(5);
    expect(rateLimiter.isLocked()).toBe(false);
  });

  it('should ignore old attempts outside 30-minute window', () => {
    rateLimiter.recordAttempt();
    rateLimiter.recordAttempt();
    
    vi.advanceTimersByTime(31 * 60 * 1000);
    
    expect(rateLimiter.getRemainingAttempts()).toBe(5);
  });

  it('should persist attempts in localStorage', () => {
    rateLimiter.recordAttempt();
    rateLimiter.recordAttempt();
    
    const newRateLimiter = new LoginRateLimiter();
    
    expect(newRateLimiter.getRemainingAttempts()).toBe(3);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('admin_login_attempts', 'invalid json');
    
    const newRateLimiter = new LoginRateLimiter();
    
    expect(newRateLimiter.getRemainingAttempts()).toBe(5);
    expect(newRateLimiter.isLocked()).toBe(false);
  });
});
