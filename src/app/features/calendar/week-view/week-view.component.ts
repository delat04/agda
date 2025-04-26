import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Event } from '../../../core/models/event.model';
import { CalendarStateService, WeekViewDay } from '../services/calendar-state.service';
import { CalendarUtilsService } from '../services/calendar-utils.service';

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template:`
    <div class="flex flex-col">
      <!-- Week Days Header -->
      <div class="grid grid-cols-8 gap-1 mb-1">
        <!-- Time column header -->
        <div class="border-b border-gray-200 py-2 text-center font-medium text-gray-500"></div>
        <!-- Day column headers -->
        <div
          *ngFor="let day of calendarState.weekViewDays"
          class="border-b border-gray-200 py-2 text-center"
        >
          <div class="font-medium" [class.text-blue-600]="day.isToday">
            {{ day.dayName }}
          </div>
          <div
            class="w-8 h-8 mx-auto flex items-center justify-center rounded-full mt-1"
            [class.bg-blue-500]="day.isToday"
            [class.text-white]="day.isToday"
          >
            {{ day.date | date:'d' }}
          </div>
        </div>
      </div>
      <!-- Week Hours Grid -->
      <div class="grid grid-cols-8 gap-1 relative">
        <!-- Time labels column -->
        <div class="relative">
          <div
            *ngFor="let slot of calendarState.hourSlots"
            class="h-16 flex items-start justify-end pr-2 pt-0 text-xs text-gray-500 font-medium"
          >
            {{ slot.label }}
          </div>
        </div>
        <!-- Day columns with hour slots -->
        <div
          *ngFor="let day of calendarState.weekViewDays"
          class="relative min-h-full border-l border-gray-200"
          [class.bg-gray-50]="readOnly && day.isToday"
          [class.bg-gray-100]="isPastDay(day.date)"
        >
          <!-- Hour slots background -->
          <div *ngFor="let slot of calendarState.hourSlots" class="h-16 border-b border-gray-100">
            <!-- Current time indicator -->
            <div
              *ngIf="utils.isCurrentTimeSlot(day.date, slot.hour)"
              class="w-full border-t-2 border-red-500 absolute z-[2]"
              [style.top.px]="utils.getCurrentTimePosition(slot.hour)"
            ></div>
          </div>

          <!-- Events -->
          <div
            *ngFor="let event of day.events"
            class="absolute rounded-md px-2 py-1 min-w-[101.2%] left-0 overflow-hidden text-xs opacity-75 z-[30]"
            [style.top.px]="utils.getEventTopPosition(event)"
            [style.height.px]="utils.getEventHeight(event)"
            [style.background-color]="event.color || '#3b82f6'"
            [style.color]="utils.getContrastColor(event.color || '#3b82f6')"
            (click)="eventClick.emit(event)"
          >
            <div class="font-medium">{{ event.title }}</div>
            <div>{{ event.start | date:'HH:mm' }} - {{ event.end | date:'HH:mm' }}</div>
          </div>

          <!-- Past day indicator overlay -->
          <div
            *ngIf="isPastDay(day.date)"
            class="absolute inset-0 bg-gray-200 bg-opacity-30 z-[1]"
          ></div>
        </div>
      </div>
    </div>
  `
})
export class WeekViewComponent {
  @Input() events: Event[] = [];
  @Input() readOnly: boolean = false;

  @Output() eventDrop = new EventEmitter<{event: Event, newStart: Date, newEnd: Date}>();
  @Output() slotClick = new EventEmitter<{date: Date, hour: number, minutes: number}>();
  @Output() eventClick = new EventEmitter<Event>();

  dragStartY: number = 0;
  dragStartHour: number = 0;

  constructor(
    public calendarState: CalendarStateService,
    public utils: CalendarUtilsService
  ) {}

  // Check if a date is in the past (before today)
  isPastDay(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  }

