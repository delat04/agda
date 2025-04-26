// features/calendar/services/calendar-state.service.ts
import { Injectable } from '@angular/core';
import { Event } from '../../../core/models/event.model';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  id: string;
  isToday: boolean;
}

export interface WeekViewDay {
  date: Date;
  dayName: string;
  isToday: boolean;
  id: string;
  events: Event[];
}

export interface WeekHourSlot {
  hour: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {
  calendarDays: CalendarDay[] = [];
  weekViewDays: WeekViewDay[] = [];
  hourSlots: WeekHourSlot[] = [];
  weekStartDate: Date = new Date();
  weekEndDate: Date = new Date();
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor() {
    this.initializeHourSlots();
  }

  updateCalendarData(currentDate: Date, viewMode: 'month' | 'week', events: Event[]): void {
    if (viewMode === 'month') {
      this.generateCalendarDays(currentDate, events);
    } else {
      this.generateWeekViewDays(currentDate, events);
    }
  }

  getConnectedLists(viewMode: 'month' | 'week'): string[] {
    if (viewMode === 'month') {
      return this.calendarDays.map(day => day.id);
    } else {
      return this.weekViewDays.map(day => day.id);
    }
  }

  private initializeHourSlots(): void {
    this.hourSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const displayHour = hour === 0 ? '12 AM' :
        hour < 12 ? `${hour} AM` :
          hour === 12 ? '12 PM' :
            `${hour - 12} PM`;
      this.hourSlots.push({ hour, label: displayHour });
    }
  }

  private generateCalendarDays(currentDate: Date, events: Event[]): void {
    this.calendarDays = [];
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysFromPrevMonth = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - daysFromPrevMonth);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear();
      }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      const dayId = `day-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      this.calendarDays.push({
        date,
        isCurrentMonth,
        events: dayEvents,
        id: dayId,
        isToday
      });
    }
  }

  private generateWeekViewDays(currentDate: Date, events: Event[]): void {
    this.weekViewDays = [];
    const today = new Date();

    const currentDay = currentDate.getDay();
    this.weekStartDate = new Date(currentDate);
    this.weekStartDate.setDate(currentDate.getDate() - currentDay);

    this.weekEndDate = new Date(this.weekStartDate);
    this.weekEndDate.setDate(this.weekStartDate.getDate() + 6);

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStartDate);
      date.setDate(this.weekStartDate.getDate() + i);

      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dayName = this.weekDays[i].slice(0, 3);

      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear();
      }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      const dayId = `week-day-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      this.weekViewDays.push({
        date,
        dayName,
        isToday,
        id: dayId,
        events: dayEvents
      });
    }
  }
}
