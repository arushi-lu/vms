// server/app.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const fetch = require('node-fetch');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function comparePassword(password, hashedPassword) {
  const passwordMatch = await bcrypt.compare(password, hashedPassword);
  return passwordMatch;
}
function correct_time(time){
    const [hour, minute, second] = time.split(':');
    const newHour = (parseInt(hour) + 6) % 24;
    const corrected_time = `${newHour}:${minute}:${second}`;
    return corrected_time;
}

app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const trimmedName = name.trim();
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [trimmedName]);

    if (result.rows.length === 0) {
      console.log('User not found:', name);
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    const passwordMatch = await comparePassword(password, user.hashed_password);

    if (passwordMatch) {
      // Successful login
      return res.json({ message: 'Login successful.', user });
    } else {
      console.log('Incorrect password for user:', name);
      return res.status(401).json({ error: 'Incorrect password.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/drivers/:driverId', async (req, res) => {
  const driverId = req.params.driverId;

  try {
    const result = await pool.query('SELECT * FROM drivers WHERE driver_id = $1', [driverId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    const driverInfo = result.rows[0];
    res.json(driverInfo);
  } catch (error) {
    console.error('Error fetching driver information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/assigned-trips/:driverId', async (req, res) => {
  const driverId = req.params.driverId;

  try {
    // Fetch assigned trips for the specified driver
    const result = await pool.query('SELECT * FROM assigned_trips WHERE driver_id = $1', [driverId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Trip not found.' });
      return;
    }
     const tripList = result.rows   
    // Send the list of assigned trips in the response
    res.json(tripList);
  } catch (error) {
    console.error('Error fetching assigned trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/assigned-trips/:tripId', async (req, res) => {
  const tripId = req.params.tripId; // Extract trip ID from URL
  const status = req.body.status;
  try {
    // Update trip status in the database
    const updateTripStatusResult = await pool.query('UPDATE assigned_trips SET status = $1 WHERE id = $2', [status, tripId]);
    if (updateTripStatusResult.rowCount === 0) {
      res.status(404).json({ error: 'Trip not found. in put req' });
      return;
    }
    // Send successful response indicating the trip status has been updated
    res.json({ message: 'Trip status updated to "' + status + '".' });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/active-trips', async (req, res) => {
  const trip = req.body; // Receive the entire trip object from the request
  console.log("Post trip ", trip)
  // Extract the required fields for creating an active trip record
  const { id, driver_id, vehicle_id, destination, departure_time, departure_date} = trip;

  try {
    // Insert trip into the active_trips table
    const insertTripResult = await pool.query('INSERT INTO active_trips (active_trip_id, driver_id, vehicle_id, destination, departure_time, departure_date) VALUES ($1, $2, $3, $4, $5, $6)', [id, driver_id, vehicle_id, destination, departure_time, departure_date]);

    if (insertTripResult.rowCount === 0) {
      res.status(500).json({ error: 'Failed to add trip to active trips.' });
      return;
    }

    // Send successful response indicating the trip has been added to active trips
    res.json({ message: 'Trip added to active trips.' });
  } catch (error) {
    console.error('Error adding trip to active trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/active-trips/:driverId', async (req, res) => {
  const driverId = req.params.driverId;

  try {
    // Fetch assigned trips for the specified driver
    const result = await pool.query('SELECT * FROM active_trips WHERE driver_id = $1', [driverId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Trip not found. in get req' });
      return;
    }
     const tripList = result.rows   
    // Send the list of assigned trips in the response
    res.json(tripList);
  } catch (error) {
    console.error('Error fetching active trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/active-trips/:tripId', async (req, res) => {
  const tripId = req.params.tripId; // Extract trip ID from URL
  const status = req.body.status;
  try {
    // Update trip status in the database
    const updateTripStatusResult = await pool.query('UPDATE active_trips SET status = $1 WHERE active_trip_id = $2', [status, tripId]);
    if (updateTripStatusResult.rowCount === 0) {
      res.status(404).json({ error: 'Trip not found. in put req' });
      return;
    }
    // Send successful response indicating the trip status has been updated
    res.json({ message: 'Trip status updated to "' + status + '".' });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/completed-trips', async (req, res) => {
  const trip = req.body; // Receive the entire trip object from the request
  console.log("Post trip to completed relation ", trip)
  // Extract the required fields for creating an active trip record
  const {trip_id, driver_id, vehicle_id, destination, departure_time, departure_date} = trip;
  const arrival_time_db = trip.arrival_time.slice(11, 19); 
  const arrival_time = correct_time(arrival_time_db);
 
  try {
    // Insert trip into the active_trips table
    const insertTripResult = await pool.query('INSERT INTO completed_trips (trip_id, driver_id, vehicle_id, destination, departure_time, arrival_time, departure_date) VALUES ($1, $2, $3, $4, $5, $6, $7)', [trip_id, driver_id, vehicle_id, destination, departure_time, arrival_time, departure_date]);

    if (insertTripResult.rowCount === 0) {
      res.status(500).json({ error: 'Failed to add trip to active trips.' });
      return;
    }

    // Send successful response indicating the trip has been added to active trips
    res.json({ message: 'Trip added to active trips.' });
  } catch (error) {
    console.error('Error adding trip to active trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/assigned-trips/:driverId/:tripId', async (req, res) => {
  const driverId = req.params.driverId;
  const tripId = req.params.tripId;

  try {
    // Find the assigned trip by driver ID and trip ID
    const assignedTrip = await pool.query('DELETE FROM assigned_trips WHERE driver_id = $1 AND id = $2', [driverId, tripId])

    if (!assignedTrip) {
      // Trip not found
      res.status(404).send({ message: 'Assigned trip not found' });
      return;
    }

    res.status(200).send({ message: 'Assigned trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting assigned trip:', error.message);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.get('/completed-trips/:driverId', async (req, res) => {
  const driverId = req.params.driverId;
  console.log("check drId ", driverId)

  try {
    // Fetch assigned trips for the specified driver
    const result = await pool.query('SELECT * FROM completed_trips WHERE driver_id = $1', [driverId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Trip not found. in get req' });
      return;
    }
     const tripList = result.rows   
     console.log(tripList)
    // Send the list of assigned trips in the response
    res.json(tripList);
  } catch (error) {
    console.error('Error fetching completed trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/completed-trips/search/:driverId', async (req, res) => {
 
   const { driverId } = req.params;
   const { id, vehicleId, date, departureTime, arrivalTime } = req.query;
   console.log("OMG ", req.query)
   console.log("OMG driver ", driverId)
 
   // Build the SQL query based on the provided search criteria
   let query = 'SELECT * FROM completed_trips WHERE driver_id = $1';
   let params = [driverId]
 
   if (id) {
     query += ` AND trip_id = $${params.length + 1}`;
     params.push(id);
   }
 
   if (vehicleId) {
     query += ` AND vehicle_id = $${params.length + 1}`;
     params.push(vehicleId);
   }
 
   if (date) {
     query += ` AND departure_date = $${params.length + 1}`;
     params.push(date);
   }
 
   if (departureTime) {
    const formattedDepartureTime = departureTime + ':00'; 
    query += ` AND EXTRACT(HOUR FROM departure_time) = EXTRACT(HOUR FROM $${params.length + 1}::time) AND EXTRACT(MINUTE FROM departure_time) = EXTRACT(MINUTE FROM $${params.length + 1}::time)`;
    params.push(formattedDepartureTime);
   }
 
   if (arrivalTime) {
    const formattedArrivalTime = arrivalTime + ':00'; // Assuming seconds are '00'
    query += ` AND EXTRACT(HOUR FROM arrival_time) = EXTRACT(HOUR FROM $${params.length + 1}::time) AND EXTRACT(MINUTE FROM arrival_time) = EXTRACT(MINUTE FROM $${params.length + 1}::time)`;
    params.push(formattedArrivalTime);
   }
   console.log(query)
 
   try {
     // Execute the query with parameters
     const result = await pool.query(query, params);
     
 
     // Send the matching trips in the response
     res.json(result.rows);
   } catch (error) {
     console.error('Error searching completed trips:', error);
     res.status(500).json({ error: 'Internal Server Error' });
   }
  
});

app.post('/send-message', async (req, res) => {
  const { message } = req.body;
  console.log("I am alive ")
  const chatId = '1139001140';

  // Use the Telegram Bot API to send messages
  const botToken = '6628012329:AAGYW5Z2NwM3IfvsmhPk_45R3icypkc9Fm0';
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();
    console.log(data)
    res.json(data);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/webhook', (req, res) => {
  // Process incoming messages from Telegram
  console.log('Received message:', req.body);
  // Handle the message here

  res.json({ received: true });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
