// core/layout/header/header.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="bg-white shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-indigo-600">Agda Platform</h1>

            <nav class="hidden md:flex space-x-6">
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
          </div>

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
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
