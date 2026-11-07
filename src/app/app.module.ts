import { SafePipe } from './pipes/safe.pipe';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MusicRoomComponent } from './components/rooms/music-room/music-room.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JokesRoomComponent } from './components/rooms/jokes-room/jokes-room.component';
import { QoutesRoomComponent } from './components/rooms/qoutes-room/qoutes-room.component';
import { ImageRoomComponent } from './components/rooms/image-room/image-room.component';
import { RoomComponent } from './components/rooms/room/room.component';
import { GifRoomComponent } from './components/rooms/gif-room/gif-room.component';
import { VideoRoomComponent } from './components/rooms/video-room/video-room.component';
import { GameRoomComponent } from './components/rooms/game-room/game-room.component';
import { FactRoomComponent } from './components/rooms/fact-room/fact-room.component';
import { StoryRoomComponent } from './components/rooms/story-room/story-room.component';
import { DoorComponent } from './components/doors/door/door.component';
import { RoomSlotComponent } from './components/rooms/room-slot/room-slot.component';
import { HandleComponent } from './components/handles/handle/handle.component';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MusicRoomComponent,
    JokesRoomComponent,
    QoutesRoomComponent,
    ImageRoomComponent,
    RoomComponent,
    GifRoomComponent,
    VideoRoomComponent,
    GameRoomComponent,
    FactRoomComponent,
    StoryRoomComponent,
    DoorComponent,
    RoomSlotComponent,
    HandleComponent,
    SafePipe,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())],
})
export class AppModule {}
