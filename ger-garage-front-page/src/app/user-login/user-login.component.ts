import { Component, OnInit, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { GlobalService } from '../services/global.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  adminCredentials: any;
  email?: string;
  username?: string;
  password?: string;
  newPassword?: string;
  isLogin: boolean = true;
  isChangePassword: boolean = false;
  isSignUp: boolean = false;

  constructor(public router: Router, public userService: UserService, public globalService: GlobalService) { }

  ngOnInit(): void {
    var token = localStorage.getItem("token")
    if (token == undefined || token == null) {
    }
    else {
      this.router.navigate(['/user-dashboard'])
    }
  }

  activeChangePassword() {
    this.isChangePassword = true;
    this.isLogin = false;
    this.isSignUp = false;
  }

  activeLogIn() {
    this.isChangePassword = false;
    this.isLogin = true;
    this.isSignUp = false;
  }

  activeSignUp() {
    this.isChangePassword = false;
    this.isLogin = false;
    this.isSignUp = true;
  }

  login() {
    if (this.isLogin) {
      if ((this.username != undefined || this.username != null) && (this.password != undefined || this.password != null)) {
        this.userLogin()
      }
      else {
        this.globalService.openSnackBar("Email or Password is Empty")
      }
    }
    else if (this.isChangePassword) {
      this.updatePassword()
    }
    else if (this.isSignUp) {
      if ((this.email != undefined || this.email != null) && (this.password != undefined || this.password != null)) {
        this.registerUser()
      }
      else {
        this.globalService.openSnackBar("Email or Password is Empty")
      }
    }
  }

  updatePassword() {
    var userData = {
      username: this.username,
      password: this.password
    }
    this.userService.userLogin(userData).subscribe((result) => {
      localStorage.setItem("token", result.token)
    },
      (err: any) => {
        console.log(err)
        this.globalService.openSnackBar("Old Password Incorrect !")
      },
      () => {
        userData.password = this.newPassword
        this.adminCredentials.updateUserPassword(userData).subscribe((result: any) => {
          this.globalService.openSnackBar("Password Updated !", "success")
        },
          (err: any) => {
            this.globalService.openSnackBar("Password Cannot Be Updated ! Try Again Later")
          });
      }
    );
  }

  registerUser(): void {
    var userData = {
      username: this.username,
      email: this.email,
      password: this.password
    }
    this.userService.userRegistration(userData).subscribe((result) => {
      this.globalService.openSnackBar("Registration Completed", "success");
    },
      (err) => {
        this.globalService.openSnackBar("Cannot Create Account Right Now ! Try Again Later");
      });
  }

  userLogin(): void {
    var userData: any = {
      username: this.username,
      password: this.password
    }
    this.userService.userLogin(userData).subscribe((result) => {
      userData.email = result.user.email;
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", result.token);
      this.router.navigate(["/user/dashboard"]);
      this.globalService.openSnackBar("Login Successfully", "success");
    },
      (err) => {
        console.log(err)
        this.globalService.openSnackBar(err);
      });
  }
}