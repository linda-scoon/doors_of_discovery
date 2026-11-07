import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { JokesService } from './jokes.service';
import {
  animate,
  stagger,
  query,
  trigger,
  group,
  transition,
  style,
} from '@angular/animations';

@Component({
  selector: 'app-jokes-room',
  templateUrl: './jokes-room.component.html',
  styleUrls: ['./jokes-room.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        group([
          query('.setup', [style({ opacity: 0 }), animate(2000)]),
          query(
            '.punch-line',
            stagger(1000, [style({ opacity: 0 }), animate(10000)]),
          ),
        ]),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class JokesRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  joke: any = {};

  constructor(private jokeStream: JokesService) {}

  ngOnInit(): void {
    this.jokeStream.loadData().subscribe((data) => {
      this.joke = data;
    });
  }
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
