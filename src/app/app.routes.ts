// app.routes.ts
import { Routes } from '@angular/router';
import { EventViewComponent } from './features/events/event-view/event-view.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },

  // Main app routes (protected)
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent)
      },
      {
        path: 'events/create',
        loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent),
        canActivate: [roleGuard],
        data: { requiredRole: 'event_manager' }
      },
      {
        path: 'events/edit/:id',
        loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent),
        canActivate: [roleGuard],
        data: { requiredRole: 'event_manager' }
      },
      {
        path: 'events/view/:id',
        component: EventViewComponent
      },
      {
        path: 'my-events',
        loadComponent: () => import('./features/events/my-events/my-events.component').then(m => m.MyEventsComponent)
      }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: 'auth/login' }
];
