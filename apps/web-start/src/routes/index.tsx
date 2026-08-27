import { createFileRoute } from '@tanstack/react-router';
import { AuroraRay, FadeIn, TypewriterText } from '../components/Animations';
import { ImageCarousel } from '../components/ImageCarousel/ImageCarousel';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const demoScreens = [
  {
    file: 'Login_screen.png',
    alt: 'SoundMate login screen with email and password fields and a Continue with Spotify option',
    title: 'Get in fast',
    description: "Sign up with just an email and password, or connect with Spotify if you're already on the approved list. Either way takes under a minute.",
  },
  {
    file: 'Authorize_spotify.png',
    alt: 'Spotify authorization screen asking to grant SoundMate access',
    title: 'Link Spotify in one tap',
    description: 'Connecting your account is a single authorization screen. We only read your top artists, top tracks, and basic profile info, nothing gets posted on your behalf.',
  },
  {
    file: 'Profile_page.png',
    alt: 'Profile page showing top artists, genres, and events the user is attending',
    title: 'A profile built from what you actually listen to',
    description: 'Your top artists and genres show up automatically, pulled straight from your real listening history, alongside every event you\'re attending.',
  },
  {
    file: 'Discover people with music taste like you.png',
    alt: 'Discover Friends page showing suggested matches with compatibility scores',
    title: 'Find your people',
    description: 'Search for classmates by name or username, or scroll through suggested matches. Every match comes with a compatibility score based on your shared taste.',
  },
  {
    file: 'view a friend profile.png',
    alt: "A friend's profile showing their top artists and an unfriend option",
    title: 'See what makes someone a match',
    description: "Tap into anyone's profile to see their top artists and bio before you connect, so a match is never a mystery.",
  },
  {
    file: 'Event Page.png',
    alt: 'Events page listing upcoming campus music events',
    title: "See what's happening",
    description: "Every event on campus in one feed. Filter to what you're going to, what you're still deciding on, or browse everything.",
  },
  {
    file: 'RSVP to an evemt.png',
    alt: 'Event detail view with RSVP options for going, maybe, or can\'t go',
    title: 'RSVP in one click',
    description: 'Tap into any event to see the details and who else is going, then mark yourself as going, maybe, or can\'t go.',
  },
  {
    file: 'Create an event.png',
    alt: 'Create Event form with fields for title, location, date, and music tag',
    title: 'Host your own',
    description: 'Set a title, location, date, and music tag, then decide whether it\'s open to everyone or invite only.',
  },
  {
    file: 'Edit profile.png',
    alt: 'Edit Profile modal with display name, bio, and social links',
    title: 'Make it yours',
    description: 'Update your bio, add links to your other socials, and choose whether your Spotify profile shows up publicly.',
  },
] as const;

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

      <section className="py-20 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl font-bold text-center text-white mb-4">
              See It In Action
            </h2>
          </FadeIn>

          <FadeIn delay={1}>
            <p className="text-center text-gray-400 mb-20 max-w-2xl mx-auto">
              Don't want to make an account yet? Here's exactly what's inside.
            </p>
          </FadeIn>

          <div className="flex flex-col gap-24">
            {demoScreens.map((screen, i) => (
              <FadeIn key={screen.file} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div
                  className={`flex flex-col ${
                    i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
                  } items-center gap-10 md:gap-14`}
                >
                  <div className="w-full md:w-3/5">
                    <div className="rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-white/5">
                      <img
                        src={`/demo/${encodeURIComponent(screen.file)}`}
                        alt={screen.alt}
                        loading="lazy"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/5">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {screen.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {screen.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
