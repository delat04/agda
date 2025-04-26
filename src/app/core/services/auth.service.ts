// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'event_seeker' | 'event_manager';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Mock data for testing
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'salim@gmail.com',
      firstName: 'E',
      lastName: 'E',
      role: 'event_seeker'
    },
    {
      id: '2',
      email: 'sam@gmail.com',
      firstName: 'A',
      lastName: 'A',
      role: 'event_manager'
    }
  ];

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }
  }

  login(email: string, password: string): Observable<{ token: string, user: User }> {
    // Mock login - in a real scenario this would call the backend
    const user = this.mockUsers.find(u => u.email === email);

    // Simulate successful login if user exists
    if (user && password) { // Simple check - any non-empty password works for testing
      const mockResponse = {
        token: `mock-token-${Date.now()}`,
        user
      };

      // Simulate network delay
      return of(mockResponse).pipe(
        delay(800),
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
    }

    // Simulate failed login
    throw new Error('Invalid credentials');
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'event_seeker' | 'event_manager';
  }): Observable<{ token: string, user: User }> {
    // Mock registration
    const newUser: User = {
      id: `${Date.now()}`, // Generate a unique ID
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    };

    // Add to mock users
    this.mockUsers.push(newUser);

    const mockResponse = {
      token: `mock-token-${Date.now()}`,
      user: newUser
    };

    // Simulate network delay
    return of(mockResponse).pipe(
      delay(800),
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === role;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // For testing - get all mock users
  getMockUsers(): User[] {
    return [...this.mockUsers];
  }

  // For testing - toggle between mock and real API mode
  enableRealApi(): void {
    // This method would be implemented when you're ready to switch to the real backend
    console.log('Ready to use real API endpoints instead of mock data');
  }
}
