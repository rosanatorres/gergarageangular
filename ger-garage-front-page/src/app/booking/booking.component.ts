import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  scheduleBooking: boolean = false;
  selectService: boolean = true;
  slotsAvaialble: number = 8;
  todayDate: Date = new Date();
  carsData: any = [];

  bookingForm = this.fb.group({
    licenseNumber: ['', [Validators.required]],
    initialCost: ['', [Validators.required]],
    userName: ['', [Validators.required]],
    customerNotes: [''],
    category: ['', [Validators.required]],
    bookingDate: ['', [Validators.required]],
    bookingStatus: ['Booked'],
    mechanicAssigned: [''],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    make: ['', [Validators.required]],
    model: ['', [Validators.required]],
    engineSize: ['', [Validators.required]],
    engineType: ['', [Validators.required, Validators.email]],
    paypal: [false],
    stripe: [false],
    creditCard: [false],
    creditCardNumber: ['']
  });

  constructor(
    private fb: FormBuilder,
    public bookingService: BookingService,
    public globalService: GlobalService
  ) { }

  ngOnInit(): void {
    this.bookingForm.controls.category.disable();
    this.globalService.getListOfCarManufacturer().subscribe(
      (res: any) => {
        console.log(res)
        this.carsData = res;
      }
    )
    this.bookingForm.controls.bookingDate.valueChanges.subscribe(
      (res) => {
        if (this.bookingForm.controls.bookingDate.value && this.bookingForm.controls.bookingDate.value != "") {
          this.getAvailableSlots(this.bookingForm.controls.bookingDate.value)
        }
      }
    )
  }

  selectingService(name: string, price:string) {
    this.bookingForm.controls.initialCost.setValue(price);
    this.bookingForm.controls.category.setValue(name);
    this.scheduleBooking = true;
    this.selectService = false;
  }

  getAvailableSlots(date: any) {
    this.bookingService.getAvailableSlots(date).subscribe(
      (res) => {
        this.slotsAvaialble = res.slotsAvailable;
        this.globalService.openSnackBar(`We have ${this.slotsAvaialble} slots available for the selected date.`)
      },
      (err) => {

      }
    )
  }

  submitBooking() {
    // if (this.bookingForm.invalid) {
    //   return;
    // }
    if (this.slotsAvaialble == 0) {
      this.globalService.openSnackBar("We don't have any slots available for the selected date. Please pick another one")
      return;
    }
    if (this.bookingForm.controls.bookingDate.value.getDay() == 0) {
      this.globalService.openSnackBar("We don't take appointment on Sunday. Please pick another date")
      return;
    }
    var bookingObject: any = {};
    bookingObject.licenseNumber = this.bookingForm.controls.licenseNumber.value;
    bookingObject.initialCost = this.bookingForm.controls.initialCost.value;
    bookingObject.customerNotes = this.bookingForm.controls.customerNotes.value;
    bookingObject.category = this.bookingForm.controls.category.value;
    bookingObject.bookingDate = this.bookingForm.controls.bookingDate.value;
    bookingObject.bookingStatus = this.bookingForm.controls.bookingStatus.value;
    bookingObject.mechanicAssigned = this.bookingForm.controls.mechanicAssigned.value;
    bookingObject.userDetail = {
      firstName: this.bookingForm.controls.firstName.value,
      lastName: this.bookingForm.controls.lastName.value,
      email: this.bookingForm.controls.email.value,
      phoneNumber: this.bookingForm.controls.phoneNumber.value,
      address: this.bookingForm.controls.address.value
    }
    bookingObject.vehicleDetail = {
      make: this.bookingForm.controls.make.value,
      model: this.bookingForm.controls.model.value,
      engineSize: this.bookingForm.controls.engineSize.value,
      engineType: this.bookingForm.controls.engineType.value,
    }
    bookingObject.paymentDetail = {
      paypal: this.bookingForm.controls.paypal.value,
      stripe: this.bookingForm.controls.stripe.value,
      creditCard: this.bookingForm.controls.creditCard.value,
      creditCardNumber: this.bookingForm.controls.creditCardNumber.value,
    }
    bookingObject.registeredUserData = {
      name: this.bookingForm.controls.userName.value,
      email: this.bookingForm.controls.email.value
    }
    console.log("Booking Object : ", JSON.stringify(bookingObject, undefined, 3));
    this.bookingService.postBookingData(bookingObject).subscribe(
      (res: any) => {
        this.globalService.openSnackBar("Your booking has been created successfully.", "success")
        this.bookingForm.reset();
        console.log("Res : ", res)
      },
      (err) => {
        console.log(err);
        this.globalService.openSnackBar("Error! Cannot create a booking at the moment. please try again later.")
        this.globalService.openSnackBar(err);
      }
    )
  }
}
