import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[mobileRegexValidator]'
})
export class MobileRegexValidatorDirective {
  @Input() maxLength: number = 10; // Set the maximum length

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    // Trim the value to the specified maxLength
    const trimmedValue = value.slice(0, this.maxLength);

    // Apply the regex pattern for mobile numbers (adjust as needed)
    const regex = /^[0-9]{10}$/; // Assuming mobile number is 10 digits long

    if (regex.test(trimmedValue)) {
      this.ngControl.valueAccessor.writeValue(trimmedValue); // Update the input value with the trimmed value
    } else {
      // If the input doesn't match the regex, prevent further input
      this.ngControl.valueAccessor.writeValue(this.ngControl.value);
    }
  }
}
