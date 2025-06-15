

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


import { UserService } from '../../services/user.service';


/**
 * Componente standalone para mostrar la lista de usuarios
 * Implementa búsqueda, carga de datos y navegación a detalles
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatSnackBarModule,

  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Servicios inyectados
  public readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Signals para manejo de estado
  public readonly errorMessage = signal<string>('');
  public searchTerm = '';

  // Configuración de la tabla
  public readonly displayedColumns: string[] = ['id', 'name', 'username', 'email', 'actions'];

  // Computed para usuarios filtrados
  public readonly filteredUsers = computed(() => {
    const users = this.userService.users();
    if (!this.searchTerm.trim()) {
      return users;
    }

    const term = this.searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios desde el servicio
   */
  loadUsers(): void {
    this.errorMessage.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        if (users.length === 0) {
          this.snackBar.open('No se encontraron usuarios', 'Cerrar', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Refresca la lista de usuarios
   */
  refreshUsers(): void {
    this.userService.refreshUsers().subscribe({
      next: () => {
        this.snackBar.open('Lista actualizada', 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.errorMessage.set(error.message);
      }
    });
  }

  /**
   * Maneja cambios en el campo de búsqueda
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  /**
   * Limpia el campo de búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
  }

  /**
   * Navega a los detalles de un usuario
   */
  viewUserDetails(userId: number): void {
    this.router.navigate(['/users', userId]);
  }
}
