import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  isToogleDriwer = signal(false);

  constructor() {}
}
