import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { provideHttpClient } from '@angular/common/http';

const config: SocketIoConfig = { url: `https://chat-distribuido-server.vercel.app`, options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideAnimationsAsync(),
    importProvidersFrom(SocketIoModule.forRoot(config)), provideHttpClient()
  ]
};
