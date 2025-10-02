import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import { getEvent } from '../../api/eventApi';
import { useParams } from 'react-router-dom';

const EventDetails = () => {
	const { id } = useParams();
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const data = await getEvent(id);
				setEvent(data);
			} catch {
				setError('Failed to fetch event');
			}
			setLoading(false);
		};
		fetchEvent();
	}, [id]);

	if (loading) return <Loader />;
	if (error) return <div className="text-red-500">{error}</div>;
	if (!event) return null;

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">{event.name}</h2>
			<p>Date: {event.date}</p>
			<p>Location: {event.location}</p>
			<p>Description: {event.description}</p>
		</div>
	);
};

export default EventDetails;
