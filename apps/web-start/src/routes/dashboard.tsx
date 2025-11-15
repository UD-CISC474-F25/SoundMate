import { createFileRoute } from '@tanstack/react-router';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isCheckingOnboarding } = useOnboardingRedirect();

  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <div className="text-white p-8">Hello "/dashboard"!</div>;
}
