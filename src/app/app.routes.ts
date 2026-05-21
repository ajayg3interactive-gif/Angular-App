import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { UsersPage } from './pages/users/users-page';

export const routes: Routes = [
  { path: '',          redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',     component: Login },
  { path: 'signup',    component: Signup },
  { path: 'dashboard', component: Dashboard },
  { path: 'users',     component: UsersPage },
  { path: '**',        redirectTo: 'login' },
];
