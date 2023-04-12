import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatMenuTrigger } from "@angular/material/menu";
import { BehaviorSubject, Observable, of } from "rxjs";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  @ViewChild("MenuTrigger") MenuTrigger: MatMenuTrigger | undefined;
  @ViewChild("view") view: any;

  weekHours = Array(24 * 2)
    .fill(0)
    .map((_, i) => {
      return ("0" + ~~(i / 2) + ": 0" + 60 * ((i / 2) % 1)).replace(
        /\d(\d\d)/g,
        "$1"
      );
    });

  weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  events: any = {
    "11/04/2023": [
      {
        name: "Vacation",
        startDate: new Date(),
        endDate: new Date(),
        startHour: "00: 00",
        endHour: "01: 00",
      },
    ],
  };
  presentedDate: Date = this.today;
  form: FormGroup;
  viewMonth: number = 0;
  viewWeek: number = 0;
  months: Date[] = [];
  week: Date[] = [];

  selection$: BehaviorSubject<{ start?: Date; end?: Date; range?: string[] }>;
  events$: Observable<any> = of([]);

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {
    this.selection$ = new BehaviorSubject({});
    this.form = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.generateMonth(this.month);
    this.generateWeek(new Date());
    this.initForm();
  }

  // Init form
  initForm(): void {
    this.form = this.formBuilder.group({
      name: [""],
      startDate: [""],
      endDate: [""],
      allDay: [true],
      hours: [""],
    });
  }

  // Change Date Button action
  changeDate(nextDate: boolean): void {
    if (this.view.value === "month") {
      this.viewMonth += nextDate ? -1 : 1;
    } else if (this.view.value === "week") {
      this.viewWeek += nextDate ? -7 : 7;
    } else if (this.view.value === "day") {
      this.viewWeek += nextDate ? -1 : 1;
    }
    this.changePresentedDate();
  }

  // Go to today action button
  goToToday(): void {
    this.viewMonth = 0;
    this.viewWeek = 0;
    this.changePresentedDate();
  }

  // On change presented date generate month and week view
  changePresentedDate(): void {
    this.presentedDate = this.weekDate;
    this.generateWeek(this.weekDate);
    this.generateMonth(
      new Date(this.weekDate.getFullYear(), this.weekDate.getMonth(), 1)
    );
  }

  // Generate month Array of dates
  generateMonth(current: any): void {
    current.setDate(current.getDate() - current.getDay() - 1);
    this.months = [...Array(this.numberOfWeeks(current))].map(
      () => new Date(current.setDate(current.getDate() + 1))
    );
  }

  // Generate week Array of dates
  generateWeek(current: any): void {
    current.setDate(current.getDate() - current.getDay() - 1);
    this.week = [...Array(7)].map(
      () => new Date(current.setDate(current.getDate() + 1))
    );
  }

  // Add event action on save
  addEvent(day: any): void {
    const event = this.form.value;
    event.startDate = day.start;
    event.endDate = day.end || day.start;
  }

  // On mouse down select start date
  mouseDown(day: Date): void {
    this.selection$.next({ start: day });
  }

  // On mouse up open menu
  mouseUp(): void {
    if (this.selection$.value.end) {
      this.MenuTrigger?.openMenu();
    }
  }

  // On mouse over select end date
  mouseOver(event: MouseEvent, day: Date): void {
    if (event.buttons === 1) {
      this.selection$.next({ ...this.selection$.value, end: day });
    }
  }

  // When menu is closed clean form
  closeMenu(): void {
    this.initForm();
    this.selection$.next({
      ...this.selection$.value,
      start: undefined,
      end: undefined,
    });
  }

  // Get if month have 4 or 5 week
  numberOfWeeks(receiveDate: Date): number {
    const now = new Date();
    return new Date(
      new Date(receiveDate).setDate(receiveDate.getDate() + 35)
    ) >= new Date(now.getFullYear(), now.getMonth() - this.viewMonth + 1, 0)
      ? 35
      : 42;
  }

  moreOptions(): void {}

  get today(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  get month(): Date {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth() - this.viewMonth,
      1
    );
  }

  get weekDate(): Date {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() - this.viewMonth,
      now.getDate() - this.viewWeek
    );
  }
}
