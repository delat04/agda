// features/dashboard/dashboard.component.ts
import { Component, OnInit, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashbord.service';
import { Event } from '../../core/models/event.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-screen">
      <!-- Fixed Header Section -->
      <div class="flex-none">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

          <div *ngIf="isEventManager">
            <a
              routerLink="/events/create"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-all shadow-md">
              Create Event
            </a>
          </div>
        </div>

        <!-- Fixed Search/Filter Section -->
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-0 z-10">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Search Events</h2>

          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Search Term -->
              <div>
                <label for="searchTerm" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="searchTerm"
                  formControlName="searchTerm"
                  placeholder="Search events..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
              </div>

              <!-- Category -->
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  formControlName="category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
                  <option value="">All Categories</option>
                  <option *ngFor="let category of categories$ | async" [value]="category">{{ category }}</option>
                </select>
              </div>

              <!-- Date Range -->
              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  formControlName="startDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
              </div>

              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  formControlName="endDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
              </div>

              <!-- Tags -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
                  <div *ngFor="let tag of availableTags$ | async"
                       class="inline-flex items-center px-3 py-1 rounded-full transition-all"
                       [class.bg-indigo-100]="!isTagSelected(tag)"
                       [class.bg-indigo-500]="isTagSelected(tag)"
                       [class.text-gray-700]="!isTagSelected(tag)"
                       [class.text-white]="isTagSelected(tag)"
                       (click)="toggleTag(tag)">
                    <span class="text-sm mr-1">{{ tag }}</span>
                    <span *ngIf="isTagSelected(tag)" class="ml-1">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="resetFilters()"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 text-sm font-medium shadow-sm transition-colors">
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Scrollable Events Section -->
      <div class="flex-grow overflow-y-auto mt-6">
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">
              {{ isEventManager ? 'Your Created Events' : 'Events' }}
            </h2>
            <ng-container *ngIf="(totalEvents | async) as total">
              <div class="text-sm text-gray-500" *ngIf="total > 0">
                Showing {{ (filteredEvents$ | async)?.length || 0 }} of {{ total }} events
              </div>
            </ng-container>
          </div>

          <div *ngIf="(filteredEvents$ | async)?.length === 0" class="text-gray-500 py-12 text-center">
            <div class="text-5xl mb-3">🔍</div>
            <p>No events match your criteria.</p>
            <button (click)="resetFilters()" class="mt-4 text-indigo-600 hover:text-indigo-800">Reset filters</button>
          </div>

          <div *ngIf="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>

          <div *ngIf="!loading && (filteredEvents$ | async)?.length ?? 0 > 0"
               #eventsContainer
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto py-2 px-1">
            <div *ngFor="let event of filteredEvents$ | async"
                 class="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
              <img [src]="event.thumbnail || 'https://via.placeholder.com/300x200'"
                   alt="{{ event.title }}"
                   class="w-full h-40 object-cover">
              <div class="p-4">
                <div class="flex items-center mb-1">
                  <span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">{{ event.category }}</span>
                  <span class="text-xs text-gray-500 ml-auto">{{ event.start | date }}</span>
                </div>

                <h3 class="text-lg font-medium text-gray-900 mb-1 line-clamp-2">{{ event.title }}</h3>

                <div *ngIf="event.location" class="text-sm text-gray-500 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ event.location }}
                </div>

                <div *ngIf="event.tags && event.tags.length > 0" class="mb-4 flex flex-wrap gap-1">
                  <span *ngFor="let tag of event.tags.slice(0, 3)"
                        class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {{ tag }}
                  </span>
                  <span *ngIf="event.tags.length > 3" class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    +{{ event.tags.length - 3 }}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <a
                    [routerLink]="['/events/view', event.id]"
                    class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    View details
                  </a>

                  <!-- Subscribe Button -->
                  <button *ngIf="!isEventManager"
                          (click)="toggleSubscription(event)"
                          [class.bg-indigo-600]="!isSubscribed(event.id)"
                          [class.bg-red-500]="isSubscribed(event.id)"
                          class="text-white text-sm px-3 py-1 rounded-md hover:opacity-90 transition-colors shadow-sm">
                    {{ isSubscribed(event.id) ? 'Unsubscribe' : 'Subscribe' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div *ngIf="(filteredEvents$ | async)?.length && hasMoreEvents" class="mt-6 text-center">
            <button
              (click)="loadMoreEvents()"
              class="px-4 py-2 bg-white border border-indigo-300 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
              Load More Events
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);

  @ViewChild('eventsContainer', { static: false }) eventsContainer: ElementRef | undefined;

  // Observables for template
  filteredEvents$: Observable<Event[]>;
  subscribedEvents$: Observable<Event[]>;
  categories$: Observable<string[]>;
  availableTags$: Observable<string[]>;
  totalEvents = new BehaviorSubject<number>(0);

  isEventManager = false;
  selectedTags: string[] = [];
  subscribedEventIds: string[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 9;
  hasMoreEvents = false;

  filterForm: FormGroup = this.fb.group({
    searchTerm: [''],
    category: [''],
    startDate: [null],
    endDate: [null]
  });

  constructor() {
    this.filteredEvents$ = this.dashboardService.filteredEvents$;
    this.subscribedEvents$ = this.dashboardService.subscribedEvents$;
    this.categories$ = this.dashboardService.categories$;
    this.availableTags$ = this.dashboardService.tags$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isEventManager = user.role === 'event_manager';
      }
    });

    // Initialize form with current filter values
    this.dashboardService.filters$.subscribe(filters => {
      this.filterForm.patchValue({
        searchTerm: filters.searchTerm || '',
        category: filters.category || '',
        startDate: filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : null,
        endDate: filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : null
      }, { emitEvent: false });

      this.selectedTags = [...(filters.tags || [])];
    });

    // Get current user's subscribed event IDs
    this.dashboardService.getSubscribedEventIds().subscribe(ids => {
      this.subscribedEventIds = ids;
    });

    // Load events with pagination
    this.loadEvents();

    // Track total events count
    this.dashboardService.getAllEventsCount().subscribe(count => {
      this.totalEvents.next(count);
      this.updateHasMoreEvents();
    });
  }

  loadEvents(): void {
    this.loading = true;
    this.dashboardService.getEvents(this.currentPage, this.pageSize).subscribe({
      next: () => {
        this.loading = false;
        this.updateHasMoreEvents();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadMoreEvents(): void {
    this.currentPage++;
    this.loading = true;
    this.dashboardService.loadMoreEvents(this.currentPage, this.pageSize).subscribe({
      next: () => {
        this.loading = false;
        this.updateHasMoreEvents();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateHasMoreEvents(): void {
    const totalItems = this.totalEvents.getValue();
    const loadedItems = this.pageSize * this.currentPage;
    this.hasMoreEvents = loadedItems < totalItems;
  }

  applyFilters(): void {
    if (!this.filterForm.valid) return;

    const formValues = this.filterForm.value;
    this.currentPage = 1; // Reset to first page when filtering
    this.loading = true;

    const filters = {
      searchTerm: formValues.searchTerm?.trim() || '',
      category: formValues.category || '',
      startDate: formValues.startDate ? new Date(formValues.startDate) : null,
      endDate: formValues.endDate ? new Date(formValues.endDate) : null,
      tags: [...this.selectedTags]
    };

    this.dashboardService.updateFilters(filters);
    this.loadEvents();
  }

  resetFilters(): void {
    this.currentPage = 1;
    this.selectedTags = [];
    this.filterForm.reset({
      searchTerm: '',
      category: '',
      startDate: null,
      endDate: null
    });
    this.dashboardService.resetFilters();
    this.loadEvents();
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  // Check if user is subscribed to a specific event
  isSubscribed(eventId: string): boolean {
    return this.subscribedEventIds.includes(eventId);
  }

  // Toggle event subscription
  toggleSubscription(event: Event): void {
    if (this.isSubscribed(event.id)) {
      this.dashboardService.unsubscribeFromEvent(event.id);
      const index = this.subscribedEventIds.indexOf(event.id);
      if (index !== -1) {
        this.subscribedEventIds.splice(index, 1);
      }
    } else {
      this.dashboardService.subscribeToEvent(event);
      this.subscribedEventIds.push(event.id);
    }
  }

  // Auto-scroll detection for infinite scrolling (alternative to Load More button)
  @HostListener('scroll', ['$event'])
  onScroll(): void {
    if (!this.eventsContainer || this.loading || !this.hasMoreEvents) return;

    const element = this.eventsContainer.nativeElement;
    const rect = element.getBoundingClientRect();
    const parentElement = element.parentElement;

    // Check if we're near the bottom of the scrollable container
    if (parentElement.scrollTop + parentElement.clientHeight >= parentElement.scrollHeight - 300) {
      this.loadMoreEvents();
    }
  }
}
