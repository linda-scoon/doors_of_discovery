import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { RoomSlotComponent } from './room-slot.component';
import { RoomComponent } from '../room/room.component';
import { DoorComponent } from '../../doors/door/door.component';
import { HandleComponent } from '../../handles/handle/handle.component';
import { RoomDefinition } from '../../../rooms';

/** Stands in for a real room, and records the door state it was given. */
@Component({
  selector: 'app-test-room-content',
  template: '<p class="content">behind the door</p>',
  standalone: false,
})
class TestRoomContentComponent {
  open = false;
}

describe('RoomSlotComponent', () => {
  let fixture: ComponentFixture<RoomSlotComponent>;

  const definition: RoomDefinition = {
    id: 'test',
    name: 'Fact Room',
    colour: '#9F8170',
    component: TestRoomContentComponent,
  };

  async function createWith(room: RoomDefinition) {
    await TestBed.configureTestingModule({
      declarations: [
        RoomSlotComponent,
        RoomComponent,
        DoorComponent,
        HandleComponent,
        TestRoomContentComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomSlotComponent);
    fixture.componentRef.setInput('room', room);
    fixture.detectChanges();
  }

  it('renders the room component behind the door', async () => {
    await createWith(definition);
    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();
  });

  it('starts with the door shut and opens it when the handle is used', async () => {
    await createWith(definition);
    const door = () => fixture.nativeElement.querySelector('.door');

    expect(door().classList).not.toContain('door--open');

    fixture.nativeElement.querySelector('button.handle').click();
    fixture.detectChanges();

    expect(door().classList).toContain('door--open');
  });

  it('builds the door label from the room name', async () => {
    await createWith(definition);
    const handle = fixture.nativeElement.querySelector('button.handle');
    expect(handle.getAttribute('aria-label')).toBe('Open the fact room');
  });

  it('withholds the door state from rooms that did not ask for it', async () => {
    await createWith(definition);
    expect(fixture.componentInstance.contentInputs).toBeUndefined();
  });

  it('passes the door state to rooms that asked for it', async () => {
    await createWith({ ...definition, needsDoorState: true });

    expect(fixture.componentInstance.contentInputs).toEqual({ open: false });

    // No detectChanges here: contentInputs is plain state, and re-rendering
    // after mutating it directly trips Angular's changed-after-checked guard.
    fixture.componentInstance.openDoor();

    expect(fixture.componentInstance.contentInputs).toEqual({ open: true });
  });
});
