import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import './MyBookingsPage.css';

const OrderCard = ({ order, past }) => {
  const movie = order.screening?.movie;
  const tickets = order.tickets || [];
  const seats = tickets.map((ticket) => ticket.seat?.label).filter(Boolean).join(', ');

  return (
    <div className={`booking-card ${past ? 'past-booking' : ''}`}>
      {movie ? <img src={movie.posterUrl} alt={movie.title} /> : <div className="booking-movie-unavailable">Movie unavailable</div>}
      <div className="booking-details">
        <h3>{movie?.title || 'Movie unavailable'}</h3>
        <p><strong>Booking:</strong> {order.orderNumber}</p>
        <p><strong>Showtime:</strong> {order.screening ? new Date(order.screening.startsAt).toLocaleString() : 'Unavailable'}</p>
        <p><strong>Seats:</strong> {seats || 'Unavailable'}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Paid:</strong> {(order.amount / 100).toFixed(2)} {order.currency}</p>
      </div>
    </div>
  );
};

const MyBookingsPage = () => {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Unable to load orders.');

      const now = new Date();
      setUpcomingOrders(data.filter((order) => order.screening && new Date(order.screening.startsAt) > now));
      setPastOrders(data.filter((order) => !order.screening || new Date(order.screening.startsAt) <= now));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [fetchOrders, token]);

  if (loading) return <p>Loading your tickets...</p>;

  return (
    <div className="bookings-container">
      <h2>My Tickets</h2>
      <h3>Upcoming Shows</h3>
      {upcomingOrders.length === 0 ? <p>You have no upcoming tickets.</p> : (
        <div className="bookings-list">
          {upcomingOrders.map((order) => <OrderCard key={order._id} order={order} />)}
        </div>
      )}

      <h3 style={{ marginTop: '2rem' }}>Booking History</h3>
      {pastOrders.length === 0 ? <p>You have no past tickets.</p> : (
        <div className="bookings-list">
          {pastOrders.map((order) => <OrderCard key={order._id} order={order} past />)}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
