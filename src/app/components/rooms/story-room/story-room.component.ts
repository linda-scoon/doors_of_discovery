import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-story-room',
  templateUrl: './story-room.component.html',
  styleUrls: ['./story-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StoryRoomComponent {

  storyFillers: UntypedFormGroup;
  showStory: boolean = false;
  textColourField: string = '';
  dessertField: string = '';
  animalField: string = '';
  vehicleField: string = '';
  placeField: string = '';
  sillywordField: string = '';
  exerciseField: string = '';
  insectsField: string = '';
  songField: string = '';
  seasonField: string = '';
  colourField: string = '';
  years: string = '';

  constructor(private fb: UntypedFormBuilder) {
    this.storyFillers = fb.group({
      textColour: ['#008B8B', Validators.required],
      dessert: ['', Validators.required],
      animal: ['', Validators.required],
      vehicle: ['', Validators.required],
      place: ['', Validators.required],
      sillyword: ['', Validators.required],
      exercise: ['', Validators.required],
      insects: ['', Validators.required],
      song: ['', Validators.required],
      season: ['', Validators.required],
      colour: ['', Validators.required],
      siblings: ['', Validators.required],
    });
  }

  get dessert() {
    return this.storyFillers.get('dessert');
  }
  get season() {
    return this.storyFillers.get('season');
  }
  get song() {
    return this.storyFillers.get('song');
  }
  get colour() {
    return this.storyFillers.get('colour');
  }
  get siblings() {
    return this.storyFillers.get('siblings');
  }
  get insects() {
    return this.storyFillers.get('insects');
  }
  get exercise() {
    return this.storyFillers.get('exercise');
  }
  get place() {
    return this.storyFillers.get('place');
  }
  get animal() {
    return this.storyFillers.get('animal');
  }
  get textColour() {
    return this.storyFillers.get('textColour');
  }
  get sillyword() {
    return this.storyFillers.get('sillyword');
  }
  get vehicle() {
    return this.storyFillers.get('vehicle');
  }

  /**
   * Picks randoms words to fill in the random inputs
   * @param {String} id
   */
  getRandom(id: string): void {
    let arrSize = 4;
    let desserts = ['icecream', 'apple pie', 'cheesecake', 'tiramisu'];
    let animals = ['squirrel', 'rabbit', 'hedgehog', 'otter'];
    let seasons = ['winter', 'autumn', 'summer', 'spring'];
    let colours = ['blue', 'green', 'red', 'yellow'];
    let sillywords = ['Oligoboshu', 'Mpishumpishu', 'Quibbles', 'Nillywilly'];
    let vehicles = ['car', 'boat', 'bus', 'plane'];
    let songs = [
      'murder song by Aurora',
      'permanent marker by Taylor Swift',
      'wait by J P Cooper',
      'runaway by The Corrs',
    ];
    let places = ['Hell', 'Lost Island', 'Dung planet', 'The Tip'];
    let insects = [' centipedes', ' ants', ' wasps', ' ticks'];
    let exercises = ['swimming', 'jogging', 'skipping', 'cycling'];

    //   random value selection
    let option = Math.floor(Math.random() * arrSize);
    switch (id) {
      case 'colour':
        this.colour?.setValue(colours[option]);
        break;
      case 'animal':
        this.animal?.setValue(animals[option]);
        break;
      case 'season':
        this.season?.setValue(seasons[option]);
        break;
      case 'dessert':
        this.dessert?.setValue(desserts[option]);
        break;
      case 'place':
        this.place?.setValue(places[option]);
        break;
      case 'song':
        this.song?.setValue(songs[option]);
        break;
      case 'siblings': //just adding extra 5 years to story
        this.siblings?.setValue(option + 5);
        break;
      case 'sillyword':
        this.sillyword?.setValue(sillywords[option]);
        break;
      case 'vehicle':
        this.vehicle?.setValue(vehicles[option]);
        break;
      case 'insects':
        this.insects?.setValue(insects[option]);
        break;
      case 'exercise':
        this.exercise?.setValue(exercises[option]);
        break;
      default:
        this.getRandom('colour');
        this.getRandom('dessert');
        this.getRandom('season');
        this.getRandom('animal');
        this.getRandom('song');
        this.getRandom('sillyword');
        this.getRandom('siblings');
        this.getRandom('place');
        this.getRandom('vehicle');
        this.getRandom('insects');
        this.getRandom('exercise');
        break;
    }
  }

  reShowStory(): void {
    this.showStory = !this.showStory;
  }

  /**
   * update page in accordance to input
   */
  generateStory() {
    this.reShowStory();
    this.textColourField = this.textColour?.value;
    this.dessertField = this.dessert?.value;
    this.animalField = this.animal?.value;
    this.vehicleField = this.vehicle?.value;
    this.placeField = this.place?.value;
    this.sillywordField = this.sillyword?.value;
    this.exerciseField = this.exercise?.value;
    this.insectsField = this.insects?.value;
    this.songField = this.song?.value;
    this.seasonField = this.season?.value;
    this.colourField = this.colour?.value;
    this.years = this.siblings?.value;
  }
}
