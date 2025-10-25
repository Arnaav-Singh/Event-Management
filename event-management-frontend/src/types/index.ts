export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'coordinator' | 'student';
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  assigned_coordinator: string;
  qr_code?: string;
  google_form_url?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  student_id: string;
  scanned_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  student_id: string;
  rating: number;
  comments: string;
  created_at: string;
}

export interface AuthUser {
  user: User;
  token: string;
}

// Backend response types
export interface BackendUser {
  _id?: string;
  id?: string;
  userID?: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface BackendEvent {
  _id?: string;
  id?: string;
  eventID?: string;
  title?: string;
  name?: string;
  description?: string;
  date: string;
  location: string;
  coordinators?: string[] | BackendUser[];
  qr_code?: string;
  google_form_url?: string;
  createdAt?: string;
}

export interface BackendFeedback {
  _id?: string;
  id?: string;
  event?: { _id: string };
  event_id?: string;
  user?: { _id: string };
  student_id?: string;
  rating: number;
  comments?: string;
  createdAt?: string;
}

export interface BackendAuthResponse {
  _id?: string;
  id?: string;
  userID?: string;
  name: string;
  email: string;
  role: string;
  token: string;
  createdAt?: string;
}

export interface BackendStatsResponse {
  assignedEvents?: number;
  events?: number;
  attendance?: number;
}