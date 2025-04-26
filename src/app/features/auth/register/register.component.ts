// features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center text-indigo-600 mb-6">Create Account</h1>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                formControlName="firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter first name"
              />
              <div *ngIf="firstName?.invalid && (firstName?.dirty || firstName?.touched)" class="text-red-500 text-sm mt-1">
                <div *ngIf="firstName?.errors?.['required']">First name is required</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                formControlName="lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter last name"
              />
              <div *ngIf="lastName?.invalid && (lastName?.dirty || lastName?.touched)" class="text-red-500 text-sm mt-1">
                <div *ngIf="lastName?.errors?.['required']">Last name is required</div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
            <div *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="text-red-500 text-sm mt-1">
              <div *ngIf="email?.errors?.['required']">Email is required</div>
              <div *ngIf="email?.errors?.['email']">Email must be valid</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Choose a password"
            />
            <div *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="text-red-500 text-sm mt-1">
              <div *ngIf="password?.errors?.['required']">Password is required</div>
              <div *ngIf="password?.errors?.['minlength']">Password must be at least 8 characters</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Confirm your password"
            />
            <div *ngIf="confirmPassword?.invalid && (confirmPassword?.dirty || confirmPassword?.touched)" class="text-red-500 text-sm mt-1">
              <div *ngIf="confirmPassword?.errors?.['required']">Confirm password is required</div>
            </div>
            <div *ngIf="registerForm.errors?.['passwordMismatch'] && confirmPassword?.dirty" class="text-red-500 text-sm mt-1">
              Passwords do not match
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">I am registering as:</label>
            <div class="flex space-x-4">
              <div class="flex items-center">
                <input
                  type="radio"
                  id="event-seeker"
                  formControlName="role"
                  value="event_seeker"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label for="event-seeker" class="ml-2 block text-sm text-gray-700">Event Seeker</label>
              </div>
              <div class="flex items-center">
                <input
                  type="radio"
                  id="event-manager"
                  formControlName="role"
                  value="event_manager"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label for="event-manager" class="ml-2 block text-sm text-gray-700">Event Manager</label>
              </div>
            </div>
            <div *ngIf="role?.invalid && (role?.dirty || role?.touched)" class="text-red-500 text-sm mt-1">
              <div *ngIf="role?.errors?.['required']">Please select a role</div>
            </div>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="terms"
              formControlName="termsAccepted"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" class="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and
              <a href="#" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
            </label>
          </div>
          <div *ngIf="termsAccepted?.invalid && (termsAccepted?.dirty || termsAccepted?.touched)" class="text-red-500 text-sm mt-1">
            <div *ngIf="termsAccepted?.errors?.['required']">You must accept the terms and conditions</div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span *ngIf="isLoading">Loading...</span>
              <span *ngIf="!isLoading">Register</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a routerLink="/auth/login" class="text-indigo-600 hover:text-indigo-500">Log in</a>
          </p>
        </div>

        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['event_seeker', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // Form controls getters
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }
  get termsAccepted() { return this.registerForm.get('termsAccepted'); }

  // Custom validator for password matching
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      email: this.email?.value,
      password: this.password?.value,
      firstName: this.firstName?.value,
      lastName: this.lastName?.value,
      role: this.role?.value
    };

    this.authService.register(userData)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
