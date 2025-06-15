import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

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
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
