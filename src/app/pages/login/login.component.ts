import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../app.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginCredentialsI, UserRegistrationI } from '../../core/models/connection.model';
import { log } from 'node:console';

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
  emailForm = new FormControl('');

  SignUp: boolean = false;

  constructor(
    private router: Router,
    private chatService: AppService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    let jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (jwt && typeof window !== 'undefined') this.router.navigate(['/chat']);
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
          typeof window !== 'undefined' ? localStorage.setItem('username', this.usernameForm.value) : '';
          typeof window !== 'undefined' ? localStorage.setItem('jwt', response.token) : '';
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
    if (this.usernameForm.value && this.passwordForm.value && this.emailForm.value) {
      let salt = this.chatService.salt;
      let pass = this.chatService.generateUserHash(
        this.usernameForm.value,
        this.passwordForm.value,
        salt
      );
      let creds: UserRegistrationI = {
        username: this.usernameForm.value,
        email: this.emailForm.value,
        salt: salt,
        pass: pass,
        active : true,
      }
      console.log(creds);
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
