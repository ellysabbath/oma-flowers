// src/pages/shop/Calendar.tsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'Wedding' | 'Birthday' | 'Graduation' | 'Corporate' | 'Other';
  location: string;
  client: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

const eventsData: Event[] = [
  { id: 1, title: 'Wedding Ceremony', date: '2026-07-25', time: '10:00 AM', type: 'Wedding', location: 'Dar es Salaam', client: 'Jane Smith', status: 'Scheduled' },
  { id: 2, title: 'Birthday Party', date: '2026-07-26', time: '2:00 PM', type: 'Birthday', location: 'Arusha', client: 'John Doe', status: 'Scheduled' },
  { id: 3, title: 'Graduation Ceremony', date: '2026-07-27', time: '9:00 AM', type: 'Graduation', location: 'Mwanza', client: 'Mary Johnson', status: 'In Progress' },
  { id: 4, title: 'Corporate Event', date: '2026-07-28', time: '11:00 AM', type: 'Corporate', location: 'Dar es Salaam', client: 'ABC Company', status: 'Completed' },
  { id: 5, title: 'Wedding Reception', date: '2026-07-29', time: '5:00 PM', type: 'Wedding', location: 'Kilimanjaro', client: 'Peter Wilson', status: 'Scheduled' },
];

const typeColors = {
  'Wedding': 'bg-rose-100 text-rose-700',
  'Birthday': 'bg-blue-100 text-blue-700',
  'Graduation': 'bg-purple-100 text-purple-700',
  'Corporate': 'bg-green-100 text-green-700',
  'Other': 'bg-gray-100 text-gray-700'
};

const statusColors = {
  'Scheduled': 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
};

const ShopCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('July 2026');
  const [selectedDate, setSelectedDate] = useState('2026-07-25');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event Calendar</h1>
          <p className="text-gray-500">Manage shop events and appointments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium">
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-amber-100/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors">
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <h3 className="font-semibold text-gray-800">{currentMonth}</h3>
            <button className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors">
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            Today
          </button>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b border-amber-100/30">
              {day}
            </div>
          ))}
          {dates.map((date) => {
            const hasEvent = eventsData.some(e => new Date(e.date).getDate() === date);
            const isSelected = selectedDate === `2026-07-${String(date).padStart(2, '0')}`;
            return (
              <div 
                key={date} 
                className={`p-2 text-center border-b border-r border-amber-100/30 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-50' : 'hover:bg-amber-50/30'
                }`}
                onClick={() => setSelectedDate(`2026-07-${String(date).padStart(2, '0')}`)}
              >
                <span className={`text-sm ${isSelected ? 'font-bold text-amber-600' : 'text-gray-600'}`}>
                  {date}
                </span>
                {hasEvent && (
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Events for {selectedDate}</h3>
        <div className="space-y-3">
          {eventsData
            .filter(e => e.date === selectedDate)
            .map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                        {event.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event.client}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
                      Manage
                    </button>
                    <button className="px-4 py-1.5 border border-amber-200 text-amber-600 text-sm rounded-lg hover:bg-amber-50 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ShopCalendar;