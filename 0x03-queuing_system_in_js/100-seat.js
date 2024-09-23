import express from 'express';
import { promisify } from 'util';
import { createQueue } from 'kue';
import { createClient } from 'redis';

const client = createClient({ name: 'reserve_seat' });
const queue = createQueue();
const INITIAL_SEATS = 50;
let reservationEnabled = true;
const PORT = 1245;
const app = express();

async function reserveSeat(number) {
  return promisify(client.SET).bind(client)('available_seats', number);
}

async function getCurrentAvailableSeats() {
  return promisify(client.GET).bind(client)('available_seats');
}

async function resetAvailableSeats(initialSeats) {
  return promisify(client.SET).bind(client)(
    'available_seats',
    Number.parseInt(initialSeats)
  );
}

app.get('/available_seats', (_req, res) => {
  getCurrentAvailableSeats().then((availableSeats) =>
    res.json({ availableSeats })
  );
});

app.get('/reserve_seat', (_req, res) => {
  if (!reservationEnabled) {
    res.json({ status: 'Reservation are blocked' });
    return;
  }
  try {
    const job = queue.create('reserve_seat');

    job
      .on('failed', (err) => {
        console.log(
          'Seat reservation job',
          job.id,
          'failed:',
          err.message.toString()
        );
      })
      .on('complete', () => {
        console.log('Seat reservation job', job.id, 'completed');
      });

    job.save();
    res.json({ status: 'Reservation in process' });
  } catch {
    res.json({ status: 'Reservation failed' });
  }
});

app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', (_job, done) => {
    getCurrentAvailableSeats().then((availableSeats) => {
      reservationEnabled = availableSeats <= 1 ? false : availableSeats;

      if (availableSeats >= 1) {
        reserveSeat(availableSeats - 1).then(() => done());
      } else {
        done(new Error('Not enough seats available'));
      }
    });
  });
});

app.listen(PORT, () => {
  resetAvailableSeats(INITIAL_SEATS)
    .then(() => {
      reservationEnabled = true;
      console.log(`Application started on port ${PORT}.`);
    })
    .catch((err) => {
      console.log(
        `Application failed to start on port ${PORT}, Error: ${err.message.toString()}`
      );
    });
});
