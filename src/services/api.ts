import { User, AuthResponse, Media, Swipe, Match, PartnerRequest } from '../types';

const API_URL = 'http://localhost:5001/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {}

class ApiService {
  private token: string | null = null;

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Something went wrong');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    // Store token in localStorage or AsyncStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    // Remove token from storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Initialize token from storage (call this when app starts)
  initializeToken() {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    return this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
  }

  // Media endpoints
  async getMovies(): Promise<Media[]> {
    return this.request('/movies');
  }

  async getMovie(id: string): Promise<Media> {
    return this.request(`/movies/${id}`);
  }

  // Swipe endpoints
  async createSwipe(mediaId: string, liked: boolean): Promise<Swipe> {
    return this.request('/swipes', {
      method: 'POST',
      body: JSON.stringify({ media_id: mediaId, liked }),
    });
  }

  async getUserSwipes(): Promise<Swipe[]> {
    return this.request('/swipes');
  }

  // Match endpoints
  async getMatches(): Promise<Match[]> {
    return this.request('/matches');
  }

  // Partner endpoints
  async setPartner(partnerId: string): Promise<User> {
    return this.request('/users/partner', {
      method: 'POST',
      body: JSON.stringify({ partner_id: partnerId }),
    });
  }

  async getPartner(): Promise<User | null> {
    return this.request('/users/partner');
  }

  async removePartner(): Promise<User> {
  return this.request('/users/partner', {
    method: 'DELETE',
  });
}
  
  // User search endpoint
  async searchUserByEmail(email: string): Promise<User | null> {
    try {
      return this.request(`/users/search?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error searching for user:', error);
      return null;
    }
  }

  // Partner request endpoints
  async createPartnerRequest(recipientEmail: string): Promise<PartnerRequest> {
    return this.request('/users/partner-requests', {
      method: 'POST',
      body: JSON.stringify({ recipient_email: recipientEmail }),
    });
  }

  async getPartnerRequests(): Promise<PartnerRequest[]> {
    return this.request('/users/partner-requests');
  }

  async getPendingPartnerRequests(): Promise<PartnerRequest[]> {
    return this.request('/users/partner-requests/pending');
  }

  async respondToPartnerRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<PartnerRequest> {
    return this.request('/users/partner-requests/respond', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, status }),
    });
  }
}

export const api = new ApiService();
// Initialize token from storage when importing this module
api.initializeToken();