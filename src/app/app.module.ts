import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';

/*
 * Every component is standalone and brings its own imports; this module
 * only starts the app and provides what the whole of it shares.
 */
@NgModule({
  imports: [
    BrowserModule,
    AppComponent,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  bootstrap: [AppComponent],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())],
})
export class AppModule {}
