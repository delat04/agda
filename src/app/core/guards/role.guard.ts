// core/guards/role.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['requiredRole'];

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
