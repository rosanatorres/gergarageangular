import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  postBookingData(Data: any): Observable<any> {
    return this.http.post<any>(environment.apiURL + 'booking', Data).pipe(catchError(this.error))
  }

  deleteBookingData(id: any): Observable<any> {
    return this.http.delete<any>(environment.apiURL + 'booking/' + id).pipe(catchError(this.error))
  }

  getBookingData(): Observable<any> {
    return this.http.get<any>(environment.apiURL + 'booking').pipe(catchError(this.error))
  }

  getPartData(): Observable<any> {
    return this.http.get<any>(environment.apiURL + 'part').pipe(catchError(this.error))
  }

  updateStatus(id: any, obj: any) {
    return this.http.put<any>(environment.apiURL + 'booking/update-status/' + id, obj).pipe(catchError(this.error))
  }

  addAdditionalParts(id: any, obj: any) {
    return this.http.put<any>(environment.apiURL + 'booking/additional-parts/' + id, obj).pipe(catchError(this.error))
  }

  assignMechanic(id: any, obj: any) {
    return this.http.put<any>(environment.apiURL + 'booking/assign-mechanic/' + id, obj).pipe(catchError(this.error))
  }

  getAvailableSlots(date: any) {
    var object = {
      appointmentDate: date
    }
    return this.http.post<any>(environment.apiURL + 'booking/checkslots', object).pipe(catchError(this.error))
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