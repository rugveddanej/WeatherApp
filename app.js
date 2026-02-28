(() => {
  'use strict';

  const STORAGE_KEY_UNIT  = 'weatherapp_unit';
  const STORAGE_KEY_THEME = 'weatherapp_theme';
  const STORAGE_KEY_RECENT = 'weatherapp_recent';
  const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const METEO_URL = 'https://api.open-meteo.com/v1/forecast';
  const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

  let unit     = localStorage.getItem(STORAGE_KEY_UNIT) || 'metric';
  let theme    = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  let recentSearches = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
  let debounceTimer  = null;
  let currentCoords  = null;

  const $ = (sel) => document.querySelector(sel);
  
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
    particles:      $('#particles'),
  };

  function getWeatherEmoji(code, isDay = 1) {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if ([1, 2].includes(code)) return isDay ? '⛅' : '☁️';
    if (code === 3) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌡️';
  }

  function getWeatherDesc(code) {
    const codes = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers',
      81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm'
    };
    return codes[code] || 'Unknown conditions';
  }

  function tempUnit() { return unit === 'metric' ? '°C' : '°F'; }
  function speedUnit() { return unit === 'metric' ? 'km/h' : 'mph'; }
  function formatTemp(val) { return `${Math.round(val)}${tempUnit()}`; }
  
  function formatTime(isoStr) {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDay(isoStr) {
    return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short' });
  }

  function degToCompass(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function getAQILabel(aqi) {
    if (aqi <= 20) return 'Good';
    if (aqi <= 40) return 'Fair';
    if (aqi <= 60) return 'Moderate';
    if (aqi <= 80) return 'Poor';
    return 'Very Poor';
  }

  function getAQIColor(aqi) {
    if (aqi <= 20) return '#4ade80';
    if (aqi <= 40) return '#a3e635';
    if (aqi <= 60) return '#fbbf24';
    if (aqi <= 80) return '#fb923c';
    return '#ef4444';
  }

  function getUVDesc(uvi) {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  }

  function getUVColor(uvi) {
    if (uvi <= 2) return '#4ade80';
    if (uvi <= 5) return '#fbbf24';
    if (uvi <= 7) return '#fb923c';
    if (uvi <= 10) return '#ef4444';
    return '#a855f7';
  }

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

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

  function applyTheme(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE_KEY_THEME, t);
  }

  function toggleUnit() {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem(STORAGE_KEY_UNIT, unit);
    dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
    if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
  }

  function addRecent(name) {
    if (!name) return;
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

  async function geocode(query) {
    const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.results || [];
  }

  async function fetchWeatherData(lat, lon) {
    const tempUnitParam = unit === 'metric' ? 'celsius' : 'fahrenheit';
    const windUnitParam = unit === 'metric' ? 'kmh' : 'mph';
    
    const weatherParams = new URLSearchParams({
      latitude: lat, longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
      temperature_unit: tempUnitParam,
      wind_speed_unit: windUnitParam,
      timezone: 'auto'
    });

    const aqiParams = new URLSearchParams({
      latitude: lat, longitude: lon,
      current: 'european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
      timezone: 'auto'
    });

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`${METEO_URL}?${weatherParams}`),
      fetch(`${AQI_URL}?${aqiParams}`)
    ]);

    if (!weatherRes.ok) throw new Error('Failed to fetch weather data.');

    const weather = await weatherRes.json();
    const aqi = aqiRes.ok ? await aqiRes.json() : null;

    return { weather, aqi };
  }

  async function fetchWeather(lat, lon, name) {
    hide(dom.error);
    hide(dom.weatherContent);
    show(dom.loader);

    currentCoords = { lat, lon, name };

    try {
      const data = await fetchWeatherData(lat, lon);
      renderWeather(data, name);
      if (name) addRecent(name);
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

  function renderWeather({ weather, aqi }, name) {
    const current = weather.current;
    const daily = weather.daily;

    dom.cityName.textContent = name || 'Current Location';
    dom.dateTime.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    dom.weatherDesc.textContent = getWeatherDesc(current.weather_code);
    dom.weatherIconLarge.textContent = getWeatherEmoji(current.weather_code, current.is_day);

    dom.currentTemp.textContent = formatTemp(current.temperature_2m);
    dom.highTemp.textContent  = `H: ${formatTemp(daily.temperature_2m_max[0])}`;
    dom.lowTemp.textContent   = `L: ${formatTemp(daily.temperature_2m_min[0])}`;
    dom.feelsLike.textContent = `Feels like ${formatTemp(current.apparent_temperature)}`;

    hide(dom.alertBanner);

    dom.windSpeed.textContent = `${current.wind_speed_10m} ${speedUnit()}`;
    dom.windDir.textContent   = `Direction: ${degToCompass(current.wind_direction_10m)}`;

    dom.humidity.textContent = `${current.relative_humidity_2m}%`;
    dom.humidityBar.querySelector('.detail-card__bar-fill').style.width = `${current.relative_humidity_2m}%`;

    dom.pressure.textContent  = `${current.pressure_msl} hPa`;
    dom.pressureTrend.textContent = current.pressure_msl > 1013 ? '↑ High pressure' : '↓ Low pressure';

    dom.visibility.textContent = 'N/A';
    dom.visibilityDesc.textContent = '';

    const uvi = daily.uv_index_max[0] || 0;
    dom.uvIndex.textContent = uvi.toFixed(1);
    dom.uvDesc.textContent  = getUVDesc(uvi);
    dom.uvIndex.style.color = getUVColor(uvi);

    dom.sunrise.textContent = `☀ ${formatTime(daily.sunrise[0])}`;
    dom.sunset.textContent  = `🌙 ${formatTime(daily.sunset[0])}`;

    dom.clouds.textContent     = `${current.cloud_cover}%`;
    dom.cloudsDesc.textContent = current.cloud_cover > 50 ? 'Mostly cloudy' : 'Mostly clear';

    const dp = estimateDewPoint(current.temperature_2m, current.relative_humidity_2m);
    dom.dewPoint.textContent     = formatTemp(dp);
    dom.dewPointDesc.textContent = unit === 'metric' ? (dp > 18 ? 'Humid' : 'Comfortable') : (dp > 65 ? 'Humid' : 'Comfortable');

    renderHourly(weather.hourly);
    renderDaily(daily);
    renderAQI(aqi);
    renderSummary(current, daily, weather.hourly, aqi);

    show(dom.weatherContent);
  }

  function estimateDewPoint(temp, humidity) {
    const a = 17.27, b = 237.7;
    const t = unit === 'metric' ? temp : (temp - 32) * 5/9;
    const alpha = (a * t) / (b + t) + Math.log(humidity / 100);
    let dp = (b * alpha) / (a - alpha);
    return unit === 'metric' ? dp : dp * 9/5 + 32;
  }

  function renderHourly(hourly) {
    const nowIdx = hourly.time.findIndex(t => new Date(t) >= new Date());
    const startIndex = nowIdx > -1 ? nowIdx : 0;
    const hours = [];

    for(let i = 0; i < 24; i++) {
      const idx = startIndex + i;
      if(idx >= hourly.time.length) break;
      hours.push({
        time: hourly.time[idx],
        temp: hourly.temperature_2m[idx],
        code: hourly.weather_code[idx],
        pop: hourly.precipitation_probability[idx]
      });
    }

    dom.hourlyForecast.innerHTML = hours.map((h, i) => `
      <div class="hourly-card${i === 0 ? ' now' : ''}">
        <span class="hourly-card__time">${i === 0 ? 'Now' : new Date(h.time).getHours() + ':00'}</span>
        <span class="hourly-card__icon">${getWeatherEmoji(h.code)}</span>
        <span class="hourly-card__temp">${formatTemp(h.temp)}</span>
        ${h.pop > 5 ? `<span class="hourly-card__pop">💧 ${h.pop}%</span>` : ''}
      </div>
    `).join('');
  }

  function renderDaily(daily) {
    const minT = Math.min(...daily.temperature_2m_min.slice(0, 5));
    const maxT = Math.max(...daily.temperature_2m_max.slice(0, 5));
    const range = maxT - minT || 1;

    let html = '';
    for(let i = 0; i < 5; i++) {
      const low = daily.temperature_2m_min[i];
      const high = daily.temperature_2m_max[i];
      const left  = ((low - minT) / range) * 100;
      const width = ((high - low) / range) * 100;

      html += `
        <div class="daily-card" style="animation-delay:${i * 0.05}s">
          <span class="daily-card__day">${i === 0 ? 'Today' : formatDay(daily.time[i])}</span>
          <span class="daily-card__icon">${getWeatherEmoji(daily.weather_code[i])}</span>
          <div class="daily-card__bar-wrapper">
            <div class="daily-card__bar-fill" style="left:${left}%;width:${Math.max(width, 8)}%"></div>
          </div>
          <div class="daily-card__temps">
            <span class="daily-card__low">${formatTemp(low)}</span>
            <span class="daily-card__high">${formatTemp(high)}</span>
          </div>
        </div>
      `;
    }
    dom.dailyForecast.innerHTML = html;
  }

  function renderAQI(aqiData) {
    if (!aqiData || !aqiData.current) { hide(dom.aqiSection); return; }
    show(dom.aqiSection);

    const c = aqiData.current;
    const aqiVal = c.european_aqi || 0;
    const color = getAQIColor(aqiVal);

    dom.aqiValue.textContent = aqiVal;
    dom.aqiValue.style.color = color;
    dom.aqiLabel.textContent = getAQILabel(aqiVal);
    dom.aqiLabel.style.color = color;

    const items = [
      { label: 'PM2.5', value: c.pm2_5 || '—' },
      { label: 'PM10',  value: c.pm10 || '—' },
      { label: 'NO₂',   value: c.nitrogen_dioxide || '—' },
      { label: 'O₃',    value: c.ozone || '—' },
      { label: 'SO₂',   value: c.sulphur_dioxide || '—' },
      { label: 'CO',    value: c.carbon_monoxide || '—' },
    ];

    dom.aqiDetails.innerHTML = items.map(i => `
      <div class="aqi-detail">
        <div class="aqi-detail__label">${i.label}</div>
        <div class="aqi-detail__value">${i.value}</div>
      </div>
    `).join('');
  }

  function renderSummary(current, daily, hourly, aqi) {
    let summary = `Currently <strong>${getWeatherDesc(current.weather_code).toLowerCase()}</strong> with a temperature of <strong>${formatTemp(current.temperature_2m)}</strong>. `;
    
    summary += `Wind is blowing at <strong>${current.wind_speed_10m} ${speedUnit()}</strong>. `;
    
    if (daily.temperature_2m_max[1]) {
      const tomorrowDiff = daily.temperature_2m_max[1] - daily.temperature_2m_max[0];
      if (Math.abs(tomorrowDiff) > 2) {
         summary += `Tomorrow will be <strong>${tomorrowDiff > 0 ? 'warmer' : 'cooler'}</strong>. `;
      }
    }

    if (aqi && aqi.current) {
      summary += `Air quality is currently <strong>${getAQILabel(aqi.current.european_aqi).toLowerCase()}</strong>.`;
    }

    dom.weatherSummary.innerHTML = summary;
  }

  async function handleSearch(query) {
    if (!query.trim()) return;
    hide(dom.suggestions);
    try {
      const results = await geocode(query);
      if (!results.length) { showError(`No results found for "${query}".`); return; }
      const r = results[0];
      const name = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`;
      fetchWeather(r.latitude, r.longitude, name);
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
        const name = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`;
        return `<div class="search__suggestion" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${name}">
          <span>${r.name}</span>
          <span class="search__suggestion-country">${r.admin1 ? r.admin1 + ', ' : ''}${r.country}</span>
        </div>`;
      }).join('');
      show(dom.suggestions);
    } catch (_) {
      hide(dom.suggestions);
    }
  }

  function handleGeoLocation() {
    if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
    show(dom.loader);
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, null),
      ()  => { hide(dom.loader); showError('Unable to retrieve location.'); }
    );
  }

  function bindEvents() {
    dom.searchBtn.addEventListener('click', () => handleSearch(dom.searchInput.value));
    dom.searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(dom.searchInput.value); });
    dom.searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => handleAutocomplete(dom.searchInput.value), 350);
    });
    dom.suggestions.addEventListener('click', e => {
      const item = e.target.closest('.search__suggestion');
      if (!item) return;
      dom.searchInput.value = item.dataset.name;
      hide(dom.suggestions);
      fetchWeather(parseFloat(item.dataset.lat), parseFloat(item.dataset.lon), item.dataset.name);
    });
    document.addEventListener('click', e => {
      if (!dom.suggestions.contains(e.target) && e.target !== dom.searchInput) hide(dom.suggestions);
    });
    dom.recentList.addEventListener('click', e => {
      const btn = e.target.closest('.search__recent-item');
      if (!btn) return;
      dom.searchInput.value = btn.dataset.city;
      handleSearch(btn.dataset.city);
    });
    dom.geoBtn.addEventListener('click', handleGeoLocation);
    dom.unitToggle.addEventListener('click', toggleUnit);
    dom.themeToggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
    dom.retryBtn.addEventListener('click', () => {
      if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== dom.searchInput) {
        e.preventDefault();
        dom.searchInput.focus();
      }
    });
  }

  function init() {
    applyTheme(theme);
    dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
    initParticles();
    renderRecent();
    bindEvents();
    
    if (recentSearches.length) {
      handleSearch(recentSearches[0]);
    } else {
      handleGeoLocation();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
