import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[restrictMultiSpaceRegexValidator]'
})
export class RestrictMultiSpaceRegexValidatorDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const regex = /^[A-Za-z]( ?[A-Za-z] ?)*$/;
    const value = this.ngControl.value || ''; // Ensure value is not null or undefined

    // Check if the pressed key is space or dot, and the current value does not match the regex pattern
    if ((event.which === 32) && value.trim() !== '' && !regex.test(value)) {
      event.preventDefault(); // Prevent typing space or dot characters
    }
  }

  @HostListener('keypress', ['$event'])
  onKeypress(event: KeyboardEvent) {
    const regex = /^[A-Za-z]( ?[A-Za-z] ?)*$/;
    const value = (this.ngControl.value || '') + event.key;

    // Check if the input value with the pressed key does not match the regex pattern
    if (!regex.test(value)) {
      event.preventDefault(); // Prevent pasting characters that don't match the pattern or dot character
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const regex = /^[A-Za-z]( ?[A-Za-z] ?)*$/;

    if (!regex.test(value)) {
      // If the input value doesn't match the regex pattern, set an error
      this.ngControl.control.setErrors({ 'restrictMultiSpaceInvalid': true });
    } else {
      // Clear errors if the input value matches the regex pattern
      this.ngControl.control.setErrors(null);
    }
  }
}
