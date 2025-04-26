//path: src/app/core/models/event.model.ts
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
  thumbnail?: string; // Main image URL for card displays
  attendees?: number;
  maxAttendees?: number;
  isPublic?: boolean;
  tags?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EventImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
}
