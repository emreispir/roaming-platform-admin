import { NgFor, NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  imports: [NgFor, NgStyle],
  standalone: true,
})
export class RatingComponent implements OnInit {
  @Input() rating: number;
  stars: boolean[];
  rateLimit: number = 5;

  ngOnInit() {
    this.stars = Array(this.rateLimit).fill(false);
    for (let i = 0; i < this.rating; i++) {
      this.stars[i] = true;
    }
  }
}
