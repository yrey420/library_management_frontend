import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * Utiliza la nueva sintaxis de Angular 18 con CanActivateFn
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado usando signals
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirigir a login
  console.warn('Acceso denegado. Redirigiendo a login.');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url } // Guardar URL de destino
  });

  return false;
};

/**
 * Guard para prevenir acceso a login cuando ya está autenticado
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, redirigir a users
  if (authService.isAuthenticated()) {
    console.info('Usuario ya autenticado. Redirigiendo a lista de usuarios.');
    router.navigate(['/users']);
    return false;
  }

  return true;
};
