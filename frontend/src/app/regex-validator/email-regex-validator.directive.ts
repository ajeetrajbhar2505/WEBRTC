import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = regex.test(control.value);
    return valid ? null : { 'emailInvalid': true };
  };
}

@Directive({
  selector: '[emailRegexValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: EmailRegexValidatorDirective, multi: true }]
})
export class EmailRegexValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return emailValidator()(control);
  }
}
