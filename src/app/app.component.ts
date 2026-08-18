import { Component } from '@angular/core';
import { LoginBodyComponent } from './login-body/login-body.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginBodyComponent],
  template: `
    <app-login-body></app-login-body>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {}