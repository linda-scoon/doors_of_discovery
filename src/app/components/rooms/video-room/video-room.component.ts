import { Component, OnInit } from '@angular/core';
import { VideosService } from './videos.service';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  videoURL: string = '';
  videoTitle: string = '';

  constructor(private videoStream: VideosService) {}
  ngOnInit(): void {
    let movieId: string = '';

    this.videoStream.getPopularMovies().subscribe((data) => {
      // generating a random number out of all the items in the array of popular films
      let movieIdx = Math.round(Math.random() * (data.items.length - 1));

      // retriving random movie id from list
      movieId = data.items[movieIdx].id;

      // retrieving trailer of random movie id
      this.videoStream.getTrailer(movieId).subscribe((data) => {
        this.videoURL = data.linkEmbed + '?autoplay=true&width=480';
        this.videoTitle = data.fullTitle;
      });
    });
  }
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
