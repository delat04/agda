import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventService } from './event.service';
import { Event } from '../models/event.model';

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
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard';
  private ApiUrl = 'http://localhost:8080/api/events';

  private filtersSubject = new BehaviorSubject<DashboardFilters>({
    searchTerm: '',
    category: '',
    startDate: null,
    endDate: null,
    tags: []
  });

  public filters$ = this.filtersSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<string[]>([]);
  private tagsSubject = new BehaviorSubject<string[]>([]);

  public categories$ = this.categoriesSubject.asObservable();
  public tags$ = this.tagsSubject.asObservable();

  private subscribedEventIdsSubject = new BehaviorSubject<string[]>([]);

  private allEvents$ = this.eventService.getAllEvents();

  public subscribedEvents$ = combineLatest([
    this.allEvents$,
    this.subscribedEventIdsSubject
  ]).pipe(
    map(([events, subscribedIds]) =>
      events.filter(event => subscribedIds.includes(event.id))
    )
  );

  constructor() {
    this.loadCategoriesAndTags();
    this.loadUserSubscriptions();
  }

  private getUserIdFromStorage(): string | null {
    const userString = localStorage.getItem('user_data');
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    return userId;
  }

  private loadUserSubscriptions(): void {
    const userId = this.getUserIdFromStorage();
    if (!userId) {
      console.error('No user ID found in localStorage for loading subscriptions');
      this.subscribedEventIdsSubject.next([]);
      return;
    }
    const params = new HttpParams().set('userId', userId);
    this.http.get<string[]>(`${this.apiUrl}/subscriptions`, { params }).pipe(
      tap(eventIds => console.log('Loaded subscribed event IDs for user', userId, ':', eventIds)),
      catchError(error => {
        console.error('Error loading subscriptions for user', userId, ':', error);
        return of([]);
      })
    ).subscribe(eventIds => {
      this.subscribedEventIdsSubject.next(eventIds);
    });
  }

  private loadCategoriesAndTags(): void {
    this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error loading categories:', error);
        return of([]);
      })
    ).subscribe(categories => {
      this.categoriesSubject.next(categories);
    });

    this.http.get<string[]>(`${this.apiUrl}/tags`).pipe(
      catchError(error => {
        console.error('Error loading tags:', error);
        return of([]);
      })
    ).subscribe(tags => {
      this.tagsSubject.next(tags);
    });
  }

  getSubscribedEventIds(): Observable<string[]> {
    return this.subscribedEventIdsSubject.asObservable();
  }

  getSubscribedEvents(): Observable<Event[]> {
    return this.subscribedEvents$;
  }

  subscribeToEvent(event: Event): Observable<string[]> {
    const userId = this.getUserIdFromStorage();
    console.log('subscribeToEvent called with event:', event, 'and userId:', userId);
    console.log('POST URL:', `${this.apiUrl}/subscriptions/${event.id}`);

    if (!userId) {
      console.error('No user ID found in localStorage for subscription');
      return of(this.subscribedEventIdsSubject.value);
    }
    if (!event || !event.id) {
      console.error('Invalid event or event ID:', event);
      return of(this.subscribedEventIdsSubject.value);
    }

    const currentIds = this.subscribedEventIdsSubject.value;
    if (!currentIds.includes(event.id)) {
      console.log("About to send HTTP POST request");

      // Create the actual request payload and log it
      const payload = { userId };
      console.log('Request payload:', payload);

      this.http
        .post<any>(
          `${this.apiUrl}/subscriptions/${encodeURIComponent(String(event.id))}`,
          payload,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )
        .pipe(
          tap(response => {
            console.log(`POST /subscriptions/${event.id} full response:`, response);
            console.log(`POST /subscriptions/${event.id} status:`, response.status);
            console.log(`POST /subscriptions/${event.id} headers:`, response.headers);

            if (response.status === 201) {
              const newIds = [...currentIds, event.id];
              this.subscribedEventIdsSubject.next(newIds);
              console.log('Updated subscribed event IDs:', newIds);
            } else {
              console.warn(`Unexpected response status: ${response.status}`);
            }
          }),
          map(() => this.subscribedEventIdsSubject.value),
          catchError(error => {
            console.error(`Failed to subscribe to event ${event.id} for user ${userId}, error type:`, typeof error);
            console.error(`Error status: ${error.status}, message: ${error.message}, stack trace:`, error.stack);
            console.error(`Full error object:`, error);

            if (error.error instanceof ErrorEvent) {
              // Client-side error
              console.error(`Client-side error: ${error.error.message}`);
            } else {
              // Server-side error
              console.error(`Server status: ${error.status}, error: ${error.error}`);
            }

            return throwError(() => new Error('Subscription failed'));
          })
        )
        .subscribe({
          next: (value) => {
            console.log('Subscription success, current subscribed event IDs:', value);
          },
          error: (err) => {
            console.error('Subscription failed:', err);
          },
          complete: () => {
            console.log('Subscription request completed');
          }
        });

    }
    console.log(`Event ${event.id} already subscribed for user ${userId}`);
    return of(currentIds);
  }
  unsubscribeFromEvent(eventId: string): Observable<string[]> {
    const userId = this.getUserIdFromStorage();
    console.log('unsubscribeFromEvent called with eventId:', eventId, 'and userId:', userId);
    console.log('DELETE URL:', `${this.apiUrl}/subscriptions/${eventId}`);
    if (!userId) {
      console.error('No user ID found in localStorage for unsubscription');
      return of(this.subscribedEventIdsSubject.value);
    }
    if (!eventId) {
      console.error('Invalid event ID:', eventId);
      return of(this.subscribedEventIdsSubject.value);
    }
    const currentIds = this.subscribedEventIdsSubject.value;
    if (currentIds.includes(eventId)) {
      this.http
        .post<any>(
          `${this.apiUrl}/subscriptions/${encodeURIComponent(String(eventId))}/unsubscribe?userId=${encodeURIComponent(String(userId))}`,
          null, // No body, since userId is now in the URL
          {
            headers: { 'Content-Type': 'application/json' },
            observe: 'response'
          }
        )
        .pipe(
          tap(response => {
            console.log(`POST /subscriptions/${eventId}/unsubscribe response:`, response);
            if (response.status === 204) {
              const newIds = currentIds.filter(id => id !== eventId);
              this.subscribedEventIdsSubject.next(newIds);
              console.log('Updated subscribed event IDs after unsubscribe:', newIds);
            } else {
              console.warn(`Unexpected response status: ${response.status}`);
            }
          }),
          map(() => this.subscribedEventIdsSubject.value),
          catchError(error => {
            console.error(`Failed to unsubscribe from event ${eventId} for user ${userId}, error type:`, typeof error);
            console.error(`Error status: ${error.status}, message: ${error.message}, stack trace:`, error.stack);
            console.error(`Full error object:`, error);

            if (error.error instanceof ErrorEvent) {
              // Client-side error
              console.error(`Client-side error: ${error.error.message}`);
            } else {
              // Server-side error
              console.error(`Server status: ${error.status}, error: ${error.error}`);
            }

            return throwError(() => new Error('Unsubscription failed'));
          })
        )
        .subscribe({
          next: (value) => {
            console.log('Unsubscription success, current subscribed event IDs:', value);
          },
          error: (err) => {
            console.error('Unsubscription failed:', err);
          },
          complete: () => {
            console.log('Unsubscription request completed');
          }
        });
    }
      console.log(`Event ${eventId} not subscribed for user ${userId}`);
    return of(currentIds);
  }

  updateFilters(updates: Partial<DashboardFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...updates });
  }

  resetFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      category: '',
      startDate: null,
      endDate: null,
      tags: []
    });
  }

  private applyFilters(events: Event[], filters: DashboardFilters): Event[] {
    return events.filter(event => {
      const searchMatch = !filters.searchTerm ||
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      const categoryMatch = !filters.category || event.category === filters.category;

      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      const eventStart = new Date(event.start);
      const dateMatch =
        (!startDate || eventStart >= startDate) &&
        (!endDate || eventStart <= endDate);

      const tagsMatch = filters.tags.length === 0 ||
        (event.tags && filters.tags.some(tag => event.tags!.includes(tag)));

      return searchMatch && categoryMatch && dateMatch && tagsMatch;
    });
  }

  private updateAvailableCategoriesAndTags(): void {
    this.allEvents$.subscribe(events => {
      const categories = [...new Set(events
        .map(event => event.category)
        .filter(Boolean) as string[]
      )];

      const tags = [...new Set(events
        .flatMap(event => event.tags || [])
      )];

      this.categoriesSubject.next(categories);
      this.tagsSubject.next(tags);
    });
  }

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

  private allEventsSubject = new BehaviorSubject<Event[]>([]);
  private paginatedEventsSubject = new BehaviorSubject<Event[]>([]);

  public filteredEvents$ = combineLatest([
    this.paginatedEventsSubject as Observable<Event[]>,
    this.filters$ as Observable<DashboardFilters>
  ]).pipe(
    map(([events, filters]: [Event[], DashboardFilters]) => this.applyFilters(events, filters))
  );

  getAllEventsCount(): Observable<number> {
    return combineLatest([
      this.allEvents$,
      this.filters$
    ]).pipe(
      map(([events, filters]: [Event[], DashboardFilters]) => {
        return this.applyFilters(events, filters).length;
      })
    );
  }



  getEvents(page: number = 1, pageSize: number = 9): Observable<Event[]> {
    const userId = this.getUserIdFromStorage();
    if (!userId) {
      console.error('No user ID found in localStorage for fetching events');
      return throwError(() => new Error('No user ID available'));
    }
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Event[]>(`${this.apiUrl}/events`, { params }).pipe(
      tap(allEvents => {
        this.allEventsSubject.next(allEvents);
        const startIndex = (page - 1) * pageSize;
        const paginatedEvents = allEvents.slice(0, startIndex + pageSize);
        this.paginatedEventsSubject.next(paginatedEvents);
      }),
      map(() => this.paginatedEventsSubject.value),
      catchError(error => {
        console.error('Error fetching events by user ID:', error);
        return throwError(() => new Error('Failed to fetch events by user ID'));
      })
    );
  }
  getManagerEvents(page: number = 1, pageSize: number = 9): Observable<Event[]> {
    const  userString = localStorage.getItem('user_data');
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Event[]>(`${this.ApiUrl}/by-user`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching events by user ID:', error);
        return throwError(() => new Error('Failed to fetch events by user ID'));
      })
    );
  }
  loadMoreEvents(page: number, pageSize: number): Observable<Event[]> {
    const allEvents = this.allEventsSubject.value;
    const startIndex = 0;
    const endIndex = page * pageSize;
    const paginatedEvents = allEvents.slice(startIndex, endIndex);
    this.paginatedEventsSubject.next(paginatedEvents);
    return of(paginatedEvents);
  }
}
