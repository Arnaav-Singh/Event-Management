import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/eventApi';

const ManageEvents = () => {
	const { token } = useContext(AuthContext);
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({ name: '', date: '', location: '' });
	const [editId, setEditId] = useState(null);
	const [error, setError] = useState('');

	const fetchEvents = async () => {
		setLoading(true);
		try {
			const data = await getEvents();
			setEvents(data);
		} catch {
			setError('Failed to fetch events');
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editId) {
				await updateEvent(editId, form, token);
			} else {
				await createEvent(form, token);
			}
			setForm({ name: '', date: '', location: '' });
			setEditId(null);
			fetchEvents();
		} catch {
			setError('Failed to save event');
		}
	};

	const handleEdit = (event) => {
		setForm({ name: event.name, date: event.date, location: event.location });
		setEditId(event._id);
	};

	const handleDelete = async (id) => {
		try {
			await deleteEvent(id, token);
			fetchEvents();
		} catch {
			setError('Failed to delete event');
		}
	};

	if (loading) return <Loader />;

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Manage Events</h2>
			<form onSubmit={handleSubmit} className="flex gap-2 mb-6">
				<input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
				<input name="date" value={form.date} onChange={handleChange} placeholder="Date" className="border p-2 rounded" required />
				<input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="border p-2 rounded" required />
				<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Create'}</button>
			</form>
			{error && <div className="text-red-500 mb-2">{error}</div>}
			<table className="w-full border">
				<thead>
					<tr className="bg-gray-200">
						<th className="p-2">Name</th>
						<th className="p-2">Date</th>
						<th className="p-2">Location</th>
						<th className="p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{events.map(event => (
						<tr key={event._id} className="border-t">
							<td className="p-2">{event.name}</td>
							<td className="p-2">{event.date}</td>
							<td className="p-2">{event.location}</td>
							<td className="p-2 flex gap-2">
								<button onClick={() => handleEdit(event)} className="bg-yellow-500 px-2 py-1 rounded text-white">Edit</button>
								<button onClick={() => handleDelete(event._id)} className="bg-red-500 px-2 py-1 rounded text-white">Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ManageEvents;
