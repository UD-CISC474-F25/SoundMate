import { createFileRoute } from '@tanstack/react-router';
import { AuroraRay, FadeIn, TypewriterText } from '../components/Animations';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                  <TypewriterText text="Find Your Music Community" />
                </h1>
              </FadeIn>

              <FadeIn delay={1}>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  <TypewriterText
                    text="SoundMate connects college students through their shared love of music. Discover friends who vibe with your playlist, find concert buddies, and create unforgettable music experiences together."
                    delay={800}
                  />
                </p>
              </FadeIn>

              <FadeIn delay={2}>
                <button className="relative px-8 py-4 text-lg font-semibold bg-white text-black rounded-full transition-all transform hover:scale-105 shadow-lg">
                  <TypewriterText text="Get Started with Spotify" delay={1600} />
                </button>
              </FadeIn>
            </div>

            <FadeIn delay={1}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/home_page_placeholder.jpeg"
                  alt="People enjoying music together"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl font-bold text-center text-white mb-4">
              <TypewriterText text="How It Works" delay={2000} />
            </h2>
          </FadeIn>

          <FadeIn delay={1}>
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
              <TypewriterText text="Three simple steps to find your music community" delay={2400} />
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={1}>
              <AuroraRay className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Connect Spotify" delay={2800} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="Link your Spotify account to import your top artists and music preferences" delay={3000} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>

            <FadeIn delay={2}>
              <AuroraRay className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Discover Matches" delay={3200} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="Our algorithm finds students at your college with similar music taste" delay={3400} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>

            <FadeIn delay={3}>
              <AuroraRay className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Create Events" delay={3600} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="Plan concerts, jam sessions, and music events with your new friends" delay={3800} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold text-white mb-4">
              <TypewriterText text="Stay in the loop, support the girlies" delay={4200} />
            </h2>
          </FadeIn>

          <FadeIn delay={1}>
            <p className="text-xl text-gray-400 mb-8">
              <TypewriterText text="Join our newsletter for product updates from 3 college students building the soundtrack to your social life" delay={4600} />
            </p>
          </FadeIn>

          <FadeIn delay={2}>
            <button className="px-8 py-4 text-lg font-semibold bg-white text-black rounded-full transition-all transform hover:scale-105 shadow-lg">
              <TypewriterText text="Join the newsletter" delay={5200} />
            </button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
