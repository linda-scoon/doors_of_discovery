import { Component, OnInit } from '@angular/core';
import { FactsService } from './facts.service';

@Component({
  selector: 'app-fact-room',
  templateUrl: './fact-room.component.html',
  styleUrls: ['./fact-room.component.css'],
})
export class FactRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  randomFact: any = {};

  constructor(private factStream: FactsService) {}

  ngOnInit(): void {
    this.factStream.loadData().subscribe((data) => {
      this.randomFact = data;
    });
  }
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
