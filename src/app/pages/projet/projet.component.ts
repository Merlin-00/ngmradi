import {
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Task } from '../../core/models/task.model';
import { FirestoreService } from '../../core/services/firebase/firestore.service';
import { TodoComponent } from './todo/todo.component';
import { Observable, Subscription } from 'rxjs';
import { Project } from '../../core/models/project.model';
import {
  FieldValue,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Title } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/firebase/auth.service';
import { SetTodoComponent } from './todo/set-todo.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SetProjectComponent } from '../home/projects/set-project/set-project.component';

@Component({
  selector: 'app-project',
  imports: [
    CdkDropList,
    CdkDrag,
    MatCardModule,
    MatDividerModule,
    TodoComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatTooltipModule,
    AsyncPipe,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss'],
})
export default class ProjetComponent implements OnInit, OnDestroy {
  id = input('id');
  projectSub?: Subscription;
  project?: Project<Timestamp>;

  readonly title = inject(Title);
  private fs = inject(FirestoreService);
  private auth = inject(AuthService);
  readonly user$ = this.auth.user;
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  todos$?: Observable<Task<Timestamp>[]>;
  inProgresses$?: Observable<Task<Timestamp>[]>;
  dones$?: Observable<Task<Timestamp>[]>;

  formateDate = (t?: Timestamp) => this.fs.formatedTimestamp(t);
  ngOnInit(): void {
    this.todos$ = this.fs.getTodos(this.id(), 'backlog');
    this.inProgresses$ = this.fs.getTodos(this.id(), 'in-progress');
    this.dones$ = this.fs.getTodos(this.id(), 'done');

    this.projectSub = this.fs
      .getDocData(this.fs.projectCol, this.id())
      .subscribe((project) => {
        this.project = project as Project<Timestamp>;
        this.title.setTitle(`${this.project.title} - ngMradi`);
      });
  }

  onSetTodo(projectId: string) {
    this.dialog.open(SetTodoComponent, {
      width: '35rem',
      disableClose: true,
      data: { projectId },
    });
  }

  onEditProject(project: Project<Timestamp>) {
    this.dialog.open(SetProjectComponent, {
      width: '35rem',
      disableClose: true,
      data: project,
    });
  }
  onDeleteProject(projectId: string) {
    this.fs.deleteData(this.fs.projectCol, projectId);
    const message = 'Projet suprimé avec succès';
    this.snackBar.open(message, '', { duration: 5000 });
  }

  drop(
    event: CdkDragDrop<Task<Timestamp>[] | null>,
    status: 'backlog' | 'in-progress' | 'done'
  ) {
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data![
        event.previousIndex
      ] as Task<FieldValue>;

      task.moved = true;
      task.status = status;
      this.fs.setTask(this.id(), task);
    }
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }
}
