import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private readonly isBrowser: boolean;

  // Signal for authentication state
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly currentUserSignal = signal<User | null>(null);

  // Computed signals
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public readonly currentUser = computed(() => this.currentUserSignal());

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.checkStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map((users: User[]) => {
        const user = users.find(u =>
          u.username === credentials.username &&
          u.password === credentials.password
        );

        if (user) {
          const userWithoutPassword: User = { ...user };
          delete userWithoutPassword.password;

          return {
            success: true,
            token: 'fake-jwt-token-123456789',
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name
            }
          };
        } else {
          return {
            success: false,
            message: 'Invalid credentials'
          };
        }
      }),
      tap((response: LoginResponse) => {
        if (response.success && response.user && response.token) {
          const user: User = {
            ...response.user,
            phone: '',
            address: '',
            role: 'user'
          };
          this.setAuthState(user, response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearAuthState();
  }

  private setAuthState(user: User, token: string): void {
    this.isAuthenticatedSignal.set(true);
    this.currentUserSignal.set({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: '',
      address: '',
      role: 'user'
    });

    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private clearAuthState(): void {
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);

    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  private checkStoredAuth(): void {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.setAuthState(user, token);
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Server not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 0:
          errorMessage = 'Cannot connect to server';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('AuthService error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
