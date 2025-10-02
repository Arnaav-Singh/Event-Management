import React, { useEffect, useState, useContext } from 'react';
import Loader from '../../components/Loader';
import { getEvents } from '../../api/eventApi';
import { Link } from 'react-router-dom';
import EventCard from '../../components/EventCard';
import { AuthContext } from '../../context/AuthContext';

const EventList = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const data = await getEvents(token);
				setEvents(data);
			} catch (e) {
				setError(e.message || 'Failed to fetch events');
			}
			setLoading(false);
		};
		fetchEvents();
	}, [token]);

	if (loading) return <Loader />;
	if (error) return <div className="text-red-500">{error}</div>;

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold">Events</h2>
				<Link to="/" className="text-sm text-blue-600">Home</Link>
			</div>
			{events.length === 0 ? (
				<div className="text-gray-500 bg-gray-50 border rounded p-6">No events yet. Check back later.</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{events.map(event => (
						<EventCard key={event._id} event={event} />
					))}
				</div>
			)}
		</div>
	);
};

export default EventList;
