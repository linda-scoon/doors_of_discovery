import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { RoomSlotComponent } from './room-slot.component';
import { RoomComponent } from '../room/room.component';
import { DoorComponent } from '../../doors/door/door.component';
import { HandleComponent } from '../../handles/handle/handle.component';
import { RoomDefinition } from '../../../rooms';

/** Stands in for a real room. */
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

  const oneDoor: RoomDefinition = {
    id: 'test',
    name: 'Fact Room',
    component: TestRoomContentComponent,
    doorLayers: 1,
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

  const doors = () => fixture.nativeElement.querySelectorAll('.door');
  const handles = () => fixture.nativeElement.querySelectorAll('button.handle');
  const openDoors = () => fixture.nativeElement.querySelectorAll('.door--open');

  it('renders the room component behind the door', async () => {
    await createWith(oneDoor);
    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();
  });

  it('starts shut and opens when the handle is used', async () => {
    await createWith(oneDoor);
    expect(openDoors().length).toBe(0);

    handles()[0].click();
    fixture.detectChanges();

    expect(openDoors().length).toBe(1);
    expect(fixture.componentInstance.roomIsOpen).toBeTrue();
  });

  it('builds the door label from the room name', async () => {
    await createWith(oneDoor);
    expect(handles()[0].getAttribute('aria-label')).toBe('Open the fact room');
  });

  it('withholds the door state from rooms that did not ask for it', async () => {
    await createWith(oneDoor);
    expect(fixture.componentInstance.contentInputs).toBeUndefined();
  });

  it('passes the door state to rooms that asked for it', async () => {
    await createWith({ ...oneDoor, needsDoorState: true });
    expect(fixture.componentInstance.contentInputs).toEqual({ open: false });

    // No detectChanges here: contentInputs is plain state, and re-rendering
    // after mutating it directly trips Angular's changed-after-checked guard.
    fixture.componentInstance.openDoor(fixture.componentInstance.layers[0]);

    expect(fixture.componentInstance.contentInputs).toEqual({ open: true });
  });

  describe('a room with more than one door', () => {
    const twoDoors: RoomDefinition = { ...oneDoor, doorLayers: 2 };

    it('renders a door per layer', async () => {
      await createWith(twoDoors);
      expect(doors().length).toBe(2);
    });

    it('is not open until every door has been opened', async () => {
      await createWith(twoDoors);

      handles()[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.roomIsOpen).toBeFalse();

      handles()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.roomIsOpen).toBeTrue();
    });

    it('ignores an inner door until the one in front of it is open', async () => {
      await createWith(twoDoors);

      handles()[1].click();
      fixture.detectChanges();

      expect(openDoors().length).toBe(0);
    });

    it('says that an inner door is not the way in', async () => {
      await createWith(twoDoors);
      expect(handles()[1].getAttribute('aria-label')).toBe(
        'Open the next door into the fact room'
      );
    });

    it('gives each layer its own identity, so they do not look alike', async () => {
      await createWith(twoDoors);
      const [outer, inner] = fixture.componentInstance.layers;
      expect(outer.id).not.toBe(inner.id);
    });

    it('shuts every door again when the pointer leaves', async () => {
      await createWith(twoDoors);
      handles()[0].click();
      handles()[1].click();
      fixture.detectChanges();
      expect(openDoors().length).toBe(2);

      // Dispatch the real event rather than calling closeDoors() directly:
      // mutating state outside Angular's own handling and then forcing a
      // render trips the changed-after-checked guard.
      fixture.nativeElement
        .querySelector('app-room')
        .dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      expect(openDoors().length).toBe(0);
    });
  });
});
