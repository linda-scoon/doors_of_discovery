import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-right-handle',
  templateUrl: './right-handle.component.html',
  styleUrls: ['./right-handle.component.css'],
})
export class RightHandleComponent implements OnInit {
  @Output() doorOpening = new EventEmitter<void>();
  @Input() handleDown: boolean = false;

  constructor() {}
  ngOnInit(): void {}

  openDoor(): void {
    this.doorOpening.emit();
  }
}
