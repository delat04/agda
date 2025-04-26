// features/dashboard/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, of, tap } from 'rxjs';
import { EventService } from './event.service';
import { Event } from '../models/event.model';
import { AuthService } from './auth.service';

export interface DashboardFilters {
  searchTerm: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  // Filter state
  private filtersSubject = new BehaviorSubject<DashboardFilters>({
    searchTerm: '',
    category: '',
    startDate: null,
    endDate: null,
    tags: []
  });

  // Expose current filters as an observable
  public filters$ = this.filtersSubject.asObservable();

  // Track available categories and tags
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  private tagsSubject = new BehaviorSubject<string[]>([]);

  public categories$ = this.categoriesSubject.asObservable();
  public tags$ = this.tagsSubject.asObservable();

  // Track user's subscribed event IDs
  private subscribedEventIdsSubject = new BehaviorSubject<string[]>([]);

  // Filtered events
  private allEvents$ = this.eventService.getEvents();


  // Subscribed events
  public subscribedEvents$ = combineLatest([
    this.allEvents$,
    this.subscribedEventIdsSubject
  ]).pipe(
    map(([events, subscribedIds]) =>
      events.filter(event => subscribedIds.includes(event.id))
    )
  );

  constructor() {
    // Initialize available categories and tags
    this.updateAvailableCategoriesAndTags();

    // Initialize user's subscribed events
    this.loadUserSubscriptions();
  }

  // Load user's subscribed events from storage or API
  private loadUserSubscriptions(): void {
    // In a real app, we would fetch this from a backend API
    // For now, we'll use localStorage as a simple persistent storage
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const storedSubscriptions = localStorage.getItem(`user_${user.id}_subscriptions`);
        if (storedSubscriptions) {
          this.subscribedEventIdsSubject.next(JSON.parse(storedSubscriptions));
        } else {
          this.subscribedEventIdsSubject.next([]);
        }
      } else {
        this.subscribedEventIdsSubject.next([]);
      }
    });
  }

  // Get subscribed event IDs as an observable
  getSubscribedEventIds(): Observable<string[]> {
    return this.subscribedEventIdsSubject.asObservable();
  }
  getSubscribedEvents(): Observable<Event[]> {
    return this.subscribedEvents$;
  }
  // Subscribe to an event
  subscribeToEvent(event: Event): Observable<string[]> {
    return this.authService.currentUser$.pipe(
      tap(user => {
        if (user) {
          const currentIds = this.subscribedEventIdsSubject.value;
          if (!currentIds.includes(event.id)) {
            const newIds = [...currentIds, event.id];
            this.subscribedEventIdsSubject.next(newIds);

            // Save to storage
            localStorage.setItem(`user_${user.id}_subscriptions`, JSON.stringify(newIds));

            // In a real app, send this to the backend
            console.log(`User ${user.id} subscribed to event ${event.id}`);
          }
        }
      }),
      map(() => this.subscribedEventIdsSubject.value)
    );
  }

// Update unsubscribeFromEvent to return an Observable
  unsubscribeFromEvent(eventId: string): Observable<string[]> {
    return this.authService.currentUser$.pipe(
      tap(user => {
        if (user) {
          const currentIds = this.subscribedEventIdsSubject.value;
          const index = currentIds.indexOf(eventId);

          if (index !== -1) {
            const newIds = currentIds.filter(id => id !== eventId);
            this.subscribedEventIdsSubject.next(newIds);

            // Save to storage
            localStorage.setItem(`user_${user.id}_subscriptions`, JSON.stringify(newIds));

            // In a real app, send this to the backend
            console.log(`User ${user.id} unsubscribed from event ${eventId}`);
          }
        }
      }),
      map(() => this.subscribedEventIdsSubject.value)
    );
  }

  // Update filters
  updateFilters(updates: Partial<DashboardFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...updates });
  }

  // Reset all filters
  resetFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      category: '',
      startDate: null,
      endDate: null,
      tags: []
    });
  }

  // Apply filters to events
  private applyFilters(events: Event[], filters: DashboardFilters): Event[] {
    return events.filter(event => {
      // Search term filter (search in title, description, location)
      const searchMatch = !filters.searchTerm ||
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Category filter
      const categoryMatch = !filters.category || event.category === filters.category;

      // Date range filter
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const eventStart = new Date(event.start);
      const dateMatch =
        (!startDate || eventStart >= startDate) &&
        (!endDate || eventStart <= endDate);

      // Tags filter
      const tagsMatch = filters.tags.length === 0 ||
        (event.tags && filters.tags.some(tag => event.tags!.includes(tag)));

      return searchMatch && categoryMatch && dateMatch && tagsMatch;
    });
  }

  // Update available categories and tags from all events
  private updateAvailableCategoriesAndTags(): void {
    this.allEvents$.subscribe(events => {
      // Extract unique categories
      const categories = [...new Set(events
        .map(event => event.category)
        .filter(Boolean) as string[]
      )];

      // Extract unique tags
      const tags = [...new Set(events
        .flatMap(event => event.tags || [])
      )];

      this.categoriesSubject.next(categories);
      this.tagsSubject.next(tags);
    });
  }


// Get upcoming subscribed events (sorted by date)
  getUpcomingSubscribedEvents(): Observable<Event[]> {
    return this.subscribedEvents$.pipe(
      map(events => {
        const now = new Date();
        return events
          .filter(event => new Date(event.start) > now)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      })
    );
  }

  // New methods to add to DashboardService

// Track all events and paginated events separately
  private allEventsSubject = new BehaviorSubject<Event[]>([]);
  private paginatedEventsSubject = new BehaviorSubject<Event[]>([]);

// Update the filteredEvents$ to use paginated events instead
  public filteredEvents$ = combineLatest([
    this.paginatedEventsSubject as Observable<Event[]>,
    this.filters$ as Observable<DashboardFilters>
  ]).pipe(
    map(([events, filters]: [Event[], DashboardFilters]) => this.applyFilters(events, filters))
  );

// Get count of all events (potentially filtered)
  // Fixed method with proper TypeScript typing
  getAllEventsCount(): Observable<number> {
    return combineLatest([
      this.allEvents$,
      this.filters$
    ]).pipe(
      map(([events, filters]: [Event[], DashboardFilters]) => {
        // Apply only filters (not pagination) to get total count
        return this.applyFilters(events, filters).length;
      })
    );
  }

// Get events with pagination - returns the first page of events
  getEvents(page: number = 1, pageSize: number = 9): Observable<Event[]> {
    return this.allEvents$.pipe(
      tap(allEvents => {
        // Store all events
        this.allEventsSubject.next(allEvents);

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const paginatedEvents = allEvents.slice(0, startIndex + pageSize);
        this.paginatedEventsSubject.next(paginatedEvents);
      }),
      // Return the paginated events
      map(() => this.paginatedEventsSubject.value)
    );
  }

// Load additional events (for infinite scrolling or "load more" functionality)
  loadMoreEvents(page: number, pageSize: number): Observable<Event[]> {
    const allEvents = this.allEventsSubject.value;
    const startIndex = 0;
    const endIndex = page * pageSize;

    // Get events up to the current page
    const paginatedEvents = allEvents.slice(startIndex, endIndex);
    this.paginatedEventsSubject.next(paginatedEvents);

    return of(paginatedEvents);
  }
}
