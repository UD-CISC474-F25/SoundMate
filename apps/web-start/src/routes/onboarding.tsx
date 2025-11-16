import { createFileRoute } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { useApiMutation, useApiClient } from '../integrations/api';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

type FormInputProps = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
};

function FormInput({ id, label, type, required, value, onChange, placeholder, maxLength }: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-2">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}

type FormTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows: number;
};

function FormTextarea({ id, label, value, onChange, placeholder, maxLength, rows }: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none transition-all"
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <p className="text-xs text-gray-400 mt-1">{value.length}/{maxLength} characters</p>
    </div>
  );
}

function OnboardingPage() {
  const { user } = useAuth0();
  const { request } = useApiClient();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: '',
    displayName: user?.name || '',
    bio: '',
  });

  const completeOnboarding = useApiMutation({
    path: '/auth/onboarding',
    method: 'POST',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await completeOnboarding.mutateAsync(formData);

      const { authUrl } = await request<{ authUrl: string }>('/auth/spotify/auth-url');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to SoundMate!</h1>
        <p className="text-gray-300 mb-6">Let's set up your profile</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            id="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            placeholder="your.email@example.com"
          />

          <FormInput
            id="username"
            label="Username"
            type="text"
            required
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            placeholder="Choose a unique username"
          />

          <FormInput
            id="displayName"
            label="Display Name"
            type="text"
            required
            value={formData.displayName}
            onChange={(value) => setFormData({ ...formData, displayName: value })}
            placeholder="How should we call you?"
          />

          <FormTextarea
            id="bio"
            label="Bio (Optional)"
            value={formData.bio}
            onChange={(value) => setFormData({ ...formData, bio: value })}
            placeholder="Tell us about yourself and your music taste..."
            maxLength={500}
            rows={4}
          />

          <button
            type="submit"
            disabled={completeOnboarding.isPending}
            className="w-full py-3 px-6 bg-white text-black font-semibold rounded-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {completeOnboarding.isPending ? 'Saving...' : 'Complete Setup'}
          </button>

          {completeOnboarding.isError && (
            <p className="text-red-400 text-sm text-center">
              Failed to complete onboarding. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
