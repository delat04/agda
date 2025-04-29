import {UUIDTypes} from 'uuid';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  location?: string;
  allDay?: boolean;
  draggable?: boolean;
  color?: string;
  category?: string;
  organizer?: string;
  contactEmail?: string;
  images?: EventImage[];
  thumbnail?: string;
  attendees?: number;
  maxAttendees?: number;
  isPublic?: boolean;
  tags?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  userId?: string;
}

export interface EventImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
}
