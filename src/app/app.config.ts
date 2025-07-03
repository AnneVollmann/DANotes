import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"danotes-e517c","appId":"1:784170745817:web:bbd51915a017bf896de3c8","storageBucket":"danotes-e517c.firebasestorage.app","apiKey":"AIzaSyBLcgpNe_qKgavvWFQYI_A59zxRwtSLXE4","authDomain":"danotes-e517c.firebaseapp.com","messagingSenderId":"784170745817"}))), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
