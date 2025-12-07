import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { WebrtcComponent } from './webrtc/webrtc.component';
import { authGuard } from './auth.guard';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'webrtc', 
    pathMatch: 'full' 
  },
  { 
    path: 'webrtc', 
    component: WebrtcComponent,
    canActivate : []
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules,useHash : true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
