import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
        {event.tag && (
          <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">{event.tag}</span>
        )}
      </div>
      <div className="text-sm text-gray-500">
        <span>{event.date}</span>
        {event.location && <span> • {event.location}</span>}
      </div>
      {event.description && (
        <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
      )}
      <div className="mt-2">
        <Link
          to={`/events/${event._id}`}
          className="inline-block text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
        >
          View details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;



