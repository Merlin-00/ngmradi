export interface Project<T> {
  id: string;
  title: string;
  description?: string;
  uid: string;
  contributors?: string[];
  archieved?: boolean;
  createdAt: T;
  updatedAt: T;
}
