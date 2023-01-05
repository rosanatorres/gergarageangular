import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  passObject: any;
  isLogin?: boolean;
  // headers = new HttpHeaders().set('Content-Type', 'application/json');
  selectedProduct: any;
  userData: any;
  addExtraClass: boolean = true;

  constructor(private http: HttpClient, public globalService: GlobalService) { }

  adminLogin(obj: any): Observable<any> {
    return this.http.post<any>(environment.apiURL + 'password', obj).pipe(catchError(this.error))
  }

  updatePassword2(obj: any) {
    return this.http.put<any>(environment.apiURL + 'password' + this.passObject.id, obj).pipe(catchError(this.error))
  }

  updatePassword(obj: any) {
    var passObject: any;
    console.log(obj)
    this.adminLogin(obj).subscribe(
      (data) => {
      }, (err) => {
        console.log(err)
        this.globalService.openSnackBar(err)
      }, () => {
        if (true) {
          obj.password = obj.newpassword;
          obj.name = this.passObject.name
          delete obj.newpassword;
          console.log(obj)
          this.updatePassword2(obj).subscribe(
            (data) => {
              console.log(data)
              this.globalService.openSnackBar("Password Updated Successfully", "success")
            }, (err) => {
              this.globalService.openSnackBar(err)
              console.log(err)
            }
          )
        }
      }
    )
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