  // Week view drag and drop handler
  dropWeekView(event: CdkDragDrop<Event[]>): void {
    if (event.previousContainer === event.container) {
      return; // Same container, no need to move
    }

    // Get the target day from the container's data
    const targetDayId = event.container.id;
    const targetDay = this.calendarState.weekViewDays.find(day => day.id === targetDayId);

    if (!targetDay) return;

    // Double check that we're not dropping into a past day
    if (this.isPastDay(targetDay.date)) {
      return; // Prevent dropping in past days
    }

    // Extract the data from the drag item
    const dragData = event.item.data;
    const droppedEvent = dragData.event as Event;

    // Calculate time difference between start and end
    const oldStart = new Date(droppedEvent.start);
    const oldEnd = new Date(droppedEvent.end);
    const timeDiff = oldEnd.getTime() - oldStart.getTime(); // Duration in milliseconds

    // Create new dates keeping the same time but changing the day
    const newStart = new Date(targetDay.date);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes());

    const newEnd = new Date(newStart.getTime() + timeDiff);

    // Emit event to parent component
    this.eventDrop.emit({
      event: droppedEvent,
      newStart: newStart,
      newEnd: newEnd
    });

    // Update UI by moving event between arrays
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  // Track drag start position for vertical time adjustments
  onDragStarted(event: any): void {
    // Save drag start position
    this.dragStartY = event.source.element.nativeElement.getBoundingClientRect().top;

    // Safely access drag data
    try {
      // First check if data is accessible through the standard path
      let eventData;

      if (event.source.data) {
        // Try the standard CDK location first
        eventData = event.source.data.event;
      } else if (event.source._dragRef && event.source._dragRef.data) {
        // Fallback to _dragRef if needed
        eventData = event.source._dragRef.data.event;
      }

      // Only process if we found valid event data
      if (eventData && eventData.start) {
        const startTime = new Date(eventData.start);
        this.dragStartHour = startTime.getHours() + startTime.getMinutes() / 60;
      } else {
        console.warn('Event data not found in drag event');
      }
    } catch (err) {
      console.error('Error accessing drag event data:', err);
    }
  }

  // Handle drag end for time adjustments in week view
  onDragEnded(event: CdkDragEnd<any>): void {
    // Check if the drag was completed with a successful drop
    const dragRef = event.source._dragRef;
    const wasDropped = dragRef && dragRef.dropped;

    if (!wasDropped) {
      // If not dropped in a valid container, we need to handle time adjustment
      const endY = event.source.element.nativeElement.getBoundingClientRect().top;
      const yDiff = endY - this.dragStartY;

      // Calculate hour difference (each hour slot is 64px)
      const hourDiff = yDiff / 64;

      // Only proceed if there's a meaningful change
      if (Math.abs(hourDiff) >= 0.25) { // At least 15 minutes difference
        const eventData = event.source.data.event;
        const sourceDay = event.source.data.sourceDay;

        // Check if day is in the past
        if (this.isPastDay(sourceDay.date)) {
          return; // Don't allow time adjustments for past days
        }

        const oldStart = new Date(eventData.start);
        const oldEnd = new Date(eventData.end);
        const duration = oldEnd.getTime() - oldStart.getTime();

        // Calculate new hour and update event time
        const newHour = this.dragStartHour + hourDiff;
        const newHourInt = Math.floor(newHour);
        const newMinutes = Math.round((newHour - newHourInt) * 60);

        const newStart = new Date(oldStart);
        newStart.setHours(newHourInt, newMinutes);

        const newEnd = new Date(newStart.getTime() + duration);

        // Emit event to parent component
        this.eventDrop.emit({
          event: eventData,
          newStart: newStart,
          newEnd: newEnd
        });
      }
    }
  }

  // Handle clicks on week view for creating events
  onWeekViewClick(event: MouseEvent, day: WeekViewDay): void {
    // Prevent creating events in past days
    if (this.isPastDay(day.date)) {
      return;
    }

    // Get click position within the day column
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;

    // Calculate hour based on click position (each hour is 64px)
    const hour = Math.floor(y / 64);
    const minutes = Math.round((y % 64) / 64 * 60 / 15) * 15; // Round to nearest 15 minutes

    // Emit slot click event with format expected by parent
    this.slotClick.emit({
      date: day.date,
      hour: hour,
      minutes: minutes
    });
  }
}
