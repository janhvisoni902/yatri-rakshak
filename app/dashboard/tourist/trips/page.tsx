'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

interface TripDestination {
  name: string;
  arrivalDate?: string;
  departureDate?: string;
  notes?: string;
}

interface TripPlan {
  _id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  destinations: TripDestination[];
}

export default function TripsPage() {
  const { status } = useSession();
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');

  const isAuthed = useMemo(() => status === 'authenticated', [status]);

  useEffect(() => {
    if (!isAuthed) return;
    fetch('/api/trips')
      .then(r => r.json())
      .then(d => setTrips(d.trips || []))
      .catch(() => {});
  }, [isAuthed]);

  const createTrip = async () => {
    if (!title.trim()) return;
    const payload: any = { title, startDate: startDate || undefined, endDate: endDate || undefined };
    if (destination.trim()) {
      payload.destinations = [{ name: destination.trim() }];
    }
    const res = await fetch('/api/trips', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      const { trip } = await res.json();
      setTrips(prev => [trip, ...prev]);
      setTitle(''); setStartDate(''); setEndDate(''); setDestination('');
    }
  };

  const deleteTrip = async (id: string) => {
    const res = await fetch(`/api/trips?id=${id}`, { method: 'DELETE' });
    if (res.ok) setTrips(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Trip Plans</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <input className="border rounded px-3 py-2" placeholder="Trip title" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="border rounded px-3 py-2" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className="border rounded px-3 py-2" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="First destination (optional)" value={destination} onChange={e => setDestination(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={createTrip}>Create Trip</button>
      </div>

      <div className="grid gap-4">
        {trips.map(trip => (
          <div key={trip._id} className="border rounded p-4 flex items-start justify-between">
            <div>
              <div className="font-medium">{trip.title}</div>
              <div className="text-sm text-gray-500">
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—'} → {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '—'}
              </div>
              <div className="text-sm mt-2">Destinations: {trip.destinations?.map(d => d.name).join(', ') || '—'}</div>
            </div>
            <button className="text-red-600" onClick={() => deleteTrip(trip._id)}>Delete</button>
          </div>
        ))}
        {!trips.length && <div className="text-sm text-gray-500">No trips yet. Create your first plan above.</div>}
      </div>
    </div>
  );
}


