require('dotenv').config();
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from "@/styles/Home.module.css";
import { getWeather } from '@/pages/api/weather';
import { getLocation } from '@/pages/api/location';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [stationsFrom, setStationsFrom] = useState([]);
  const [stationsTo, setStationsTo] = useState([]);
  const [trips, setTrips] = useState([]);
  const [circleClass, setCircleClass] = useState(styles.temperatureCircle);
  const [showNewUI, setShowNewUI] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trainResults, setTrainResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemperature, setLoadingTemperature] = useState(true);
  
  
  const handleCircleClick = (e) => {
    e.stopPropagation();
    setCircleClass(circleClass === styles.temperatureCircle ? styles.temperatureCircleExpanded : styles.temperatureCircle);
    setShowNewUI(!showNewUI);
    document.body.style.overflow = !showNewUI ? 'hidden' : 'auto';
  };

  const handleSearchChangeFrom = async (event) => {
    setSearchFrom(event.target.value);
    if (event.target.value.length > 0) {
      try {
        const res = await axios.get(`/api/stations?q=${event.target.value}`);
        setStationsFrom(res.data.payload);
      } catch (error) {
        console.error(error);
      }
    } else {
      setStationsFrom([]);
    }
  };

  const handleSearchChangeTo = async (event) => {
    setSearchTo(event.target.value);
    if (event.target.value.length > 0) {
      try {
        const res = await axios.get(`/api/stations?q=${event.target.value}`);
        setStationsTo(res.data.payload);
      } catch (error) {
        console.error(error);
      }
    } else {
      setStationsTo([]);
    }
  };

  const handleStationClickFrom = (stationName) => {
    setSearchFrom(stationName);
    setStationsFrom([]);
  };

  const handleStationClickTo = (stationName) => {
    setSearchTo(stationName);
    setStationsTo([]);
  };

  // Voeg deze functie toe aan je component
  const handleSearchClick = async () => {
    try {
      const res = await axios.get(`/api/trips?fromStation=${searchFrom}&toStation=${searchTo}`);
      setTrips(res.data.trips);
      console.log(res.data.trips); // Debugging
    } catch (error) {
      console.error(error);
    }
  };


 useEffect(() => {
  async function fetchData() {
    try {
      const location = await getLocation();

      const weatherPromise = getWeather(location);
      const stationPromise = fetch(`/api/closeststation?lat=${location.latitude}&lng=${location.longitude}`).then(response => response.json());

      const [weatherData, stationData] = await Promise.all([weatherPromise, stationPromise]);

      setWeather(weatherData);
      setLoading(false);

      if (weatherData && weatherData.hourly && weatherData.hourly.temperature2m) {
        const currentHour = new Date().getHours();
        const currentTemperature = weatherData.hourly.temperature2m[currentHour];
        setTemperature(currentTemperature);
        setLoadingTemperature(false);
      }

      const lang = stationData.payload[0].namen.lang;
      setSearchFrom(lang);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setLoadingTemperature(false);
    }
  }

  fetchData();
}, []);

// In your render method
// {!showNewUI && <p className={`${styles.tempratuur} ${showNewUI ? styles.fadeOut : ''}`}>{!loadingTemperature ? `${temperature.toFixed(1)}°C` : 'Laden...'}</p>}

// Update je handleTripClick functie om de resultaten op te slaan in de state
const handleTripClick = async (trip) => {
  setSelectedTrip(trip);

  let results = {};

  if (trip.legs && trip.legs.length > 0) {
    for (let i = 0; i < trip.legs.length; i++) {
      const ritnummer = trip.legs[i].product.number;
      console.log(`Ritnummer: ${ritnummer}`); // Debugging

      try {
        const res = await axios.get(`/api/trein/${ritnummer}`);
        results[ritnummer] = res.data;
      } catch (error) {
        // console.error(error);
      }
    }
  }

  console.log('Treinen:', results); // Debugging

  // Sla de resultaten op in de state
  setTrainResults(Object.values(results));
};

// Add this function to close the overlay
const closeOverlay = () => {
  setSelectedTrip(null);
  setTrainResults([]);
};

// Modify your trip rendering code to call handleTripClick when a trip is clicked
{trips.map((trip, index) => (
  <div key={index} className={styles.tripCard} onClick={() => handleTripClick(trip)}>
    ...
  </div>
))}


let temperature;
if (weather && weather.hourly && weather.hourly.temperature_2m) {
  const currentHour = new Date().getHours();
  const closestHour = currentHour + (currentHour % 1 >= 0.5 ? 1 : 0);
  temperature = weather.hourly.temperature_2m[closestHour];
}


// async function fetchClosestStation() {
//   try {
//     const location = await getLocation();

