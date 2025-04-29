import {inject, Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Event } from '../models/event.model';
import {DashboardFilters} from './dashbord.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:8080/api/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);

  constructor(private http: HttpClient) {
    this.loadInitialEvents();
  }

  private loadInitialEvents(): void {
    this.getAllEvents().subscribe(events => {
      this.eventsSubject.next(events);
    });
  }

  // getEvents(): Observable<Event[]> {
  //   return this.eventsSubject.asObservable();
  // }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API_URL).pipe(
      tap(events => this.eventsSubject.next(events)),
      catchError(this.handleError)
    );
  }

  getEvent(id: string | undefined): Observable<Event | undefined> {
    if (!id) {
      return throwError(() => new Error('Event ID is required'));
    }
    return this.http.get<Event>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    const  userString = localStorage.getItem('user_data');
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    // Merge userId into the event object
    const payload = {
      ...event,
      userId: userId
    };

    return this.http.post<Event>(this.API_URL, payload).pipe(
      tap(newEvent => {
        const currentEvents = this.eventsSubject.value;
        this.eventsSubject.next([...currentEvents, newEvent]);
      }),
      catchError(this.handleError)
    );
  }

  updateEvent(event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/${event.id}`, event).pipe(
      tap(updatedEvent => {
        const currentEvents = this.eventsSubject.value;
        const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          currentEvents[index] = updatedEvent;
          this.eventsSubject.next([...currentEvents]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteEvent(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { observe: 'response' }).pipe(
      map(response => response.status === 204),
      tap(success => {
        if (success) {
          const currentEvents = this.eventsSubject.value.filter(e => e.id !== id);
          this.eventsSubject.next(currentEvents);
        }
      }),
      catchError(this.handleError)
    );
  }

  updateEventDates(id: string, start: Date, end: Date): Observable<Event> {
    return this.http.patch<Event>(`${this.API_URL}/${id}/dates`, { start, end }).pipe(
      tap(updatedEvent => {
        const currentEvents = this.eventsSubject.value;
        const index = currentEvents.findIndex(e => e.id === id);
        if (index !== -1) {
          currentEvents[index] = updatedEvent;
          this.eventsSubject.next([...currentEvents]);
        }
      }),
      catchError(this.handleError)
    );
  }

  getEventsByCategory(category: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/category/${category}`).pipe(
      catchError(this.handleError)
    );
  }

  getEventsByTag(tag: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/tag/${tag}`).pipe(
      catchError(this.handleError)
    );
  }

  getUpcomingEvents(limit: number = 5): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/upcoming?limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400) {
        errorMessage = error.error.message || 'Invalid request';
      } else if (error.status === 404) {
        errorMessage = 'Event not found';
      } else if (error.status === 409) {
        errorMessage = 'Data conflict';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }




  getEvents(): Observable<Event[]> {
    const  userString = localStorage.getItem('user_data');
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Event[]>(`${this.API_URL}/by-user`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching events by user ID:', error);
        return throwError(() => new Error('Failed to fetch events by user ID'));
      })
    );
  }
}
