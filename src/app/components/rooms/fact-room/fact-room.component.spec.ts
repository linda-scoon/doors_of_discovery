import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactRoomComponent } from './fact-room.component';

describe('FactRoomComponent', () => {
  let component: FactRoomComponent;
  let fixture: ComponentFixture<FactRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FactRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FactRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
