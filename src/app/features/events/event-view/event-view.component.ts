// features/events/event-view/event-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event, EventImage } from '../../../core/models/event.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="font-[syne] bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen py-6">
      <div class="container-fluid mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Navigation -->
        <div class="mb-4">
          <button
            [routerLink]="isEventSeeker ? ['/my-events'] : ['/events']"
            class="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Back to Events
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Event Details -->
        <div *ngIf="!loading && !error && event" class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <!-- Header with color bar -->
          <div class="h-2" [ngStyle]="{'background-color': event.color || '#4f46e5'}"></div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Left column - Images -->
            <div class="lg:col-span-1 p-4">
              <!-- Event Images -->
              <div *ngIf="event.images && event.images.length > 0" class="relative mb-4">
                <!-- Main image -->
                <div class="relative h-64 lg:h-80 overflow-hidden rounded-lg">
                  <img
                    [src]="currentImage.url"
                    alt="Event image"
                    class="w-full h-full object-cover transition-opacity duration-300"
                  >

                  <!-- Navigation arrows if multiple images -->
                  <div *ngIf="event.images.length > 1" class="absolute inset-0 flex items-center justify-between px-4">
                    <button
                      (click)="previousImage()"
                      class="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      (click)="nextImage()"
                      class="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <!-- Image caption -->
                  <div *ngIf="currentImage.caption" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3 text-white">
                    <p class="text-sm">{{ currentImage.caption }}</p>
                  </div>
                </div>

                <!-- Thumbnail indicators if multiple images -->
                <div *ngIf="event.images.length > 1" class="flex justify-center mt-2 p-2 gap-2">
                  <button
                    *ngFor="let image of event.images; let i = index"
                    (click)="setCurrentImage(i)"
                    class="h-2 w-10 rounded-full transition-colors duration-200"
                    [ngClass]="{'bg-indigo-600': currentImageIndex === i, 'bg-gray-300': currentImageIndex !== i}"
                  ></button>
                </div>
              </div>

              <!-- Additional Details -->
              <div *ngIf="event.organizer || event.contactEmail || event.isPublic !== undefined" class="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>

                <div *ngIf="event.organizer" class="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Organizer:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ event.organizer }}</span>
                  </div>
                </div>

                <div *ngIf="event.contactEmail" class="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Contact:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ event.contactEmail }}</span>
                  </div>
                </div>

                <div *ngIf="event.isPublic !== undefined" class="flex items-center mb-3">
                  <svg *ngIf="event.isPublic" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="!event.isPublic" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Visibility:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ event.isPublic ? 'Public' : 'Private' }}</span>
                  </div>
                </div>

                <div *ngIf="event.createdAt" class="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Created:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ event.createdAt | date: 'MMM d, y' }}</span>
                  </div>
                </div>

                <div *ngIf="event.updatedAt && event.updatedAt !== event.createdAt" class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Last updated:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ event.updatedAt | date: 'MMM d, y' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Middle column - Event Details -->
            <div class="lg:col-span-2 p-4 lg:p-6">
              <!-- Event Title, Status and Tags -->
              <div class="mb-4">
                <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <h1 class="text-3xl font-bold text-gray-900">{{ event.title }}</h1>
                  <div class="flex flex-wrap gap-2">
                    <span *ngIf="isUpcoming(event)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Upcoming
                    </span>
                    <span *ngIf="isPast(event)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Past
                    </span>
                    <span *ngIf="isOngoing(event)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Ongoing
                    </span>
                    <span *ngIf="event.category" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {{ event.category }}
                    </span>
                  </div>
                </div>

                <!-- Tags -->
                <div *ngIf="event.tags && event.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                  <span
                    *ngFor="let tag of event.tags"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700"
                  >
                    # {{ tag }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Date and Time -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-semibold text-gray-900">Date & Time</h3>
                      <p class="text-md text-gray-700 mt-1">
                        {{ event.start | date: 'EEEE, MMMM d, y' }}
                      </p>
                      <ng-container *ngIf="event.allDay; else timeRange">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 mt-1">
                          All day
                        </span>
                      </ng-container>
                      <ng-template #timeRange>
                        <p class="text-md text-gray-700">
                          {{ event.start | date: 'h:mm a' }} - {{ event.end | date: 'h:mm a' }}
                        </p>
                        <p *ngIf="getDuration()" class="text-sm text-gray-500 mt-1">
                          {{ getDuration() }}
                        </p>
                      </ng-template>
                    </div>
                  </div>
                </div>

                <!-- Location -->
                <div *ngIf="event.location" class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-semibold text-gray-900">Location</h3>
                      <p class="text-md text-gray-700 mt-1">{{ event.location }}</p>
                    </div>
                  </div>
                </div>

                <!-- Attendees -->
                <div *ngIf="event.attendees !== undefined || event.maxAttendees !== undefined" class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-semibold text-gray-900">Attendance</h3>
                      <div class="text-md text-gray-700 mt-1">
                        <p *ngIf="event.attendees !== undefined && event.maxAttendees !== undefined">
                          {{ event.attendees }} / {{ event.maxAttendees }} attendees
                        </p>
                        <p *ngIf="event.attendees !== undefined && event.maxAttendees === undefined">
                          {{ event.attendees }} attendees
                        </p>
                        <p *ngIf="event.attendees === undefined && event.maxAttendees !== undefined">
                          Maximum {{ event.maxAttendees }} attendees
                        </p>
                      </div>

                      <!-- Progress bar for capacity -->
                      <div *ngIf="event.attendees !== undefined && event.maxAttendees !== undefined" class="mt-2">
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full"
                            [ngClass]="{
                              'bg-green-500': (event.attendees / event.maxAttendees) < 0.7,
                              'bg-yellow-500': (event.attendees / event.maxAttendees) >= 0.7 && (event.attendees / event.maxAttendees) < 0.9,
                              'bg-red-500': (event.attendees / event.maxAttendees) >= 0.9
                            }"
                            [style.width.%]="(event.attendees / event.maxAttendees) * 100"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div *ngIf="event.description" class="mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div class="prose prose-indigo max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <p>{{ event.description }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap justify-end space-x-0 sm:space-x-4 space-y-0 sm:space-y-0 mt-6 pt-4 border-t border-gray-200" *ngIf="!isEventSeeker">
                <button *ngIf="isUpcoming(event)" class="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors mr-0 sm:mr-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Calendar
                </button>
                <button
                  [routerLink]="['/events/edit', event.id]"
                  class="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mx-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Event
                </button>
                <button
                  (click)="deleteEvent()"
                  class="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Additional styles for the component */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    /* Make the container fluid to use full width */
    .container-fluid {
      width: 100%;
      max-width: 100%;
    }
  `]
})
export class EventViewComponent implements OnInit {
  event: Event | undefined;
  loading: boolean = true;
  error: boolean = false;
  errorMessage: string = 'Failed to load event details. Please try again.';
  eventId: string | null = null;
  isEventSeeker: boolean = false;

  // Image carousel
  currentImageIndex: number = 0;
  get currentImage(): EventImage {
    return this.event?.images && this.event.images.length > 0
      ? this.event.images[this.currentImageIndex]
      : { id: '0', url: 'assets/images/placeholder.jpg' };
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isEventSeeker = user.role === 'event_seeker';
      }
    });
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEvent(this.eventId);
      } else {
        this.error = true;
        this.errorMessage = 'Event ID not found in URL.';
        this.loading = false;
      }
    });
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.error = false;

    this.eventService.getEvent(id).subscribe(
      event => {
        this.event = event;
        this.loading = false;
      },
      error => {
        console.error('Error loading event:', error);
        this.error = true;
        this.errorMessage = 'Failed to load event details. The event may have been deleted or you may not have permission to view it.';
        this.loading = false;
      }
    );
  }

  deleteEvent(): void {
    if (!this.eventId) return;

    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.loading = true;

      this.eventService.deleteEvent(this.eventId).subscribe(
        () => {
          this.router.navigate(['/events']);
        },
        error => {
          console.error('Error deleting event:', error);
          this.error = true;
          this.errorMessage = 'Failed to delete the event. Please try again.';
          this.loading = false;
        }
      );
    }
  }

  // Image carousel methods
  nextImage(): void {
    if (!this.event?.images || this.event.images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + 1) % this.event.images.length;
  }

  previousImage(): void {
    if (!this.event?.images || this.event.images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex - 1 + this.event.images.length) % this.event.images.length;
  }

  setCurrentImage(index: number): void {
    if (!this.event?.images || index < 0 || index >= this.event.images.length) return;

    this.currentImageIndex = index;
  }

  // Helper methods for event status
  isUpcoming(event: Event): boolean {
    return new Date(event.start) > new Date();
  }

  isPast(event: Event): boolean {
    return new Date(event.end) < new Date();
  }

  isOngoing(event: Event): boolean {
    const now = new Date();
    return new Date(event.start) <= now && new Date(event.end) >= now;
  }

  // Calculate event duration
  getDuration(): string {
    if (!this.event) return '';

    const start = new Date(this.event.start);
    const end = new Date(this.event.end);

    // Calculate duration in minutes
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      if (minutes === 0) {
        return hours === 1 ? `${hours} hour` : `${hours} hours`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    }
  }
}
