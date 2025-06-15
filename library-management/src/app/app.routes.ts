import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

/**
 * Configuración de rutas de la aplicación
 * Utiliza lazy loading para optimizar la carga inicial
 */
export const routes: Routes = [
  // Ruta por defecto - redirige a login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Ruta de login - solo accesible si no está autenticado
  {
    path: 'login',
    loadComponent: () => import('./components/login.component').then(c => c.LoginComponent),
    canActivate: [noAuthGuard],
    title: 'Iniciar Sesión'
  },

  // Ruta de lista de usuarios - requiere autenticación
  {
    path: 'users',
    loadComponent: () => import('./components/user-list/user-list.component').then(c => c.UserListComponent),
    canActivate: [authGuard],
    title: 'Lista de Usuarios'
  },

  // Ruta de detalles de usuario - requiere autenticación
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./components/user-detail/user-detail.component').then(m => m.UserDetailComponent),
    canActivate: [authGuard],
    title: 'Detalles del Usuario'
  },

  // Ruta wildcard - redirige a login para rutas no encontradas
  {
    path: '**',
    redirectTo: '/login'
  }
];
