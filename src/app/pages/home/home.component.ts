import { Component } from '@angular/core';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { SideNavComponent } from './side-nav/side-nav.component';

@Component({
  selector: 'app-home',
  imports: [ToolBarComponent, SideNavComponent],
  template: ` <app-tool-bar />
    <app-side-nav />`,
  styles: ``,
})
export default class HomeComponent {}
