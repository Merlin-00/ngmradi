import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contributors',
  imports: [MatDividerModule, MatTabsModule, RouterOutlet, RouterLink],
  template: `
    <header>
      <h1 style="margin-left: 1rem;">Contributeurs</h1>
    </header>
    <mat-divider />

    <nav mat-tab-nav-bar mat-stretch-tabs="false" [tabPanel]="tabPanel">
      @for (link of links; track link) {
      <a
        mat-tab-link
        (click)="activeLink = link.url"
        [active]="activeLink == link.url"
        [routerLink]="link.url"
      >
        {{ link.name }}
      </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
    <router-outlet />
  `,
  styles: ``,
})
export default class ContributorsComponent {
  links = [
    {
      name: 'Actifs',
      url: 'active',
    },
    {
      name: 'Archivés',
      url: 'achived',
    },
  ];

  private router = inject(Router);
  activeLink = this.router.url.replace(`/contributors/`, '');
}
