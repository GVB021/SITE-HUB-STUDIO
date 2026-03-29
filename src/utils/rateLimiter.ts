interface LoginAttempt {
  timestamp: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const ATTEMPTS_WINDOW = 30 * 60 * 1000;

export class LoginRateLimiter {
  private storageKey = 'admin_login_attempts';
  
  private getAttempts(): LoginAttempt[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  private saveAttempts(attempts: LoginAttempt[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(attempts));
  }
  
  recordAttempt(): void {
    const attempts = this.getAttempts();
    attempts.push({ timestamp: Date.now() });
    this.saveAttempts(attempts);
  }
  
  clearAttempts(): void {
    localStorage.removeItem(this.storageKey);
  }
  
  isLocked(): boolean {
    const attempts = this.getAttempts();
    const now = Date.now();
    
    const recentAttempts = attempts.filter(
      a => now - a.timestamp < ATTEMPTS_WINDOW
    );
    this.saveAttempts(recentAttempts);
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const lastAttempt = recentAttempts[recentAttempts.length - 1];
      const lockoutEnds = lastAttempt.timestamp + LOCKOUT_DURATION;
      return now < lockoutEnds;
    }
    
    return false;
  }
  
  getRemainingAttempts(): number {
    const attempts = this.getAttempts();
    const now = Date.now();
    const recentAttempts = attempts.filter(
      a => now - a.timestamp < ATTEMPTS_WINDOW
    );
    return Math.max(0, MAX_ATTEMPTS - recentAttempts.length);
  }
  
  getLockoutRemaining(): number {
    const attempts = this.getAttempts();
    if (attempts.length < MAX_ATTEMPTS) return 0;
    
    const lastAttempt = attempts[attempts.length - 1];
    const lockoutEnds = lastAttempt.timestamp + LOCKOUT_DURATION;
    const remaining = Math.max(0, lockoutEnds - Date.now());
    return Math.ceil(remaining / 1000 / 60);
  }
}
