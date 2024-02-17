import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router)
  let cloneRequest = req;

  if (token) {
    cloneRequest = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token
      }
    });
  }

  return next(cloneRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400 || error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(error);
    })
  );
};



