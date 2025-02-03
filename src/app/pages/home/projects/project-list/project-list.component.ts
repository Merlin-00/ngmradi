import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Project } from '../../../../core/models/project.model';
import { AuthService } from '../../../../core/services/firebase/auth.service';
import { FirestoreService } from '../../../../core/services/firebase/firestore.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-list',
  imports: [
    MatCardModule,
    AsyncPipe,
    MatDividerModule,
    DatePipe,
    MatBadgeModule,
    MatRippleModule,
    RouterLink,
  ],
  template: `
    <main>
      @let user = user$ | async; @for (project of projects$ | async; track
      $index) {
      <mat-card
        appearance="outlined"
        style="width: 400px; cursor: pointer;"
        matRipple
        [routerLink]="'/project/' + project.id"
      >
        <div
          align="end"
          style="right : 5.2rem; top: 0.4rem"
          [matBadge]="
            project.uid === user?.uid ? 'PROPRIETAIRE' : 'CONTRIBUTEUR'
          "
          [class.green-badge]="project.uid === user?.uid"
        ></div>
        <mat-card-header>
          <mat-card-title>
            {{ project.title }}
          </mat-card-title>
          <mat-card-subtitle
            ><span class="truncate">{{ project.description }}</span>
          </mat-card-subtitle>
        </mat-card-header>
        <br />
        <mat-divider />
        <mat-card-content>
          <p>{{ formateDate(project.createdAt) | date : 'fullDate' }}</p>
        </mat-card-content>
      </mat-card>
      }@empty {
      <h3 align="center" style="width: 100%;">
        Oups! Aucun projet à afficher! <br />Commencer par ajouter un nouveau
        projet ou être ajouté comme collaborateur dans un projet
      </h3>
      }
    </main>
  `,
  styles: `
    main {
      display: flex;
      flex-wrap: wrap; 
      margin:0 1rem;
      gap: 1rem;
    }
    .truncate {
      -webkit-line-clamp: 4;
    }
  `,
})
export class ProjectListComponent implements OnInit, OnDestroy {
  private fs = inject(FirestoreService);
  private auth = inject(AuthService);
  user$ = this.auth.user;
  userSub?: Subscription;
  projects$?: Observable<Project<Timestamp>[]>;

  formateDate = (t?: Timestamp) => this.fs.formatedTimestamp(t);
  ngOnInit() {
    this.userSub = this.user$.subscribe((user) => {
      this.projects$ = this.fs.getProjects(user!) as Observable<
        Project<Timestamp>[]
      >;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
