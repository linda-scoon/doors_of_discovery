import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QoutesRoomComponent } from './qoutes-room.component';

describe('QoutesRoomComponent', () => {
  let component: QoutesRoomComponent;
  let fixture: ComponentFixture<QoutesRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QoutesRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QoutesRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
