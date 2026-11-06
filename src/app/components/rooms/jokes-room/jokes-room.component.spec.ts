import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JokesRoomComponent } from './jokes-room.component';

describe('JokesRoomComponent', () => {
  let component: JokesRoomComponent;
  let fixture: ComponentFixture<JokesRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JokesRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JokesRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
