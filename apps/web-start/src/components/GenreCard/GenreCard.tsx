export function GenreCard({ genre }: { genre: string }) {
  return (
    <div className="px-4 py-2 bg-gray-800 rounded-full text-center text-white text-sm">
      {genre}
    </div>
  );
}
