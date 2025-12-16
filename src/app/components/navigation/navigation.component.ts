import { Component } from '@angular/core';
import { StreetViewService } from '../../services/street-view.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  constructor(private streetViewService: StreetViewService) {}

  moveForward() {
    this.streetViewService.moveForward();
  }

  moveBackward() {
    this.streetViewService.moveBackward();
  }

  turnLeft() {
    this.streetViewService.turnLeft();
  }

  turnRight() {
    this.streetViewService.turnRight();
  }
}