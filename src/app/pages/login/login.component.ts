import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../app.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginCredentialsI } from '../../core/models/connection.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  usernameForm = new FormControl('');
  passwordForm = new FormControl('');

  SignUp: boolean = false;

  constructor(
    private router: Router,
    private chatService: AppService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('username')) this.router.navigate(['/chat']);
  }

  submit(): void {
    (this.SignUp) ? this.signup() : this.login();
  }

  login(): void {
    if (this.usernameForm.value && this.passwordForm.value) {
      console.log('login');
      let creds: LoginCredentialsI = {
        username: this.usernameForm.value,
        password: this.passwordForm.value
      }
      this.chatService.login(creds).then((response) => {
        if (this.usernameForm.value) {
          localStorage.setItem('username', this.usernameForm.value);
          this.router.navigate(['/chat']);
        }
      }).catch((error) => {
        this._snackBar.open('Credenciales no existen o son incorrectas', 'ok', {
          duration: 4000,
          horizontalPosition: 'end',
        });
      });
    }
  }

  signup(): void {
    if (this.usernameForm.value && this.passwordForm.value) {
      console.log('signup');
      let creds: LoginCredentialsI = {
        username: this.usernameForm.value,
        password: this.passwordForm.value
      }
      this.chatService.signup(creds).then((response) => {
        this.toggleSignUp();
        this._snackBar.open('Se ha registrado correctamente', 'ok', {
          duration: 4000,
          horizontalPosition: 'end',
        });
      }).catch((error) => {
        this._snackBar.open('El username ya esta registrado', 'ok', {
          duration: 4000,
          horizontalPosition: 'end',
        });
      });
    }
  }

  toggleSignUp(): void {
    this.usernameForm.reset();
    this.passwordForm.reset();
    this.SignUp = !this.SignUp;
  }
}
