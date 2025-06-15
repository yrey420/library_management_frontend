import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { User, UserSummary } from '../models/user.model';

/**
 * Servicio para gestionar usuarios
 * Maneja las operaciones CRUD y el estado de carga
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000';

  // Signals para manejo de estado
  private readonly loadingSignal = signal<boolean>(false);
  private readonly usersSignal = signal<UserSummary[]>([]);
  private readonly selectedUserSignal = signal<User | null>(null);

  // Computed signals públicos
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly users = this.usersSignal.asReadonly();
  public readonly selectedUser = this.selectedUserSignal.asReadonly();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de usuarios desde la API
   * @returns Observable con array de UserSummary
   */
  getUsers(): Observable<UserSummary[]> {
    this.loadingSignal.set(true);

    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map((users: User[]) => {
        // Transformar a UserSummary (sin contraseña y datos sensibles)
        return users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        }));
      }),
      tap((users: UserSummary[]) => {
        // Actualizar signal con los usuarios obtenidos
        this.usersSignal.set(users);
      }),
      catchError(this.handleError),
      finalize(() => {
        // Siempre desactivar loading al finalizar
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Obtiene los detalles completos de un usuario específico
   * @param userId - ID del usuario a obtener
   * @returns Observable con los detalles del usuario
   */
  getUserById(userId: number): Observable<User> {
    this.loadingSignal.set(true);

    return this.http.get<User>(`${this.API_URL}/users/${userId}`).pipe(
      map((user: User) => {
        // Remover contraseña de la respuesta por seguridad
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }),
      tap((user: User) => {
        // Actualizar signal con el usuario seleccionado
        this.selectedUserSignal.set(user);
      }),
      catchError(this.handleError),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Limpia el usuario seleccionado
   */
  clearSelectedUser(): void {
    this.selectedUserSignal.set(null);
  }

  /**
   * Refresca la lista de usuarios
   * @returns Observable con la lista actualizada
   */
  refreshUsers(): Observable<UserSummary[]> {
    return this.getUsers();
  }

  /**
   * Maneja errores HTTP de manera centralizada
   * @param error - Error HTTP recibido
   * @returns Observable que emite el error formateado
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, etc.)
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio no disponible';
          break;
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifique su conexión.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
      }
    }

    // Log del error para debugging
    console.error('Error en UserService:', {
      status: error.status,
      message: error.message,
      error: error.error,
      url: error.url
    });

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Método para buscar usuarios por nombre o email (funcionalidad adicional)
   * @param searchTerm - Término de búsqueda
   * @returns Observable con usuarios filtrados
   */
  searchUsers(searchTerm: string): Observable<UserSummary[]> {
    if (!searchTerm.trim()) {
      return this.getUsers();
    }

    this.loadingSignal.set(true);

    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map((users: User[]) => {
        const filteredUsers = users.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filteredUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        }));
      }),
      tap((users: UserSummary[]) => {
        this.usersSignal.set(users);
      }),
      catchError(this.handleError),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
}
