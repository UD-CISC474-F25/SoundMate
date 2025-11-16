type ProfileEventItem = {
  id: number;
  title: string;
  date: string;
  location: string;
};

interface EventListProps {
  events: Array<ProfileEventItem>;
  editable?: boolean;
}

export function EventList({ events, editable = false }: EventListProps) {
  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="bg-white/5 border border-white/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">{event.title}</h3>
              <p className="text-gray-400">{event.date}</p>
              <p className="text-gray-500 text-sm">{event.location}</p>
            </div>
            {editable && (
              <div className="flex gap-8">
                <button className="text-white hover:text-gray-300 cursor-pointer">Edit</button>
                <button className="text-red-400 hover:text-red-300 cursor-pointer">Delete</button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
