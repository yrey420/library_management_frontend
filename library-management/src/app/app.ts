import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import '@angular/compiler'; // Import necesario para Angular 18
import { AuthService } from './services/auth.service';

/**
 * Componente raíz de la aplicación
 * Maneja la navegación principal y el estado de autenticación
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Barra de navegación principal -->
    <mat-toolbar
      color="primary"
      *ngIf="authService.isAuthenticated()"
      class="app-toolbar"
    >
      <span class="app-title">
        <mat-icon>people</mat-icon>
        Gestión de Usuarios
      </span>

      <span class="spacer"></span>

      <!-- Información del usuario y menú -->
      <div class="user-info" *ngIf="authService.currentUser() as user">
        <span class="welcome-text">
          Bienvenido, {{ user.name }}
        </span>

        <button
          mat-icon-button
          [matMenuTriggerFor]="userMenu"
          class="user-menu-button"
          aria-label="Menú de usuario"
        >
          <mat-icon>account_circle</mat-icon>
        </button>

        <!-- Menú desplegable del usuario -->
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="navigateToUsers()">
            <mat-icon>people</mat-icon>
            <span>Lista de Usuarios</span>
          </button>

          <button mat-menu-item (click)="logout()" class="logout-item">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>

    <!-- Contenido principal -->
    <main class="app-content" [ngClass]="{'with-toolbar': authService.isAuthenticated()}">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .welcome-text {
      font-size: 14px;
      opacity: 0.9;
    }

    .user-menu-button {
      border-radius: 50%;
    }

    .logout-item {
      color: #f44336;
    }

    .app-content {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .app-content.with-toolbar {
      min-height: calc(100vh - 64px);
    }

    /* Responsividad */
    @media (max-width: 768px) {
      .welcome-text {
        display: none;
      }

      .app-title {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .app-title mat-icon {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  // Servicios inyectados
  private readonly router = inject(Router);

  // Exposer authService para uso en template
  public readonly authService = inject(AuthService);

  /**
   * Navegar a la lista de usuarios
   */
  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Cerrar sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
