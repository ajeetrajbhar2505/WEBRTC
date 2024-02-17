import { Attribute, Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[numberOnlyRegexValidator]'
})
export class NumberOnlyRegexValidatorDirective {
  @Input() maxLength: number;

  constructor(private ngControl: NgControl,@Attribute('maxlength') maxLength: string) { 
    this.maxLength = parseInt(maxLength, 10);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const maxLength = (this.maxLength); 
    const trimmedValue = value.slice(0, maxLength);
    const regex = new RegExp(`^[0-9]{1,${maxLength}}$`);
    if (regex.test(trimmedValue) && trimmedValue.length === maxLength) { 
      this.ngControl.control.setErrors(null); 
      this.ngControl.valueAccessor.writeValue(trimmedValue);
    } else {
      this.ngControl.control.setErrors({ 'numberOnlyInvalid': true });
      this.ngControl.valueAccessor.writeValue(trimmedValue);
    }
  }
  

}
