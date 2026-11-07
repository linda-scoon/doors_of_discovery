import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FactsService } from './facts.service';

@Component({
  selector: 'app-fact-room',
  templateUrl: './fact-room.component.html',
  styleUrls: ['./fact-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FactRoomComponent implements OnInit {
  randomFact: any = {};

  constructor(private factStream: FactsService) {}

  ngOnInit(): void {
    this.factStream.loadData().subscribe((data) => {
      this.randomFact = data;
    });
  }
}
