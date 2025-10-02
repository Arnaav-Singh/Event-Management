
import React from "react";

const stats = [
  { icon: "📅", count: 3, label: "Assigned Events", color: "bg-mit-maroon text-mit-gold" },
  { icon: "👥", count: 2, label: "Total Attendees", color: "bg-mit-gold text-mit-maroon" },
  { icon: "⭐", count: 5, label: "Avg Rating", color: "bg-mit-black text-mit-gold" },
];

const events = [
  {
    name: "Tech Symposium 2024",
    desc: "Annual technology symposium featuring industry experts and innovative projects.",
    date: "Fri, Mar 15, 2024, 03:30 PM",
    location: "Main Auditorium",
    isPast: true,
  },
  {
    name: "Career Fair",
    desc: "Connect with top employers and explore career opportunities.",
    date: "Wed, Mar 20, 2024, 02:30 PM",
    location: "Student Center",
    isPast: true,
  },
];

const AttenderDashboard = () => (
  <div className="max-w-5xl mx-auto py-10 px-4">
    <div className="bg-mit-gold text-mit-maroon font-bold rounded-lg p-3 mb-6 shadow">Attender Dashboard rendered</div>
    <h1 className="text-3xl font-bold text-mit-maroon mb-2">Welcome, Attender!</h1>
    <p className="text-lg text-mit-black mb-8">Here are your assigned events and stats.</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {stats.map((s, i) => (
        <div key={i} className={`rounded-xl shadow-lg p-6 flex flex-col items-center ${s.color}`}>
          <span className="text-4xl mb-2">{s.icon}</span>
          <span className="text-2xl font-bold">{s.count}</span>
          <span className="text-base mt-1">{s.label}</span>
        </div>
      ))}
    </div>

    <div className="bg-mit-white rounded-xl shadow-lg p-8 border border-mit-gold">
      <h2 className="text-xl font-bold text-mit-maroon mb-6">Your Assigned Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((ev, i) => (
          <div key={i} className="bg-mit-gold/10 border border-mit-gold rounded-lg p-6 flex flex-col justify-between shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-mit-maroon text-lg">{ev.name}</span>
              {ev.isPast && <span className="bg-mit-maroon text-mit-gold px-3 py-1 rounded-full text-xs font-semibold">Past</span>}
            </div>
            <p className="text-mit-black mb-3">{ev.desc}</p>
            <div className="flex gap-4 text-mit-black mb-4">
              <span className="flex items-center gap-1"><span role="img" aria-label="calendar">📅</span> {ev.date}</span>
              <span className="flex items-center gap-1"><span role="img" aria-label="location">📍</span> {ev.location}</span>
            </div>
            <div className="flex gap-3 mt-auto">
              <button className="bg-mit-maroon text-mit-gold px-4 py-2 rounded hover:bg-mit-gold hover:text-mit-maroon transition font-semibold">View Details</button>
              <button className="bg-mit-gold text-mit-maroon px-4 py-2 rounded hover:bg-mit-maroon hover:text-mit-gold transition font-semibold">QR Code</button>
              <button className="bg-mit-black text-mit-gold px-4 py-2 rounded hover:bg-mit-gold hover:text-mit-black transition font-semibold">Attendance</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AttenderDashboard;
