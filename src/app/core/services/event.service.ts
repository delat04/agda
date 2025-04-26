// core/services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Event, EventImage } from '../models/event.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // In a real app, this would come from an API
  private events: Event[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      start: new Date(2025, 3, 25, 10, 0),
      end: new Date(2025, 3, 25, 11, 0),
      location: 'Conference Room A',
      draggable: true,
      organizer: 'John Smith',
      contactEmail: 'john@example.com',
      attendees: 5,
      maxAttendees: 10,
      isPublic: true,
      tags: ['team', 'weekly'],
      category: 'Meeting',
      color: '#4285F4',
      thumbnail: 'https://eventologists.co.uk/wp-content/uploads/2023/10/Eventologists-Dancing-through-the-decades-Themed-Event-70s-Entertainer-Hire-1024x683.jpeg',
      images: [
        {
          id: '101',
          url: 'https://eventologists.co.uk/wp-content/uploads/2023/10/Eventologists-Dancing-through-the-decades-Themed-Event-70s-Entertainer-Hire-1024x683.jpeg',
          caption: 'Conference Room A',
          isPrimary: true,
          order: 0
        }
      ],
      createdAt: new Date(2025, 3, 20),
      updatedAt: new Date(2025, 3, 20)
    },
    {
      id: '2',
      title: 'Project Kickoff',
      description: 'Start new project',
      start: new Date(2025, 3, 26, 14, 0),
      end: new Date(2025, 3, 26, 16, 0),
      location: 'Main Hall',
      draggable: true,
      organizer: 'Sarah Jones',
      contactEmail: 'sarah@example.com',
      attendees: 15,
      maxAttendees: 30,
      isPublic: true,
      tags: ['project', 'kickoff', 'important'],
      category: 'Project',
      color: '#0F9D58',
      thumbnail: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/9c/db/d3/the-junction-dancefloor.jpg?w=900&h=500&s=1',
      images: [],
      createdAt: new Date(2025, 3, 22),
      updatedAt: new Date(2025, 3, 22)
    }
  ];

  private eventsSubject = new BehaviorSubject<Event[]>(this.events);

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    // In a real application, this would be an HTTP request
    return this.eventsSubject.asObservable();
  }

  getEvent(id: string | undefined): Observable<Event | undefined> {
    return of(this.events.find(event => event.id === id));
  }

  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    const now = new Date();
    const newEvent = {
      ...event,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    // Ensure images have IDs
    if (newEvent.images) {
      newEvent.images = newEvent.images.map((img, index) => ({
        ...img,
        id: img.id || uuidv4(),
        order: img.order !== undefined ? img.order : index
      }));
    }

    this.events.push(newEvent);
    this.eventsSubject.next([...this.events]);
    return of(newEvent);
  }

  updateEvent(event: Event): Observable<Event> {
    const index = this.events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      // Ensure images have IDs and proper order
      if (event.images) {
        event.images = event.images.map((img, index) => ({
          ...img,
          id: img.id || uuidv4(),
          order: img.order !== undefined ? img.order : index
        }));
      }

      // Update timestamps
      const updatedEvent = {
        ...event,
        updatedAt: new Date()
      };

      this.events[index] = updatedEvent;
      this.eventsSubject.next([...this.events]);
      return of(updatedEvent);
    }
    return of(event);
  }

  deleteEvent(id: string): Observable<boolean> {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events.splice(index, 1);
      this.eventsSubject.next([...this.events]);
      return of(true);
    }
    return of(false);
  }

  updateEventDates(id: string, start: Date, end: Date): Observable<Event | null> {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      // Create a new event object with updated dates
      const updatedEvent = {
        ...this.events[index],
        start: new Date(start),
        end: new Date(end),
        updatedAt: new Date()
      };

      // Replace the old event with the updated one
      this.events[index] = updatedEvent;

      // Notify subscribers about the changes
      this.eventsSubject.next([...this.events]);

      return of(updatedEvent);
    }

    return of(null as any);
  }

  // Filter events by category
  getEventsByCategory(category: string): Observable<Event[]> {
    const filteredEvents = this.events.filter(event =>
      event.category && event.category.toLowerCase() === category.toLowerCase()
    );
    return of(filteredEvents);
  }

  // Search events by tag
  getEventsByTag(tag: string): Observable<Event[]> {
    const filteredEvents = this.events.filter(event =>
      event.tags && event.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    return of(filteredEvents);
  }

  // Get upcoming events
  getUpcomingEvents(limit: number = 5): Observable<Event[]> {
    const now = new Date();
    const upcomingEvents = this.events
      .filter(event => new Date(event.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, limit);

    return of(upcomingEvents);
  }

  getSubscribedEvents() {

  }
}
