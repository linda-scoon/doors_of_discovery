import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorComponent } from './door.component';
import { HandleComponent } from '../../handles/handle/handle.component';

describe('DoorComponent', () => {
  let component: DoorComponent;
  let fixture: ComponentFixture<DoorComponent>;

  /**
   * Inputs are set through componentRef rather than assigned on the instance.
   * Assigning directly after the first change detection raises NG0100,
   * because Angular has already checked the bindings this component passes
   * down to the handle.
   */
  function setInputs(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  const door = () => fixture.nativeElement.querySelector('.door');
  const handle = () => fixture.nativeElement.querySelector('button.handle');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is closed until told otherwise', () => {
    expect(door().classList).not.toContain('door--open');
  });

  it('opens when the open input is set', () => {
    setInputs({ open: true });
    expect(door().classList).toContain('door--open');
  });

  it('emits opened when the handle is used', () => {
    let emitted = false;
    component.opened.subscribe(() => (emitted = true));

    handle().click();

    expect(emitted).toBe(true);
  });

  it('hinges on the right when the handle is on the left', () => {
    setInputs({ handleSide: 'left' });
    expect(door().classList).toContain('door--hinge-right');
  });

  it('gives the handle an accessible name built from the label', () => {
    setInputs({ label: 'the fact room' });
    expect(handle().getAttribute('aria-label')).toBe('Open the fact room');
  });

  it('tells assistive technology whether the door is open', () => {
    expect(handle().getAttribute('aria-expanded')).toBe('false');

    setInputs({ open: true });

    expect(handle().getAttribute('aria-expanded')).toBe('true');
  });
});
