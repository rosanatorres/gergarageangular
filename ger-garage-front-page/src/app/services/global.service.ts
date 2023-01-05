import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    action: boolean = true;
    setAutoHide: boolean = true;
    autoHide: number = 2000;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'top';
    addExtraClass: boolean = true;

    constructor(private http: HttpClient, public snackBar: MatSnackBar) { }

    getCurrencyUpdate() {
        return this.http.get("https://api.currencyfreaks.com/latest?apikey=178315ed37f24b2090b002624a6104ce")
    }

    getListOfCarManufacturer() {
        return this.http.get("https://private-anon-c46c45369c-carsapi1.apiary-mock.com/manufacturers")
    }

    openSnackBar(message: string, action?: string) {
        var snackBarType = action == "success" ? "success" : "danger"
        this.snackBar.open(message, undefined, {
            duration: 4000,
            verticalPosition: this.verticalPosition,
            horizontalPosition: this.horizontalPosition,
            panelClass: snackBarType,
        });
    }
}