//     const response = await fetch(`/api/closeststation?lat=${location.latitude}&lng=${location.longitude}`);
//     const data = await response.json();

//     console.log(data); 

//     const lang = data.payload[0].namen.lang;
//     console.log(lang); 
//   } catch (error) {
//     console.error(error);
//   }
// }

// fetchClosestStation();



  return (
<div className={styles.container}>
  {error && <div className={styles.error}>{error}</div>}
    {weather && (
      <div className={styles.weather}>
        {loading ? (
          <p>Laden...</p>
        ) : (
          <div className={circleClass} onClick={handleCircleClick}>
            {!showNewUI && <p className={`${styles.tempratuur} ${showNewUI ? styles.fadeOut : ''}`}>{temperature ? `${temperature.toFixed(1)}°C` : 'Laden...'}</p>}
            {showNewUI && <div className={styles.newUI}>
            <p className={styles.tempratuur}>{temperature ? `${temperature.toFixed(1)}°C` : 'Laden...'}</p>
            

            </div>}
          </div>
        )}
      </div>
    )}

      



    <div className={`${styles.searchField} ${styles.firstSearchField}`}>
      <label>Van:</label>
      <input type="text" value={searchFrom} onChange={handleSearchChangeFrom} />
      {stationsFrom.length > 0 && (
        <div className={styles.stationsList}>
          {stationsFrom.map(station => (
            <div key={station.UICCode} className={styles.stationItem} onClick={() => handleStationClickFrom(station.namen.lang)}>
              {station.namen.lang}
            </div>
          ))}
        </div>
      )}
      </div>

      <div className={styles.searchField}>
        <label>Naar:</label>
        <input type="text" value={searchTo} onChange={handleSearchChangeTo} />
        {stationsTo.length > 0 && (
          <div className={styles.stationsList}>
            {stationsTo.map(station => (
              <div key={station.UICCode} className={styles.stationItem} onClick={() => handleStationClickTo(station.namen.lang)}>
                {station.namen.lang}
              </div>
            ))}
          </div>
        )}
      </div>
      <button className={styles.searchButton} onClick={handleSearchClick}>Zoek reis</button>


      
      {trips.map((trip, index) => (
        <div key={index} className={styles.tripCard} onClick={() => handleTripClick(trip)}>
          <div className={styles.timeInfo}>
            <span className={trip.legs[0].stops[0].actualDepartureDateTime && trip.legs[0].stops[0].actualDepartureDateTime !== trip.legs[0].stops[0].plannedDepartureDateTime ? "actualTime" : "departureTime"}>
              {new Date((trip.legs[0].stops[0].actualDepartureDateTime || trip.legs[0].stops[0].plannedDepartureDateTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={styles.arrow}> → </span>
            <span className={trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].actualArrivalDateTime && trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].actualArrivalDateTime !== trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].plannedArrivalDateTime ? "actualTime" : "arrivalTime"}>
              {new Date((trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].actualArrivalDateTime || trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].plannedArrivalDateTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className={trip.actualDurationInMinutes && trip.actualDurationInMinutes !== trip.plannedDurationInMinutes ? "actualDuration" : "duration"}>
            Duration: {Math.floor((trip.actualDurationInMinutes || trip.plannedDurationInMinutes) / 60)}:{("0" + ((trip.actualDurationInMinutes || trip.plannedDurationInMinutes) % 60)).slice(-2)}
          </div>
        </div>
      ))}

      {selectedTrip && (
        <div className={styles.overlay} onClick={closeOverlay}>
          <div className={styles.overlayContent} onClick={e => e.stopPropagation()}>
            {/* <button onClick={closeOverlay}>X</button> */}

            <div className={styles.timeInfobig}>
              <span className={styles.departureTime}>
                {new Date(selectedTrip.legs[0].stops[0].plannedDepartureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={styles.arrow}> → </span>
              <span className={styles.arrivalTime}>
                {new Date(selectedTrip.legs[selectedTrip.legs.length - 1].stops[selectedTrip.legs[selectedTrip.legs.length - 1].stops.length - 1].plannedArrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {trainResults.map((result, index) => (
              <div key={index} className={styles.trainSection}>
                <div className={styles.trainImageContainer}>
                  {result.materieeldelen.map((deel, i) => (
                    <img key={i} src={deel.afbeelding} alt={deel.type} />
                  ))}
                </div>
                <div className={styles.trainLength}>
                  Lengte: {result.lengte}
                </div>
              </div>
            ))}

            </div>
          </div>
      )}

    </div>
  );
}



// npm run dev -- -H 192.168.2.14
// npm run dev -- -H 10.52.17.152

// http-server out -S -C cert.pem -K key.pem