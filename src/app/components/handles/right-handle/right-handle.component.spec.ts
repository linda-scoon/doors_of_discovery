import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightHandleComponent } from './right-handle.component';

describe('RightHandleComponent', () => {
  let component: RightHandleComponent;
  let fixture: ComponentFixture<RightHandleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RightHandleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
