import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { Subscription } from 'rxjs';
import Peer from 'peerjs';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrl: './webrtc.component.scss'
})
export class WebrtcComponent implements OnInit {
  private peer: Peer
  title = 'peerjs';
  peerIdShare: string;
  peerId: string
  private lazyStream: any;
  currentPeer: any;
  private peerList: Array<any> = []
  constructor() {
    this.peer = new Peer()
  }

  ngOnInit(): void {
    this.getPeerId()
  }

  private getPeerId = () => {
    //Generate unique Peer Id for establishing connection
    this.peer.on('open', (id) => {
      this.peerId = id;
    });

    // Peer event to accept incoming calls
    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then((stream) => {
        this.lazyStream = stream;

        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (!this.peerList.includes(call.peer)) {
            this.streamRemoteVideo(remoteStream, call.peer);
            this.currentPeer = call.peerConnection;
            this.peerList.push(call.peer);
          }
        });

      }).catch(err => {
        console.log(err + 'Unable to get media');
      });
    });
  }

  private streamRemoteVideo(stream, peer) {
    const video = document.createElement('video');
    video.classList.add('video');
    video.srcObject = stream;
    video.play();
    console.log(this.peerIdShare);
    console.log(peer);

    peer != null && peer != this.peerIdShare ? document.getElementById('local-video').append(video) :  document.getElementById('remote-video').append(video);
    peer != null && peer == this.peerIdShare ? document.getElementById('remote-video').append(video) :  document.getElementById('local-video').append(video);
    

  }

  public callPeer(id: string): void {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      this.lazyStream = stream;

      const call = this.peer.call(id, stream);
      call.on('stream', (remoteStream) => {
        if (!this.peerList.includes(call.peer)) {
          this.streamRemoteVideo(remoteStream, call.peer);
          this.currentPeer = call.peerConnection;
          this.peerList.push(call.peer);
        }
      });
    }).catch(err => {
      console.log(err + 'Unable to connect');
    });
  }

  public shareScreen() {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare() {
    const videoTrack = this.lazyStream.getVideoTracks()[0];
    const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }

  connectWithPeer() {
    this.callPeer(this.peerIdShare)
  }

  screenShare() {
    this.shareScreen()
  }
}