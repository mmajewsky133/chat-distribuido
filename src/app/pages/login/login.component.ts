import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../app.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  usernameForm = new FormControl('');

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('username')) this.router.navigate(['/chat']);
  }

  login(): void {
    let username = this.usernameForm.value || 'Anonymous';
    localStorage.setItem('username', username);
    this.router.navigate(['/chat']);
  }
}
