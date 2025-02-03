import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IS_MEDIUM } from '../../../app.constants';
import { WindowsObserverService } from '../../../core/services/utilities/windows-observer.service';
import { StateService } from '../../../core/services/utilities/state.service';

@Component({
  selector: 'app-side-nav',
  imports: [
    MatSidenavModule,
    MatMenuModule,
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    RouterOutlet,
  ],
  template: `
    <mat-drawer-container autosize style="height: calc(100vh - 65px)">
      <mat-drawer
        [mode]="viewpoint() >= ismedium ? 'side' : 'over'"
        [opened]="viewpoint() >= ismedium || isToogleDrawer()"
      >
        <a
          routerLink="/projects"
          mat-menu-item
          routerLinkActive="active-link"
          (click)="toogleDrawer()"
        >
          <mat-icon>dataset</mat-icon>
          Projects</a
        >
        <a
          routerLink="/contributors"
          mat-menu-item
          routerLinkActive="active-link"
          (click)="toogleDrawer()"
        >
          <mat-icon>group</mat-icon>
          Contributeurs</a
        >
      </mat-drawer>

      <mat-drawer-content>
        <router-outlet />
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: `
  mat-drawer{
    width: 220px;
    border-right: 1px solid var(--mat-sys-outline-variant); 
    border-radius: 0%;
  }
  .active-link{
    background: var(--mat-sys-outline-variant)
  }
  `,
})
export class SideNavComponent {
  ismedium = IS_MEDIUM;
  viewpoint = inject(WindowsObserverService).width;

  state = inject(StateService);
  isToogleDrawer = computed(() => this.state.isToogleDriwer());
  toogleDrawer = () => this.state.isToogleDriwer.update((value) => !value);
}
