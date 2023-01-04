import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { BookingService } from '../services/booking.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  userData: any;
  bookingData: any;
  productData: any;
  totalPurchase: any = 0;
  totalDiscount: any = 0;
  USDRates: any = 0;
  EURRates: any = 0.765254;
  constructor(
    public adminService: AdminService,
    public router: Router,
    public globalService: GlobalService,
    public bookingService: BookingService
  ) { }

  ngOnInit(): void {

    var token = localStorage.getItem("token")
    if (token == undefined || token == null) {
      this.globalService.openSnackBar("Please Login !");
      this.router.navigate(['/user-login'])
    }
    else {
      var userData: any = localStorage.getItem("user")
      userData = JSON.parse(userData)
      this.userData = {
        username: userData.username,
        email: userData.email
      }
    }

    this.globalService.getCurrencyUpdate().subscribe(
      (data: any) => {
        this.EURRates = (1 / data.rates.EUR).toFixed(3)
        this.USDRates = (data.rates.EUR / 1).toFixed(3)
      }
    )

    this.bookingService.getBookingData().subscribe(
      (data) => {
        console.log(data)
        this.bookingData = data.filter((x: any) => x.registeredUserData.email == this.userData.email)
        console.log("User Booking Data : ", this.bookingData)
        for (var i = 0; i < this.bookingData.length; i++) {
          this.totalPurchase = this.totalPurchase + Number(this.bookingData[i].initialCost)
        }
        console.log("Total Purchase : ",this.totalPurchase)
      }
    )
  }

  getPreviousOrders(status?: string) {
    return this.bookingData?.filter((x: any) => x.bookingStatus == status && x.registeredUserData.email == this.userData.email)
  }

  logOut() {
    localStorage.clear()
    this.router.navigate(["/user/login"])
  }
}
