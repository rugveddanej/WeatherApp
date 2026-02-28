/* ============================================================
   WeatherApp — Smart Weather Application Logic
   ============================================================ */

(() => {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  const STORAGE_KEY_API   = 'weatherapp_api_key';
  const STORAGE_KEY_UNIT  = 'weatherapp_unit';
  const STORAGE_KEY_THEME = 'weatherapp_theme';
  const STORAGE_KEY_RECENT = 'weatherapp_recent';
  const GEO_URL  = 'https://api.openweathermap.org/geo/1.0';
  const OWM_URL  = 'https://api.openweathermap.org/data/2.5';
  const OWM3_URL = 'https://api.openweathermap.org/data/3.0';

  // ── STATE ───────────────────────────────────────────────────
  let apiKey   = localStorage.getItem(STORAGE_KEY_API) || '';
  let unit     = localStorage.getItem(STORAGE_KEY_UNIT) || 'metric';
  let theme    = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  let recentSearches = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
  let debounceTimer  = null;
  let currentCoords  = null;

  // ── DOM REFS ────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    searchInput:    $('#searchInput'),
    searchBtn:      $('#searchBtn'),
    suggestions:    $('#suggestions'),
    recentSearches: $('#recentSearches'),
    recentList:     $('#recentList'),
    geoBtn:         $('#geoBtn'),
    unitToggle:     $('#unitToggle'),
    themeToggle:    $('#themeToggle'),
    loader:         $('#loader'),
    error:          $('#error'),
    errorMsg:       $('#errorMsg'),
    retryBtn:       $('#retryBtn'),
    weatherContent: $('#weatherContent'),
    cityName:       $('#cityName'),
    dateTime:       $('#dateTime'),
    weatherDesc:    $('#weatherDesc'),
    weatherIconLarge: $('#weatherIconLarge'),
    currentTemp:    $('#currentTemp'),
    highTemp:       $('#highTemp'),
    lowTemp:        $('#lowTemp'),
    feelsLike:      $('#feelsLike'),
    alertBanner:    $('#alertBanner'),
    alertText:      $('#alertText'),
    windSpeed:      $('#windSpeed'),
    windDir:        $('#windDir'),
    humidity:       $('#humidity'),
    humidityBar:    $('#humidityBar'),
    pressure:       $('#pressure'),
    pressureTrend:  $('#pressureTrend'),
    visibility:     $('#visibility'),
    visibilityDesc: $('#visibilityDesc'),
    uvIndex:        $('#uvIndex'),
    uvDesc:         $('#uvDesc'),
    sunrise:        $('#sunrise'),
    sunset:         $('#sunset'),
    clouds:         $('#clouds'),
    cloudsDesc:     $('#cloudsDesc'),
    dewPoint:       $('#dewPoint'),
    dewPointDesc:   $('#dewPointDesc'),
    hourlyForecast: $('#hourlyForecast'),
    dailyForecast:  $('#dailyForecast'),
    aqiSection:     $('#aqiSection'),
    aqiValue:       $('#aqiValue'),
    aqiLabel:       $('#aqiLabel'),
    aqiDetails:     $('#aqiDetails'),
    weatherSummary: $('#weatherSummary'),
    apiKeyModal:    $('#apiKeyModal'),
    apiKeyInput:    $('#apiKeyInput'),
    saveApiKey:     $('#saveApiKey'),
    particles:      $('#particles'),
  };

  // ── WEATHER ICONS (Emoji-based for zero dependencies) ──────
  const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };

  // ── UTILITY ─────────────────────────────────────────────────
  function tempUnit() { return unit === 'metric' ? '°C' : '°F'; }
  function speedUnit() { return unit === 'metric' ? 'm/s' : 'mph'; }

  function formatTemp(val) {
    return `${Math.round(val)}${tempUnit()}`;
  }

  function formatTime(unix, tz) {
    const d = new Date((unix + tz) * 1000);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  function formatDay(unix, tz) {
    const d = new Date((unix + tz) * 1000);
    return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  }

  function formatDate(unix, tz) {
    const d = new Date((unix + tz) * 1000);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
    });
  }

  function formatHour(unix, tz) {
    const d = new Date((unix + tz) * 1000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'UTC' });
  }

  function degToCompass(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function getVisibilityDesc(m) {
    if (m >= 10000) return 'Excellent';
    if (m >= 5000)  return 'Good';
    if (m >= 2000)  return 'Moderate';
    if (m >= 1000)  return 'Poor';
    return 'Very poor';
  }

  function getUVDesc(uvi) {
    if (uvi <= 2)  return 'Low';
    if (uvi <= 5)  return 'Moderate';
    if (uvi <= 7)  return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  }

  function getUVColor(uvi) {
    if (uvi <= 2)  return '#4ade80';
    if (uvi <= 5)  return '#fbbf24';
    if (uvi <= 7)  return '#fb923c';
    if (uvi <= 10) return '#ef4444';
    return '#a855f7';
  }

  function getAQILabel(aqi) {
    const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return labels[aqi] || 'Unknown';
  }

  function getAQIColor(aqi) {
    const colors = ['', '#4ade80', '#a3e635', '#fbbf24', '#fb923c', '#ef4444'];
    return colors[aqi] || '#94a3b8';
  }

  function getCloudsDesc(pct) {
    if (pct <= 10) return 'Clear sky';
    if (pct <= 25) return 'Few clouds';
    if (pct <= 50) return 'Scattered';
    if (pct <= 84) return 'Broken clouds';
    return 'Overcast';
  }

  function getDewPointDesc(dp) {
    const val = unit === 'metric' ? dp : (dp - 32) * 5/9;
    if (val < 10) return 'Dry & comfortable';
    if (val < 16) return 'Comfortable';
    if (val < 18) return 'Slightly humid';
    if (val < 21) return 'Humid';
    return 'Very humid';
  }

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // ── PARTICLES ───────────────────────────────────────────────
  function initParticles() {
    const count = window.innerWidth < 640 ? 15 : 30;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 2;
      p.style.width  = size + 'px';
      p.style.height = size + 'px';
      p.style.left   = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 15 + 10) + 's';
      p.style.animationDelay    = (Math.random() * 10) + 's';
      dom.particles.appendChild(p);
    }
  }

  // ── THEME ───────────────────────────────────────────────────
  function applyTheme(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE_KEY_THEME, t);
  }

  // ── UNITS ───────────────────────────────────────────────────
  function toggleUnit() {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem(STORAGE_KEY_UNIT, unit);
    dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
    if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
  }

  // ── RECENT SEARCHES ────────────────────────────────────────
  function addRecent(name) {
    recentSearches = recentSearches.filter(s => s.toLowerCase() !== name.toLowerCase());
    recentSearches.unshift(name);
    if (recentSearches.length > 6) recentSearches.pop();
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentSearches));
    renderRecent();
  }

  function renderRecent() {
    if (!recentSearches.length) { hide(dom.recentSearches); return; }
    show(dom.recentSearches);
    dom.recentList.innerHTML = recentSearches.map(s =>
      `<button class="search__recent-item" data-city="${s}">${s}</button>`
    ).join('');
  }

  // ── API CALLS ──────────────────────────────────────────────
  async function geocode(query) {
    const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`);
    if (!res.ok) throw new Error('Geocoding failed');
    return res.json();
  }

  async function fetchWeatherData(lat, lon) {
    const params = `lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

    // Use 2.5 forecast (free tier) as primary
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${OWM_URL}/weather?${params}`),
      fetch(`${OWM_URL}/forecast?${params}`),
    ]);

    if (!currentRes.ok) {
      if (currentRes.status === 401) throw new Error('Invalid API key. Please check your key.');
      throw new Error('Failed to fetch weather data.');
    }

    const current  = await currentRes.json();
    const forecast = await forecastRes.json();

    // Try AQI (free)
    let aqi = null;
    try {
      const aqiRes = await fetch(`${OWM_URL}/air_pollution?${params}`);
      if (aqiRes.ok) aqi = await aqiRes.json();
    } catch (_) { /* ignore */ }

    // Try OneCall 3.0 for extra data (UV, hourly, etc.) — falls back gracefully
    let oneCall = null;
    try {
      const ocRes = await fetch(`${OWM3_URL}/onecall?${params}&exclude=minutely`);
      if (ocRes.ok) oneCall = await ocRes.json();
    } catch (_) { /* ignore */ }

    // Fallback: try 2.5 onecall
    if (!oneCall) {
      try {
        const ocRes = await fetch(`${OWM_URL}/onecall?${params}&exclude=minutely`);
        if (ocRes.ok) oneCall = await ocRes.json();
      } catch (_) { /* ignore */ }
    }

    return { current, forecast, aqi, oneCall };
  }

  // ── MAIN FETCH ─────────────────────────────────────────────
  async function fetchWeather(lat, lon, name) {
    hide(dom.error);
    hide(dom.weatherContent);
    show(dom.loader);

    currentCoords = { lat, lon, name };

    try {
      const data = await fetchWeatherData(lat, lon);
      renderWeather(data, name);
      addRecent(name);
    } catch (err) {
      showError(err.message);
    } finally {
      hide(dom.loader);
    }
  }

  function showError(msg) {
    hide(dom.loader);
    hide(dom.weatherContent);
    dom.errorMsg.textContent = msg;
    show(dom.error);
  }

  // ── RENDER ─────────────────────────────────────────────────
  function renderWeather({ current, forecast, aqi, oneCall }, name) {
    const tz = current.timezone;

    // City & date
    dom.cityName.textContent = name || `${current.name}, ${current.sys?.country || ''}`;
    dom.dateTime.textContent = formatDate(current.dt, tz);

    // Description & icon
    const w = current.weather[0];
    dom.weatherDesc.textContent = w.description;
    dom.weatherIconLarge.textContent = weatherIcons[w.icon] || '🌡️';

    // Temperatures
    dom.currentTemp.textContent = formatTemp(current.main.temp);
    dom.highTemp.textContent  = `H: ${formatTemp(current.main.temp_max)}`;
    dom.lowTemp.textContent   = `L: ${formatTemp(current.main.temp_min)}`;
    dom.feelsLike.textContent = `Feels like ${formatTemp(current.main.feels_like)}`;

    // Alerts
    if (oneCall?.alerts?.length) {
      dom.alertText.textContent = oneCall.alerts[0].event + ' — ' + (oneCall.alerts[0].description || '').slice(0, 120);
      show(dom.alertBanner);
    } else {
      hide(dom.alertBanner);
    }

    // Detail cards
    dom.windSpeed.textContent = `${current.wind.speed} ${speedUnit()}`;
    dom.windDir.textContent   = current.wind.deg != null ? `Direction: ${degToCompass(current.wind.deg)} (${current.wind.deg}°)` : '';

    dom.humidity.textContent = `${current.main.humidity}%`;
    dom.humidityBar.querySelector('.detail-card__bar-fill').style.width = `${current.main.humidity}%`;

    dom.pressure.textContent  = `${current.main.pressure} hPa`;
    dom.pressureTrend.textContent = current.main.pressure > 1013 ? '↑ High pressure' : '↓ Low pressure';

    const vis = current.visibility ?? 10000;
    dom.visibility.textContent     = vis >= 1000 ? `${(vis / 1000).toFixed(1)} km` : `${vis} m`;
    dom.visibilityDesc.textContent = getVisibilityDesc(vis);

    // UV (from onecall or estimate)
    const uvi = oneCall?.current?.uvi ?? estimateUV(current);
    dom.uvIndex.textContent = uvi.toFixed(1);
    dom.uvDesc.textContent  = getUVDesc(uvi);
    dom.uvIndex.style.color = getUVColor(uvi);

    // Sunrise / Sunset
    dom.sunrise.textContent = `☀ ${formatTime(current.sys.sunrise, tz)}`;
    dom.sunset.textContent  = `🌙 ${formatTime(current.sys.sunset, tz)}`;

    // Clouds
    dom.clouds.textContent     = `${current.clouds.all}%`;
    dom.cloudsDesc.textContent = getCloudsDesc(current.clouds.all);

    // Dew point
    const dp = oneCall?.current?.dew_point ?? estimateDewPoint(current.main.temp, current.main.humidity);
    dom.dewPoint.textContent     = formatTemp(dp);
    dom.dewPointDesc.textContent = getDewPointDesc(dp);

    // Hourly forecast
    renderHourly(oneCall, forecast, tz);

    // Daily forecast
    renderDaily(oneCall, forecast, tz);

    // AQI
    renderAQI(aqi);

    // Weather summary
    renderSummary(current, forecast, oneCall, aqi);

    show(dom.weatherContent);
  }

  function estimateUV(current) {
    const now = current.dt;
    const sunrise = current.sys.sunrise;
    const sunset  = current.sys.sunset;
    if (now < sunrise || now > sunset) return 0;
    const dayProgress = (now - sunrise) / (sunset - sunrise);
    const peak = Math.sin(dayProgress * Math.PI);
    const cloudFactor = 1 - (current.clouds.all / 100) * 0.7;
    return Math.max(0, peak * 10 * cloudFactor);
  }

  function estimateDewPoint(temp, humidity) {
    // Magnus formula approximation
    const a = 17.27, b = 237.7;
    const t = unit === 'metric' ? temp : (temp - 32) * 5/9;
    const alpha = (a * t) / (b + t) + Math.log(humidity / 100);
    let dp = (b * alpha) / (a - alpha);
    return unit === 'metric' ? dp : dp * 9/5 + 32;
  }

  // ── HOURLY FORECAST ─────────────────────────────────────────
  function renderHourly(oneCall, forecast, tz) {
    let hours = [];

    if (oneCall?.hourly) {
      hours = oneCall.hourly.slice(0, 24).map(h => ({
        dt: h.dt, temp: h.temp, icon: h.weather[0].icon, pop: h.pop || 0
      }));
    } else {
      hours = forecast.list.slice(0, 8).map(h => ({
        dt: h.dt, temp: h.main.temp, icon: h.weather[0].icon, pop: h.pop || 0
      }));
    }

    dom.hourlyForecast.innerHTML = hours.map((h, i) => `
      <div class="hourly-card${i === 0 ? ' now' : ''}">
        <span class="hourly-card__time">${i === 0 ? 'Now' : formatHour(h.dt, tz)}</span>
        <span class="hourly-card__icon">${weatherIcons[h.icon] || '🌡️'}</span>
        <span class="hourly-card__temp">${formatTemp(h.temp)}</span>
        ${h.pop > 0.05 ? `<span class="hourly-card__pop">💧 ${Math.round(h.pop * 100)}%</span>` : ''}
      </div>
    `).join('');
  }

  // ── DAILY FORECAST ──────────────────────────────────────────
  function renderDaily(oneCall, forecast, tz) {
    let days = [];

    if (oneCall?.daily) {
      days = oneCall.daily.slice(0, 6).map(d => ({
        dt: d.dt, high: d.temp.max, low: d.temp.min,
        icon: d.weather[0].icon, pop: d.pop || 0
      }));
    } else {
      // Group 3-hour forecast by day
      const grouped = {};
      forecast.list.forEach(item => {
        const day = new Date((item.dt + tz) * 1000).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        if (!grouped[day]) grouped[day] = { temps: [], icons: [], pops: [], dt: item.dt };
        grouped[day].temps.push(item.main.temp);
        grouped[day].icons.push(item.weather[0].icon);
        grouped[day].pops.push(item.pop || 0);
      });
      days = Object.entries(grouped).slice(0, 5).map(([, v]) => ({
        dt: v.dt,
        high: Math.max(...v.temps),
        low:  Math.min(...v.temps),
        icon: v.icons[Math.floor(v.icons.length / 2)],
        pop:  Math.max(...v.pops)
      }));
    }

    const allTemps = days.flatMap(d => [d.high, d.low]);
    const minT = Math.min(...allTemps);
    const maxT = Math.max(...allTemps);
    const range = maxT - minT || 1;

    dom.dailyForecast.innerHTML = days.map((d, i) => {
      const left  = ((d.low - minT) / range) * 100;
      const width = ((d.high - d.low) / range) * 100;
      return `
        <div class="daily-card" style="animation-delay:${i * 0.05}s">
          <span class="daily-card__day">${i === 0 ? 'Today' : formatDay(d.dt, tz)}</span>
          <span class="daily-card__icon">${weatherIcons[d.icon] || '🌡️'}</span>
          <div class="daily-card__bar-wrapper">
            <div class="daily-card__bar-fill" style="left:${left}%;width:${Math.max(width, 8)}%"></div>
          </div>
          <div class="daily-card__temps">
            <span class="daily-card__low">${formatTemp(d.low)}</span>
            <span class="daily-card__high">${formatTemp(d.high)}</span>
            ${d.pop > 0.1 ? `<span class="daily-card__pop">💧${Math.round(d.pop * 100)}%</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── AQI ─────────────────────────────────────────────────────
  function renderAQI(aqi) {
    if (!aqi?.list?.length) { hide(dom.aqiSection); return; }
    show(dom.aqiSection);

    const data = aqi.list[0];
    const idx  = data.main.aqi;
    const color = getAQIColor(idx);

    dom.aqiValue.textContent = idx;
    dom.aqiValue.style.color = color;
    dom.aqiLabel.textContent = getAQILabel(idx);
    dom.aqiLabel.style.color = color;

    const components = data.components;
    const items = [
      { label: 'PM2.5', value: components.pm2_5?.toFixed(1) || '—', unit: 'μg/m³' },
      { label: 'PM10',  value: components.pm10?.toFixed(1) || '—', unit: 'μg/m³' },
      { label: 'NO₂',   value: components.no2?.toFixed(1) || '—', unit: 'μg/m³' },
      { label: 'O₃',    value: components.o3?.toFixed(1) || '—', unit: 'μg/m³' },
      { label: 'SO₂',   value: components.so2?.toFixed(1) || '—', unit: 'μg/m³' },
      { label: 'CO',    value: components.co?.toFixed(0) || '—', unit: 'μg/m³' },
    ];

    dom.aqiDetails.innerHTML = items.map(i => `
      <div class="aqi-detail">
        <div class="aqi-detail__label">${i.label}</div>
        <div class="aqi-detail__value">${i.value}</div>
      </div>
    `).join('');
  }

  // ── WEATHER SUMMARY ─────────────────────────────────────────
  function renderSummary(current, forecast, oneCall, aqi) {
    const w = current.weather[0];
    const temp = Math.round(current.main.temp);
    const feels = Math.round(current.main.feels_like);
    const humidity = current.main.humidity;
    const wind = current.wind.speed;

    let summary = `Currently <strong>${w.description}</strong> with a temperature of <strong>${formatTemp(current.main.temp)}</strong>`;
    summary += ` (feels like ${formatTemp(current.main.feels_like)}).`;

    if (Math.abs(temp - feels) > 3) {
      summary += unit === 'metric'
        ? ` The wind chill and humidity make it feel ${feels < temp ? 'colder' : 'warmer'} than actual.`
        : ` The wind chill and humidity make it feel ${feels < temp ? 'colder' : 'warmer'} than actual.`;
    }

    summary += ` Humidity is at <strong>${humidity}%</strong>`;
    summary += humidity > 70 ? ' — quite muggy.' : humidity < 30 ? ' — very dry.' : '.';

    summary += ` Wind is blowing at <strong>${wind} ${speedUnit()}</strong>`;
    summary += wind > 10 ? ' — breezy conditions.' : '.';

    // Forecast outlook
    if (forecast.list.length > 8) {
      const tomorrow = forecast.list.slice(8, 16);
      const tomorrowTemps = tomorrow.map(h => h.main.temp);
      const avgTomorrow = tomorrowTemps.reduce((a, b) => a + b, 0) / tomorrowTemps.length;
      const diff = avgTomorrow - current.main.temp;
      if (Math.abs(diff) > 2) {
        summary += ` Tomorrow will be <strong>${diff > 0 ? 'warmer' : 'cooler'}</strong> with an average around ${formatTemp(avgTomorrow)}.`;
      } else {
        summary += ' Tomorrow looks similar to today.';
      }
    }

    // Rain check
    const rainHours = forecast.list.slice(0, 8).filter(h => h.pop > 0.3);
    if (rainHours.length > 0) {
      summary += ` <strong>🌧️ Rain is expected</strong> in the next few hours — don't forget an umbrella!`;
    }

    if (aqi?.list?.length) {
      const aqiLevel = getAQILabel(aqi.list[0].main.aqi);
      summary += ` Air quality is <strong>${aqiLevel.toLowerCase()}</strong>.`;
    }

    dom.weatherSummary.innerHTML = summary;
  }

  // ── SEARCH ──────────────────────────────────────────────────
  async function handleSearch(query) {
    if (!query.trim()) return;
    hide(dom.suggestions);

    try {
      const results = await geocode(query);
      if (!results.length) { showError(`No results found for "${query}".`); return; }
      const r = results[0];
      const name = `${r.name}${r.state ? ', ' + r.state : ''}, ${r.country}`;
      fetchWeather(r.lat, r.lon, name);
    } catch (err) {
      showError(err.message);
    }
  }

  async function handleAutocomplete(query) {
    if (query.length < 2) { hide(dom.suggestions); return; }

    try {
      const results = await geocode(query);
      if (!results.length) { hide(dom.suggestions); return; }

      dom.suggestions.innerHTML = results.map(r => {
        const name = `${r.name}${r.state ? ', ' + r.state : ''}, ${r.country}`;
        return `<div class="search__suggestion" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${name}">
          <span>${r.name}</span>
          <span class="search__suggestion-country">${r.state ? r.state + ', ' : ''}${r.country}</span>
        </div>`;
      }).join('');
      show(dom.suggestions);
    } catch (_) {
      hide(dom.suggestions);
    }
  }

  // ── GEOLOCATION ────────────────────────────────────────────
  function handleGeoLocation() {
    if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
    show(dom.loader);
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, ''),
      ()  => { hide(dom.loader); showError('Unable to retrieve your location. Please allow location access.'); }
    );
  }

  // ── API KEY MODAL ──────────────────────────────────────────
  function checkApiKey() {
    if (!apiKey) {
      show(dom.apiKeyModal);
    } else {
      hide(dom.apiKeyModal);
      // Auto-load weather on start
      if (recentSearches.length) {
        handleSearch(recentSearches[0]);
      }
    }
  }

  // ── EVENT LISTENERS ────────────────────────────────────────
  function bindEvents() {
    // Search
    dom.searchBtn.addEventListener('click', () => handleSearch(dom.searchInput.value));
    dom.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch(dom.searchInput.value);
    });
    dom.searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => handleAutocomplete(dom.searchInput.value), 350);
    });

    // Suggestions
    dom.suggestions.addEventListener('click', e => {
      const item = e.target.closest('.search__suggestion');
      if (!item) return;
      dom.searchInput.value = item.dataset.name;
      hide(dom.suggestions);
      fetchWeather(parseFloat(item.dataset.lat), parseFloat(item.dataset.lon), item.dataset.name);
    });

    // Close suggestions on outside click
    document.addEventListener('click', e => {
      if (!dom.suggestions.contains(e.target) && e.target !== dom.searchInput) {
        hide(dom.suggestions);
      }
    });

    // Recent searches
    dom.recentList.addEventListener('click', e => {
      const btn = e.target.closest('.search__recent-item');
      if (!btn) return;
      dom.searchInput.value = btn.dataset.city;
      handleSearch(btn.dataset.city);
    });

    // Geo
    dom.geoBtn.addEventListener('click', handleGeoLocation);

    // Unit toggle
    dom.unitToggle.addEventListener('click', toggleUnit);

    // Theme toggle
    dom.themeToggle.addEventListener('click', () => {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    });

    // Retry
    dom.retryBtn.addEventListener('click', () => {
      if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
    });

    // API key modal
    dom.saveApiKey.addEventListener('click', () => {
      const key = dom.apiKeyInput.value.trim();
      if (!key) return;
      apiKey = key;
      localStorage.setItem(STORAGE_KEY_API, key);
      hide(dom.apiKeyModal);
      // Try geolocation on first use
      handleGeoLocation();
    });

    // Focus search on '/' key
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== dom.searchInput && document.activeElement !== dom.apiKeyInput) {
        e.preventDefault();
        dom.searchInput.focus();
      }
    });
  }

  // ── INIT ────────────────────────────────────────────────────
  function init() {
    applyTheme(theme);
    dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
    initParticles();
    renderRecent();
    bindEvents();
    checkApiKey();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
