// core/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-white  shadow-sm px-6 py-4 fixed top-0 left-0 right-0 z-40">
      <div class="//max-w-7xl mx-auto flex items-center justify-between">
        <!-- App Title -->
        <div class="flex items-center">
          <span class="text-xl font-bold text-gray-600">Manage Your Events With Ease</span>
        </div>

        <!-- Navigation Toggle -->
        <div class="flex justify-center">
          <div class="relative inline-flex rounded-lg border-b border-[#a9a9a970] p-1 shadow-sm">
            <a
              routerLink="/calendar"
              routerLinkActive="text-white"
              [routerLinkActiveOptions]="{exact: true}"
              class="relative px-6 py-2 rounded-md font-medium transition-all duration-300 z-10"
              [class.text-gray-600]="!isActive('/calendar')"
              [class.hover:text-gray-800]="!isActive('/calendar')"
            >
              Calendar
            </a>
            <a
              routerLink="/events"
              routerLinkActive="text-white"
              [routerLinkActiveOptions]="{exact: true}"
              class="relative px-6 py-2 rounded-md font-medium transition-all duration-300 z-10"
              [class.text-gray-600]="!isActive('/events')"
              [class.hover:text-gray-800]="!isActive('/events')"
            >
              Events
            </a>

            <!-- Active background slider -->
            <div
              class="absolute top-1 bottom-1 border-b-blue-700 rounded-md bg-blue-600 transition-all duration-300 ease-in-out"
              [class.left-1]="isActive('/calendar')"
              [class.left-[50%]]="isActive('/events')"
            [style.width]="'calc(50% - 0.5rem)'"
            ></div>
        </div>
        </div>
      </div>
    </nav>

    <!-- Spacer to prevent content from hiding under the fixed navbar -->
    <div class="h-16"></div>
  `,
  styles: [`
    @media (max-width: 640px) {
      .relative.inline-flex {
        width: 99%;
        justify-content: center;
      }
    }
  `]
})
export class NavbarComponent {
  isActive(route: string): boolean {
    return window.location.pathname === route;
  }
}
