// API service layer that simulates MongoDB REST endpoints
// In production, these would be actual HTTP calls to your MongoDB + Express backend

import { User, Event, Attendance, Feedback, AuthUser, BackendUser, BackendEvent, BackendFeedback, BackendAuthResponse, BackendStatsResponse } from '@/types';

const API_BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5050';

function getAuthToken(): string | null {
	return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		credentials: 'include',
	});
	if (!res.ok) {
		let message = 'Request failed';
		try {
			const data = await res.json();
			message = data?.message || message;
		} catch {
			// Ignore JSON parsing errors
		}
		throw new Error(message);
	}
	// Attempt JSON, allow empty
	try {
		return (await res.json()) as T;
	} catch (_) {
		return undefined as unknown as T;
	}
}

function mapRoleFromBackend(role: string): User['role'] {
	if (role === 'attender') return 'student';
	if (role === 'coordinator') return 'coordinator';
	return 'admin';
}

function mapRoleToBackend(role: User['role']): string {
	if (role === 'student') return 'attender';
	return role;
}

function mapUser(bu: BackendUser): User {
	return {
		id: bu._id || bu.id || bu.userID,
		name: bu.name,
		email: bu.email,
		role: mapRoleFromBackend(bu.role),
		created_at: bu.createdAt || new Date().toISOString(),
	};
}

function mapEvent(be: BackendEvent): Event {
	return {
		id: be._id || be.id || be.eventID,
		title: be.title || be.name,
		description: be.description || '',
		date: be.date,
		location: be.location,
		assigned_coordinator: Array.isArray(be.coordinators) && be.coordinators.length > 0
			? (typeof be.coordinators[0] === 'string' ? be.coordinators[0] : be.coordinators[0]?._id)
			: '',
		qr_code: be.qr_code,
		google_form_url: be.google_form_url,
		created_at: be.createdAt || new Date().toISOString(),
	};
}

class APIService {
	// Authentication
	async login(email: string, password: string): Promise<AuthUser> {
		const data = await http<BackendAuthResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		const user = mapUser(data);
		const token: string = data.token;
		return { user, token };
	}

	async register(userData: { name: string; email: string; password: string; role: 'admin' | 'coordinator' | 'student' }): Promise<AuthUser> {
		const payload = {
			name: userData.name,
			email: userData.email,
			password: userData.password,
			role: mapRoleToBackend(userData.role),
		};
		const data = await http<BackendAuthResponse>('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
		const user = mapUser(data);
		const token: string = data.token;
		return { user, token };
	}

	// Users
	async getUsers(): Promise<User[]> {
		const data = await http<BackendUser[]>('/api/admin/users', { headers: { ...authHeaders() } });
		return data.map(mapUser);
	}

	async getUserById(id: string): Promise<User | null> {
		const users = await this.getUsers();
		return users.find(u => u.id === id) || null;
	}

	async getCoordinators(): Promise<User[]> {
		const users = await this.getUsers();
		return users.filter(u => u.role === 'coordinator');
	}

	// Events
	async getEvents(): Promise<Event[]> {
		const data = await http<BackendEvent[]>('/api/events');
		return data.map(mapEvent);
	}

	async getEventById(id: string): Promise<Event | null> {
		const data = await http<BackendEvent>(`/api/events/${id}`);
		return mapEvent(data);
	}

	async getEventsByCoordinator(coordinatorId: string): Promise<Event[]> {
		const all = await this.getEvents();
		return all.filter(e => e.assigned_coordinator === coordinatorId || false);
	}

	async createEvent(eventData: { title: string; description: string; date: string; location: string; assigned_coordinator: string; google_form_url?: string; }): Promise<Event> {
		// Create event (admin/coordinator required depending on route)
		const created = await http<BackendEvent>('/api/events', {
			method: 'POST',
			headers: { ...authHeaders() },
			body: JSON.stringify({
				name: eventData.title,
				description: eventData.description,
				date: eventData.date,
				location: eventData.location,
				google_form_url: eventData.google_form_url,
			}),
		});
		let ev = mapEvent(created);
		// Assign coordinator if provided
		if (eventData.assigned_coordinator) {
			try {
				const assigned = await http<BackendEvent>(`/api/events/${ev.id}/assign`, {
					method: 'POST',
					headers: { ...authHeaders() },
					body: JSON.stringify({ coordinatorIds: [eventData.assigned_coordinator] }),
				});
				ev = mapEvent(assigned);
			} catch {
			// Ignore JSON parsing errors
		}
		}
		return ev;
	}

	async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
		const payload: Partial<BackendEvent> = {};
		if (updates.title) payload.name = updates.title;
		if (typeof updates.description === 'string') payload.description = updates.description;
		if (updates.date) payload.date = updates.date;
		if (updates.location) payload.location = updates.location;
		const data = await http<BackendEvent>(`/api/events/${id}`, {
			method: 'PUT',
			headers: { ...authHeaders() },
			body: JSON.stringify(payload),
		});
		return mapEvent(data);
	}

