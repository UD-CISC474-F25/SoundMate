export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gray-400 text-sm text-center">
          Consider{' '}
          <a
            href="https://www.qobuz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 underline transition-colors"
          >
            Qobuz
          </a>{' '}
          as a better and more ethical streaming service. We chose Spotify for this project because it was one of the only available public APIs.
        </p>
      </div>
    </footer>
  );
}
