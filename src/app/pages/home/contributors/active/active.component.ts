import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { Project } from '../../../../core/models/project.model';
import { AuthService } from '../../../../core/services/firebase/auth.service';
import { FirestoreService } from '../../../../core/services/firebase/firestore.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-active',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `<main style="margin: 1rem;">
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
            <button mat-icon-button><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="archieveItem(project)">
              <mat-icon>delete</mat-icon>
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
export default class ActiveComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  displayedColumns: string[] = [
    'position',
    'title',
    'possession',
    'contributors',
    'action',
  ];
  projets: Project<Timestamp>[] = [];

  dataSource = new MatTableDataSource<Project<Timestamp>>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fs = inject(FirestoreService);
  private auth = inject(AuthService);
  user$ = this.auth.user;
  userSub?: Subscription;
  projects$?: Observable<Project<Timestamp>[]>;

  formateDate = (t?: Timestamp) => this.fs.formatedTimestamp(t);

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
        // Filtrer les projets archivés *avant* d'afficher les données
        const activeProjects = projects.filter(
          (project) => !project['archieved']
        );
        this.projets = activeProjects as Project<Timestamp>[];
        this.dataSource.data = this.projets;
      });
  }

  archieveItem(item: Project<Timestamp>) {
    item.archieved = true;

    this.fs
      .updateProject(item.id, { archieved: true })
      .then(() => {
        console.log('Project archived successfully in Firestore');

        // Filtrer les projets *après* la mise à jour réussie de Firestore
        this.projets = this.projets.filter((i) => i.id !== item.id);
        this.dataSource.data = this.projets;

        if (this.projets.length === 0 && this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      })
      .catch((error) => {
        console.error('Error archiving project:', error);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
