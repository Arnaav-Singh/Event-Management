export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coordinator' | 'student';
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