const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

/**
 * Utility to delay execution
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Advanced Network Client handling retries, backoff, and auth injections.
 */
class ApiClient {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.token = null;
    this.tokenExpiry = null;
    
    // Configurations
    this.maxRetries = 3;
    this.initialBackoffMs = 500;
  }

  /**
   * Automatically handles getting a new token if expired or not present.
   */
  async _ensureToken() {
    // If token exists and we assume it's still good for at least 5 minutes
    if (this.token && this.tokenExpiry && Date.now() < (this.tokenExpiry - 300000)) {
      return this.token;
    }

    // Otherwise, fetch a new token
    return await this.login();
  }

  /**
   * Core request function with exponential backoff for 5xx errors or 429 Too Many Requests
   */
  async request(endpoint, method = 'GET', body = null, requireAuth = true) {
    let currentAttempt = 0;
    
    while (currentAttempt < this.maxRetries) {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };

        if (requireAuth) {
          headers['Authorization'] = `Bearer ${await this._ensureToken()}`;
        }

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${BASE_URL}${endpoint}`, options);

        // Parse JSON response safely
        let data;
        try {
          data = await response.json();
        } catch (e) {
          data = { message: await response.text() };
        }

        if (response.ok) {
          return data;
        }

        // Handle specific status codes
        if (response.status === 401 && requireAuth) {
          // Token might be unexpectedly invalid. Clear it and retry immediately once.
          console.warn("[ApiClient] 401 Unauthorized. Clearing token and retrying...");
          this.token = null;
          this.tokenExpiry = null;
          
          if (currentAttempt === 0) { // Only do this once per request chain
             return this.request(endpoint, method, body, requireAuth);
          }
        }

        // Retry on Server Errors (5xx) or Rate Limiting (429)
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Transient API Error [${response.status}]: ${JSON.stringify(data)}`);
        }

        // For 400 Bad Request or other 4xx client errors, do NOT retry. Bubble up.
        const error = new Error(`Shiprocket API Error [${response.status}]: ${JSON.stringify(data)}`);
        error.status = response.status;
        error.data = data;
        throw error;

      } catch (error) {
        currentAttempt++;
        
        // If it's a client error (like 400 or 422), we already wrapped it and we shouldn't retry.
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        if (currentAttempt >= this.maxRetries) {
          throw new Error(`API failed after ${this.maxRetries} attempts. Last error: ${error.message}`);
        }

        // Exponential backoff
        const delay = this.initialBackoffMs * Math.pow(2, currentAttempt - 1);
        console.log(`[ApiClient] Network request failed. Retrying in ${delay}ms... (Attempt ${currentAttempt + 1}/${this.maxRetries})`);
        await sleep(delay);
      }
    }
  }

  /**
   * Step 1: Authentication & JWT Token Handshake
   */
  async login() {
    const data = await this.request('/auth/login', 'POST', {
      email: this.email,
      password: this.password
    }, false); // requireAuth = false
    
    this.token = data.token;
    // Shiprocket tokens usually expire in 10 days. We'll set a conservative 24-hour expiry.
    this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); 
    
    return this.token;
  }
}

module.exports = ApiClient;
