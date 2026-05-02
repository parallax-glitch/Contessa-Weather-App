import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function Map({ lat, lon, city }) {
  if (lat === undefined || lon === undefined) return null

  return (
    <div className="mt-6 border-2 border-purple-600/30">
      <MapContainer center={[lat, lon]} zoom={10} style={{ height: '300px', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>{city}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default Map
