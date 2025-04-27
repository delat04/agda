import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { animate, style, transition, trigger, state } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleUp', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('150ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
      ])
    ]),
    trigger('menuItem', [
      state('active', style({
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        transform: 'translateX(0)'
      })),
      state('inactive', style({
        backgroundColor: 'transparent',
        color: '#4B5563',
        transform: 'translateX(0)'
      })),
      transition('inactive => active', [
        style({ transform: 'translateX(-20px)', backgroundColor: 'transparent' }),
        animate('200ms ease-out')
      ])
    ])
  ],
  template: `
    <header class="bg-white shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-indigo-600">Agda Platform</h1>
          </div>

          <!-- Mobile menu button -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden flex items-center p-2 rounded-md text-gray-600 hover:text-indigo-500 focus:outline-none"
            aria-label="Toggle menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              [class.hidden]="isMenuOpen()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              [class.hidden]="!isMenuOpen()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <nav class="flex space-x-6">
              <a routerLink="/dashboard" routerLinkActive="text-indigo-600 font-medium"
                 class="text-gray-600 hover:text-indigo-500">Dashboard</a>

              <a routerLink="/calendar" routerLinkActive="text-indigo-600 font-medium"
                 class="text-gray-600 hover:text-indigo-500">Calendar</a>
              <ng-container *ngIf="authService.hasRole('event_manager')">
                <a routerLink="/events" routerLinkActive="text-indigo-600 font-medium"
                   class="text-gray-600 hover:text-indigo-500">Events</a>
              </ng-container>
              <ng-container *ngIf="authService.hasRole('event_manager')">
                <a routerLink="/events/create" routerLinkActive="text-indigo-600 font-medium"
                   class="text-gray-600 hover:text-indigo-500">Create Event</a>
              </ng-container>

              <ng-container *ngIf="authService.hasRole('event_seeker')">
                <a routerLink="/my-events" routerLinkActive="text-indigo-600 font-medium"
                   class="text-gray-600 hover:text-indigo-500">My Events</a>
              </ng-container>
            </nav>

            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-700">
                Welcome, {{ (currentUser$ | async)?.firstName || 'User' }}
              </div>
              <button (click)="logout()"
                      class="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500">
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu overlay -->
        <div *ngIf="isMenuOpen()" @fadeInOut class="md:hidden fixed inset-0 bg-[#483d8b3b] bg-opacity-30 z-10"></div>

        <!-- Mobile menu - popup style -->
        <div
          *ngIf="isMenuOpen()"
          @scaleUp
          class="md:hidden fixed left-4 right-4 top-20 z-20 bg-white rounded-xl shadow-xl py-3 border border-gray-100 overflow-hidden">

          <!-- Mobile menu header -->
          <div class="px-4 py-2 bg-indigo-50 flex items-center justify-between border-b border-indigo-100">
            <h3 class="text-sm font-medium text-indigo-700">Navigation Menu</h3>
            <button (click)="toggleMobileMenu()" class="text-indigo-500 hover:text-indigo-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Menu items -->
          <nav class="flex flex-col space-y-1 px-2 py-2">
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
               (mouseenter)="setActiveMenuItem('dashboard')"
               [@menuItem]="activeMenuItem === 'dashboard' ? 'active' : 'inactive'"
               (click)="navigateTo('/dashboard')"
               class="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>

            <a routerLink="/calendar" routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
               (mouseenter)="setActiveMenuItem('calendar')"
               [@menuItem]="activeMenuItem === 'calendar' ? 'active' : 'inactive'"
               (click)="navigateTo('/calendar')"
               class="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </a>

            <ng-container *ngIf="authService.hasRole('event_manager')">
              <a routerLink="/events" routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
                 (mouseenter)="setActiveMenuItem('events')"
                 [@menuItem]="activeMenuItem === 'events' ? 'active' : 'inactive'"
                 (click)="navigateTo('/events')"
                 class="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Events
              </a>
            </ng-container>

            <ng-container *ngIf="authService.hasRole('event_manager')">
              <a routerLink="/events/create" routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
                 (mouseenter)="setActiveMenuItem('create-event')"
                 [@menuItem]="activeMenuItem === 'create-event' ? 'active' : 'inactive'"
                 (click)="navigateTo('/events/create')"
                 class="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Event
              </a>
            </ng-container>

            <ng-container *ngIf="authService.hasRole('event_seeker')">
              <a routerLink="/my-events" routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
                 (mouseenter)="setActiveMenuItem('my-events')"
                 [@menuItem]="activeMenuItem === 'my-events' ? 'active' : 'inactive'"
                 (click)="navigateTo('/my-events')"
                 class="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                My Events
              </a>
            </ng-container>
          </nav>

          <!-- User section -->
          <div class="mt-2 px-4 pt-3 pb-3 border-t border-gray-100 bg-gray-50">
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                {{ (currentUser$ | async)?.firstName?.charAt(0) || 'U' }}
              </div>
              <div class="text-sm font-medium text-gray-700">
                {{ (currentUser$ | async)?.firstName || 'User' }}
              </div>
            </div>
            <button (click)="logout()"
                    class="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;
  private mobileMenuOpen = signal(false);
  activeMenuItem = '';

  isMenuOpen(): boolean {
    return this.mobileMenuOpen();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
    if (!this.mobileMenuOpen()) {
      this.activeMenuItem = '';
    }
  }

  setActiveMenuItem(item: string): void {
    this.activeMenuItem = item;
  }

  navigateTo(route: string): void {
    // Close menu after a short delay to allow animation to complete
    setTimeout(() => {
      this.toggleMobileMenu();
    }, 150);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
