import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Project } from '../../../../core/models/project.model';
import { Timestamp } from '@angular/fire/firestore';
import { FirestoreService } from '../../../../core/services/firebase/firestore.service';
import { AuthService } from '../../../../core/services/firebase/auth.service';
import { MatSort } from '@angular/material/sort';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-archieved',
  imports: [
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormField,
    MatTableModule,
    MatInputModule,
    AsyncPipe,
    MatTooltipModule,
  ],
  template: ` <main style="margin: 1rem;">
    <mat-form-field>
      <mat-label>Filter</mat-label>
      <input
        matInput
        (keyup)="applyFilter($event)"
        placeholder="Ex. Création d'un site web"
        #input
      />
    </mat-form-field>

    <div class="table-container">
      <table mat-table [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="position">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>N°</th>
          <td mat-cell *matCellDef="let project">
            {{ dataSource.filteredData.indexOf(project) + 1 }}
          </td>
        </ng-container>

        <!-- Title Column -->
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
          <td mat-cell *matCellDef="let project">{{ project.title }}</td>
        </ng-container>

        <!-- Possession Column -->
        <ng-container matColumnDef="possession">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Possession</th>
          <td mat-cell *matCellDef="let project">
            {{
              project.uid === (user$ | async)?.uid
                ? 'Proprietaire'
                : 'Contributeur'
            }}
          </td>
        </ng-container>

        <!-- Contributors Column -->
        <ng-container matColumnDef="contributors">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            Contributeurs
          </th>
          <td mat-cell *matCellDef="let project">
            {{ project.contributors?.length ?? 0 }}
          </td>
        </ng-container>

        <!-- Action Column -->
        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef></th>
          (
          <td mat-cell *matCellDef="let project">
            <button
              mat-icon-button
              matTooltip="restaurer ce contributeur"
              (click)="restoreProject(project)"
            >
              <mat-icon>restore</mat-icon>
            </button>
            <button
              mat-icon-button
              matTooltip="supprimer définitivement"
              (click)="onDeleteProject(project)"
            >
              <mat-icon style="color: red;">delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr
          mat-header-row
          *matHeaderRowDef="displayedColumns"
          style="font-weight: bolder"
        ></tr>
        <tr mat-row *matRowDef="let project; columns: displayedColumns"></tr>

        <!-- Row shown when there is no matching data. -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4" align="center">
            Aucune donnée à afficher pour {{ input.value }}
          </td>
        </tr>
      </table>
      <mat-divider />
      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 100]"
        aria-label="Séléctionnez la page des projets"
      ></mat-paginator>
    </div>
  </main>`,
  styles: `
       main {
      border: 1px solid var(--mat-sys-outline);
      border-radius: 4px;

      mat-divider {
        border-top-color: var(--mat-sys-outline) !important;
      }
    }
  `,
})
export default class ArchievedComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  displayedColumns: string[] = [
    'position',
    'title',
    'possession',
    'contributors',
    'action',
  ];

  dataSource = new MatTableDataSource<Project<Timestamp>>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fs = inject(FirestoreService);
  private auth = inject(AuthService);
  user$ = this.auth.user;
  userSub?: Subscription;
  projects$?: Observable<Project<Timestamp>[]>;

  formateDate = (t?: Timestamp) => this.fs.formatedTimestamp(t);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.userSub = this.user$
      .pipe(
        switchMap((user) => {
          if (user) {
            return this.fs.getProjects(user);
          } else {
            return of([]);
          }
        })
      )
      .subscribe((projects) => {
        const archivedProjects = projects.filter(
          (project) => project['archieved']
        );
        this.dataSource.data = archivedProjects as Project<Timestamp>[];
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  restoreProject(project: Project<Timestamp>) {
    this.fs
      .updateProject(project.id, { archieved: false })
      .then(() => {
        // Mettre à jour archieved à false
        console.log('Project restored successfully in Firestore');
        this.dataSource.data = this.dataSource.data.filter(
          (p) => p.id !== project.id
        ); // Mettre à jour le tableau
        const message = 'Projet restauré avec succès';
        this.snackBar.open(message, '', { duration: 5000 });
      })
      .catch((error) => {
        console.error('Error restoring project:', error);
        const message = 'Erreur lors de la restauration du projet.';
        this.snackBar.open(message, '', { duration: 5000 });
      });
  }

  onDeleteProject(project: Project<Timestamp>) {
    this.fs
      .deleteData(this.fs.projectCol, project.id)
      .then(() => {
        console.log('Project deleted successfully in Firestore');
        this.dataSource.data = this.dataSource.data.filter(
          (p) => p.id !== project.id
        ); // Mettre à jour le tableau
        const message = 'Ce projet a été supprimé definitivement';
        this.snackBar.open(message, '', { duration: 5000 });
      })
      .catch((error) => {
        console.error('Error deleting project:', error);
        const message = 'Erreur lors de la suppression du projet.';
        this.snackBar.open(message, '', { duration: 5000 });
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
