import { createFileRoute } from '@tanstack/react-router';
import { AuroraRay, FadeIn, TypewriterText } from '../components/Animations';
import { VideoCarousel } from '../components/VideoCarousel/VideoCarousel';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const videos = [
    '/videos/14994578-uhd_3840_2160_25fps.mp4',
    '/videos/19149712-uhd_3840_2160_60fps.mp4',
    '/videos/19807699-uhd_3840_2024_25fps.mp4',
    '/videos/5788982-hd_1920_1080_25fps.mp4',
    '/videos/7064870-uhd_3840_2160_30fps.mp4',
    '/videos/9733929-uhd_4096_2160_30fps.mp4',
  ];

  return (
    <div className="min-h-screen bg-black">
      <section className="relative h-screen w-full overflow-hidden">
        <VideoCarousel videos={videos} className="h-full" />

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
                    <TypewriterText text="Connect Spotify" delay={2800} />
                  </h3>
                  <p className="text-gray-400">
                    <TypewriterText text="Link your Spotify account to import your top artists and music preferences" delay={3000} />
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
                    <TypewriterText text="Our algorithm finds students at your college with similar music taste" delay={3400} />
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
              <TypewriterText text="We are a group of 3 developers! Connect with us and give us some feedbacks!" delay={4600} />
            </p>
          </FadeIn>

          <FadeIn delay={2}>
            <a
              href="mailto:dustintr@udel.edu,vniko@udel.edu,gscoz@udel.edu?subject=Newsletter Signup&body=Just wanted to say hi!"
              className="px-8 py-4 text-lg font-semibold bg-white text-black rounded-full transition-all transform hover:scale-105 shadow-lg cursor-pointer inline-block"
            >
              <TypewriterText text="Say hi to us!" delay={5200} />
            </a>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
