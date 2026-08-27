import { Mail, ArrowRight, Music } from 'lucide-react';
import { Modal } from '../Modal/Modal';

const CONTACT_EMAIL = 'dustintr4n@gmail.com';
const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'SoundMate — add me to the Spotify allowlist'
)}&body=${encodeURIComponent(
  "Hey Dustin, I'd like to try SoundMate with my real Spotify account.\n\nHere's the email on my Spotify account:\n"
)}`;

interface SpotifyGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Real Spotify OAuth login — unchanged existing flow. */
  onContinueWithSpotify: () => void;
  /** Spotify-free signup so anyone can demo the app immediately. */
  onContinueWithoutSpotify: () => void;
}

export function SpotifyGateModal({
  isOpen,
  onClose,
  onContinueWithSpotify,
  onContinueWithoutSpotify,
}: SpotifyGateModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Before you connect Spotify" maxWidth="md">
      <div className="space-y-5 text-gray-300">
        <p className="text-sm leading-relaxed">
          SoundMate's Spotify login is still in developer mode, so Spotify only
          lets me manually approve a handful of accounts. If you haven't
          emailed me yet, log in with Spotify won't work.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Haven't contacted me yet?</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                Email me the address on your Spotify account and I'll approve it,
                usually within a day.
              </p>
              <a
                href={MAILTO_HREF}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300 transition-colors cursor-pointer"
              >
                Email {CONTACT_EMAIL}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onContinueWithSpotify}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-white text-black font-semibold text-sm rounded-full hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            <Music size={16} className="shrink-0" />
            I'm approved — Continue with Spotify
          </button>

          <button
            onClick={onContinueWithoutSpotify}
            className="w-full flex flex-col items-center gap-0.5 py-2.5 px-6 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer"
          >
            <span>Continue without Spotify</span>
          </button>
          <p className="text-xs text-center text-gray-500">
            Explore every feature — events, profiles, connections — right away.
            Add your own taste profile in under a minute to unlock matching too.
          </p>
          <p className="text-xs text-center text-gray-500">
            Already made an account this way? Use the "Log in" link on the next
            screen instead of signing up again.
          </p>
        </div>
      </div>
    </Modal>
  );
}
