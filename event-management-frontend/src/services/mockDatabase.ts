// Mock MongoDB-like database service using localStorage
// This simulates what your MongoDB + Express API would provide

import { User, Event, Attendance, Feedback } from '@/types';

class MockDatabase {
  private getCollection<T>(collectionName: string): T[] {
    const data = localStorage.getItem(`mongodb_${collectionName}`);
    return data ? JSON.parse(data) : [];
  }

  private saveCollection<T>(collectionName: string, data: T[]): void {
    localStorage.setItem(`mongodb_${collectionName}`, JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Users Collection (equivalent to MongoDB users collection)
  async getUsers(): Promise<User[]> {
    return this.getCollection<User>('users');
  }

  async getUserById(id: string): Promise<User | null> {
    const users = this.getCollection<User>('users');
    return users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getCollection<User>('users');
    return users.find(user => user.email === email) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const users = this.getCollection<User>('users');
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    this.saveCollection('users', users);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = this.getCollection<User>('users');
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveCollection('users', users);
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = this.getCollection<User>('users');
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) return false;
    
    this.saveCollection('users', filteredUsers);
    return true;
  }

  // Events Collection (equivalent to MongoDB events collection)
  async getEvents(): Promise<Event[]> {
    return this.getCollection<Event>('events');
  }

  async getEventById(id: string): Promise<Event | null> {
    const events = this.getCollection<Event>('events');
    return events.find(event => event.id === id) || null;
  }

  async getEventsByCoordinator(coordinatorId: string): Promise<Event[]> {
    const events = this.getCollection<Event>('events');
    return events.filter(event => event.assigned_coordinator === coordinatorId);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    const events = this.getCollection<Event>('events');
    const newEvent: Event = {
      ...eventData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    this.saveCollection('events', events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const events = this.getCollection<Event>('events');
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return null;
    
    events[index] = { ...events[index], ...updates };
    this.saveCollection('events', events);
    return events[index];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const events = this.getCollection<Event>('events');
    const filteredEvents = events.filter(event => event.id !== id);
    if (filteredEvents.length === events.length) return false;
    
    this.saveCollection('events', filteredEvents);
    return true;
  }

  // Attendance Collection (equivalent to MongoDB attendance collection)
  async getAttendance(): Promise<Attendance[]> {
    return this.getCollection<Attendance>('attendance');
  }

  async getAttendanceByEvent(eventId: string): Promise<Attendance[]> {
    const attendance = this.getCollection<Attendance>('attendance');
    return attendance.filter(record => record.event_id === eventId);
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    const attendance = this.getCollection<Attendance>('attendance');
    return attendance.filter(record => record.student_id === studentId);
  }

  async markAttendance(eventId: string, studentId: string): Promise<Attendance> {
    const attendance = this.getCollection<Attendance>('attendance');
    
    // Check if already marked
    const existing = attendance.find(
      record => record.event_id === eventId && record.student_id === studentId
    );
    if (existing) {
      throw new Error('Attendance already marked for this event');
    }

    const newAttendance: Attendance = {
      id: this.generateId(),
      event_id: eventId,
      student_id: studentId,
      scanned_at: new Date().toISOString()
    };
    
    attendance.push(newAttendance);
    this.saveCollection('attendance', attendance);
    return newAttendance;
  }

  // Feedback Collection (equivalent to MongoDB feedback collection)
  async getFeedback(): Promise<Feedback[]> {
    return this.getCollection<Feedback>('feedback');
  }

  async getFeedbackByEvent(eventId: string): Promise<Feedback[]> {
    const feedback = this.getCollection<Feedback>('feedback');
    return feedback.filter(fb => fb.event_id === eventId);
  }

  async getFeedbackByStudent(studentId: string): Promise<Feedback[]> {
    const feedback = this.getCollection<Feedback>('feedback');
    return feedback.filter(fb => fb.student_id === studentId);
  }

  async createFeedback(feedbackData: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const feedback = this.getCollection<Feedback>('feedback');
    const newFeedback: Feedback = {
      ...feedbackData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    feedback.push(newFeedback);
    this.saveCollection('feedback', feedback);
    return newFeedback;
  }

  // Initialize with seed data (equivalent to MongoDB seed script)
  async initializeDatabase(): Promise<void> {
    const users = this.getCollection<User>('users');
    if (users.length === 0) {
      // Seed users
      const seedUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'John Coordinator',
          email: 'coord@test.com',
          role: 'coordinator',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Alice Student', 
          email: 'student1@test.com',
          role: 'student',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Bob Student',
          email: 'student2@test.com', 
          role: 'student',
          created_at: new Date().toISOString()
        }
      ];
      this.saveCollection('users', seedUsers);

      // Seed events
      const seedEvents: Event[] = [
        {
          id: 'event-1',
          title: 'Tech Symposium 2024',
          description: 'Annual technology symposium featuring industry experts and innovative projects.',
          date: '2024-03-15T10:00:00Z',
          location: 'Main Auditorium', 
          assigned_coordinator: '2',
          qr_code: 'tech-symposium-2024-qr',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'event-2',
          title: 'Career Fair',
          description: 'Connect with top employers and explore career opportunities.',
          date: '2024-03-20T09:00:00Z',
          location: 'Student Center',
          assigned_coordinator: '2', 
          qr_code: 'career-fair-2024-qr',
          created_at: '2024-01-20T00:00:00Z'
        },
        {
          id: 'event-3',
          title: 'Workshop: React Development',
          description: 'Learn modern React development techniques.',
          date: '2024-02-15T14:00:00Z',
          location: 'Computer Lab 1',
          assigned_coordinator: '2',
          qr_code: 'react-workshop-qr',
          created_at: '2024-02-01T00:00:00Z'
        }
      ];
      this.saveCollection('events', seedEvents);

      // Seed some attendance records
      const seedAttendance: Attendance[] = [
        {
          id: 'att-1',
          event_id: 'event-3',
          student_id: '3',
          scanned_at: '2024-02-15T14:15:00Z'
        },
        {
          id: 'att-2', 
          event_id: 'event-3',
          student_id: '4',
          scanned_at: '2024-02-15T14:20:00Z'
        }
      ];
      this.saveCollection('attendance', seedAttendance);

      // Seed some feedback
      const seedFeedback: Feedback[] = [
        {
          id: 'fb-1',
          event_id: 'event-3',
          student_id: '3',
          rating: 5,
          comments: 'Excellent workshop! Learned a lot about React hooks.',
          created_at: '2024-02-15T16:00:00Z'
        }
      ];
      this.saveCollection('feedback', seedFeedback);
    }
  }
}

// Export singleton instance (equivalent to MongoDB connection)
export const mockDB = new MockDatabase();