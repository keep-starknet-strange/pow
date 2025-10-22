// Rate limiting utility for fingerprint validation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request from the given IP is allowed
   * @param ip - The IP address to check
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(ip: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(ip);

    if (!entry) {
      // First request from this IP
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if under the limit
    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get the remaining requests for an IP
   * @param ip - The IP address to check
   * @returns number of remaining requests
   */
  getRemainingRequests(ip: string): number {
    const entry = this.requests.get(ip);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get the time until reset for an IP
   * @param ip - The IP address to check
   * @returns milliseconds until reset
   */
  getTimeUntilReset(ip: string): number {
    const entry = this.requests.get(ip);
    if (!entry) {
      return 0;
    }
    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Global rate limiter instance
export const fingerprintRateLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute

// Cleanup expired entries every 5 minutes
setInterval(() => {
  fingerprintRateLimiter.cleanup();
}, 5 * 60 * 1000);

export default RateLimiter;
