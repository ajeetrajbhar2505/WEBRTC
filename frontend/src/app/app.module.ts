import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { WebrtcComponent } from './webrtc/webrtc.component';
import { GlobalService } from './global.service';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './token.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmailRegexValidatorDirective } from './regex-validator/email-regex-validator.directive';
import { MobileRegexValidatorDirective } from './regex-validator/mobile-regex-validator.directive';
import { NumberOnlyRegexValidatorDirective } from './regex-validator/number-only-regex-validator.directive';
import { RestrictMultiSpaceRegexValidatorDirective } from './regex-validator/restrict-multi-space-regex-validator.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WebrtcComponent,
    EmailRegexValidatorDirective,
    MobileRegexValidatorDirective,
    NumberOnlyRegexValidatorDirective,
    RestrictMultiSpaceRegexValidatorDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [GlobalService, provideHttpClient(withInterceptors([tokenInterceptor]))],
  bootstrap: [AppComponent]
})
export class AppModule { }
