import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrl: './webrtc.component.scss'
})
export class WebrtcComponent implements OnInit {
  dataSubscription: Subscription;
  notificationMessage;
  constructor(private globalService: GlobalService) {}

  ngOnInit(): void {
    this.dataSubscription = this.globalService.notificationSubject.subscribe(data => {
     this.notificationMessage = data
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
