import { inject, Injectable } from '@angular/core';
import { Project } from '../../models/project.model';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  FieldValue,
  Firestore,
  or,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { merge, Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  projectCol = 'projects';
  todoCol = (projectId: string) => `${this.projectCol}/${projectId}/todos`;

  fs = inject(Firestore);
  createDocId = (colName: string) => doc(collection(this.fs, colName)).id;

  setProject(project: Project<FieldValue>) {
    const projectColRef = collection(this.fs, this.projectCol);
    const projectDocRef = doc(projectColRef, project.id);
    return setDoc(projectDocRef, project, { merge: true });
  }

  setTask(projectId: string, t: Task<FieldValue>) {
    const todoColRef = collection(this.fs, this.todoCol(projectId));
    const todoDocRef = doc(todoColRef, t.id);
    return setDoc(todoDocRef, t, { merge: true });
  }

  getProjects(user: User) {
    const projectColRef = collection(this.fs, this.projectCol);
    const queryProjects = query(
      projectColRef,
      or(
        where('uid', '==', user.uid),
        where('contributors', 'array-contains', user.email)
      ),
      orderBy('createdAt', 'desc')
    );
    return collectionData(queryProjects);
  }

  getTodos(projectId: string, todoStatus: string) {
    const todoColRef = collection(this.fs, this.todoCol(projectId));
    const queryTodos = query(
      todoColRef,
      where('status', '==', todoStatus),
      orderBy('createdAt', 'asc')
    );
    return collectionData(queryTodos) as Observable<Task<Timestamp>[]>;
  }

  getDocData(colName: string, id: string) {
    return docData(doc(this.fs, colName, id));
  }
  deleteData(colName: string, id: string) {
    return deleteDoc(doc(this.fs, colName, id));
  }

  updateProject(projectId: string, data: Partial<Project<Timestamp>>) {
    const projectDocRef = doc(collection(this.fs, this.projectCol), projectId); // Utilisation de la nouvelle API
    return updateDoc(projectDocRef, data); // Utilisation de updateDoc
  }

  formatedTimestamp = (t?: Timestamp) => (t?.seconds ? t.toDate() : new Date());
}
