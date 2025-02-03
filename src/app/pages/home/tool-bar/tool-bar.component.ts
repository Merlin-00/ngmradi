import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { APP_NAME, IS_MEDIUM } from '../../../app.constants';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { WindowsObserverService } from '../../../core/services/utilities/windows-observer.service';
import {
  ThemeMode,
  ThemeService,
} from '../../../core/services/utilities/theme.service';
import { StateService } from '../../../core/services/utilities/state.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/firebase/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-tool-bar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    AsyncPipe,
  ],
  template: `
    <mat-toolbar>
      <div class="left-container">
        @if (viewport() <= medium) {
        <button mat-icon-button matTooltip="menu" (click)="toogleDrawer()">
          <mat-icon>menu</mat-icon>
        </button>
        }
        <span
          ><b>{{ appName }}</b></span
        >
      </div>

      <div class="avatar-container">
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <img
          matTooltip="Profile"
          [matMenuTriggerFor]="menu"
          [src]="(user$ | async)?.photoURL ?? '/assets/avatar.png'"
          alt="profil avatar"
        />
      </div>
      <mat-menu #menu="matMenu">
        <button mat-menu-item [matMenuTriggerFor]="themeMenu">
          <mat-icon>dark_mode</mat-icon>
          <span>Theme</span>
        </button>

        <mat-divider />

        <button mat-menu-item (click)="logOut()">
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </mat-menu>

      <mat-menu #themeMenu="matMenu">
        <button mat-menu-item (click)="switchTheme('device-theme')">
          Appareil
        </button>
        <button mat-menu-item (click)="switchTheme('light-theme')">
          Claire
        </button>
        <button mat-menu-item (click)="switchTheme('dark-theme')">
          Sombre
        </button>
      </mat-menu>
    </mat-toolbar>
    <mat-divider />
  `,
  styles: `
  mat-toolbar{
    display: flex;
    justify-content: space-between;
    align-items: center;

  .left-container, avatar-container{
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  }
  img{
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: lightgray;
    cursor: pointer;
    transition: 250ms;

    &:hover{
      transform: scale(0.98);
    }
  }

  `,
})
export class ToolBarComponent {
  appName = APP_NAME;
  medium = IS_MEDIUM;
  viewport = inject(WindowsObserverService).width;
  router = inject(Router);
  auth = inject(AuthService);
  user$ = this.auth.user;

  ts = inject(ThemeService);

  switchTheme = (theme: ThemeMode) => this.ts.setTheme(theme);
  state = inject(StateService);
  toogleDrawer = () => this.state.isToogleDriwer.update((value) => !value);
  async logOut() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
