import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from "ngx-spinner";
import { AdminService } from '../services/admin.service';
import { GlobalService } from '../services/global.service';
import { BookingService } from '../services/booking.service';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  @ViewChild('myModal') myModal: any;
  @ViewChild('invoice') content!: ElementRef;

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<any[]>;
  fileName = 'Booking-Data.xlsx';
  bookingData: any;
  selectedOrder: any = 0;
  reviewsData: any;
  partsData: any = [];
  totalRevenue: any = 0;
  totalProfit: any = 0;
  closeResult!: string;
  showCommentDailog: boolean = false;
  categorySelected: string = "All";
  isBooking: boolean = true;
  isPart: boolean = false;
  activeProduct: any;
  selectedIndex: any = -1;
  selectedBooking: any;
  byDate: any = "";
  additionalParts: any = [];
  additionalCostInEuro: any = 0;

  constructor(private spinner: NgxSpinnerService, public adminService: AdminService, public router: Router, private modalService: NgbModal, public globalService: GlobalService, public bookingService: BookingService) { }

  ngOnInit(): void {
    console.log(this.adminService.isLogin)
    if (this.adminService.isLogin == false || this.adminService.isLogin == undefined) {
      if (JSON.parse(localStorage.getItem("isLogin") || "") != true || JSON.parse(localStorage.getItem("isLogin") || "") == undefined) {
        this.router.navigate(["/login"])
        console.log(this.adminService.isLogin)
      }
      else {
        this.adminService.isLogin = true;
        this.bookingService.getBookingData().subscribe(
          (data: any) => {
            console.log(data)
            this.bookingData = data;
            this.calculateAmounts()
          },
          (err: any) => {
            this.globalService.openSnackBar("Error ! Cannot Load Data At The Moment")
          },
          () => {
            this.bookingService.getPartData().subscribe(
              (data: any) => {
                console.log(data)
                this.partsData = data;
              },
              (err: any) => {
                this.globalService.openSnackBar("Error ! Cannot Load Data At The Moment")
              }
            )
          }
        )
      }
    }
    else {
      this.adminService.isLogin = true;
      this.getBookingData()
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.partsData.filter((option: any) => option.name.toLowerCase().includes(filterValue));
  }

  deleteBooking(id: any, index: any) {
    this.spinner.show();
    console.log("ID : ", id)
    this.bookingService.deleteBookingData(id).subscribe(
      (res) => {
        this.globalService.openSnackBar("Booking Deleted Successfully !")
        this.getBookingData();
        this.spinner.hide()
      },
      (err) => {
        this.globalService.openSnackBar("Booking cannot be deleted at the moment.")
        this.spinner.hide()
      }
    )
  }

  calculateAmounts() {
    this.totalRevenue = 0;
    this.totalProfit = 0;
    for (var i = 0; i < this.bookingData.length; i++) {
      this.totalRevenue = this.totalRevenue + Number(this.bookingData[i].initialCost)
      this.totalProfit = this.totalProfit + 0.3 * Number(this.bookingData[i].initialCost)
    }
    this.totalProfit = (this.totalProfit.toFixed(2)).toString()
  }

  deleteReview(review: any, index: any) {
    // this.spinner.show()
    // var allReviewsData = {
    //   reviews: this.reviewsData.filter((x: any) => x._id != review._id)
    // }
    // console.log(allReviewsData)
    // setTimeout(() => {
    //   // Updating Reviews Data by posting on API 
    //   this.adminService.postReviews(this.activeProduct.id, allReviewsData).subscribe(
    //   (data:any) => {
    //       // Showing loader
    //       this.spinner.hide()
    //       // filtering reviews data from frontend after successful updating on API
    //       this.reviewsData = this.reviewsData.filter((x: any) => x._id != review._id)
    //       this.adminService.openSnackBar("Review Deleted Successfully !", "success")
    //     },
    //     (err:any) => {
    //       this.spinner.hide()
    //       this.adminService.openSnackBar("Review Cannot Be Deleted  !", "danger")
    //     }
    //   )
    // }, 2000);
  }

  exportexcel(): void {
    if (this.isPart) {
      this.fileName = "Part-Data.xlsx"
    }
    else {
      this.fileName = "Booking-Data.xlsx"
    }
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  selectedRow(index: any) {
    console.log("Selected Index : ", index)
    this.selectedIndex = index
  }

  changeStatus(status?: string) {
    console.log(status)
    var object = {
      bookingStatus: status
    }
    this.bookingService.updateStatus(this.bookingData[this.selectedIndex].id, object).subscribe(
      (data: any) => {
        this.globalService.openSnackBar("Status Updated Successfully !", "success")
        this.getBookingData();
      },
      (err: any) => {
        this.globalService.openSnackBar("Status Not Updated !")
      }
    )
  }

  assignMechanic(mechanic?: string) {
    console.log(mechanic)
    var object = {
      mechanicAssigned: mechanic
    }
    this.bookingService.assignMechanic(this.bookingData[this.selectedIndex].id, object).subscribe(
      (data: any) => {
        this.globalService.openSnackBar("Mechanic Assigned Successfully !", "success")
        this.getBookingData()
      },
      (err: any) => {
        this.globalService.openSnackBar("Mechanic Not Updated !")
      }
    )
  }

  open(content: any, index?: any) {
    this.selectedOrder = index
    this.showCommentDailog = true;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result: any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason: any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  logOut() {
    localStorage.clear()
    this.router.navigate(["/admin/login"])
  }

  setCategory(categoryName: string) {
    this.categorySelected = categoryName
  }

  addAdditionalParts(booking?: any, content?: any, index?: any) {
    this.selectedBooking = booking;
    this.additionalParts = booking.additionalParts ? booking.additionalParts : []
    this.open(content, index)
  }

  addParts(part: any) {
    var checkIfPartExist = this.selectedBooking?.additionalParts?.filter((x: any) => x.name === part.name);
    if (checkIfPartExist?.length == 0) {
      this.additionalParts.push(part)
    }
    else {
      this.additionalParts.filter((x: any) => x.name !== part.name)
    }
    this.bookingService.addAdditionalParts(this.selectedBooking.id, this.additionalParts).subscribe(
      (res: any) => {
        this.globalService.openSnackBar("Parts Updated Successfully!")
      }
    )
  }

  checkIfPartExist(part: any) {
    return this.selectedBooking?.additionalParts?.filter((x: any) => x.name === part.name).length > 0 ? true : false;
  }

  getFilteredData() {
    if (this.categorySelected == "All") {
      if (this.isBooking) {
        if (this.byDate == "") {
          return this.bookingData
        }
        else {
          return this.bookingData.filter((x: any) => {
            return new Date(x.bookingDate).toDateString() == new Date(this.byDate).toDateString()
          })
        }
      }
      else {
        return this.partsData
      }
    }
    else {
      if (this.isBooking) {
        if (this.byDate == "") {
          return this.bookingData.filter((x: any) => x.bookingStatus == this.categorySelected)
        }
        else {
          return this.bookingData.filter((x: any) => {
            return x.bookingStatus == this.categorySelected && new Date(x.bookingDate).toDateString() == new Date(this.byDate).toDateString()
          }
          )
        }
      }
      else {
        return this.partsData.filter((x: any) => x.bookingStatus == this.categorySelected)
      }
    }
  }

  viewComment(order?: any, content?: any, index?: any) {
    console.log(order)
    console.log()
    this.reviewsData = this.partsData[index].reviews;
    this.activeProduct = this.partsData[index]
    this.open(content, index)
  }

  viewInvoice(booking?: any, content?: any, index?: any) {
    console.log(booking)
    this.selectedBooking = booking;
    this.additionalCostInEuro = this.selectedBooking.additionalParts.map((x: any) => Number(x.price)).reduce((partialSum: any, a: any) => partialSum + a, 0) + Number(this.selectedBooking.initialCost)
    console.log("Additonal Cost : ", this.additionalCostInEuro)
    this.open(content, index)
  }

  exportAsPDF(div_id: any) {
    let data: any = document.getElementById(div_id);
    html2canvas(data).then(canvas => {
      let pdf = new jspdf.jsPDF('p', 'cm', 'a4');
      const contentDataURL = canvas.toDataURL('image/png')
      const imgProps = pdf.getImageProperties(contentDataURL);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; //Generates PDF in landscape mode
      // let pdf = new jspdf.jsPDF('p', 'cm', 'a4'); // Generates PDF in portrait mode
      pdf.addImage(contentDataURL, 'PNG', 0.1, 0.1, pdfWidth, pdfHeight);
      pdf.save(`${this.selectedBooking.licenseNumber}-${new Date(this.selectedBooking.bookingDate).toDateString()}.pdf`);
    });
  }

  setTable(tableName?: any) {
    if (tableName == "Parts") {
      this.isPart = true;
      this.isBooking = false;
    }
    else {
      this.isPart = false;
      this.isBooking = true;
    }
  }

  getBookingData() {
    this.bookingService.getBookingData().subscribe(
      (data: any) => {
        console.log(data)
        this.bookingData = data;
        this.calculateAmounts()
      }
    )
  }
}