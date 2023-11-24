import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Driver.css';


const DriverPage = ({ user }) => {
  const drId = user.id
  
  const [driverInfo, setDriverInfo] = useState(null);
  const [showPersonalInfoPopup, setShowPersonalInfoPopup] = useState(false);

  const [assignedTrips, setAssignedTrips] = useState([]);
  const [showTripsPopup, setShowTripsPopup] = useState(false);

  const [activeTrips, setActiveTrips] = useState([]);
  const [showActiveTripsPopup, setShowActiveTripsPopup] = useState(false);

  const [completedTrips, setCompletedTrips] = useState([]);
  const [showCompletedTripsPopup, setShowCompletedTripsPopup] = useState(false);

  
  //////////////////////////////// Start of assigned_trips info 
  const fetchAssignedTrips = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/assigned-trips/${user.id}`);
      setAssignedTrips(response.data);
    } catch (error) {
      console.error('Error fetching assigned trips:', error.response?.data?.error || 'Unknown error');
    }
  };
  useEffect(() => {
    // Fetch assigned trips when the component mounts
    if (user && user.id) {
      fetchAssignedTrips();
    }
  }, [user]);
  
  const handleShowAssignedTrips = () => {
    setShowTripsPopup(true);
  };

  const handleCloseAssignedTrips = () => {
    setShowTripsPopup(false);
  };
  ///////////////////////////////// End of assigned_Trips info
  
  ////////////////////start of active_trips info
  const fetchActiveTrips = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/active-trips/${user.id}`);
      setActiveTrips(response.data);
      console.log("hehehe ", activeTrips)
    } catch (error) {
      console.error('Error fetching active trips:', error.response?.data?.error || 'Unknown error');
    }
  };
  useEffect(() => {
    // Fetch assigned trips when the component mounts
    if (user && user.id) {
      fetchActiveTrips();
    }
  }, [user]);
  
  const handleShowActiveTrips = () => {
   setShowActiveTripsPopup(true)
  };
  const handleCloseActiveTrips = () => {
    setShowActiveTripsPopup(false)
  };
  //////////////////////end of active trips info

    ////////////////////start of completed_trips info
    const fetchCompletedTrips = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/completed-trips/${user.id}`);
        console.log("Here is response data", response.data)
        setCompletedTrips(response.data);
        console.log("Here is completed trips list ", completedTrips)
      } catch (error) {
        console.error('Error fetching completed trips:', error.response?.data?.error || 'Unknown error');
      }
    };
    useEffect(() => {
      if (user && user.id) {
        if (showCompletedTripsPopup) { // Check if the "Completed Trips" button is pressed
          fetchCompletedTrips().then((trips) => {
            if (trips === undefined) {
              console.log("No copmleted trips!");
            } else {
              setCompletedTrips(trips);
            }
          });
        }
      }
    }, [showCompletedTripsPopup]);
    
    const handleShowCompletedTrips = () => {
     setShowCompletedTripsPopup(true)
    };
    const handleCloseCompletedTrips = () => {
      setShowCompletedTripsPopup(false)
    };
    //////////////////////end of completed_trips info

  // Driver's personal info
  useEffect(() => {
    if (user && user.id) {
      fetchDriverInfo();
    }
  }, [user]);

  const fetchDriverInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/drivers/${user.id}`);
      setDriverInfo(response.data);
    } catch (error) {
      console.error('Error fetching driver information:', error.response?.data?.error || 'Unknown error');
    } finally {
      //console.log('Driver Info:', driverInfo);
    }
  };

  const handleOpenPersonalInfoPopup = () => {
    setShowPersonalInfoPopup(true);
  };

  const handleClosePersonalInfoPopup = () => {
    setShowPersonalInfoPopup(false);
  };
  // End of Driver's Personal Info 

  const moveTripToActiveTrips = (trip) => {
    // Send API request to add trip to active-trips
    fetch('http://localhost:5000/active-trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trip),
    })
      .then((response) => {
        if (response.ok) {
          // Trip successfully moved to active trips, update UI
          // Remove trip from assignedTrips array
          const updatedAssignedTrips = assignedTrips.filter((assignedTrip) => assignedTrip.id !== trip.id);
          setAssignedTrips(updatedAssignedTrips);
  
          // Add trip to activeTrips array
          const updatedActiveTrips = [...activeTrips, { ...trip, status: 'Active' }];
          setActiveTrips(updatedActiveTrips);
        } else {
          // Handle error in moving trip to active-trips
          console.error('Error moving trip to active-trips:', response.statusText);
          alert('Failed to start trip. Please try again.');
        }
      });
  };
  
  const handleStartTrip = (trip) => {
    // Send API request to update trip status to 'Active'
    fetch('http://localhost:5000/assigned-trips/' + trip.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Active',
      }),
    })
    .then((response) => {
      if (response.ok) {
        // Trip status updated successfully, proceed to move trip to active-trips
        console.log("Succesful change of status")
        moveTripToActiveTrips(trip);
      } else {
        // Handle error in updating trip status
        console.error('Error updating trip status:', response.statusText);
        alert('Failed to start trip. Please try again.');
      }
    });
  };

  function formatTime(timeString) {
    if (timeString == null){
      return ''
    }
    const hour = timeString[0] + timeString[1]
    const minute = timeString[3] + timeString[4]
    return `${hour}:${minute}`;
  }
  
  function formatDate(dateString) {
    const months = [
      "January","February","March","April",
      "May","June","July","August",
      "September","October","November","December"
    ];
    const dateTime = new Date(dateString);
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1; // Months are zero-indexed
    const year = dateTime.getFullYear();
    return `${day} ${months[month - 1]} ${year}`;
  }

  const handleStatusChange = (trip, newStatus) => {
    // Update trip status in the database and update UI
    fetch('http://localhost:5000/active-trips/' + trip.active_trip_id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    })
    .then((response) => {
      if (response.ok) {
        // Trip status updated successfully, update UI
        const updatedActiveTrips = activeTrips.map((activeTrip) => {
          if (activeTrip.active_trip_id === trip.active_trip_id) {
            if (newStatus === 'Completed') {
              // Update arrival time to current timestamp
              activeTrip.arrival_time = new Date();
              document.getElementById('status-change-dropdown').disabled = true;
            }
            return { ...activeTrip, status: newStatus };
          }
          return activeTrip;
        });
        setActiveTrips(updatedActiveTrips);
      } else {
        // Handle error in updating trip status
        console.error('Error updating trip status:', response.statusText);
        alert('Failed to update trip status. Please try again.');
      }
    });

    fetch('http://localhost:5000/completed-trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id: trip.active_trip_id,
          driver_id: trip.driver_id,
          vehicle_id: trip.vehicle_id,
          destination: trip.destination,
          departure_time: trip.departure_time,
          departure_date: trip.departure_date,
          arrival_time: new Date(),
        }),
      })
      .then((response) => {
        if (response.ok) {
          // Completed trip successfully added to history
          console.log('Completed trip added to history:', trip.active_trip_id);

          // Update the UI to reflect the completed trip
          const updatedActiveTrips = activeTrips.filter((activeTrip) => activeTrip.active_trip_id !== trip.active_trip_id);
          setActiveTrips(updatedActiveTrips);

          // Refresh the history of completed trips
          fetchCompletedTrips();

          fetch('http://localhost:5000/assigned-trips/' + trip.driver_id + '/' + trip.active_trip_id, {
            method: 'DELETE',
          }).then((response) => {
            if (response.ok) {
              // Assigned trip successfully deleted
              console.log('Assigned completed trip deleted:', trip.active_trip_id);
            } else {
             // Handle error in deleting assigned trip
              console.error('Error deleting assigned trip:', response.statusText);
            }
          });

        } else {
          // Handle error in adding completed trip to history
          console.error('Error adding completed trip to history:', response.statusText);
          alert('Failed to complete trip. Please try again.');
        }
    })
    
  };

  
    const [searchCriteria, setSearchCriteria] = useState({
      id: '',
      vehicleId: '',
      date: '',
      departureTime: '',
      arrivalTime: ''
    });
    const [matchingTrips, setMatchingTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSearchCriteria((prevCriteria) => ({
        ...prevCriteria,
        [name]: value,
      }));
    };
    
  
    const handleSearch = async (e) => {
      e.preventDefault();
      setLoading(true);
    
      // Check if any search criteria has a value
      const hasSearchCriteria = Object.values(searchCriteria).some((value) => value !== '');
      console.log("Search criteria in client: ", searchCriteria)
    
      try {
        if (hasSearchCriteria) {
          const response = await axios.get('http://localhost:5000/completed-trips/search/' + drId, {
            params: searchCriteria,
          });
    
          setMatchingTrips(response.data);
          setSearchButtonClicked(true);
        } else {
          // If no search criteria provided, set matchingTrips to an empty array
          setMatchingTrips([]);
        }
      } catch (error) {
        console.error('Error searching completed trips:', error);
      } finally {
        setLoading(false);
      }
    };

    
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');

    const sendMessage = async () => {
      try {
        const response = await axios.post('http://localhost:5000/send-message', {
          message,
        });

        if (response) {
          setResponse('Message sent successfully!');
        } else {
          console.log("That's response", response)
          setResponse('Failed to send message. in else st');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setResponse('Failed to send message. in catch st');
      }
    }

    const handleLogout = () => {
      setDriverInfo(null);
      window.location.reload();
    };

    
    
  



  return (
    <div className="driver-page-container">
    <h2 className="driver-page-header">Driver Page: Hello {user.name}!</h2>
    
    <button className="pers-info-btn" onClick={handleOpenPersonalInfoPopup}>Personal Info</button>
    {showPersonalInfoPopup && (
      <div className="personal-info-popup">
        <h3 className="personal-info-popup-header">Personal Information</h3>
        <p className="personal-info-p">Name: {driverInfo.name}</p>
        <p className="personal-info-p">Contact Number: {driverInfo.contact_phone_number}</p>
        <p className="personal-info-p">Email: {driverInfo.contact_email_address}</p>
        <p className="personal-info-p">License Number: {driverInfo.license_number}</p>
        <button className="personal-info-popup-close" onClick={handleClosePersonalInfoPopup}>Close</button>
      </div>
    )}


    <button className='trips-info' onClick={handleShowAssignedTrips}>Assigned Trips</button>
    {showTripsPopup && (
        <div className="trips-info-popup">
          <h3 className="trips-info-popup-header">Assigned Trips</h3>
          <table>
            <thead>
              <tr>
                <th>Trip Number</th>
                <th>Destination</th>
                <th>Departure Time</th>
                <th>Departure Date</th>
                <th>Status</th>
                <th>Start Trip</th>
              </tr>
            </thead>
            <tbody>
              {assignedTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.destination}</td>
                  <td>{formatTime(trip.departure_time)}</td>
                  <td>{formatDate(trip.departure_date)}</td>
                  <td>{trip.status}</td>
                  <td>
                    {trip.status === "Pending" ? (
                      <button className="trips-info-popup-start-trip" 
                      onClick={() => handleStartTrip(trip)}>
                        Start Trip
                      </button>
                    ) : (
                      <span className="trips-info-popup-trip-status-inactive">Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="trips-info-popup-close" onClick={handleCloseAssignedTrips}>Close</button>
        </div>
    )}

     
    <button className='active-trips-info' onClick={handleShowActiveTrips}>Active Trips</button>
    {showActiveTripsPopup && (
        <div className="active-trips-info-popup">
          <h3 className="active-trips-info-popup-header">Active Trips</h3>

          <table>
            <thead>
              <tr>
                <th>Trip Number</th>
                <th>Destination</th>
                <th>Departure Time</th>
                <th>Departure Date</th>
                <th>Status</th>
               
                <th>Arrival Time</th>
              </tr>
            </thead>
            <tbody>
             
            {activeTrips.map((trip) => (
             
              <tr key={trip.active_trip_id}>
                
                <td>{trip.active_trip_id}</td>
                <td>{trip.destination}</td>
                <td>{formatTime(trip.departure_time)}</td>
                <td>{formatDate(trip.departure_date)}</td>
                
                <td>
                  <select id="status-change-dropdown" onChange={(event) => handleStatusChange(trip, event.target.value)}>
                    <option value="Active" defaultValue>Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </td>
                <td>{formatTime(trip.arrival_time)}</td>
              </tr>
            ))}
            </tbody>
          </table>

          <button className="trips-info-popup-close" onClick={handleCloseActiveTrips}>Close</button>
        </div>
    )}

    <button className='completed-trips-info' onClick={handleShowCompletedTrips}>Completed Trips</button>
    {showCompletedTripsPopup && (
        <div className="completed-trips-info-popup">
          <h3 className="completed-trips-info-popup-header">Completed Trips </h3>
          <table>
            <thead>
              <tr>
                <th>Trip Number</th>
                <th>Destination</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Vehicle ID</th>
                <th>Departure Date</th>
              </tr>
            </thead>
            <tbody>
            
            {completedTrips.map((completed_trip) => (
            
              <tr key={completed_trip.trip_id}>
                
                <td>{completed_trip.trip_id}</td>
                <td>{completed_trip.destination}</td>
                <td>{formatTime(completed_trip.departure_time)}</td>
                <td>{formatTime(completed_trip.arrival_time)}</td>
                <td>{completed_trip.vehicle_id}</td>
                <td>{formatDate(completed_trip.departure_date)}</td>
              </tr>
            ))}
            </tbody>
          </table>

          <button className="trips-info-popup-close" onClick={handleCloseCompletedTrips}>Close</button>
        </div>
    )}

    <button className='search_but' onClick={() => setSearchButtonClicked(true)}>Search Trips</button>
    <button className='close_search_but' onClick={() => setSearchButtonClicked(false)}>Close Search</button>
    {searchButtonClicked && (
      <div className='search_field'>
        <form onSubmit={(e) => handleSearch(e)}>
        <div className="form-input-container">
          <label className="form-label">
            Trip ID:
            <input
              type="text"
              name="id"
              value={searchCriteria.id}
              onChange={handleInputChange}
              className="form-input"
            />
          </label>
          <br />
          <label className="form-label">
            Vehicle ID:
            <input
              type="text"
              name="vehicleId"
              value={searchCriteria.vehicleId}
              onChange={handleInputChange}
              className="form-input"
            />
          </label>
          <br />
          <label className="form-label">
            Date:
            <input
              type="text"
              name="date"
              value={searchCriteria.date}
              onChange={handleInputChange}
              className="form-input"
            />
          </label>
          <br />
          <label className="form-label">
            Arrival Time:
            <input
              type="text"
              name="arrivalTime"
              value={searchCriteria.arrivalTime}
              onChange={handleInputChange}
              className="form-input"
            />
          </label>
          <br />
          <label className="form-label">
            Departure Time:
            <input
              type="text"
              name="departureTime"
              value={searchCriteria.departureTime}
              onChange={handleInputChange}
              className="form-input"
            />
          </label>
        </div>
          <button type="submit" disabled={loading} className="form-button"> Search </button>
        </form>
        
          <div className="completed-trips-info-popup">
              {loading && <p>Loading...</p>}

              {searchButtonClicked && (
                <>
                  <h3>Matching Trips</h3>
                  {matchingTrips.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Trip Number</th>
                          <th>Destination</th>
                          <th>Departure Time</th>
                          <th>Arrival Time</th>
                          <th>Vehicle ID</th>
                          <th>Departure Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchingTrips.map((trip) => (
                          <tr key={trip.trip_id}>
                            <td>{trip.trip_id}</td>
                            <td>{trip.destination}</td>
                            <td>{formatTime(trip.departure_time)}</td>
                            <td>{formatTime(trip.arrival_time)}</td>
                            <td>{trip.vehicle_id}</td>
                            <td>{formatDate(trip.departure_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No matching trips found</p>
                    )}
                </>
              )}
          </div>
      </div>
    )}
    <div className='dispatcher_chat'>
    <h2>Dispatcher Chat</h2>
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
              />
            </div>
            <div>
              <button onClick={sendMessage}>Send Message</button>
            </div>
            {response && <div>{response}</div>}
    </div>
    <button className='logout' onClick={handleLogout}>Logout</button>
      
            
  
  </div>
)};

export default DriverPage;
