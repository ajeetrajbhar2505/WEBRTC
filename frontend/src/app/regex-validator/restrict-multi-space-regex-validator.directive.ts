import { Attribute, Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[restrictMultiSpaceRegexValidator]'
})
export class RestrictMultiSpaceRegexValidatorDirective {

  constructor(private ngControl: NgControl) { 
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: any) {
    const regex = /^[A-Za-z]( ?[A-Za-z] ?)*$/;

    if (!regex.test(value)) {
      this.ngControl.control.setErrors({ 'restrictMultiSpaceInvalid': true });
    } else {
      this.ngControl.control.setErrors(null);
    }
    this.ngControl.valueAccessor.writeValue(this.ngControl.value);
  }
}
