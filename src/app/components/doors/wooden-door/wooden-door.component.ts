import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-wooden-door',
    templateUrl: './wooden-door.component.html',
    styleUrls: ['./wooden-door.component.css'],
    standalone: false
})
export class WoodenDoorComponent implements OnInit {
  @Output() doorOpen = new EventEmitter<void>();
  @Input() openedDoor: boolean = false;
  @Input() bgColor: string = '';
  audioElem: HTMLAudioElement | null = document.querySelector('.knock');
  openingAudio: HTMLAudioElement | null = document.querySelector('.openScrek');

  constructor() {}

  ngOnInit(): void {}

  openDoor(): void {
    // this.openingAudio?.play();
    this.doorOpen.emit();
  }

  knock() {
    // this.audioElem?.play();
  }

  stopKnock() {
    // this.audioElem?.pause();
  }
}
