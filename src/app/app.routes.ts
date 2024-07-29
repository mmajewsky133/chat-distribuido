import { Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', component: ChatComponent }
];
