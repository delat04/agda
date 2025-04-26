// features/calendar/month-view/month-view.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Event } from '../../../core/models/event.model';
import { CalendarStateService, CalendarDay } from '../services/calendar-state.service';
import { CalendarUtilsService } from '../services/calendar-utils.service';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <!-- Weekday Headers -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div *ngFor="let day of calendarState.weekDays" class="text-center py-2 font-medium text-gray-500">
        {{ day.slice(0, 3) }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1">
      <div
        *ngFor="let day of calendarState.calendarDays"
        class="relative min-h-32 p-1 border border-gray-100 rounded-md transition-all"
        [class.bg-gray-50]="!day.isCurrentMonth"
        [class.bg-white]="day.isCurrentMonth"
        [class.bg-gray-50]="readOnly && day.isCurrentMonth"
        [class.ring-2]="day.isToday"
        [class.ring-blue-500]="day.isToday"
        cdkDropList
        [id]="day.id"
        [cdkDropListData]="day.events"
        [cdkDropListConnectedTo]="!readOnly ? calendarState.getConnectedLists('month') : []"
        [cdkDropListDisabled]="readOnly"
        (cdkDropListDropped)="drop($event)"
        (click)="onDayClick(day, $event)"
      >
        <div class="flex justify-between items-center mb-1">
          <span
            class="w-7 h-7 flex items-center justify-center rounded-full"
            [class.font-bold]="day.isCurrentMonth"
            [class.text-gray-400]="!day.isCurrentMonth"
            [class.bg-blue-500]="day.isToday"
            [class.text-white]="day.isToday"
          >
            {{ day.date | date:'d' }}
          </span>
          <!-- Only show add button if not readOnly -->
          <svg
            *ngIf="!readOnly"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
            (click)="onAddEventClick(day, $event)"
          >
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </div>

        <div class="space-y-1">
          <div
            *ngFor="let event of day.events"
            class="text-xs p-1 rounded transition-all"
            [class.cursor-pointer]="true"
            [class.opacity-75]="readOnly"
            [style.background-color]="event.color || '#3b82f6'"
            [style.color]="utils.getContrastColor(event.color || '#3b82f6')"
            cdkDrag
            [cdkDragData]="{ event: event, sourceDay: day }"
            [cdkDragDisabled]="readOnly"
            (click)="onEventClick(event, $event)"
          >
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ event.start | date:'HH:mm' }}</span>
              <span class="truncate">{{ event.title }}</span>
            </div>

            <div *cdkDragPreview class="bg-white shadow-lg rounded-md p-2 border border-gray-200">
              <div class="font-medium">{{ event.title }}</div>
              <div class="text-xs text-gray-500">{{ event.start | date:'MMM d, HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonthViewComponent {
  @Input() events: Event[] = [];
  @Input() readOnly: boolean = false; // Add readOnly input parameter
  @Output() eventDrop = new EventEmitter<{event: Event, newStart: Date, newEnd: Date}>();
  @Output() dayClick = new EventEmitter<Date>();
  @Output() eventClick = new EventEmitter<Event>();

  constructor(
    public calendarState: CalendarStateService,
    public utils: CalendarUtilsService
  ) {}

  drop(event: CdkDragDrop<Event[]>): void {
    // Skip if in readOnly mode
    if (this.readOnly) return;

    if (event.previousContainer === event.container) {
      return;
    }

    const dragData = event.item.data;
    const droppedEvent = dragData.event as Event;
    const sourceDay = dragData.sourceDay as CalendarDay;

    const targetDayId = event.container.id;
    const targetDay = this.calendarState.calendarDays.find(day => day.id === targetDayId);

    if (!targetDay) return;

    const oldStart = new Date(droppedEvent.start);
    const oldEnd = new Date(droppedEvent.end);
    const timeDiff = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(targetDay.date);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes());

    const newEnd = new Date(newStart.getTime() + timeDiff);

    this.eventDrop.emit({
      event: droppedEvent,
      newStart,
      newEnd
    });

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  onDayClick(day: CalendarDay, event: MouseEvent): void {
    // Skip if readOnly mode or clicked on event/svg
    if (this.readOnly) return;

    if ((event.target as HTMLElement).closest('[cdkDrag]') ||
      (event.target as HTMLElement).closest('svg')) {
      return;
    }
    this.dayClick.emit(day.date);
  }

  onAddEventClick(day: CalendarDay, event: MouseEvent): void {
    // Skip if readOnly mode
    if (this.readOnly) return;

    event.stopPropagation();
    this.dayClick.emit(day.date);
  }

  onEventClick(event: Event, clickEvent: MouseEvent): void {
    clickEvent.stopPropagation();
    this.eventClick.emit(event);
  }
}
