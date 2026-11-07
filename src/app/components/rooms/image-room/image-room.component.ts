import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ImagesService } from './images.service';

@Component({
  selector: 'app-image-room',
  templateUrl: './image-room.component.html',
  styleUrls: ['./image-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ImageRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  image: any = {};
  imageIdx: number = 0;

  constructor(private imageStream: ImagesService) {}

  ngOnInit(): void {
    this.imageStream.loadData().subscribe((data) => {
      this.imageIdx = Math.floor(Math.random() * (data.length - 1));
      this.image = data[this.imageIdx];
    });
  }

  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
