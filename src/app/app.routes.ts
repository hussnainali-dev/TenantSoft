import { Routes } from '@angular/router';
import { LoginBodyComponent } from './login-body/login-body.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateUserComponent } from './create-user/create-user.component';


export const routes: Routes = [
  { path: 'login', component: LoginBodyComponent },
    { path: 'create-user', component: CreateUserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];