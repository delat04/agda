// features/calendar/event-modal/event-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="font-[syne] fixed inset-0 backdrop-blur-[2px] z-50 flex items-center justify-center transition-opacity"
      (click)="emitClose()"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        (click)="$event.stopPropagation()"
      style="border: 1px solid #1a191c29 ">
        <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <h3 class="text-lg font-medium text-gray-800">
            {{ readOnly ? 'View Event' : (event?.id ? 'Edit Event' : 'Create New Event') }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            (click)="emitClose()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" *ngIf="event" class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label for="title" class="block mb-1 text-sm font-medium text-gray-700">Title</label>
            <input
              [disabled]="readOnly"
              type="text"
              id="title"
              formControlName="title"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div
              class="mt-1 text-sm text-red-600"
              *ngIf="eventForm.get('title')?.invalid && eventForm.get('title')?.touched"
            >
              Title is required
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea
              [disabled]="readOnly"
              id="description"
              formControlName="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Start Date/Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="startDate" class="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
              <input
                [disabled]="readOnly"
                type="date"
                id="startDate"
                formControlName="startDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label for="startTime" class="block mb-1 text-sm font-medium text-gray-700">Start Time</label>
              <input
                [disabled]="readOnly"
                type="time"
                id="startTime"
                formControlName="startTime"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- End Date/Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="endDate" class="block mb-1 text-sm font-medium text-gray-700">End Date</label>
              <input
                [disabled]="readOnly"
                type="date"
                id="endDate"
                formControlName="endDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label for="endTime" class="block mb-1 text-sm font-medium text-gray-700">End Time</label>
              <input
                [disabled]="readOnly"
                type="time"
                id="endTime"
                formControlName="endTime"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- Location -->
          <div>
            <label for="location" class="block mb-1 text-sm font-medium text-gray-700">Location</label>
            <input
              [disabled]="readOnly"
              type="text"
              id="location"
              formControlName="location"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Color -->
          <div>
            <label for="color" class="block mb-1 text-sm font-medium text-gray-700">Color</label>
            <div class="flex items-center gap-3">
              <input
                [disabled]="readOnly"
                type="color"
                id="color"
                formControlName="color"
                class="w-10 h-10 rounded cursor-pointer border border-gray-300"
              >
              <span class="text-sm text-gray-600">Select event color</span>
            </div>
          </div>

          <!-- Checkboxes -->
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                [disabled]="readOnly"
                type="checkbox"
                formControlName="allDay"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              >
              <span class="text-sm text-gray-700">All Day Event</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                [disabled]="readOnly"
                type="checkbox"
                formControlName="dragabble"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              >
              <span class="text-sm text-gray-700">Allow Drag & Drop</span>
            </label>
          </div>

          <!-- Form Actions -->
          <button
            *ngIf="event?.id && !readOnly"
            type="button"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            (click)="deleteEvent()"
          >
            Delete
          </button>

          <div class="flex gap-3">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              (click)="emitClose()"
            >
              Cancel
            </button>

            <button
              *ngIf="!readOnly"
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="eventForm.invalid"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class EventModalComponent {
  @Input() event: Event | null = null;
  @Input() readOnly: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Event>();
  @Output() delete = new EventEmitter<string>();

  eventForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.createEventForm();
  }

  ngOnChanges(): void {
    if (this.event) {
      this.populateForm(this.event);
    }
  }

  createEventForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      location: [''],
      allDay: [false],
      draggable: [true],
      color: ['#3b82f6']

    });
  }

  populateForm(event: Event): void {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    this.eventForm.setValue({
      title: event.title,
      description: event.description || '',
      startDate: this.formatDate(startDate),
      startTime: this.formatTime(startDate),
      endDate: this.formatDate(endDate),
      endTime: this.formatTime(endDate),
      location: event.location || '',
      allDay: event.allDay || false,
      draggable: event.draggable !== false,
      color: event.color || '#3b82f6'
    });
  }

  saveEvent(): void {
    if (this.eventForm.invalid || !this.event) return;

    const formValues = this.eventForm.value;

    const startDateTime = this.combineDateTime(formValues.startDate, formValues.startTime);
    const endDateTime = this.combineDateTime(formValues.endDate, formValues.endTime);

    const updatedEvent: Event = {
      ...this.event,
      title: formValues.title,
      description: formValues.description,
      start: startDateTime,
      end: endDateTime,
      location: formValues.location,
      allDay: formValues.allDay,
      draggable: formValues.draggable,
      color: formValues.color
    };

    this.save.emit(updatedEvent);
  }

  deleteEvent(): void {
    if (this.event?.id) {
      this.delete.emit(this.event.id);
    }
  }

  emitClose(): void {
    this.close.emit();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private combineDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
}
