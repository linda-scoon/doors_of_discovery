import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';

import { RoomSlotComponent } from './room-slot.component';
import { RoomComponent } from '../room/room.component';
import { DoorComponent } from '../../doors/door/door.component';
import { HandleComponent } from '../../handles/handle/handle.component';
import { RoomDefinition } from '../../../rooms';
import { DoorSoundService } from '../../../services/door-sound.service';

/** Stands in for a real room. */
@Component({
  selector: 'app-test-room-content',
  template: '<p class="content">behind the door</p>',
  standalone: false,
})
class TestRoomContentComponent {
  open = false;
}

/** Records what the door asked to be played, without making any noise. */
class SilentSoundService {
  played: string[] = [];
  tap = () => this.played.push('tap');
  knockBack = () => this.played.push('knockBack');
  creak = () => this.played.push('creak');
  shriek = () => this.played.push('shriek');
  callOut = (words: string) => this.played.push(`callOut:${words}`);
}

describe('RoomSlotComponent', () => {
  let fixture: ComponentFixture<RoomSlotComponent>;
  let sound: SilentSoundService;

  const plainRoom: RoomDefinition = {
    id: 'test',
    name: 'Fact Room',
    component: TestRoomContentComponent,
    // Pinned so the test does not depend on what the id happens to generate.
    openStyle: 'swing',
  };

  async function createWith(room: RoomDefinition) {
    sound = new SilentSoundService();

    await TestBed.configureTestingModule({
      declarations: [
        RoomSlotComponent,
        RoomComponent,
        DoorComponent,
        HandleComponent,
        TestRoomContentComponent,
      ],
      providers: [{ provide: DoorSoundService, useValue: sound }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomSlotComponent);
    fixture.componentRef.setInput('room', room);
    fixture.detectChanges();
  }

  const door = () => fixture.nativeElement.querySelector('.door');
  const handle = () => fixture.nativeElement.querySelector('button.handle');
  const leave = () =>
    fixture.nativeElement.querySelector('app-room').dispatchEvent(new MouseEvent('mouseleave'));

  it('builds the room behind the door only once it is opened', async () => {
    await createWith(plainRoom);
    // Nothing is fetched for a door nobody opens.
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();

    handle().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();
  });

  it('takes the room down once the door has swung shut', fakeAsync(async () => {
    await createWith(plainRoom);
    handle().click();
    fixture.detectChanges();

    leave();
    fixture.detectChanges();
    // Still there while the door swings closed over it.
    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();

    tick(2000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
  }));

  it('keeps the room if the door is opened again before it is taken down', fakeAsync(async () => {
    await createWith(plainRoom);
    handle().click();
    leave();
    tick(500);
    handle().click();
    tick(2000);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();
  }));

  it('renders exactly one door', async () => {
    await createWith(plainRoom);
    expect(fixture.nativeElement.querySelectorAll('.door').length).toBe(1);
  });

  it('starts shut and opens when the handle is used', async () => {
    await createWith(plainRoom);
    expect(door().classList).not.toContain('door--open');

    handle().click();
    fixture.detectChanges();

    expect(door().classList).toContain('door--open');
    expect(fixture.componentInstance.open).toBeTrue();
  });

  it('builds the door label from the room name', async () => {
    await createWith(plainRoom);
    expect(handle().getAttribute('aria-label')).toBe('Open the fact room');
  });

  it('makes a sound when the door itself is tapped', async () => {
    await createWith(plainRoom);

    door().click();

    expect(sound.played).toContain('tap');
  });

  it('shuts again when the pointer leaves', async () => {
    await createWith(plainRoom);
    handle().click();
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('app-room')
      .dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();

    expect(door().classList).not.toContain('door--open');
  });

  it('withholds the door state from rooms that did not ask for it', async () => {
    await createWith(plainRoom);
    expect(fixture.componentInstance.contentInputs).toBeUndefined();
  });

  it('passes the door state to rooms that asked for it', async () => {
    await createWith({ ...plainRoom, needsDoorState: true });
    expect(fixture.componentInstance.contentInputs).toEqual({ open: false });

    // No detectChanges here: contentInputs is plain state, and re-rendering
    // after mutating it directly trips Angular's changed-after-checked guard.
    fixture.componentInstance.openDoor();

    expect(fixture.componentInstance.contentInputs).toEqual({ open: true });
  });

  it('creaks on the way open when the door is a creaky one', async () => {
    await createWith({ ...plainRoom, openStyle: 'creak' });

    handle().click();

    expect(sound.played).toContain('creak');
  });

  it('does not open a stuck door, however often it is tried', async () => {
    await createWith({ ...plainRoom, openStyle: 'stuck' });

    handle().click();
    fixture.detectChanges();
    handle().click();
    fixture.detectChanges();

    expect(door().classList).not.toContain('door--open');
    expect(fixture.componentInstance.open).toBeFalse();
  });

  it('answers from inside and then lets you in', fakeAsync(async () => {
    await createWith(plainRoom);
    // The surprise comes from the id, so set it directly for the test.
    fixture.componentInstance.character.surprise = 'answers';

    fixture.componentInstance.onTap('wood');
    expect(sound.played).toContain('callOut:coming');
    expect(fixture.componentInstance.open).toBeFalse();

    tick(1400);
    expect(fixture.componentInstance.open).toBeTrue();
  }));

  it('hides the room until the door is open', async () => {
    await createWith(plainRoom);
    const content = fixture.nativeElement.querySelector('.room-content');

    // Being behind the door is not enough: glass doors are translucent, so
    // the room could be read through one before it was opened.
    expect(content.classList).toContain('room-content--hidden');

    handle().click();
    fixture.detectChanges();

    expect(content.classList).not.toContain('room-content--hidden');
  });

  it('never leaves a door onto an empty room stuck', async () => {
    await createWith({ ...plainRoom, openStyle: 'stuck', isEmpty: true });

    handle().click();
    fixture.detectChanges();

    expect(door().classList).toContain('door--open');
  });

  it('still allows a stuck door onto a room with something in it', async () => {
    await createWith({ ...plainRoom, openStyle: 'stuck' });

    handle().click();
    fixture.detectChanges();

    expect(door().classList).not.toContain('door--open');
  });

  it('opens to a tap when that is the kind of door it is', async () => {
    await createWith(plainRoom);
    fixture.componentInstance.character.surprise = 'opens-on-tap';

    fixture.componentInstance.onTap('wood');

    expect(fixture.componentInstance.open).toBeTrue();
  });
});
