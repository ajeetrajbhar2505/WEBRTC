import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginFrom:FormGroup
  constructor(private globalService: GlobalService,private formBuilder:FormBuilder) {
  }

  ngOnInit(): void {
   this.InitializeForm()
  }

  InitializeForm(){
    this.loginFrom = this.formBuilder.group({
      email : ['',Validators.required],
      mobile : ['',Validators.required],
      pincode : ['',Validators.required],
      father : ['',Validators.required],
    })
  }
  

}
