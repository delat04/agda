// features/events/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <div class="font-[syne] bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen py-12" style="margin-top: 35px;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header with animated underline -->
        <div class="flex justify-between items-center mb-12" @fadeIn>
          <div class="relative">
            <h2 class="text-4xl font-bold text-gray-900">Events</h2>
            <div class="absolute -bottom-2 left-0 h-1 w-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
          </div>
          <button
            [routerLink]="['/events/create']"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out flex items-center gap-2 transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Event
          </button>
        </div>

        <!-- Empty state with illustrations -->
        <div *ngIf="events.length === 0" class="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100" @fadeIn>
          <div class="relative mx-auto w-32 h-32 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 left-0 h-32 w-32 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-4 left-4 h-24 w-24 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
          <p class="text-gray-500 mb-8 max-w-md mx-auto">Start planning your schedule by creating your first event. It only takes a minute!</p>
          <button
            [routerLink]="['/events/create']"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out inline-flex items-center gap-2 transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Your First Event
          </button>
        </div>

        <!-- Event grid with improved cards -->
        <div *ngIf="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" @listAnimation>
          <div *ngFor="let event of events; let i = index"
               [style.animation-delay]="i * 100 + 'ms'"
               class="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 border border-gray-100">
            <!-- Dynamic color bar based on event index for variety -->
            <div class="h-2" [ngClass]="{'bg-indigo-600': i % 3 === 0, 'bg-purple-600': i % 3 === 1, 'bg-blue-600': i % 3 === 2}"></div>

            <div class="p-6">
              <!-- Status indicator -->
              <div class="flex justify-between items-start mb-4">
                <span *ngIf="isUpcoming(event)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Upcoming
                </span>
                <span *ngIf="isPast(event)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Past
                </span>

                <!-- Event Type Tag -->
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{'bg-indigo-100 text-indigo-800': i % 3 === 0, 'bg-purple-100 text-purple-800': i % 3 === 1, 'bg-blue-100 text-blue-800': i % 3 === 2}">
                  {{ getEventType(i) }}
                </span>
              </div>

              <!-- Event Title with hover effect -->
              <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-indigo-700 transition-colors duration-200">
                {{ event.title }}
              </h3>

              <!-- Date and Time with improved styling -->
              <div class="flex items-start mb-4 bg-gray-50 p-3 rounded-lg">
                <div class="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-800">
                    {{ event.start | date: 'EEEE, MMM d, y' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ event.start | date: 'h:mm a' }} - {{ event.end | date: 'h:mm a' }}
                  </p>
                </div>
              </div>

              <!-- Location with improved styling -->
              <div *ngIf="event.location" class="flex items-start mb-4">
                <div class="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700 line-clamp-1">{{ event.location }}</p>
                </div>
              </div>

              <!-- Description Preview with styled container -->
              <div *ngIf="event.description" class="mb-6 bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600 line-clamp-2 italic">{{ event.description }}</p>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-100 my-4"></div>

              <!-- Action Buttons with improved styling -->
              <div class="flex justify-end space-x-3 mt-4">
                <button
                  [routerLink]="['/events/view', event.id]"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                <button
                  [routerLink]="['/events/edit', event.id]"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  (click)="deleteEvent(event.id)"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom animations and utility classes */
    .line-clamp-1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading: boolean = true;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe(
      events => {
        this.events = events;
        this.loading = false;
      },
      error => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    );
  }

  deleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.loading = true;
      this.eventService.deleteEvent(id).subscribe(
        () => {
          this.loadEvents();
        },
        error => {
          console.error('Error deleting event:', error);
          this.loading = false;
        }
      );
    }
  }

  // Helper methods for event status
  isUpcoming(event: Event): boolean {
    return new Date(event.start) > new Date();
  }

  isPast(event: Event): boolean {
    return new Date(event.end) < new Date();
  }

  // Helper method to provide event types based on index
  getEventType(index: number): string {
    const types = ['Meeting', 'Conference', 'Workshop', 'Social', 'Webinar', 'Training'];
    return types[index % types.length];
  }
}
