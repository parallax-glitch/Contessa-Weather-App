import { useState, useEffect } from 'react'

function DigitalClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="absolute top-4 right-4 text-right">
      <div className="text-xl font-mono text-purple-300 tracking-widest">{formatTime(time)}</div>
      <div className="text-xs text-slate-400 tracking-wider uppercase">{formatDate(time)}</div>
    </div>
  )
}

const WMO_WEATHER_CODES = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌧️' },
  57: { description: 'Dense freezing drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌧️' },
  67: { description: 'Heavy freezing rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '❄️' },
  73: { description: 'Moderate snow fall', icon: '❄️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '❄️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌦️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '🌨️' },
  95: { description: 'Thunderstorm', icon: '⚡' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCoordinates = async (cityName) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    )
    const data = await response.json()
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
      }
    }
    throw new Error('City not found')
  }

  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const location = await getCoordinates(city)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      )
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const weatherCode = data.current.weather_code
      const weatherInfo = WMO_WEATHER_CODES[weatherCode] || { description: 'Unknown', icon: '❓' }

      setWeather({
        ...data.current,
        ...weatherInfo,
        location: location.name,
        country: location.country
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl relative bg-slate-800 border-t-4 border-l-4 border-r-4 border-purple-600 p-8">
        <DigitalClock />
        
        <div className="text-center mb-8 border-b border-purple-600/30 pb-6">
          <h1 className="text-4xl font-mono text-purple-300 uppercase tracking-wider">Weather Update</h1>
          <p className="text-slate-400 mt-2 text-sm font-mono tracking-widest">// SENSOR ARRAY ACTIVE</p>
        </div>

        <form onSubmit={fetchWeather} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="[ ENTER CITY DESIGNATION ]"
              className="w-full px-5 py-4 bg-slate-900 border border-purple-600/50 text-purple-100 placeholder-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-mono text-sm uppercase tracking-widest"
            />
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-mono text-xs uppercase tracking-widest border border-purple-500"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'EXECUTE'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-purple-600/10 border-l-4 border-purple-600 p-4 mb-6 font-mono text-sm">
            <span className="font-bold text-purple-300">ERR:</span> <span className="text-slate-300">{error}</span>
          </div>
        )}

        {weather && (
          <div className="bg-slate-900/40 border-2 border-purple-600/30 p-6 font-mono">
            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-purple-600/20">
              <div className="text-left border-r border-purple-600/20 pr-6">
                <p className="text-purple-500 text-xs uppercase tracking-widest mb-1">LOCATION</p>
                <p className="text-white text-xl font-light uppercase">{weather.location}, {weather.country}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-500 text-xs uppercase tracking-widest mb-1">STATUS</p>
                <p className="text-purple-200">{weather.description}</p>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="relative inline-block">
                <span className="text-8xl">{weather.icon}</span>
                <div className="absolute -right-2 -bottom-2 bg-purple-600 text-white text-sm font-bold px-3 py-1 border-4 border-slate-800">
                  {Math.round(weather.temperature_2m)}°C
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-purple-600/20">
              <div className="text-left">
                <p className="text-purple-500 text-xs uppercase tracking-widest">Feels Like</p>
                <p className="text-white text-2xl font-light">{Math.round(weather.apparent_temperature)}°</p>
              </div>
              <div className="text-right">
                <p className="text-purple-500 text-xs uppercase tracking-widest">Humidity</p>
                <p className="text-white text-2xl font-light">{weather.relative_humidity_2m}%</p>
              </div>
              <div className="text-left">
                <p className="text-purple-500 text-xs uppercase tracking-widest">Wind Speed</p>
                <p className="text-white text-xl font-light">{Math.round(weather.wind_speed_10m)} km/h</p>
              </div>
              <div className="text-right">
                <p className="text-purple-500 text-xs uppercase tracking-widest">Local Time</p>
                <p className="text-slate-300 font-mono text-sm">{weather.time}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