	async deleteEvent(id: string): Promise<boolean> {
		await http<void>(`/api/events/${id}`, {
			method: 'DELETE',
			headers: { ...authHeaders() },
		});
		return true;
	}

	// Attendance
	async getEventAttendance(eventId: string): Promise<{ attendance: Attendance[]; attendees: User[] }> {
		const data = await http<BackendUser[]>(`/api/attenders/events/${eventId}/attendance`, { headers: { ...authHeaders() } });
		const attendees = data.map(mapUser);
		return { attendance: [], attendees };
	}

	async getStudentAttendance(_studentId: string): Promise<{ attendance: Attendance[]; events: Event[] }> {
		// Backend provides my events for the authenticated attender
		const data = await http<BackendEvent[]>('/api/attenders/my-events', { headers: { ...authHeaders() } });
		const events = data.map(mapEvent);
		return { attendance: [], events };
	}

	async markAttendance(eventId: string, _studentId: string): Promise<Attendance> {
		await http<void>(`/api/attenders/events/${eventId}/attendance`, {
			method: 'POST',
			headers: { ...authHeaders() },
		});
		return { id: crypto.randomUUID(), event_id: eventId, student_id: 'me', scanned_at: new Date().toISOString() };
	}

	// Feedback
	async getEventFeedback(eventId: string): Promise<Feedback[]> {
		const data = await http<BackendFeedback[]>(`/api/feedback/${eventId}`, { headers: { ...authHeaders() } });
		return (data || []).map((fb: BackendFeedback) => ({
			id: fb._id || fb.id,
			event_id: fb.event?._id || fb.event_id || eventId,
			student_id: fb.user?._id || fb.student_id,
			rating: fb.rating,
			comments: fb.comments || '',
			created_at: fb.createdAt || new Date().toISOString(),
		}));
	}

	async submitFeedback(feedbackData: { event_id: string; student_id: string; rating: number; comments: string; }): Promise<Feedback> {
		const data = await http<BackendFeedback>(`/api/feedback/${feedbackData.event_id}`, {
			method: 'POST',
			headers: { ...authHeaders() },
			body: JSON.stringify({ rating: feedbackData.rating, comments: feedbackData.comments }),
		});
		return {
			id: data._id || data.id,
			event_id: data.event?._id || feedbackData.event_id,
			student_id: data.user?._id || feedbackData.student_id,
			rating: data.rating,
			comments: data.comments || feedbackData.comments,
			created_at: data.createdAt || new Date().toISOString(),
		};
	}

	// QR Code (frontend generates image; backend supports ephemeral code if needed)
	async generateQRCode(eventId: string): Promise<string> {
		// Keep existing behavior: generate URL to attendance route for the app
		const qrCodeUrl = `${window.location.origin}/attendance/${eventId}`;
		return qrCodeUrl;
	}

	// Stats
	async getAdminStats(): Promise<{ totalEvents: number; totalUsers: number; totalCoordinators: number; thisMonthEvents: number; }> {
		const [eventsRaw, usersRaw] = await Promise.all([
			http<BackendEvent[]>('/api/events', { headers: { ...authHeaders() } }),
			http<BackendUser[]>('/api/admin/users', { headers: { ...authHeaders() } }),
		]);
		const events = eventsRaw.map(mapEvent);
		const users = usersRaw.map(mapUser);
		const thisMonth = new Date().getMonth();
		const thisMonthEvents = events.filter(e => new Date(e.date).getMonth() === thisMonth).length;
		const totalCoordinators = users.filter(u => u.role === 'coordinator').length;
		return {
			totalEvents: events.length,
			totalUsers: users.length,
			totalCoordinators,
			thisMonthEvents,
		};
	}

	async getCoordinatorStats(_coordinatorId: string): Promise<{ assignedEvents: number; totalAttendees: number; avgFeedbackRating: number; }> {
		const data = await http<BackendStatsResponse>('/api/events/stats/coordinator/summary', { headers: { ...authHeaders() } });
		// Backend returns { assignedEvents, attendance }
		return {
			assignedEvents: data.assignedEvents ?? data.events ?? 0,
			totalAttendees: data.attendance ?? 0,
			avgFeedbackRating: 0,
		};
	}

	async getStudentStats(_studentId: string): Promise<{ attendedEvents: number; upcomingEvents: number; feedbackGiven: number; }> {
		const [allEvents, myEvents] = await Promise.all([
			this.getEvents(),
			http<BackendEvent[]>('/api/attenders/my-events', { headers: { ...authHeaders() } }),
		]);
		const now = new Date();
		const upcomingEvents = allEvents.filter(e => new Date(e.date) > now).length;
		return {
			attendedEvents: (myEvents || []).length,
			upcomingEvents,
			feedbackGiven: 0,
		};
	}
}

export const apiService = new APIService();