import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  
  constructor(private globalService: GlobalService) {
  }

  ngOnInit(): void {
   
  }

  sendHello(): void {
    this.globalService.notificationSubject.next('hello');
  }
}
