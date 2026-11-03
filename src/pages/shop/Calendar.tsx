// src/pages/shop/Calendar.tsx
import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';

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

const typeColors: Record<Event['type'], string> = {
  Wedding: 'bg-rose-100 text-rose-700',
  Birthday: 'bg-blue-100 text-blue-700',
  Graduation: 'bg-purple-100 text-purple-700',
  Corporate: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<Event['status'], string> = {
  Scheduled: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** YYYY-MM-DD for a given year + 0-based month + 1-based day. */
const toISO = (year: number, monthIndex: number, day: number): string =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** Number of days in the given month (handles leap years). */
const daysInMonth = (year: number, monthIndex: number): number =>
  new Date(year, monthIndex + 1, 0).getDate();

/** Weekday (0=Sun … 6=Sat) of the 1st of the month. */
const firstWeekdayOfMonth = (year: number, monthIndex: number): number =>
  new Date(year, monthIndex, 1).getDay();

const ShopCalendar: React.FC = () => {
  // Start on July 2026 — matches the seeded events.
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(6); // 0-based; 6 = July
  const [selectedDate, setSelectedDate] = useState('2026-07-25');

  const currentMonthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  /* Days to render: leading blanks for weekday alignment + real days. */
  const cells = useMemo(() => {
    const leading = firstWeekdayOfMonth(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);

    const blanks: Array<{ key: string; blank: true }> = Array.from(
      { length: leading },
      (_, i) => ({ key: `blank-${i}`, blank: true as const })
    );

    const days: Array<{ key: string; blank: false; day: number; iso: string }> =
      Array.from({ length: total }, (_, i) => {
        const day = i + 1;
        return {
          key: `day-${day}`,
          blank: false as const,
          day,
          iso: toISO(viewYear, viewMonth, day),
        };
      });

    return [...blanks, ...days];
  }, [viewYear, viewMonth]);

  /* Which ISO dates have events (for the dot). */
  const eventDates = useMemo(
    () => new Set(eventsData.map((e) => e.date)),
    []
  );

  /* Events for the selected day. */
  const selectedEvents = useMemo(
    () => eventsData.filter((e) => e.date === selectedDate),
    [selectedDate]
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    setSelectedDate(toISO(y, m, d));
  };

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
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <h3 className="font-semibold text-gray-800">{currentMonthLabel}</h3>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Today
          </button>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500 border-b border-amber-100/30"
            >
              {day}
            </div>
          ))}

          {cells.map((cell) => {
            if (cell.blank) {
              return (
                <div
                  key={cell.key}
                  className="p-2 border-b border-r border-amber-100/30"
                />
              );
            }

            const hasEvent = eventDates.has(cell.iso);
            const isSelected = selectedDate === cell.iso;

            return (
              <div
                key={cell.key}
                onClick={() => setSelectedDate(cell.iso)}
                className={`p-2 text-center border-b border-r border-amber-100/30 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-50' : 'hover:bg-amber-50/30'
                }`}
              >
                <span
                  className={`text-sm ${
                    isSelected ? 'font-bold text-amber-600' : 'text-gray-600'
                  }`}
                >
                  {cell.day}
                </span>
                {hasEvent && (
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">
          Events for {selectedDate}
        </h3>

        {selectedEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 text-center text-gray-500">
            No events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800">
                        {event.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type]}`}
                      >
                        {event.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status]}`}
                      >
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
        )}
      </div>
    </div>
  );
};

export default ShopCalendar;