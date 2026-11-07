import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { QoutesService } from './qoutes.service';

@Component({
  selector: 'app-qoutes-room',
  templateUrl: './qoutes-room.component.html',
  styleUrls: ['./qoutes-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class QoutesRoomComponent implements OnInit {
  quote: any = {};

  constructor(private qoutesStream: QoutesService) {}

  ngOnInit(): void {
    this.qoutesStream.loadData().subscribe((data) => {
      this.quote = data[0];
    });
  }
}
