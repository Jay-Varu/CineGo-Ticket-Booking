require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const Venue = require('../models/Venue');
const Auditorium = require('../models/Auditorium');
const Seat = require('../models/Seat');
const Screening = require('../models/Screening');
const ScreeningSeat = require('../models/ScreeningSeat');

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
const seatsPerRow = 8;
const defaultPrice = Number(process.env.DEFAULT_TICKET_PRICE || 250);

async function ensureSeats(auditorium) {
  const operations = rows.flatMap((row) =>
    Array.from({ length: seatsPerRow }, (_, index) => {
      const number = index + 1;
      const label = `${row}${number}`;
      return {
        updateOne: {
          filter: { auditorium: auditorium._id, label },
          update: {
            $setOnInsert: {
              auditorium: auditorium._id,
              row,
              number,
              label,
              type: 'standard',
            },
          },
          upsert: true,
        },
      };
    })
  );

  await Seat.bulkWrite(operations);
  return Seat.find({ auditorium: auditorium._id, isActive: true }).sort({ row: 1, number: 1 });
}

async function migrate() {
  await connectDB();

  const venue = await Venue.findOneAndUpdate(
    { name: process.env.DEFAULT_VENUE_NAME || 'CineGo Main Venue' },
    {
      $setOnInsert: {
        timezone: process.env.DEFAULT_VENUE_TIMEZONE || 'UTC',
        address: process.env.DEFAULT_VENUE_ADDRESS || 'Update venue address',
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const auditorium = await Auditorium.findOneAndUpdate(
    { venue: venue._id, name: process.env.DEFAULT_AUDITORIUM_NAME || 'Screen 1' },
    { $setOnInsert: { isActive: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seats = await ensureSeats(auditorium);
  const movies = await Movie.find({ showtimes: { $exists: true, $ne: [] } });
  let created = 0;

  for (const movie of movies) {
    for (const showtime of movie.showtimes) {
      const startsAt = new Date(showtime);
      if (Number.isNaN(startsAt.getTime())) continue;

      const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
      const salesCloseAt = new Date(startsAt.getTime() - 15 * 60 * 1000);
      const salesOpenAt = new Date(startsAt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const status = startsAt > new Date() ? 'on-sale' : 'completed';

      const screening = await Screening.findOneAndUpdate(
        { movie: movie._id, auditorium: auditorium._id, startsAt },
        {
          $setOnInsert: {
            movie: movie._id,
            auditorium: auditorium._id,
            startsAt,
            endsAt,
            salesOpenAt,
            salesCloseAt,
            status,
            basePrice: defaultPrice,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const inventory = seats.map((seat) => ({ screening: screening._id, seat: seat._id }));
      await ScreeningSeat.bulkWrite(
        inventory.map((entry) => ({
          updateOne: {
            filter: entry,
            update: { $setOnInsert: entry },
            upsert: true,
          },
        }))
      );
      created += 1;
    }
  }

  console.log(`Migrated ${created} screenings with ${seats.length} seats each.`);
}

migrate()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
