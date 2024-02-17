import { Attribute, Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[mobileRegexValidator]'
})
export class MobileRegexValidatorDirective {
  @Input() maxLength: number; // Set the maximum length

  constructor(private ngControl: NgControl,@Attribute('maxlength') maxLength: string) {
    this.maxLength = parseInt(maxLength, 10);
   }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const trimmedValue = value.slice(0, this.maxLength);
    const regex = new RegExp(`^[0-9]{1,${this.maxLength}}$`);
    if (regex.test(trimmedValue)) {
      this.ngControl.control.setErrors(null); 
      this.ngControl.valueAccessor.writeValue(trimmedValue);
    } else {
      this.ngControl.control.setErrors({ 'mobileInvalid': true });
      this.ngControl.valueAccessor.writeValue(this.ngControl.value);
    }
  }
}
