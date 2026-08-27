import { createFileRoute } from '@tanstack/react-router';
import { AuroraRay, FadeIn, TypewriterText } from '../components/Animations';
import { ImageCarousel } from '../components/ImageCarousel/ImageCarousel';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const images = [
    '/bg-images/pexels-chris-clark-1933184-5804422.jpg',
    '/bg-images/pexels-slimmars-13-197677686-13037412.jpg',
    '/bg-images/pexels-slimmars-13-197677686-28690469.jpg',
  ];

  return (
    <div className="min-h-screen bg-black">
      <section className="relative h-screen w-full overflow-hidden">
        <ImageCarousel images={images} className="h-full" />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="w-full md:w-[80%] flex flex-col items-center gap-6">
              <FadeIn>
                <div className="flex justify-center">
                  <img
                    src="/assets/WhiteLogo.svg"
                    alt="SoundMate Logo"
                    className="w-80 h-80 md:w-96 md:h-96 object-contain drop-shadow-2xl"
                  />
                </div>
              </FadeIn>

              <div className="flex flex-col items-center gap-3">
                <FadeIn delay={1}>
                  <h1 className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
                    Find Your Music Community
                  </h1>
                </FadeIn>

                <FadeIn delay={2}>
                  <p className="text-base md:text-lg text-gray-200 leading-relaxed text-center drop-shadow-lg">
                  <TypewriterText
                    text="Bringing IRL connections to your URL. Swag out twin, and stop sending that Spotify Blend to your talking stage. Instead, you can use our app, it's way cooler <3."
                    delay={1500}
                  />
                </p>
                </FadeIn>
              </div>
            </div>
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
              <AuroraRay variant="warm" intensity="subtle" className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Build Your Taste Profile" delay={2800} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="SoundMate matches you on what you actually listen to, not a bio. Connect Spotify to import your top artists and genres automatically, or add your favorites by hand" delay={3000} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>

            <FadeIn delay={2}>
              <AuroraRay variant="warm" intensity="subtle" className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Discover Matches" delay={3200} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="We compare your top artists and genres against real students at your school and surface a compatibility score, so you find people who already like what you like" delay={3400} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>

            <FadeIn delay={3}>
              <AuroraRay variant="warm" intensity="subtle" className="h-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
                  <div className="w-14 h-14 mb-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <TypewriterText text="Meet Up IRL" delay={3600} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="Turn a match into a hangout. Create or RSVP to concerts, jam sessions, and meetups with people who share your taste" delay={3800} />
                  </p>
                </div>
              </AuroraRay>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
