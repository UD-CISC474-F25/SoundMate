export function GenreCard({ genre }: { genre: string }) {
  return (
     <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:border-white/70 hover:from-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105 cursor-pointer group text-center">
      {genre}
    </div>
  );
}
