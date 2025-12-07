import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import Peer from 'peerjs';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss']
})
export class WebrtcComponent implements OnInit, OnDestroy {
  private peer: Peer;
  title = 'peerjs';
  peerIdShare: string;
  peerId: string;
  private localStream: MediaStream;
  currentPeer: RTCPeerConnection;
  private peerList: Array<any> = [];
  copied: boolean = false

  // For UI state management
  isConnected: boolean = false;
  isCalling: boolean = false;
  isRinging: boolean = false;
  incomingCall: boolean = false;
  incomingCallPeerId: string = '';
  currentCall: any = null;

  // Video states
  isVideoZoomed: boolean = false;
  isFrontCamera: boolean = true;
  localVideoEnabled: boolean = true;
  audioEnabled: boolean = true;

  // Call status and messages
  callStatus: string = '';
  showCallEndedModal: boolean = false;
  callEndedMessage: string = '';

  // Audio for ringing
  private ringtone: HTMLAudioElement;
  private ringbackTone: HTMLAudioElement;

  // Timeout references
  private callTimeout: any;
  private incomingCallTimeout: any;

  constructor() {
    this.peer = new Peer();
    this.initializeAudio();
  }

  ngOnInit(): void {
    this.getPeerId();
  }

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.cleanupCall();
    this.stopRingtone();
    this.stopRingbackTone();
    if (this.peer) {
      this.peer.destroy();
    }
  }

  private initializeAudio(): void {
    this.ringtone = new Audio();
    this.ringtone.loop = true;

    this.ringbackTone = new Audio();
    this.ringbackTone.loop = true;
  }

  private getPeerId = () => {
    this.peer.on('open', (id) => {
      this.peerId = id;
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('error', (err) => {
      console.error('Peer connection error:', err);
    });

    this.peer.on('disconnected', (peerId) => {
      if (this.isRinging && !this.isConnected) {
        this.handleCallNotAnswered('The user disconnected before answering');
      }
    });

    this.peer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);

      this.incomingCall = true;
      this.incomingCallPeerId = call.peer;
      this.currentCall = call;

      this.playRingtone();

      this.incomingCallTimeout = setTimeout(() => {
        if (this.incomingCall) {
          this.declineCall();
          this.showCallEndedMessage('Call not answered');
        }
      }, 30000);

      call.on('close', () => {
        if (this.incomingCall) {
          this.handleCallerCancelled();
        }
      });

      call.on('error', () => {
        if (this.incomingCall) {
          this.handleCallerCancelled();
        }
      });
    });
  }

  private handleCallerCancelled(): void {
    this.stopRingtone();
    this.incomingCall = false;
    this.currentCall = null;
    this.showCallEndedMessage('Call cancelled by caller');
    if (this.incomingCallTimeout) {
      clearTimeout(this.incomingCallTimeout);
    }
  }

  private handleCallNotAnswered(message: string = 'Call not answered'): void {
    this.stopRingbackTone();
    this.isCalling = false;
    this.isRinging = false;
    this.showCallEndedMessage(message);
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
    }
  }

  private showCallEndedMessage(message: string): void {
    this.callEndedMessage = message;
    this.showCallEndedModal = true;

    setTimeout(() => {
      this.showCallEndedModal = false;
    }, 3000);
  }

  public async acceptCall(): Promise<void> {
    if (!this.currentCall) return;

    this.stopRingtone();
    this.incomingCall = false;
    this.isRinging = false;

    if (this.incomingCallTimeout) {
      clearTimeout(this.incomingCallTimeout);
    }

    try {
      const stream = await this.getFullHDVideoStream(this.isFrontCamera);
      this.localStream = stream;
      this.setLocalVideoStream(stream);

      this.currentCall.answer(stream);

      this.currentCall.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', this.currentCall.peer);
        if (!this.peerList.includes(this.currentCall.peer)) {
          this.setRemoteVideoStream(remoteStream);
          this.currentPeer = this.currentCall.peerConnection;
          this.peerList.push(this.currentCall.peer);
          this.isConnected = true;
          this.callStatus = 'Connected';
        }
      });

      this.currentCall.on('close', () => {
        console.log('Call closed');
        this.cleanupCall();
        this.showCallEndedMessage('Call ended');
      });

      this.currentCall.on('error', (err) => {
        console.error('Call error:', err);
        this.cleanupCall();
        this.showCallEndedMessage('Call failed');
      });

    } catch (err) {
      console.log(err + 'Unable to get media');
      this.cleanupCall();
      this.showCallEndedMessage('Unable to access camera/microphone');
    }
  }

  public declineCall(): void {
    this.stopRingtone();
    this.incomingCall = false;
    this.isRinging = false;

    if (this.currentCall) {
      this.currentCall.close();
    }

    this.currentCall = null;
    this.incomingCallPeerId = '';

    if (this.incomingCallTimeout) {
      clearTimeout(this.incomingCallTimeout);
    }
  }

  public cancelCall(): void {
    this.stopRingbackTone();
    this.isCalling = false;
    this.isRinging = false;

    if (this.currentCall) {
      this.currentCall.close();
    }

    this.currentCall = null;

    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
    }
  }

  public async callPeer(id: string): Promise<void> {
    if (!id) {
      alert('Please enter a peer ID');
      return;
    }

    this.isCalling = true;
    this.isRinging = true;
    this.callStatus = 'Ringing...';
    this.playRingbackTone();

    try {
      const stream = await this.getFullHDVideoStream(this.isFrontCamera);
      this.localStream = stream;
      this.setLocalVideoStream(stream);

      const call = this.peer.call(id, stream);
      this.currentCall = call;

      this.callTimeout = setTimeout(() => {
        if (this.isRinging && !this.isConnected) {
          this.handleCallNotAnswered('No answer - user may be unavailable');
        }
      }, 45000);

      call.on('stream', (remoteStream) => {
        console.log('Connected to remote peer:', call.peer);
        this.stopRingbackTone();
        if (!this.peerList.includes(call.peer)) {
          this.setRemoteVideoStream(remoteStream);
          this.currentPeer = call.peerConnection;
          this.peerList.push(call.peer);
          this.isConnected = true;
          this.isCalling = false;
          this.isRinging = false;
          this.callStatus = 'Connected';
        }

        if (this.callTimeout) {
          clearTimeout(this.callTimeout);
        }
      });

      call.on('close', () => {
        console.log('Call closed by remote peer');
        this.stopRingbackTone();
        if (this.isRinging && !this.isConnected) {
          this.handleCallNotAnswered('Call declined by user');
        } else {
          this.cleanupCall();
          this.showCallEndedMessage('Call ended');
        }
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        this.stopRingbackTone();
        if (this.isRinging && !this.isConnected) {
          this.handleCallNotAnswered('User unavailable or disconnected');
        } else {
          this.cleanupCall();
        }

        if (this.callTimeout) {
          clearTimeout(this.callTimeout);
        }
      });

    } catch (err) {
      console.log(err + 'Unable to connect');
      this.stopRingbackTone();
      this.isCalling = false;
      this.isRinging = false;
      this.showCallEndedMessage('Unable to access camera/microphone');
    }
  }

  private async getFullHDVideoStream(isFront: boolean): Promise<MediaStream> {
    const constraints = {
      video: {
        facingMode: isFront ? 'user' : 'environment',
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 60 },
        aspectRatio: { ideal: 16 / 9 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 2,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0
      }
    };

    try {
      // Try Full HD first
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn('Full HD not available, trying HD...', err);

      // Fallback to HD
      const hdConstraints = {
        video: {
          facingMode: isFront ? 'user' : 'environment',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          aspectRatio: 16 / 9
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      try {
        return await navigator.mediaDevices.getUserMedia(hdConstraints);
      } catch (err2) {
        console.warn('HD not available, trying basic...', err2);

        // Final fallback to basic quality
        const basicConstraints = {
          video: {
            facingMode: isFront ? 'user' : 'environment'
          },
          audio: true
        };

        return await navigator.mediaDevices.getUserMedia(basicConstraints);
      }
    }
  }

  public async flipCamera(): Promise<void> {
    if (!this.localStream) return;

    // Stop current video tracks
    this.localStream.getVideoTracks().forEach(track => {
      track.stop();
      this.localStream.removeTrack(track);
    });

    this.isFrontCamera = !this.isFrontCamera;

    try {
      const newStream = await this.getFullHDVideoStream(this.isFrontCamera);
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Add new video track to existing stream
      this.localStream.addTrack(newVideoTrack);

      // Update local video display
      this.setLocalVideoStream(this.localStream);

      // Replace track in peer connection if connected
      if (this.currentPeer && this.isConnected) {
        const sender = this.currentPeer.getSenders().find((s: any) =>
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      console.log('Camera flipped to:', this.isFrontCamera ? 'front' : 'back');

    } catch (err) {
      console.error('Error flipping camera:', err);
      // Revert camera state if flip fails
      this.isFrontCamera = !this.isFrontCamera;
    }
  }

  public toggleVideo(): void {
    if (!this.localStream) return;

    this.localVideoEnabled = !this.localVideoEnabled;
    const videoTrack = this.localStream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = this.localVideoEnabled;
    }
  }

  public toggleAudio(): void {
    if (!this.localStream) return;

    this.audioEnabled = !this.audioEnabled;
    const audioTracks = this.localStream.getAudioTracks();

    audioTracks.forEach(track => {
      track.enabled = this.audioEnabled;
    });
  }

  public toggleVideoZoom(): void {
    this.isVideoZoomed = !this.isVideoZoomed;
  }

  private setLocalVideoStream(stream: MediaStream): void {
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.muted = true;

      // Set video quality attributes
      localVideo.playsInline = true;
      localVideo.setAttribute('playsinline', 'true');
    }
  }

  private setRemoteVideoStream(stream: MediaStream): void {
    const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
    if (remoteVideo) {
      remoteVideo.srcObject = stream;

      // Set video quality attributes
      remoteVideo.playsInline = true;
      remoteVideo.setAttribute('playsinline', 'true');
    }
  }

  private playRingtone(): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();

      this.ringtone = oscillator as any;
    } catch (e) {
      console.log('Audio context not supported');
    }
  }

  private stopRingtone(): void {
    if (this.ringtone) {
      if (this.ringtone instanceof OscillatorNode) {
        this.ringtone.stop();
      } else {
        this.ringtone.pause();
        this.ringtone.currentTime = 0;
      }
    }
  }

  private playRingbackTone(): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);

      oscillator.start();

      this.ringbackTone = oscillator as any;
    } catch (e) {
      console.log('Audio context not supported');
    }
  }

  copyPeerId() {
    if (!this.peerId) return;

    navigator.clipboard.writeText(this.peerId)
      .then(() => {
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 1000);
        console.log("Copied!");
      })
      .catch(err => console.error(err));
  }


  private stopRingbackTone(): void {
    if (this.ringbackTone) {
      if (this.ringbackTone instanceof OscillatorNode) {
        this.ringbackTone.stop();
      } else {
        this.ringbackTone.pause();
        this.ringbackTone.currentTime = 0;
      }
    }
  }

  public shareScreen(): void {
    if (!this.isConnected) return;

    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true
    }).then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      if (this.currentPeer) {
        const sender = this.currentPeer.getSenders().find((s: any) =>
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (this.currentPeer) {
        const sender = this.currentPeer.getSenders().find((s: any) =>
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
    }
  }

  public connectWithPeer(): void {
    this.callPeer(this.peerIdShare);
  }

  public endCall(): void {
    this.stopRingtone();
    this.stopRingbackTone();

    if (this.currentCall) {
      this.currentCall.close();
    }

    this.cleanupCall();
    this.showCallEndedMessage('Call ended');

    this.peer.destroy();
    this.peer = new Peer();
    this.getPeerId();
  }

  private cleanupCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;

    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    this.isConnected = false;
    this.isCalling = false;
    this.isRinging = false;
    this.incomingCall = false;
    this.incomingCallPeerId = '';
    this.currentCall = null;
    this.peerList = [];
    this.currentPeer = null;
    this.callStatus = '';
    this.isVideoZoomed = false;
    this.localVideoEnabled = true;
    this.audioEnabled = true;
    this.isFrontCamera = true;

    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
    }
    if (this.incomingCallTimeout) {
      clearTimeout(this.incomingCallTimeout);
    }
  }

  public closeCallEndedModal(): void {
    this.showCallEndedModal = false;
  }
}