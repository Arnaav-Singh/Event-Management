import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { submitFeedback } from '../../api/feedbackApi';

const FeedbackForm = () => {
	const { token } = useContext(AuthContext);
	const [form, setForm] = useState({ message: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await submitFeedback(form, token);
			setSuccess('Feedback submitted!');
			setForm({ message: '' });
		} catch {
			setError('Failed to submit feedback');
		}
		setLoading(false);
	};

	return (
		<div className="max-w-md mx-auto bg-white p-8 rounded shadow">
			<h2 className="text-2xl font-bold mb-6">Submit Feedback</h2>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<textarea name="message" value={form.message} onChange={handleChange} placeholder="Your feedback..." className="border p-2 rounded" required />
				<button type="submit" className="bg-blue-600 text-white py-2 rounded">Submit</button>
				{loading && <Loader />}
				{error && <div className="text-red-500">{error}</div>}
				{success && <div className="text-green-500">{success}</div>}
			</form>
		</div>
	);
};

export default FeedbackForm;
