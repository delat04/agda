// features/calendar/calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { MonthViewComponent } from './month-view/month-view.component';
import { WeekViewComponent } from './week-view/week-view.component';
import { EventModalComponent } from './event-modal/event-modal.component';
import { CalendarStateService } from './services/calendar-state.service';
import { CalendarUtilsService } from './services/calendar-utils.service';
import { AuthService } from '../../core/services/auth.service'; // Add this import
import { DashboardService } from '../../core/services/dashbord.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MonthViewComponent,
    WeekViewComponent,
    EventModalComponent,
  ],
  template: `
    <div class="font-[syne] mt-[14px] bg-white rounded-xl shadow-lg p-6">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            (click)="previousPeriod()"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <h2 class="text-2xl font-bold text-gray-800">
            <ng-container *ngIf="viewMode === 'month'">
              {{ currentDate | date:'MMMM yyyy' }}
            </ng-container>
            <ng-container *ngIf="viewMode === 'week'">
              {{ calendarState.weekStartDate | date:'MMM d' }} - {{ calendarState.weekEndDate | date:'MMM d, yyyy' }}
            </ng-container>
          </h2>

          <button
            (click)="nextPeriod()"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- View Toggle -->
          <div class="flex rounded-md shadow-sm">
            <button
              (click)="setViewMode('month')"
              class="px-4 py-2 text-sm font-medium rounded-l-md transition-colors"
              [class.bg-blue-600]="viewMode === 'month'"
              [class.text-white]="viewMode === 'month'"
              [class.bg-white]="viewMode !== 'month'"
              [class.text-gray-700]="viewMode !== 'month'"
              [class.border]="viewMode !== 'month'"
              [class.border-gray-300]="viewMode !== 'month'"
            >
              Month
            </button>
            <button
              (click)="setViewMode('week')"
              class="px-4 py-2 text-sm font-medium rounded-r-md transition-colors"
              [class.bg-blue-600]="viewMode === 'week'"
              [class.text-white]="viewMode === 'week'"
              [class.bg-white]="viewMode !== 'week'"
              [class.text-gray-700]="viewMode !== 'week'"
              [class.border]="viewMode !== 'week'"
              [class.border-gray-300]="viewMode !== 'week'"
            >
              Week
            </button>
          </div>

          <!-- Only show Create Event button for event managers -->
          <button
            *ngIf="authService.hasRole('event_manager')"
            [routerLink]="['/events/create']"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create New Event
          </button>
        </div>
      </div>

      <!-- Month View -->
      <app-month-view
        *ngIf="viewMode === 'month'"
        [events]="events"
        [readOnly]="!authService.hasRole('event_manager')"
        (eventDrop)="handleEventDrop($event)"
        (dayClick)="handleDayClick($event)"
        (eventClick)="handleEventClick($event)"
      ></app-month-view>

      <!-- Week View -->
      <app-week-view
        *ngIf="viewMode === 'week'"
        [events]="events"
        [readOnly]="!authService.hasRole('event_manager')"
        (eventDrop)="handleEventDrop($event)"
        (slotClick)="handleSlotClick($event)"
        (eventClick)="handleEventClick($event)"
      ></app-week-view>
    </div>

    <!-- Event Modal -->
    <app-event-modal
      *ngIf="showEventModal"
      [event]="selectedEvent"
      [readOnly]="!authService.hasRole('event_manager')"
      (close)="closeEventModal()"
      (save)="saveEvent($event)"
      (delete)="deleteEvent($event)"
    ></app-event-modal>
  `
})
export class CalendarComponent implements OnInit {
  viewMode: 'month' | 'week' = 'month';
  currentDate: Date = new Date();
  events: Event[] = [];

  // Modal properties
  showEventModal = false;
  selectedEvent: Event | null = null;

  constructor(
    private eventService: EventService,
    private DashboardService: DashboardService,
    public calendarState: CalendarStateService,
    public authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    if (this.authService.hasRole('event_manager')) {
      // Event managers can see all events
      this.eventService.getEvents().subscribe(events => {
        this.events = events;
        this.calendarState.updateCalendarData(this.currentDate, this.viewMode, this.events);
      });
    } else {
      // Event seekers can only see events they've subscribed to
      this.DashboardService.getSubscribedEvents().subscribe(events => {
        this.events = events;
        this.calendarState.updateCalendarData(this.currentDate, this.viewMode, this.events);
      });
    }
  }

  setViewMode(mode: 'month' | 'week'): void {
    this.viewMode = mode;
    this.calendarState.updateCalendarData(this.currentDate, this.viewMode, this.events);
  }

  previousPeriod(): void {
    if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    }
    this.calendarState.updateCalendarData(this.currentDate, this.viewMode, this.events);
  }

  nextPeriod(): void {
    if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    }
    this.calendarState.updateCalendarData(this.currentDate, this.viewMode, this.events);
  }

  handleEventDrop(eventData: {event: Event, newStart: Date, newEnd: Date}): void {
    // Only allow event managers to drag events
    if (!this.authService.hasRole('event_manager')) return;

    this.eventService.updateEventDates(
      eventData.event.id,
      eventData.newStart,
      eventData.newEnd
    ).subscribe(() => {
      this.loadEvents();
    });
  }

  handleEventClick(event: Event): void {
    this.selectedEvent = event;
    this.showEventModal = true;
  }

  handleDayClick(date: Date): void {
    // Only allow event managers to create events
    if (!this.authService.hasRole('event_manager')) return;

    // Create default event starting at 9am
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(10, 0, 0, 0);

    this.selectedEvent = {
      id: '',
      title: '',
      description: '',
      start: startDate,
      end: endDate,
      draggable: true,
      color: '#3b82f6',
      allDay: false
    };

    this.showEventModal = true;
  }

  handleSlotClick(timeSlot: {date: Date, hour: number, minutes: number}): void {
    // Only allow event managers to create events
    if (!this.authService.hasRole('event_manager')) return;

    const startDate = new Date(timeSlot.date);
    startDate.setHours(timeSlot.hour, timeSlot.minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    this.selectedEvent = {
      id: '',
      title: '',
      description: '',
      start: startDate,
      end: endDate,
      draggable: true,
      color: '#3b82f6',
      allDay: false
    };

    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
  }

  saveEvent(event: Event): void {
    // Only allow event managers to save events
    if (!this.authService.hasRole('event_manager')) return;

    if (event.id) {
      // Update existing event
      this.eventService.updateEvent(event).subscribe(() => {
        this.loadEvents();
        this.closeEventModal();
      });
    } else {
      // Create new event
      this.eventService.createEvent(event).subscribe(() => {
        this.loadEvents();
        this.closeEventModal();
      });
    }
  }

  deleteEvent(eventId: string): void {
    // Only allow event managers to delete events
    if (!this.authService.hasRole('event_manager')) return;

    this.eventService.deleteEvent(eventId).subscribe(() => {
      this.loadEvents();
      this.closeEventModal();
    });
  }
}
