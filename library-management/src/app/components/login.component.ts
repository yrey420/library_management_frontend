import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/user.model';

/**
 * Componente standalone para manejo de autenticación
 * Utiliza Angular Material para UI y signals para estado reactivo
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Injection con la nueva sintaxis de Angular 18
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  // Signals para manejo de estado
  public readonly loading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly hidePassword = signal<boolean>(true);

  // Formulario reactivo con validaciones
  public readonly loginForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Ejecuta el proceso de login
   */
  private performLogin(): void {
    const credentials: LoginRequest = this.loginForm.value;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.handleLoginSuccess();
        } else {
          this.handleLoginError(response.message || 'Credenciales inválidas');
        }
      },
      error: (error) => {
        this.handleLoginError(error.message || 'Error de conexión');
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  /**
   * Maneja el login exitoso
   */
  private handleLoginSuccess(): void {
    this.snackBar.open('¡Bienvenido!', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    // Obtener URL de retorno o ir a users por defecto
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/users';
    this.router.navigate([returnUrl]);
  }

  /**
   * Maneja errores de login
   */
  private handleLoginError(message: string): void {
    this.errorMessage.set(message);
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
