import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashbord.service';
import { Event } from '../../../core/models/event.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">My Subscribed Events</h1>
      </div>

      <!-- Subscribed Events -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div *ngIf="(subscribedEvents$ | async)?.length === 0" class="text-gray-500 p-4 text-center">
          <p>You haven't subscribed to any events yet.</p>
          <a
            routerLink="/dashboard"
            class="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">
            Browse Events
          </a>
        </div>

        <div *ngIf="(subscribedEvents$ | async)?.length ?? 0 > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let event of subscribedEvents$ | async" class="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            <img [src]="event.thumbnail || 'https://via.placeholder.com/300x200'"
                 alt="{{ event.title }}"
                 class="w-full h-40 object-cover">

            <div class="p-4">
              <div class="text-xs text-indigo-600 font-medium mb-1">{{ event.category }}</div>
              <h3 class="text-lg font-medium text-gray-900 mb-1">{{ event.title }}</h3>
              <div class="text-sm text-gray-500 mb-2">{{ event.start | date }}</div>

              <div *ngIf="event.location" class="text-sm text-gray-500 mb-2">
                <span class="inline-block mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1114.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                {{ event.location }}
              </div>

              <!-- Event tags -->
              <div *ngIf="event.tags && event.tags.length > 0" class="mb-4 flex flex-wrap gap-1">
                <span *ngFor="let tag of event.tags" class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {{ tag }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <a
                  [routerLink]="['/events/view', event.id]"
                  class="text-sm text-indigo-600 hover:text-indigo-500">
                  View details
                </a>

                <!-- Unsubscribe Button -->
                <button
                  (click)="unsubscribeFromEvent(event.id)"
                  class="bg-red-500 text-white text-sm px-3 py-1 rounded hover:opacity-90 transition-colors">
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events Section -->
      <div *ngIf="(upcomingEvents$ | async)?.length ?? 0 > 0" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h2>

        <div class="grid grid-cols-1 gap-4">
          <div *ngFor="let event of upcomingEvents$ | async" class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0 mr-4 text-center">
              <div class="bg-indigo-100 rounded-md p-2 w-16">
                <div class="text-xs text-gray-500">{{ event.start | date: 'MMM' }}</div>
                <div class="text-xl font-bold text-indigo-700">{{ event.start | date: 'd' }}</div>
              </div>
            </div>

            <div class="flex-grow">
              <h3 class="text-md font-medium text-gray-900">{{ event.title }}</h3>
              <div class="text-sm text-gray-500">{{ event.start | date: 'h:mm a' }} • {{ event.location || 'Online' }}</div>
            </div>

            <div class="flex-shrink-0">
              <a [routerLink]="['/events/view', event.id]" class="text-indigo-600 hover:text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MyEventsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  subscribedEvents$: Observable<Event[]>;
  upcomingEvents$: Observable<Event[]>;

  constructor() {
    this.subscribedEvents$ = this.dashboardService.subscribedEvents$;
    this.upcomingEvents$ = this.dashboardService.getUpcomingSubscribedEvents();
  }

  ngOnInit(): void {
    // Any additional initialization logic
  }

  unsubscribeFromEvent(eventId: string): void {
    this.dashboardService.unsubscribeFromEvent(eventId);
  }
}
