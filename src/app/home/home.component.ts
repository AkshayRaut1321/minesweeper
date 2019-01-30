import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public radioModel = 'easy';
  public levels = [
    {name:'Easy', value:'easy'},
    {name:'Medium', value:'medium'},
    {name:'Hard', value:'hard'}
  ];

  constructor(private router:Router) { }

  ngOnInit() {
  }

  Start(){
    this.router.navigate(['/' + this.radioModel]);
  }
}
