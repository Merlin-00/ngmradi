import { Component, inject, input } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/firebase/auth.service';
import { FirestoreService } from '../../../core/services/firebase/firestore.service';
import { SetTodoComponent } from './set-todo.component';
import { UpperCasePipe, AsyncPipe, DatePipe } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo',
  imports: [
    MatDividerModule,
    MatButtonModule,
    MatBadgeModule,
    UpperCasePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AsyncPipe,
    DatePipe,
    CdkDrag,
    CdkDropList,
  ],
  template: ` <main>
    <div
      align="end"
      style="right : 2.7rem; top: -1.2rem"
      [matBadge]="task().priority | uppercase"
      [class.green-badge]="task().priority === 'low'"
      [class.orange-badge]="task().priority === 'medium'"
    ></div>
    <p>
      <b>{{ task().title }}</b>
    </p>
    <p>
      {{ task().description }}
    </p>
    <mat-divider />
    <p>
      {{ formatedDate(task().createdAt) | date : 'fullDate'
      }}{{ task().moved ? ' | Deplacé' : ''
      }}{{ task().updatedAt > task().createdAt ? ' | Modifié' : '' }}
    </p>
    @if (task().uid === (user$ | async)?.uid) {
    <div class="actions" align="end">
      <mat-divider />
      <button
        mat-icon-button
        matTooltip="Modifier cette tâche"
        (click)="onEditTodo(task())"
      >
        <mat-icon>edit</mat-icon>
      </button>
      <button
        mat-icon-button
        matTooltip="Supprimer cette tâche"
        (click)="onDeleteTask(task())"
      >
        <mat-icon class="alert-action">delete</mat-icon>
      </button>
    </div>
    }
  </main>`,
  styles: `
  p{padding: 0 1rem}
  `,
})
export class TodoComponent {
  task = input.required<Task<Timestamp>>();

  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private fs = inject(FirestoreService);
  private snackBar = inject(MatSnackBar);
  user$ = this.auth.user;

  formatedDate = (t?: Timestamp) => this.fs.formatedTimestamp(t);

  onEditTodo(task: Task<Timestamp>) {
    this.dialog.open(SetTodoComponent, {
      width: '35rem',
      disableClose: true,
      data: task,
    });
  }

  onDeleteTask(task: Task<Timestamp>) {
    const todoCollection = this.fs.todoCol(task.projectId!);
    this.fs.deleteData(todoCollection, task.id!);
    const message = 'Tâche suprimée avec succès';
    this.snackBar.open(message, '', { duration: 5000 });
  }
}
