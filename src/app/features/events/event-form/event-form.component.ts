// features/events/event-form/event-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event, EventImage } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="font-[syne] max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md" style="margin-top: 35px;">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h2>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Info Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Basic Information</h3>

          <div class="space-y-2">
            <label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
            <div
              class="text-sm text-red-600 mt-1"
              *ngIf="eventForm.get('title')?.invalid && eventForm.get('title')?.touched"
            >
              Title is required
            </div>
          </div>

          <div class="space-y-2 mt-4">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="space-y-2">
              <label for="organizer" class="block text-sm font-medium text-gray-700">Organizer</label>
              <input
                type="text"
                id="organizer"
                formControlName="organizer"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div class="space-y-2">
              <label for="contactEmail" class="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                formControlName="contactEmail"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
              <div
                class="text-sm text-red-600 mt-1"
                *ngIf="eventForm.get('contactEmail')?.invalid && eventForm.get('contactEmail')?.touched"
              >
                Please enter a valid email address
              </div>
            </div>
          </div>
        </div>

        <!-- Date & Time Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Date & Time</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                id="startDate"
                formControlName="startDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div class="space-y-2">
              <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                id="startTime"
                formControlName="startTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="space-y-2">
              <label for="endDate" class="block text-sm font-medium text-gray-700">End Date *</label>
              <input
                type="date"
                id="endDate"
                formControlName="endDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div class="space-y-2">
              <label for="endTime" class="block text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                id="endTime"
                formControlName="endTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>
          </div>

          <div class="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="allDay"
              formControlName="allDay"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            >
            <label for="allDay" class="text-sm font-medium text-gray-700">All Day Event</label>
          </div>
        </div>

        <!-- Location Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Location</h3>
          <div class="space-y-2">
            <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              formControlName="location"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>
        </div>

        <!-- Attendees Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Attendees</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="attendees" class="block text-sm font-medium text-gray-700">Current Attendees</label>
              <input
                type="number"
                id="attendees"
                formControlName="attendees"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div class="space-y-2">
              <label for="maxAttendees" class="block text-sm font-medium text-gray-700">Maximum Attendees</label>
              <input
                type="number"
                id="maxAttendees"
                formControlName="maxAttendees"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>
          </div>
        </div>

        <!-- Images Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Images</h3>

          <div class="space-y-2">
            <label for="thumbnail" class="block text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input
              type="text"
              id="thumbnail"
              formControlName="thumbnail"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
            <div formArrayName="images" class="space-y-4">
              <div *ngFor="let image of imagesFormArray.controls; let i = index" [formGroupName]="i" class="grid grid-cols-12 gap-2 items-end">
                <div class="col-span-5">
                  <label [for]="'imageUrl' + i" class="block text-xs text-gray-500">URL</label>
                  <input
                    [id]="'imageUrl' + i"
                    formControlName="url"
                    type="text"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                </div>
                <div class="col-span-4">
                  <label [for]="'imageCaption' + i" class="block text-xs text-gray-500">Caption</label>
                  <input
                    [id]="'imageCaption' + i"
                    formControlName="caption"
                    type="text"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                </div>
                <div class="col-span-2">
                  <div class="flex items-center">
                    <input
                      [id]="'imagePrimary' + i"
                      formControlName="isPrimary"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    >
                    <label [for]="'imagePrimary' + i" class="ml-2 text-xs text-gray-500">Primary</label>
                  </div>
                </div>
                <div class="col-span-1">
                  <button
                    type="button"
                    class="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    (click)="removeImage(i)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="mt-2 px-3 py-1 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                (click)="addImage()"
              >
                + Add Image
              </button>
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Tags & Categories</h3>

          <div class="space-y-2">
            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="category"
              formControlName="category"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div class="flex flex-wrap items-center gap-2">
              <div *ngFor="let tag of tagsArray; let i = index" class="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <span class="text-sm text-gray-800">{{ tag }}</span>
                <button
                  type="button"
                  class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  (click)="removeTag(i)"
                >
                  ×
                </button>
              </div>

              <div class="flex">
                <input
                  type="text"
                  [formControl]="newTagControl"
                  placeholder="Add a tag"
                  class="px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  (keydown.enter)="$event.preventDefault(); addTag()"
                >
                <button
                  type="button"
                  class="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  (click)="addTag()"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Settings</h3>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              formControlName="isPublic"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            >
            <label for="isPublic" class="text-sm font-medium text-gray-700">Public Event</label>
          </div>

          <div class="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="draggable"
              formControlName="draggable"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            >
            <label for="draggable" class="text-sm font-medium text-gray-700">Allow Drag & Drop</label>
          </div>

          <div class="mt-4 space-y-2">
            <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              id="color"
              formControlName="color"
              class="h-10 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            (click)="goBack()"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            [disabled]="eventForm.invalid"
            [ngClass]="{'opacity-50 cursor-not-allowed': eventForm.invalid}"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  isEditMode = false;
  eventId?: string;
  tagsArray: string[] = [];
  newTagControl!: FormControl;
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.newTagControl = this.fb.control(''); // Initialize in ngOnInit

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = params['id'];
        this.loadEvent(this.eventId);
      }
    });
  }

  initForm(): void {
    const today = new Date();
    const todayStr = this.formatDate(today);
    const timeStr = this.formatTime(today);

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [todayStr, Validators.required],
      startTime: [timeStr, Validators.required],
      endDate: [todayStr, Validators.required],
      endTime: [this.formatTime(new Date(today.getTime() + 60 * 60 * 1000)), Validators.required],
      location: [''],
      allDay: [false],
      draggable: [true],
      // New fields
      organizer: [''],
      contactEmail: ['', Validators.email],
      thumbnail: [''],
      attendees: [0],
      maxAttendees: [0],
      isPublic: [true],
      category: [''],
      color: ['#3788d8'],
      images: this.fb.array([])
    });
  }

  loadEvent(id: string | undefined): void {
    this.eventService.getEvent(id).subscribe(event => {
      if (event) {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description || '',
          startDate: this.formatDate(new Date(event.start)),
          startTime: this.formatTime(new Date(event.start)),
          endDate: this.formatDate(new Date(event.end)),
          endTime: this.formatTime(new Date(event.end)),
          location: event.location || '',
          allDay: event.allDay || false,
          draggable: event.draggable !== false,
          // New fields
          organizer: event.organizer || '',
          contactEmail: event.contactEmail || '',
          thumbnail: event.thumbnail || '',
          attendees: event.attendees || 0,
          maxAttendees: event.maxAttendees || 0,
          isPublic: event.isPublic !== false,
          category: event.category || '',
          color: event.color || '#3788d8'
        });

        // Load tags
        if (event.tags && event.tags.length > 0) {
          this.tagsArray = [...event.tags];
        }

        // Load images
        if (event.images && event.images.length > 0) {
          this.clearImages();
          event.images.forEach(image => {
            this.addImage(image);
          });
        }
      } else {
        this.router.navigate(['/events']);
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;

    const formValues = this.eventForm.value;

    // Combine date and time values
    const startDateTime = this.combineDateTime(formValues.startDate, formValues.startTime);
    const endDateTime = this.combineDateTime(formValues.endDate, formValues.endTime);

    const eventData: Omit<Event, 'id'> = {
      title: formValues.title,
      description: formValues.description,
      start: startDateTime,
      end: endDateTime,
      location: formValues.location,
      allDay: formValues.allDay,
      draggable: formValues.draggable,
      // New fields
      organizer: formValues.organizer,
      contactEmail: formValues.contactEmail,
      thumbnail: formValues.thumbnail,
      attendees: formValues.attendees,
      maxAttendees: formValues.maxAttendees,
      isPublic: formValues.isPublic,
      category: formValues.category,
      color: formValues.color,
      tags: this.tagsArray,
      images: formValues.images
    };

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent({ ...eventData, id: this.eventId }).subscribe(() => {
        this.router.navigate(['/events']);
      });
    } else {
      this.eventService.createEvent(eventData).subscribe(() => {
        this.router.navigate(['/events']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  // Helper methods for date/time handling
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

  // Image FormArray Methods
  get imagesFormArray(): FormArray {
    return this.eventForm.get('images') as FormArray;
  }

  addImage(image?: EventImage): void {
    const imageForm = this.fb.group({
      id: [image?.id || this.generateId()],
      url: [image?.url || '', Validators.required],
      caption: [image?.caption || ''],
      isPrimary: [image?.isPrimary || false],
      order: [image?.order || this.imagesFormArray.length]
    });

    this.imagesFormArray.push(imageForm);
  }

  removeImage(index: number): void {
    this.imagesFormArray.removeAt(index);

    // Update order of remaining images
    for (let i = 0; i < this.imagesFormArray.length; i++) {
      this.imagesFormArray.at(i).get('order')?.setValue(i);
    }
  }

  clearImages(): void {
    while (this.imagesFormArray.length) {
      this.imagesFormArray.removeAt(0);
    }
  }

  // Tags Methods
  addTag(): void {
    const tagValue = this.newTagControl.value?.trim();
    if (tagValue && !this.tagsArray.includes(tagValue)) {
      this.tagsArray.push(tagValue);
      this.newTagControl.setValue('');
    }
  }

  removeTag(index: number): void {
    this.tagsArray.splice(index, 1);
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
