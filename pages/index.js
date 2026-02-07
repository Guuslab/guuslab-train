import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/Home.module.css';

const FAVORITES_STORAGE_KEY = 'favorite-routes';
const MAX_FAVORITES = 3;

export default function Home() {
  const [error, setError] = useState(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [stationsFrom, setStationsFrom] = useState([]);
  const [stationsTo, setStationsTo] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trainResults, setTrainResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteDepartures, setFavoriteDepartures] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  const favoriteKey = (from, to) => `${from}__${to}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setFavorites(parsed.slice(0, MAX_FAVORITES));
      }
    } catch (storageError) {
      console.error('Kon favorieten niet laden:', storageError);
    }
  }, []);

  useEffect(() => {
    if (!favorites.length) {
      setFavoriteDepartures({});
      return;
    }

    const fetchUpcomingForFavorites = async () => {
      const nextDepartures = {};

      await Promise.all(
        favorites.map(async (favorite) => {
          const key = favoriteKey(favorite.from, favorite.to);
          try {
            const res = await axios.get(
              `/api/trips?fromStation=${encodeURIComponent(favorite.from)}&toStation=${encodeURIComponent(favorite.to)}`,
            );

            const upcoming = (res.data?.trips || []).slice(0, 3).map((trip) => {
              const stop = trip?.legs?.[0]?.stops?.[0];
              const departureDateTime = stop?.actualDepartureDateTime || stop?.plannedDepartureDateTime;
              return {
                departureDateTime,
                durationInMinutes: trip.actualDurationInMinutes || trip.plannedDurationInMinutes,
              };
            });

            nextDepartures[key] = { loading: false, departures: upcoming, failed: false };
          } catch (fetchError) {
            nextDepartures[key] = { loading: false, departures: [], failed: true };
          }
        }),
      );

      setFavoriteDepartures(nextDepartures);
    };

    setFavoriteDepartures((current) => {
      const loadingMap = { ...current };
      favorites.forEach((favorite) => {
        loadingMap[favoriteKey(favorite.from, favorite.to)] = { loading: true, departures: [], failed: false };
      });
      return loadingMap;
    });

    fetchUpcomingForFavorites();
    const interval = setInterval(fetchUpcomingForFavorites, 60000);

    return () => clearInterval(interval);
  }, [favorites]);

  useEffect(() => {
    if (selectedTrip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedTrip]);

  const canSaveFavorite = useMemo(
    () => searchFrom.trim().length > 0 && searchTo.trim().length > 0,
    [searchFrom, searchTo],
  );

  const isCurrentRouteFavorite = useMemo(
    () => favorites.some((favorite) => favorite.from === searchFrom && favorite.to === searchTo),
    [favorites, searchFrom, searchTo],
  );

  const handleSearchChangeFrom = async (event) => {
    const value = event.target.value;
    setSearchFrom(value);

    if (!value.length) {
      setStationsFrom([]);
      return;
    }

    try {
      const res = await axios.get(`/api/stations?q=${value}`);
      setStationsFrom(res.data.payload || []);
    } catch (stationError) {
      console.error(stationError);
    }
  };

  const handleSearchChangeTo = async (event) => {
    const value = event.target.value;
    setSearchTo(value);

    if (!value.length) {
      setStationsTo([]);
      return;
    }

    try {
      const res = await axios.get(`/api/stations?q=${value}`);
      setStationsTo(res.data.payload || []);
    } catch (stationError) {
      console.error(stationError);
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

  const handleSearchClick = async () => {
    setError(null);

    if (!searchFrom || !searchTo) {
      setError('Vul eerst zowel vertrek- als aankomststation in.');
      return;
    }

    try {
      const res = await axios.get(
        `/api/trips?fromStation=${encodeURIComponent(searchFrom)}&toStation=${encodeURIComponent(searchTo)}`,
      );
      setTrips(res.data.trips || []);
      setHasSearched(true);
    } catch (searchError) {
      console.error(searchError);
      setError('Er ging iets mis bij het ophalen van de reizen.');
    }
  };

  const handleSaveFavorite = () => {
    if (!canSaveFavorite || isCurrentRouteFavorite) return;

    const nextFavorites = [{ from: searchFrom, to: searchTo }, ...favorites].slice(0, MAX_FAVORITES);
    setFavorites(nextFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  };

  const handleRemoveFavorite = (route) => {
    const nextFavorites = favorites.filter((favorite) => !(favorite.from === route.from && favorite.to === route.to));
    setFavorites(nextFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  };

  const handleTripClick = async (trip) => {
    setSelectedTrip(trip);

    const results = {};
    const legs = trip.legs || [];

    for (let i = 0; i < legs.length; i += 1) {
      const ritnummer = legs[i]?.product?.number;
      if (!ritnummer) continue;

      try {
        const res = await axios.get(`/api/trein/${ritnummer}`);
        results[ritnummer] = res.data;
      } catch {
        // bewust stil: niet alle ritnummers hebben trein-informatie
      }
    }

    setTrainResults(Object.values(results));
  };

  const closeOverlay = () => {
    setSelectedTrip(null);
    setTrainResults([]);
  };

  const formatTravelTime = (minutes) => `${Math.floor(minutes / 60)}:${(`0${minutes % 60}`).slice(-2)}`;

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {!hasSearched && (
        <section className={styles.favoritesWidget}>
          <div className={styles.favoriteHeader}>
            <h2>Jouw favoriete reizen</h2>
            <p>Direct vanaf nu: de eerstvolgende 3 treinen per route.</p>
          </div>

          {favorites.length === 0 ? (
            <p className={styles.emptyFavorites}>Je hebt nog geen favorieten opgeslagen.</p>
          ) : (
            <div className={styles.favoriteGrid}>
              {favorites.map((favorite) => {
                const key = favoriteKey(favorite.from, favorite.to);
                const data = favoriteDepartures[key];

                return (
                  <article key={key} className={styles.favoriteCard}>
                    <button
                      className={styles.favoriteRouteButton}
                      onClick={() => {
                        setSearchFrom(favorite.from);
                        setSearchTo(favorite.to);
                      }}
                    >
                      {favorite.from} → {favorite.to}
                    </button>

                    <button className={styles.removeFavoriteButton} onClick={() => handleRemoveFavorite(favorite)}>
                      Verwijder
                    </button>

                    {data?.loading && <p>Treinen ophalen…</p>}
                    {data?.failed && <p>Kon vertrektijden niet laden.</p>}
                    {!data?.loading && !data?.failed && (
                      <ul className={styles.departureList}>
                        {(data?.departures || []).map((departure, index) => (
                          <li key={`${key}-${index}`}>
                            <span>
                              {new Date(departure.departureDateTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>{formatTravelTime(departure.durationInMinutes)}</span>
                          </li>
                        ))}
                        {!data?.departures?.length && <li>Geen vertrekkende treinen gevonden.</li>}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div className={`${styles.searchField} ${styles.firstSearchField}`}>
        <label>Van:</label>
        <input type="text" value={searchFrom} onChange={handleSearchChangeFrom} onFocus={() => setSearchFrom('')} />
        {stationsFrom.length > 0 && (
          <div className={styles.stationsList}>
            {stationsFrom.map((station) => (
              <div
                key={station.UICCode}
                className={styles.stationItem}
                onClick={() => handleStationClickFrom(station.namen.lang)}
              >
                {station.namen.lang}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className={styles.switchButon}
        onClick={() => {
          const temp = searchFrom;
          setSearchFrom(searchTo);
          setSearchTo(temp);
        }}
      >
        <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 161.62 142.47">
          <line
            className={styles.switch}
            x1="43.05"
            y1="5.5"
            x2="43.05"
            y2="136.97"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
          <line
            className={styles.switch}
            x1="5.5"
            y1="46.87"
            x2="43.05"
            y2="5.5"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
          <line
            className={styles.switch}
            x1="80.6"
            y1="46.87"
            x2="43.05"
            y2="5.5"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
          <line
            className={styles.switch}
            x1="118.57"
            y1="136.97"
            x2="118.57"
            y2="5.5"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
          <line
            className={styles.switch}
            x1="156.12"
            y1="95.6"
            x2="118.57"
            y2="136.97"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
          <line
            className={styles.switch}
            x1="81.02"
            y1="95.6"
            x2="118.57"
            y2="136.97"
            style={{ fill: 'none', stroke: 'var(--primary)', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '11px' }}
          />
        </svg>
      </button>

      <div className={styles.searchField}>
        <label>Naar:</label>
        <input type="text" value={searchTo} onChange={handleSearchChangeTo} onFocus={() => setSearchTo('')} />
        {stationsTo.length > 0 && (
          <div className={styles.stationsList}>
            {stationsTo.map((station) => (
              <div key={station.UICCode} className={styles.stationItem} onClick={() => handleStationClickTo(station.namen.lang)}>
                {station.namen.lang}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.searchButton} onClick={handleSearchClick}>
          Zoek reis
        </button>
        <button
          className={styles.saveFavoriteButton}
          onClick={handleSaveFavorite}
          disabled={!canSaveFavorite || isCurrentRouteFavorite || favorites.length >= MAX_FAVORITES}
          title={favorites.length >= MAX_FAVORITES ? 'Je kan maximaal 3 favorieten opslaan' : ''}
        >
          {isCurrentRouteFavorite ? 'Al favoriet' : 'Opslaan als favoriet'}
        </button>
      </div>

      {trips.map((trip, index) => (
        <div key={index} className={styles.tripCard} onClick={() => handleTripClick(trip)}>
          <div className={styles.timeInfo}>
            <span>
              {new Date(trip.legs[0].stops[0].actualDepartureDateTime || trip.legs[0].stops[0].plannedDepartureDateTime).toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' },
              )}
            </span>
            <span className={styles.arrow}> → </span>
            <span>
              {new Date(
                trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].actualArrivalDateTime ||
                  trip.legs[trip.legs.length - 1].stops[trip.legs[trip.legs.length - 1].stops.length - 1].plannedArrivalDateTime,
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>Duration: {formatTravelTime(trip.actualDurationInMinutes || trip.plannedDurationInMinutes)}</div>
        </div>
      ))}

      {selectedTrip && (
        <div className={styles.overlay} onClick={closeOverlay}>
          <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.timeInfobig}>
              <span className={styles.departureTime}>
                {new Date(selectedTrip.legs[0].stops[0].plannedDepartureDateTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className={styles.arrow}> → </span>
              <span className={styles.arrivalTime}>
                {new Date(
                  selectedTrip.legs[selectedTrip.legs.length - 1].stops[
                    selectedTrip.legs[selectedTrip.legs.length - 1].stops.length - 1
                  ].plannedArrivalDateTime,
                ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <br />
                  spoor: {result.spoor}
                  <br />
                  drukte: {selectedTrip.legs[index].crowdForecast === 'UNKNOWN' ? 'niet bekend' : selectedTrip.legs[index].crowdForecast}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <a href="/legal" className={styles.footerLink}>
        Legal
      </a>
    </div>
  );
}
