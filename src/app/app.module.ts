import { SafePipe } from './pipes/safe.pipe';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoomComponent } from './components/rooms/room/room.component';
import { GifRoomComponent } from './components/rooms/gif-room/gif-room.component';
import { VideoRoomComponent } from './components/rooms/video-room/video-room.component';
import { GameRoomComponent } from './components/rooms/game-room/game-room.component';
import { StoryRoomComponent } from './components/rooms/story-room/story-room.component';
import { DoorComponent } from './components/doors/door/door.component';
import { RoomSlotComponent } from './components/rooms/room-slot/room-slot.component';
import { EmptyRoomComponent } from './components/rooms/empty-room/empty-room.component';
import { HandleComponent } from './components/handles/handle/handle.component';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  // Rooms built as standalone components are not declared here: the wall
  // creates them by type, and they bring their own imports.
  declarations: [
    AppComponent,
    RoomComponent,
    GifRoomComponent,
    VideoRoomComponent,
    GameRoomComponent,
    StoryRoomComponent,
    DoorComponent,
    RoomSlotComponent,
    EmptyRoomComponent,
    HandleComponent,
    SafePipe,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())],
})
export class AppModule {}
