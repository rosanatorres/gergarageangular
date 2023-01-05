import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  userRegistration(userDetails: any): Observable<any> {
    console.log(userDetails);
    return this.http.post(environment.apiURL + 'user', userDetails).pipe(catchError(this.error));
  }

  userLogin(userDetails: any): Observable<any> {
    console.log(userDetails);
    const token = localStorage.getItem('token');
    return this.http.post(environment.apiURL + 'login', userDetails).pipe(catchError(this.error));
  }

  updateUserPassword(obj: any) {
    const token = localStorage.getItem('token');
    return this.http.put<any>(environment.apiURL + 'user/' + obj.username, obj, {
        headers: new HttpHeaders(
            {
                Authorization: 'Bearer ' + token,
            })
    }).pipe(catchError(this.error))
}

  error(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}