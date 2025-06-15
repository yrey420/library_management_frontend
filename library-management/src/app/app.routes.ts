import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserListComponent } from './components/user-list/user-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',

    loadComponent: () => import('./components/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
    title: 'Iniciar Sesión'
  },
  {
    path: 'users',

    component: UserListComponent,
    canActivate: [authGuard],
    title: 'Lista de Usuarios'
  },
  {
    path: 'users/:id',
    component:  UserDetailComponent,
    canActivate: [authGuard],
    title: 'Detalles del Usuario'
  },

  {
    path: '**',
    redirectTo: '/login'
  }
];
