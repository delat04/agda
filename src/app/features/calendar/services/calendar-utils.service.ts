// features/calendar/services/calendar-utils.service.ts
import { Injectable } from '@angular/core';
import { Event } from '../../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarUtilsService {

  constructor() {}

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  combineDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  getEventTopPosition(event: Event): number {
    const startTime = new Date(event.start);
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    return hours * 64 + (minutes / 60) * 64;
  }

  getEventHeight(event: Event): number {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    return Math.max(durationHours * 64, 24);
  }

  isCurrentTimeSlot(date: Date, slotHour: number): boolean {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    return isToday && now.getHours() === slotHour;
  }

  getCurrentTimePosition(slotHour: number): number {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHour === slotHour) {
      return (currentMinutes / 60) * 64;
    }
    return 0;
  }
}
