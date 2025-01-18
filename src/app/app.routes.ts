import { Routes } from '@angular/router';
import { APP_NAME } from './app.constants';

export const routes: Routes = [
  {
    path: 'login',
    title: `connexion - ${{ APP_NAME }}`,
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: '',
    title: `${{ APP_NAME }}`,
    loadComponent: () => import('./pages/home/home.component'),
    children: [
      {
        path: 'projects',
        title: `projets - ${{ APP_NAME }}`,
        loadComponent: () => import('./pages/home/projects/projects.component'),
      },
      {
        path: 'contributors',
        title: `contributeurs - ${{ APP_NAME }}`,
        loadComponent: () =>
          import('./pages/home/contributors/contributors.component'),
        children: [
          {
            path: 'active',
            title: `contributeurs actifs - ${{ APP_NAME }}`,
            loadComponent: () =>
              import('./pages/home/contributors/active/active.component'),
          },
          {
            path: 'achived',
            title: `contributeurs archivés - ${{ APP_NAME }}`,
            loadComponent: () =>
              import('./pages/home/contributors/archieved/archieved.component'),
          },
          {
            path: '',
            redirectTo: 'active',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'project/:id',
    title: `chargement du projet... ${{ APP_NAME }}`,
    loadComponent: () => import('./pages/projet/projet.component'),
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
