import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

/**
 * Componente standalone para mostrar los detalles completos de un usuario
 * Incluye navegación y manejo de errores
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  userService = inject(UserService);
  errorMessage: string = '';
  private userId: string = '';

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.userId = params['id'];
        if (this.userId) {
          this.loadUserDetails();
        } else {
          this.handleError('ID de usuario no válido');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los detalles del usuario por ID
   */
  private loadUserDetails(): void {
    this.errorMessage = '';

    this.userService.getUserById(Number(this.userId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          if (!user) {
            this.handleError('Usuario no encontrado');
          }
        },
        error: (error) => {
          this.handleError('Error al cargar los detalles del usuario. Por favor, inténtalo de nuevo.');
          console.error('Error loading user details:', error);
        }
      });
  }

  /**
   * Maneja los errores y muestra mensajes apropiados
   */
  private handleError(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Reintenta cargar los datos del usuario
   */
  retryLoad(): void {
    this.loadUserDetails();
  }

  /**
   * Actualiza los detalles del usuario
   */
  refreshUserDetails(): void {
    this.loadUserDetails();
    this.snackBar.open('Actualizando información...', '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Navega de vuelta a la lista de usuarios
   */
  goBack(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Obtiene el color del chip según el rol del usuario
   */
  getRoleColor(role: string): 'primary' | 'accent' | 'warn' {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'warn';
      case 'moderator':
      case 'mod':
        return 'accent';
      case 'user':
      case 'member':
      default:
        return 'primary';
    }
  }

  /**
   * Obtiene la etiqueta legible del rol
   */
  getRoleLabel(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'Administrador';
      case 'moderator':
      case 'mod':
        return 'Moderador';
      case 'user':
      case 'member':
        return 'Usuario';
      default:
        return role || 'Usuario';
    }
  }
}
