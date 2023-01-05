import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  adminCredentials: any;
  email?: string;
  password?: string;
  newPassword?: string;
  isLogin: boolean = true;
  isChangePassword: boolean = false;

  constructor(public router: Router, public adminService: AdminService, public globalService:GlobalService) { }

  ngOnInit(): void {
  }

  activeChangePassword() {
    this.isChangePassword = true;
    this.isLogin = false;
  }

  login() {
    if (this.isLogin) {
      if ((this.email != undefined || this.email != null) && (this.password != undefined || this.password != null)) {
        var obj2 = {
          name: this.email,
          password: this.password,
        }
        this.adminService.adminLogin(obj2).subscribe(
          (data: any) => {
            this.globalService.openSnackBar("Login Successful", "success")
            this.router.navigate(["/admin/dashboard"])
            this.adminService.isLogin = true;
            localStorage.setItem("isLogin", JSON.stringify(this.adminService.isLogin))
          },
          (err: any) => {
            this.globalService.openSnackBar("Email or Password is Incorrect", "danger")
          }
        )
      }
      else {
        this.openSnackBar("Email or Password is Incorrect", "danger")
      }
    }
    else if (this.isChangePassword) {
      var obj = {
        name: this.email,
        password: this.password,
        newpassword: this.newPassword
      }
      this.adminService.updatePassword(obj)
    }
  }

  openSnackBar(message: string, action?: string) {
    this.globalService.openSnackBar(message, action)
  }

}