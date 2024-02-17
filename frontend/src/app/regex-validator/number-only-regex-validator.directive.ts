import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[numberOnlyRegexValidator]'
})
export class NumberOnlyRegexValidatorDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const newValue = value.replace(/[^0-9]/g, ''); // Replace any character that is not a digit with an empty string
    this.ngControl.valueAccessor.writeValue(newValue); // Update the input value with the sanitized value
  }
}
