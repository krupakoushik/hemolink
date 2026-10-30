
import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

import {
  bloodBanks,
  type BloodBank
} from "./data/bloodBanks";

const chennai: [number, number] = [13.0827, 80.2707];

const bloodGroups = [
  "A+", "A-", "B+", "B-",
  "O+", "O-", "AB+", "AB-"
];

// Custom blood bank marker
const bloodBankIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="blood-bank-marker">
      <span>✚</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Selected blood bank marker
const selectedBankIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="blood-bank-marker selected-marker">
      <span>✚</span>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

const userIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="user-location-marker">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Calculate distance between two coordinates in km
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * earthRadius * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

// Map controls
function MapController({
  position,
  selectedBank
}: {
  position: [number, number] | null;
  selectedBank: BloodBank | null;
}) {
  const map = useMap();

  // Fly to user's location when GPS is enabled
  if (position) {
    map.flyTo(position, 13, {
      duration: 1
    });
  }

  // Fly to selected blood bank
  if (selectedBank) {
    map.flyTo(
      [selectedBank.lat, selectedBank.lng],
      15,
      {
        duration: 1
      }
    );
  }

  return null;
}

function App() {
  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null);

  const [bloodGroup, setBloodGroup] =
    useState("O+");

  const [units, setUnits] = useState(2);

  const [searched, setSearched] =
    useState(false);

  const [locationStatus, setLocationStatus] =
    useState("idle");

  const [selectedBank, setSelectedBank] =
    useState<number | null>(null);

  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude
        ]);

        setLocationStatus("success");
      },
      () => {
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  // Filter blood banks and rank by distance
  const results = useMemo(() => {
    if (!searched) return [];

    const origin = userLocation ?? chennai;

    return bloodBanks
      .filter((bank) => {
        const available =
          bank.inventory[bloodGroup] ?? 0;

        return available >= units;
      })
      .map((bank) => ({
        ...bank,
        distance: getDistance(
          origin[0],
          origin[1],
          bank.lat,
          bank.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [searched, bloodGroup, units, userLocation]);

  function searchBloodBanks() {
    setSearched(true);
    setSelectedBank(null);
  }

  function showBankOnMap(bank: BloodBank) {
    setSelectedBank(bank.id);
  }

  const visibleBanks = searched
    ? results
    : bloodBanks;

  const selectedBankData =
    bloodBanks.find(
      (bank) => bank.id === selectedBank
    ) ?? null;

  return (
    <main className="app">
      {/* Map */}
      <MapContainer
        center={chennai}
        zoom={12}
        zoomControl={false}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          position={userLocation}
          selectedBank={selectedBankData}
        />

        {/* User marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={userIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Blood bank markers */}
        {visibleBanks.map((bank) => (
          <Marker
            key={bank.id}
            position={[bank.lat, bank.lng]}
            icon={
              selectedBank === bank.id
                ? selectedBankIcon
                : bloodBankIcon
            }
            eventHandlers={{
              click: () => showBankOnMap(bank)
            }}
          >
            <Popup>
              <strong>{bank.name}</strong>
              <br />
              {bank.address}
              <br />
              {bloodGroup}: {bank.inventory[bloodGroup]} units
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Branding */}
      <div className="brand">
        <div>
          <h1>HemoLink</h1>
          <p>When it matters.</p>
        </div>
      </div>

      {/* Search panel */}
      <section className="search-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              BLOOD BANK FINDER
            </span>
            <h2>Find blood near you</h2>
          </div>
          <span className="search-icon">⌕</span>
        </div>

        <label className="field-label">
          Blood group
        </label>

        <div className="blood-groups">
          {bloodGroups.map((group) => (
            <button
              key={group}
              className={`blood-group ${
                bloodGroup === group ? "active" : ""
              }`}
              onClick={() => {
                setBloodGroup(group);
                setSearched(false);
              }}
            >
              {group}
            </button>
          ))}
        </div>

        <label className="field-label">
          Units required
        </label>

        <select
          value={units}
          onChange={(event) => {
            setUnits(Number(event.target.value));
            setSearched(false);
          }}
          className="units-select"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? "unit" : "units"}
            </option>
          ))}
        </select>

        <button
          className="search-button"
          onClick={searchBloodBanks}
        >
          Search blood banks
        </button>

        <button
          className="location-button"
          onClick={findMyLocation}
          disabled={locationStatus === "loading"}
        >
          {locationStatus === "loading"
            ? "Locating..."
            : "⌖ Use my location"}
        </button>

        {locationStatus === "error" && (
          <p className="error-message">
            Location unavailable. Showing results from Chennai.
          </p>
        )}

        {locationStatus === "unsupported" && (
          <p className="error-message">
            Geolocation is not supported by this browser.
          </p>
        )}
      </section>

      {/* Results */}
      {searched && (
        <section className="results-panel">
          <div className="results-heading">
            <div>
              <span className="eyebrow">
                SEARCH RESULTS
              </span>
              <h2>
                {results.length} blood banks found
              </h2>
            </div>

            <span className="result-badge">
              {bloodGroup}
            </span>
          </div>

          {results.length === 0 && (
            <p className="empty-state">
              No blood banks in the sample data have
              the requested quantity. Try a different
              blood group or fewer units.
            </p>
          )}

          {results.map((bank) => (
            <button
              key={bank.id}
              className={`bank-card ${
                selectedBank === bank.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => showBankOnMap(bank)}
            >
              <div className="bank-card-top">
                <div className="bank-icon">✚</div>

                <div className="bank-info">
                  <h3>{bank.name}</h3>
                  <p>{bank.address}</p>
                </div>
              </div>

              <div className="bank-card-bottom">
                <span className="availability">
                  {bank.inventory[bloodGroup]} units available
                </span>

                <span className="distance">
                  {bank.distance.toFixed(1)} km
                </span>
              </div>
            </button>
          ))}

          <p className="demo-note">
            Demo data only — availability is not real.
          </p>
        </section>
      )}

      {/* Map status */}
      <div className="map-label">
        <span className="status-dot" />
        {userLocation
          ? "Location enabled"
          : "Exploring Chennai"}
      </div>
    </main>
  );
}

export default App;
