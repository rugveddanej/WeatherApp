# Combined Project Documentation

*Generated on: 3/1/2026, 3:43:38 AM*
*Projects included: WeatherApp*

## 📁 Combined Structure

Total files documented: 4

📦 Combined Project Structure
```

📂 WeatherApp/
├── README.md
├── app.js
├── index.html
└── style.css
```

## 📄 File Contents

# 📦 Project: WeatherApp

## 📖 README.md

**Path:** `WeatherApp/README.md`

```md
   1: # ⛅ WeatherApp — Advanced Smart Weather
   2: 
   3: A modern, responsive weather application with glassmorphism UI, real-time data, and smart weather insights.
   4: 
   5: ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
   6: ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
   7: ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
   8: 
   9: ## ✨ Features
  10: 
  11: - 🌡️ **Current Weather** — Real-time temperature, feels-like, high/low, and weather description
  12: - 🕐 **Hourly Forecast** — Scrollable 24-hour forecast with precipitation probability
  13: - 📅 **5-Day Forecast** — Daily highs/lows with temperature range bars
  14: - 🔍 **Smart Search** — Autocomplete city search with recent search history
  15: - 📍 **Geolocation** — One-click location detection
  16: - 🌬️ **Weather Details** — Wind, humidity, pressure, visibility, UV index, dew point, cloudiness, sunrise/sunset
  17: - 🏭 **Air Quality Index** — AQI with PM2.5, PM10, NO₂, O₃, SO₂, CO breakdown
  18: - 🧠 **Weather Summary** — AI-style natural language weather insight
  19: - ⚠️ **Weather Alerts** — Severe weather warning banner
  20: - 🌙 **Dark / Light Theme** — Toggle with smooth transitions
  21: - 🔄 **°C / °F Toggle** — Switch between metric and imperial units
  22: - 💾 **Local Storage** — Remembers your API key, theme, units, and recent searches
  23: - ✨ **Animated Particles** — Floating background particles
  24: - 📱 **Fully Responsive** — Looks great on mobile, tablet, and desktop
  25: 
  26: ## 🚀 Getting Started
  27: 
  28: 1. **Clone the repo**
  29:    ```bash
  30:    git clone https://github.com/your-username/WeatherApp.git
  31:    cd WeatherApp
  32:    ```
  33: 
  34: 2. **Open `index.html`** in your browser (no build step needed!)
  35: 
  36: 3. **Enter your API key** — Get a free key from [OpenWeatherMap](https://openweathermap.org/appid)
  37: 
  38: That's it! The app runs entirely in the browser with zero dependencies.
  39: 
  40: ## ⌨️ Keyboard Shortcuts
  41: 
  42: | Key | Action |
  43: |-----|--------|
  44: | `/` | Focus search bar |
  45: | `Enter` | Search |
  46: 
  47: ## 🛠️ Tech Stack
  48: 
  49: - **HTML5** — Semantic markup
  50: - **CSS3** — Custom properties, glassmorphism, grid, flexbox, animations
  51: - **Vanilla JavaScript** — ES6+, async/await, Fetch API
  52: - **OpenWeatherMap API** — Weather data provider
  53: 
  54: ## 📁 Project Structure
  55: 
  56: ```
  57: WeatherApp/
  58: ├── index.html    # Main HTML structure
  59: ├── style.css     # All styles (themes, responsive, animations)
  60: ├── app.js        # Application logic (API, rendering, state)
  61: └── README.md     # Documentation
  62: ```
  63: 
  64: ## 📄 License
  65: 
  66: MIT
```

---

## 📄 app.js

**Path:** `WeatherApp/app.js`

```javascript
   1: /* ============================================================
   2:    WeatherApp — Smart Weather Application Logic (Open-Meteo)
   3:    ============================================================ */
   4: 
   5: (() => {
   6:   'use strict';
   7: 
   8:   // ── CONFIG ──────────────────────────────────────────────────
   9:   const STORAGE_KEY_UNIT  = 'weatherapp_unit';
  10:   const STORAGE_KEY_THEME = 'weatherapp_theme';
  11:   const STORAGE_KEY_RECENT = 'weatherapp_recent';
  12:   const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  13:   const METEO_URL = 'https://api.open-meteo.com/v1/forecast';
  14:   const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  15: 
  16:   // ── STATE ───────────────────────────────────────────────────
  17:   let unit     = localStorage.getItem(STORAGE_KEY_UNIT) || 'metric';
  18:   let theme    = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  19:   let recentSearches = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
  20:   let debounceTimer  = null;
  21:   let currentCoords  = null;
  22: 
  23:   // ── DOM REFS ────────────────────────────────────────────────
  24:   const $ = (sel) => document.querySelector(sel);
  25:   
  26:   const dom = {
  27:     searchInput:    $('#searchInput'),
  28:     searchBtn:      $('#searchBtn'),
  29:     suggestions:    $('#suggestions'),
  30:     recentSearches: $('#recentSearches'),
  31:     recentList:     $('#recentList'),
  32:     geoBtn:         $('#geoBtn'),
  33:     unitToggle:     $('#unitToggle'),
  34:     themeToggle:    $('#themeToggle'),
  35:     loader:         $('#loader'),
  36:     error:          $('#error'),
  37:     errorMsg:       $('#errorMsg'),
  38:     retryBtn:       $('#retryBtn'),
  39:     weatherContent: $('#weatherContent'),
  40:     cityName:       $('#cityName'),
  41:     dateTime:       $('#dateTime'),
  42:     weatherDesc:    $('#weatherDesc'),
  43:     weatherIconLarge: $('#weatherIconLarge'),
  44:     currentTemp:    $('#currentTemp'),
  45:     highTemp:       $('#highTemp'),
  46:     lowTemp:        $('#lowTemp'),
  47:     feelsLike:      $('#feelsLike'),
  48:     alertBanner:    $('#alertBanner'),
  49:     alertText:      $('#alertText'),
  50:     windSpeed:      $('#windSpeed'),
  51:     windDir:        $('#windDir'),
  52:     humidity:       $('#humidity'),
  53:     humidityBar:    $('#humidityBar'),
  54:     pressure:       $('#pressure'),
  55:     pressureTrend:  $('#pressureTrend'),
  56:     visibility:     $('#visibility'),
  57:     visibilityDesc: $('#visibilityDesc'),
  58:     uvIndex:        $('#uvIndex'),
  59:     uvDesc:         $('#uvDesc'),
  60:     sunrise:        $('#sunrise'),
  61:     sunset:         $('#sunset'),
  62:     clouds:         $('#clouds'),
  63:     cloudsDesc:     $('#cloudsDesc'),
  64:     dewPoint:       $('#dewPoint'),
  65:     dewPointDesc:   $('#dewPointDesc'),
  66:     hourlyForecast: $('#hourlyForecast'),
  67:     dailyForecast:  $('#dailyForecast'),
  68:     aqiSection:     $('#aqiSection'),
  69:     aqiValue:       $('#aqiValue'),
  70:     aqiLabel:       $('#aqiLabel'),
  71:     aqiDetails:     $('#aqiDetails'),
  72:     weatherSummary: $('#weatherSummary'),
  73:     particles:      $('#particles'),
  74:   };
  75: 
  76:   // ── WEATHER MAPPING (WMO Codes) ─────────────────────────────
  77:   function getWeatherEmoji(code, isDay = 1) {
  78:     if (code === 0) return isDay ? '☀️' : '🌙';
  79:     if ([1, 2].includes(code)) return isDay ? '⛅' : '☁️';
  80:     if (code === 3) return '☁️';
  81:     if ([45, 48].includes(code)) return '🌫️';
  82:     if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  83:     if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  84:     if ([95, 96, 99].includes(code)) return '⛈️';
  85:     return '🌡️';
  86:   }
  87: 
  88:   function getWeatherDesc(code) {
  89:     const codes = {
  90:       0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  91:       45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  92:       55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  93:       71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers',
  94:       81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm'
  95:     };
  96:     return codes[code] || 'Unknown conditions';
  97:   }
  98: 
  99:   // ── UTILITY ─────────────────────────────────────────────────
 100:   function tempUnit() { return unit === 'metric' ? '°C' : '°F'; }
 101:   function speedUnit() { return unit === 'metric' ? 'km/h' : 'mph'; }
 102:   function formatTemp(val) { return `${Math.round(val)}${tempUnit()}`; }
 103:   
 104:   function formatTime(isoStr) {
 105:     return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
 106:   }
 107: 
 108:   function formatDay(isoStr) {
 109:     return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short' });
 110:   }
 111: 
 112:   function degToCompass(deg) {
 113:     const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
 114:     return dirs[Math.round(deg / 22.5) % 16];
 115:   }
 116: 
 117:   function getAQILabel(aqi) {
 118:     if (aqi <= 20) return 'Good';
 119:     if (aqi <= 40) return 'Fair';
 120:     if (aqi <= 60) return 'Moderate';
 121:     if (aqi <= 80) return 'Poor';
 122:     return 'Very Poor';
 123:   }
 124: 
 125:   function getAQIColor(aqi) {
 126:     if (aqi <= 20) return '#4ade80';
 127:     if (aqi <= 40) return '#a3e635';
 128:     if (aqi <= 60) return '#fbbf24';
 129:     if (aqi <= 80) return '#fb923c';
 130:     return '#ef4444';
 131:   }
 132: 
 133:   function getUVDesc(uvi) {
 134:     if (uvi <= 2) return 'Low';
 135:     if (uvi <= 5) return 'Moderate';
 136:     if (uvi <= 7) return 'High';
 137:     if (uvi <= 10) return 'Very High';
 138:     return 'Extreme';
 139:   }
 140: 
 141:   function getUVColor(uvi) {
 142:     if (uvi <= 2) return '#4ade80';
 143:     if (uvi <= 5) return '#fbbf24';
 144:     if (uvi <= 7) return '#fb923c';
 145:     if (uvi <= 10) return '#ef4444';
 146:     return '#a855f7';
 147:   }
 148: 
 149:   function show(el) { el.classList.remove('hidden'); }
 150:   function hide(el) { el.classList.add('hidden'); }
 151: 
 152:   // ── PARTICLES & THEME ───────────────────────────────────────
 153:   function initParticles() {
 154:     const count = window.innerWidth < 640 ? 15 : 30;
 155:     for (let i = 0; i < count; i++) {
 156:       const p = document.createElement('div');
 157:       p.className = 'particle';
 158:       const size = Math.random() * 6 + 2;
 159:       p.style.width  = size + 'px';
 160:       p.style.height = size + 'px';
 161:       p.style.left   = Math.random() * 100 + '%';
 162:       p.style.animationDuration = (Math.random() * 15 + 10) + 's';
 163:       p.style.animationDelay    = (Math.random() * 10) + 's';
 164:       dom.particles.appendChild(p);
 165:     }
 166:   }
 167: 
 168:   function applyTheme(t) {
 169:     theme = t;
 170:     document.documentElement.setAttribute('data-theme', t);
 171:     localStorage.setItem(STORAGE_KEY_THEME, t);
 172:   }
 173: 
 174:   function toggleUnit() {
 175:     unit = unit === 'metric' ? 'imperial' : 'metric';
 176:     localStorage.setItem(STORAGE_KEY_UNIT, unit);
 177:     dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
 178:     if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
 179:   }
 180: 
 181:   // ── RECENT SEARCHES ────────────────────────────────────────
 182:   function addRecent(name) {
 183:     if (!name) return;
 184:     recentSearches = recentSearches.filter(s => s.toLowerCase() !== name.toLowerCase());
 185:     recentSearches.unshift(name);
 186:     if (recentSearches.length > 6) recentSearches.pop();
 187:     localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentSearches));
 188:     renderRecent();
 189:   }
 190: 
 191:   function renderRecent() {
 192:     if (!recentSearches.length) { hide(dom.recentSearches); return; }
 193:     show(dom.recentSearches);
 194:     dom.recentList.innerHTML = recentSearches.map(s =>
 195:       `<button class="search__recent-item" data-city="${s}">${s}</button>`
 196:     ).join('');
 197:   }
 198: 
 199:   // ── API CALLS ──────────────────────────────────────────────
 200:   async function geocode(query) {
 201:     const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
 202:     if (!res.ok) throw new Error('Geocoding failed');
 203:     const data = await res.json();
 204:     return data.results || [];
 205:   }
 206: 
 207:   async function fetchWeatherData(lat, lon) {
 208:     const tempUnitParam = unit === 'metric' ? 'celsius' : 'fahrenheit';
 209:     const windUnitParam = unit === 'metric' ? 'kmh' : 'mph';
 210:     
 211:     const weatherParams = new URLSearchParams({
 212:       latitude: lat, longitude: lon,
 213:       current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
 214:       hourly: 'temperature_2m,precipitation_probability,weather_code',
 215:       daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
 216:       temperature_unit: tempUnitParam,
 217:       wind_speed_unit: windUnitParam,
 218:       timezone: 'auto'
 219:     });
 220: 
 221:     const aqiParams = new URLSearchParams({
 222:       latitude: lat, longitude: lon,
 223:       current: 'european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
 224:       timezone: 'auto'
 225:     });
 226: 
 227:     const [weatherRes, aqiRes] = await Promise.all([
 228:       fetch(`${METEO_URL}?${weatherParams}`),
 229:       fetch(`${AQI_URL}?${aqiParams}`)
 230:     ]);
 231: 
 232:     if (!weatherRes.ok) throw new Error('Failed to fetch weather data.');
 233: 
 234:     const weather = await weatherRes.json();
 235:     const aqi = aqiRes.ok ? await aqiRes.json() : null;
 236: 
 237:     return { weather, aqi };
 238:   }
 239: 
 240:     async function fetchWeather(lat, lon, name) {
 241:     hide(dom.error);
 242:     hide(dom.weatherContent);
 243:     show(dom.loader);
 244: 
 245:     try {
 246:       let locationName = name;
 247:       if (!locationName) {
 248:         try {
 249:           const reverseGeoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
 250:           if (reverseGeoRes.ok) {
 251:             const geoData = await reverseGeoRes.json();
 252:             // Try to get the most specific location name available
 253:             locationName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Current Location';
 254:           } else {
 255:             locationName = 'Current Location';
 256:           }
 257:         } catch (err) {
 258:           console.warn("Reverse geocoding failed", err);
 259:           locationName = 'Current Location';
 260:         }
 261:       }
 262: 
 263:       // 2. Save current state
 264:       currentCoords = { lat, lon, name: locationName };
 265: 
 266:       // 3. Fetch weather data
 267:       const data = await fetchWeatherData(lat, lon);
 268:       
 269:       // 4. Render the UI
 270:       renderWeather(data, locationName);
 271:       
 272:       // 5. Add to recent searches (if we have a real name)
 273:       if (locationName && locationName !== 'Current Location') {
 274:         addRecent(locationName);
 275:       }
 276:       
 277:     } catch (err) {
 278:       showError(err.message);
 279:     } finally {
 280:       hide(dom.loader);
 281:     }
 282:   }
 283: 
 284: 
 285:   function showError(msg) {
 286:     hide(dom.loader);
 287:     hide(dom.weatherContent);
 288:     dom.errorMsg.textContent = msg;
 289:     show(dom.error);
 290:   }
 291: 
 292:   // ── RENDER ─────────────────────────────────────────────────
 293:   function renderWeather({ weather, aqi }, name) {
 294:     const current = weather.current;
 295:     const daily = weather.daily;
 296: 
 297:     dom.cityName.textContent = name || 'Current Location';
 298:     dom.dateTime.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
 299: 
 300:     dom.weatherDesc.textContent = getWeatherDesc(current.weather_code);
 301:     dom.weatherIconLarge.textContent = getWeatherEmoji(current.weather_code, current.is_day);
 302: 
 303:     dom.currentTemp.textContent = formatTemp(current.temperature_2m);
 304:     dom.highTemp.textContent  = `H: ${formatTemp(daily.temperature_2m_max[0])}`;
 305:     dom.lowTemp.textContent   = `L: ${formatTemp(daily.temperature_2m_min[0])}`;
 306:     dom.feelsLike.textContent = `Feels like ${formatTemp(current.apparent_temperature)}`;
 307: 
 308:     // Alerts (Open-Meteo doesn't provide alerts by default, so we hide it)
 309:     hide(dom.alertBanner);
 310: 
 311:     // Detail cards
 312:     dom.windSpeed.textContent = `${current.wind_speed_10m} ${speedUnit()}`;
 313:     dom.windDir.textContent   = `Direction: ${degToCompass(current.wind_direction_10m)}`;
 314: 
 315:     dom.humidity.textContent = `${current.relative_humidity_2m}%`;
 316:     dom.humidityBar.querySelector('.detail-card__bar-fill').style.width = `${current.relative_humidity_2m}%`;
 317: 
 318:     dom.pressure.textContent  = `${current.pressure_msl} hPa`;
 319:     dom.pressureTrend.textContent = current.pressure_msl > 1013 ? '↑ High pressure' : '↓ Low pressure';
 320: 
 321:     // Visibility (Not standard in current, hiding or showing dummy if needed. Removed from mapping to prevent crash, replacing with N/A)
 322:     dom.visibility.textContent = 'N/A';
 323:     dom.visibilityDesc.textContent = '';
 324: 
 325:     const uvi = daily.uv_index_max[0] || 0;
 326:     dom.uvIndex.textContent = uvi.toFixed(1);
 327:     dom.uvDesc.textContent  = getUVDesc(uvi);
 328:     dom.uvIndex.style.color = getUVColor(uvi);
 329: 
 330:     dom.sunrise.textContent = `☀ ${formatTime(daily.sunrise[0])}`;
 331:     dom.sunset.textContent  = `🌙 ${formatTime(daily.sunset[0])}`;
 332: 
 333:     dom.clouds.textContent     = `${current.cloud_cover}%`;
 334:     dom.cloudsDesc.textContent = current.cloud_cover > 50 ? 'Mostly cloudy' : 'Mostly clear';
 335: 
 336:     // Dew point estimation
 337:     const dp = estimateDewPoint(current.temperature_2m, current.relative_humidity_2m);
 338:     dom.dewPoint.textContent     = formatTemp(dp);
 339:     dom.dewPointDesc.textContent = unit === 'metric' ? (dp > 18 ? 'Humid' : 'Comfortable') : (dp > 65 ? 'Humid' : 'Comfortable');
 340: 
 341:     renderHourly(weather.hourly);
 342:     renderDaily(daily);
 343:     renderAQI(aqi);
 344:     renderSummary(current, daily, weather.hourly, aqi);
 345: 
 346:     show(dom.weatherContent);
 347:   }
 348: 
 349:   function estimateDewPoint(temp, humidity) {
 350:     const a = 17.27, b = 237.7;
 351:     const t = unit === 'metric' ? temp : (temp - 32) * 5/9;
 352:     const alpha = (a * t) / (b + t) + Math.log(humidity / 100);
 353:     let dp = (b * alpha) / (a - alpha);
 354:     return unit === 'metric' ? dp : dp * 9/5 + 32;
 355:   }
 356: 
 357:   function renderHourly(hourly) {
 358:     const nowIdx = hourly.time.findIndex(t => new Date(t) >= new Date());
 359:     const startIndex = nowIdx > -1 ? nowIdx : 0;
 360:     const hours = [];
 361: 
 362:     for(let i = 0; i < 24; i++) {
 363:       const idx = startIndex + i;
 364:       if(idx >= hourly.time.length) break;
 365:       hours.push({
 366:         time: hourly.time[idx],
 367:         temp: hourly.temperature_2m[idx],
 368:         code: hourly.weather_code[idx],
 369:         pop: hourly.precipitation_probability[idx]
 370:       });
 371:     }
 372: 
 373:     dom.hourlyForecast.innerHTML = hours.map((h, i) => `
 374:       <div class="hourly-card${i === 0 ? ' now' : ''}">
 375:         <span class="hourly-card__time">${i === 0 ? 'Now' : new Date(h.time).getHours() + ':00'}</span>
 376:         <span class="hourly-card__icon">${getWeatherEmoji(h.code)}</span>
 377:         <span class="hourly-card__temp">${formatTemp(h.temp)}</span>
 378:         ${h.pop > 5 ? `<span class="hourly-card__pop">💧 ${h.pop}%</span>` : ''}
 379:       </div>
 380:     `).join('');
 381:   }
 382: 
 383:   function renderDaily(daily) {
 384:     const minT = Math.min(...daily.temperature_2m_min.slice(0, 5));
 385:     const maxT = Math.max(...daily.temperature_2m_max.slice(0, 5));
 386:     const range = maxT - minT || 1;
 387: 
 388:     let html = '';
 389:     for(let i = 0; i < 5; i++) {
 390:       const low = daily.temperature_2m_min[i];
 391:       const high = daily.temperature_2m_max[i];
 392:       const left  = ((low - minT) / range) * 100;
 393:       const width = ((high - low) / range) * 100;
 394: 
 395:       html += `
 396:         <div class="daily-card" style="animation-delay:${i * 0.05}s">
 397:           <span class="daily-card__day">${i === 0 ? 'Today' : formatDay(daily.time[i])}</span>
 398:           <span class="daily-card__icon">${getWeatherEmoji(daily.weather_code[i])}</span>
 399:           <div class="daily-card__bar-wrapper">
 400:             <div class="daily-card__bar-fill" style="left:${left}%;width:${Math.max(width, 8)}%"></div>
 401:           </div>
 402:           <div class="daily-card__temps">
 403:             <span class="daily-card__low">${formatTemp(low)}</span>
 404:             <span class="daily-card__high">${formatTemp(high)}</span>
 405:           </div>
 406:         </div>
 407:       `;
 408:     }
 409:     dom.dailyForecast.innerHTML = html;
 410:   }
 411: 
 412:   function renderAQI(aqiData) {
 413:     if (!aqiData || !aqiData.current) { hide(dom.aqiSection); return; }
 414:     show(dom.aqiSection);
 415: 
 416:     const c = aqiData.current;
 417:     const aqiVal = c.european_aqi || 0;
 418:     const color = getAQIColor(aqiVal);
 419: 
 420:     dom.aqiValue.textContent = aqiVal;
 421:     dom.aqiValue.style.color = color;
 422:     dom.aqiLabel.textContent = getAQILabel(aqiVal);
 423:     dom.aqiLabel.style.color = color;
 424: 
 425:     const items = [
 426:       { label: 'PM2.5', value: c.pm2_5 || '—' },
 427:       { label: 'PM10',  value: c.pm10 || '—' },
 428:       { label: 'NO₂',   value: c.nitrogen_dioxide || '—' },
 429:       { label: 'O₃',    value: c.ozone || '—' },
 430:       { label: 'SO₂',   value: c.sulphur_dioxide || '—' },
 431:       { label: 'CO',    value: c.carbon_monoxide || '—' },
 432:     ];
 433: 
 434:     dom.aqiDetails.innerHTML = items.map(i => `
 435:       <div class="aqi-detail">
 436:         <div class="aqi-detail__label">${i.label}</div>
 437:         <div class="aqi-detail__value">${i.value}</div>
 438:       </div>
 439:     `).join('');
 440:   }
 441: 
 442:   function renderSummary(current, daily, hourly, aqi) {
 443:     let summary = `Currently <strong>${getWeatherDesc(current.weather_code).toLowerCase()}</strong> with a temperature of <strong>${formatTemp(current.temperature_2m)}</strong>. `;
 444:     
 445:     summary += `Wind is blowing at <strong>${current.wind_speed_10m} ${speedUnit()}</strong>. `;
 446:     
 447:     if (daily.temperature_2m_max[1]) {
 448:       const tomorrowDiff = daily.temperature_2m_max[1] - daily.temperature_2m_max[0];
 449:       if (Math.abs(tomorrowDiff) > 2) {
 450:          summary += `Tomorrow will be <strong>${tomorrowDiff > 0 ? 'warmer' : 'cooler'}</strong>. `;
 451:       }
 452:     }
 453: 
 454:     if (aqi && aqi.current) {
 455:       summary += `Air quality is currently <strong>${getAQILabel(aqi.current.european_aqi).toLowerCase()}</strong>.`;
 456:     }
 457: 
 458:     dom.weatherSummary.innerHTML = summary;
 459:   }
 460: 
 461:   // ── SEARCH & EVENTS ─────────────────────────────────────────
 462:   async function handleSearch(query) {
 463:     if (!query.trim()) return;
 464:     hide(dom.suggestions);
 465:     try {
 466:       const results = await geocode(query);
 467:       if (!results.length) { showError(`No results found for "${query}".`); return; }
 468:       const r = results[0];
 469:       const name = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`;
 470:       fetchWeather(r.latitude, r.longitude, name);
 471:     } catch (err) {
 472:       showError(err.message);
 473:     }
 474:   }
 475: 
 476:   async function handleAutocomplete(query) {
 477:     if (query.length < 2) { hide(dom.suggestions); return; }
 478:     try {
 479:       const results = await geocode(query);
 480:       if (!results.length) { hide(dom.suggestions); return; }
 481:       dom.suggestions.innerHTML = results.map(r => {
 482:         const name = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`;
 483:         return `<div class="search__suggestion" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${name}">
 484:           <span>${r.name}</span>
 485:           <span class="search__suggestion-country">${r.admin1 ? r.admin1 + ', ' : ''}${r.country}</span>
 486:         </div>`;
 487:       }).join('');
 488:       show(dom.suggestions);
 489:     } catch (_) {
 490:       hide(dom.suggestions);
 491:     }
 492:   }
 493: 
 494:   function handleGeoLocation() {
 495:     if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
 496:     show(dom.loader);
 497:     navigator.geolocation.getCurrentPosition(
 498:       pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, null),
 499:       ()  => { hide(dom.loader); showError('Unable to retrieve location.'); }
 500:     );
 501:   }
 502: 
 503:   function bindEvents() {
 504:     dom.searchBtn.addEventListener('click', () => handleSearch(dom.searchInput.value));
 505:     dom.searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(dom.searchInput.value); });
 506:     dom.searchInput.addEventListener('input', () => {
 507:       clearTimeout(debounceTimer);
 508:       debounceTimer = setTimeout(() => handleAutocomplete(dom.searchInput.value), 350);
 509:     });
 510:     dom.suggestions.addEventListener('click', e => {
 511:       const item = e.target.closest('.search__suggestion');
 512:       if (!item) return;
 513:       dom.searchInput.value = item.dataset.name;
 514:       hide(dom.suggestions);
 515:       fetchWeather(parseFloat(item.dataset.lat), parseFloat(item.dataset.lon), item.dataset.name);
 516:     });
 517:     document.addEventListener('click', e => {
 518:       if (!dom.suggestions.contains(e.target) && e.target !== dom.searchInput) hide(dom.suggestions);
 519:     });
 520:     dom.recentList.addEventListener('click', e => {
 521:       const btn = e.target.closest('.search__recent-item');
 522:       if (!btn) return;
 523:       dom.searchInput.value = btn.dataset.city;
 524:       handleSearch(btn.dataset.city);
 525:     });
 526:     dom.geoBtn.addEventListener('click', handleGeoLocation);
 527:     dom.unitToggle.addEventListener('click', toggleUnit);
 528:     dom.themeToggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
 529:     dom.retryBtn.addEventListener('click', () => {
 530:       if (currentCoords) fetchWeather(currentCoords.lat, currentCoords.lon, currentCoords.name);
 531:     });
 532:     document.addEventListener('keydown', e => {
 533:       if (e.key === '/' && document.activeElement !== dom.searchInput) {
 534:         e.preventDefault();
 535:         dom.searchInput.focus();
 536:       }
 537:     });
 538:   }
 539: 
 540:   // ── INIT ────────────────────────────────────────────────────
 541:   function init() {
 542:     applyTheme(theme);
 543:     dom.unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
 544:     initParticles();
 545:     renderRecent();
 546:     bindEvents();
 547:     
 548:     // Auto-load weather on start
 549:     if (recentSearches.length) {
 550:       handleSearch(recentSearches[0]);
 551:     } else {
 552:       handleGeoLocation();
 553:     }
 554:   }
 555: 
 556:   if (document.readyState === 'loading') {
 557:     document.addEventListener('DOMContentLoaded', init);
 558:   } else {
 559:     init();
 560:   }
 561: })();
 562: 
```

---

## 🌐 index.html

**Path:** `WeatherApp/index.html`

```html
   1: <!DOCTYPE html>
   2: <html lang="en" data-theme="dark">
   3: <head>
   4:   <meta charset="UTF-8" />
   5:   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   6:   <title>WeatherApp — Smart Weather</title>
   7:   <link rel="stylesheet" href="style.css" />
   8:   <link rel="preconnect" href="https://fonts.googleapis.com" />
   9:   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  10:   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  11: </head>
  12: <body>
  13:   <!-- Animated background particles -->
  14:   <div id="particles" class="particles"></div>
  15: 
  16:   <div class="app">
  17:     <!-- Header -->
  18:     <header class="header">
  19:       <div class="header__brand">
  20:         <svg class="header__logo" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  21:           <path d="M17.5 19a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/>
  22:           <path d="M17.5 9.5V5M17.5 19v4.5M22 14.5h4.5M8 14.5h4.5M20.6 11.4l3.2-3.2M11.2 20.8l3.2-3.2M20.6 17.6l3.2 3.2M11.2 8.2l3.2 3.2"/>
  23:         </svg>
  24:         <h1 class="header__title">WeatherApp</h1>
  25:       </div>
  26:       <div class="header__actions">
  27:         <button id="geoBtn" class="btn btn--icon" title="Use my location" aria-label="Use my location">
  28:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  29:             <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
  30:           </svg>
  31:         </button>
  32:         <button id="unitToggle" class="btn btn--pill" title="Toggle units">°C</button>
  33:         <button id="themeToggle" class="btn btn--icon" title="Toggle theme" aria-label="Toggle theme">
  34:           <svg class="icon-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  35:             <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  36:           </svg>
  37:           <svg class="icon-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  38:             <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
  39:           </svg>
  40:         </button>
  41:       </div>
  42:     </header>
  43: 
  44:     <!-- Search -->
  45:     <div class="search">
  46:       <div class="search__wrapper">
  47:         <svg class="search__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  48:           <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  49:         </svg>
  50:         <input id="searchInput" class="search__input" type="text" placeholder="Search any city or place..." autocomplete="off" />
  51:         <button id="searchBtn" class="btn btn--primary">Search</button>
  52:       </div>
  53:       <div id="suggestions" class="search__suggestions hidden"></div>
  54:       <div id="recentSearches" class="search__recent hidden">
  55:         <span class="search__recent-label">Recent:</span>
  56:         <div id="recentList" class="search__recent-list"></div>
  57:       </div>
  58:     </div>
  59: 
  60:     <!-- Loading -->
  61:     <div id="loader" class="loader hidden">
  62:       <div class="loader__spinner"></div>
  63:       <p class="loader__text">Fetching weather data...</p>
  64:     </div>
  65: 
  66:     <!-- Error -->
  67:     <div id="error" class="error-card hidden">
  68:       <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  69:         <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
  70:       </svg>
  71:       <p id="errorMsg" class="error-card__msg"></p>
  72:       <button id="retryBtn" class="btn btn--primary">Retry</button>
  73:     </div>
  74: 
  75:     <!-- Main Weather Content -->
  76:     <main id="weatherContent" class="weather hidden">
  77: 
  78:       <!-- Current Weather Card -->
  79:       <section class="current-weather">
  80:         <div class="current-weather__main">
  81:           <div class="current-weather__info">
  82:             <div class="current-weather__location">
  83:               <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  84:                 <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  85:               </svg>
  86:               <h2 id="cityName" class="current-weather__city"></h2>
  87:             </div>
  88:             <p id="dateTime" class="current-weather__datetime"></p>
  89:             <p id="weatherDesc" class="current-weather__description"></p>
  90:           </div>
  91:           <div class="current-weather__temp-group">
  92:             <div id="weatherIconLarge" class="current-weather__icon-large"></div>
  93:             <div class="current-weather__temp-info">
  94:               <span id="currentTemp" class="current-weather__temp"></span>
  95:               <div class="current-weather__highlow">
  96:                 <span id="highTemp" class="current-weather__high"></span>
  97:                 <span id="lowTemp" class="current-weather__low"></span>
  98:               </div>
  99:               <span id="feelsLike" class="current-weather__feels"></span>
 100:             </div>
 101:           </div>
 102:         </div>
 103: 
 104:         <!-- Alert Banner -->
 105:         <div id="alertBanner" class="alert-banner hidden">
 106:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
 107:             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>
 108:           </svg>
 109:           <span id="alertText"></span>
 110:         </div>
 111:       </section>
 112: 
 113:       <!-- Weather Details Grid -->
 114:       <section class="details-grid">
 115:         <div class="detail-card">
 116:           <div class="detail-card__header">
 117:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6l3-3M12 8l-3-3"/><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/></svg>
 118:             <span>Wind</span>
 119:           </div>
 120:           <p id="windSpeed" class="detail-card__value"></p>
 121:           <p id="windDir" class="detail-card__sub"></p>
 122:         </div>
 123:         <div class="detail-card">
 124:           <div class="detail-card__header">
 125:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
 126:             <span>Humidity</span>
 127:           </div>
 128:           <p id="humidity" class="detail-card__value"></p>
 129:           <div id="humidityBar" class="detail-card__bar"><div class="detail-card__bar-fill"></div></div>
 130:         </div>
 131:         <div class="detail-card">
 132:           <div class="detail-card__header">
 133:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
 134:             <span>Pressure</span>
 135:           </div>
 136:           <p id="pressure" class="detail-card__value"></p>
 137:           <p id="pressureTrend" class="detail-card__sub"></p>
 138:         </div>
 139:         <div class="detail-card">
 140:           <div class="detail-card__header">
 141:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
 142:             <span>Visibility</span>
 143:           </div>
 144:           <p id="visibility" class="detail-card__value"></p>
 145:           <p id="visibilityDesc" class="detail-card__sub"></p>
 146:         </div>
 147:         <div class="detail-card">
 148:           <div class="detail-card__header">
 149:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
 150:             <span>UV Index</span>
 151:           </div>
 152:           <p id="uvIndex" class="detail-card__value"></p>
 153:           <p id="uvDesc" class="detail-card__sub"></p>
 154:         </div>
 155:         <div class="detail-card">
 156:           <div class="detail-card__header">
 157:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 9V2"/><path d="M4.22 10.22l1.42 1.42M18.36 10.22l-1.42 1.42"/></svg>
 158:             <span>Sunrise / Sunset</span>
 159:           </div>
 160:           <p id="sunrise" class="detail-card__value"></p>
 161:           <p id="sunset" class="detail-card__sub"></p>
 162:         </div>
 163:         <div class="detail-card">
 164:           <div class="detail-card__header">
 165:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/></svg>
 166:             <span>Cloudiness</span>
 167:           </div>
 168:           <p id="clouds" class="detail-card__value"></p>
 169:           <p id="cloudsDesc" class="detail-card__sub"></p>
 170:         </div>
 171:         <div class="detail-card">
 172:           <div class="detail-card__header">
 173:             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6l3-3M12 8l-3-3"/><path d="M4.93 4.93l4.24 4.24"/><path d="M20 12h-6l3 3M14 12l3-3"/></svg>
 174:             <span>Dew Point</span>
 175:           </div>
 176:           <p id="dewPoint" class="detail-card__value"></p>
 177:           <p id="dewPointDesc" class="detail-card__sub"></p>
 178:         </div>
 179:       </section>
 180: 
 181:       <!-- Hourly Forecast -->
 182:       <section class="forecast-section">
 183:         <h3 class="section-title">
 184:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
 185:           Hourly Forecast
 186:         </h3>
 187:         <div id="hourlyForecast" class="hourly-forecast"></div>
 188:       </section>
 189: 
 190:       <!-- 5-Day Forecast -->
 191:       <section class="forecast-section">
 192:         <h3 class="section-title">
 193:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
 194:           5-Day Forecast
 195:         </h3>
 196:         <div id="dailyForecast" class="daily-forecast"></div>
 197:       </section>
 198: 
 199:       <!-- Air Quality -->
 200:       <section id="aqiSection" class="forecast-section hidden">
 201:         <h3 class="section-title">
 202:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8l4 10H4z"/><path d="M12 12v10"/><path d="M8 22h8"/></svg>
 203:           Air Quality
 204:         </h3>
 205:         <div class="aqi-card">
 206:           <div class="aqi-card__gauge">
 207:             <div id="aqiValue" class="aqi-card__value"></div>
 208:             <div id="aqiLabel" class="aqi-card__label"></div>
 209:           </div>
 210:           <div id="aqiDetails" class="aqi-card__details"></div>
 211:         </div>
 212:       </section>
 213: 
 214:       <!-- Weather Map placeholder -->
 215:       <section class="forecast-section">
 216:         <h3 class="section-title">
 217:           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><path d="M8 2v16M16 6v16"/></svg>
 218:           Weather Summary
 219:         </h3>
 220:         <div id="weatherSummary" class="summary-card"></div>
 221:       </section>
 222: 
 223:     </main>
 224: 
 225:     <!-- Footer -->
 226:     <footer class="footer">
 227:       <p>Built with ♥ — Data from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></p>
 228:     </footer>
 229:   </div>
 230: 
 231:   <script src="app.js"></script>
 232: </body>
 233: </html>
 234: 
```

---

## 🎨 style.css

**Path:** `WeatherApp/style.css`

```css
   1: /* ============================================================
   2:    WeatherApp — Modern Smart Weather App Styles
   3:    ============================================================ */
   4: 
   5: /* ---------- CSS Variables ---------- */
   6: :root {
   7:   --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
   8:   --radius: 16px;
   9:   --radius-sm: 10px;
  10:   --radius-xs: 6px;
  11:   --transition: 0.3s cubic-bezier(.4,0,.2,1);
  12:   --shadow: 0 8px 32px rgba(0,0,0,.12);
  13:   --shadow-lg: 0 16px 48px rgba(0,0,0,.18);
  14: }
  15: 
  16: [data-theme="dark"] {
  17:   --bg-primary: #0f172a;
  18:   --bg-secondary: #1e293b;
  19:   --bg-card: rgba(30, 41, 59, 0.7);
  20:   --bg-glass: rgba(30, 41, 59, 0.55);
  21:   --border: rgba(148, 163, 184, 0.12);
  22:   --text-primary: #f1f5f9;
  23:   --text-secondary: #94a3b8;
  24:   --text-muted: #64748b;
  25:   --accent: #38bdf8;
  26:   --accent-glow: rgba(56, 189, 248, 0.25);
  27:   --danger: #f87171;
  28:   --success: #4ade80;
  29:   --warning: #fbbf24;
  30:   --gradient-hero: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  31:   --glass-blur: 20px;
  32:   --scrollbar-track: #1e293b;
  33:   --scrollbar-thumb: #334155;
  34: }
  35: 
  36: [data-theme="light"] {
  37:   --bg-primary: #f0f4ff;
  38:   --bg-secondary: #ffffff;
  39:   --bg-card: rgba(255, 255, 255, 0.75);
  40:   --bg-glass: rgba(255, 255, 255, 0.6);
  41:   --border: rgba(148, 163, 184, 0.2);
  42:   --text-primary: #0f172a;
  43:   --text-secondary: #475569;
  44:   --text-muted: #94a3b8;
  45:   --accent: #0ea5e9;
  46:   --accent-glow: rgba(14, 165, 233, 0.2);
  47:   --danger: #ef4444;
  48:   --success: #22c55e;
  49:   --warning: #f59e0b;
  50:   --gradient-hero: linear-gradient(135deg, #e0f2fe 0%, #f0f4ff 50%, #e0f2fe 100%);
  51:   --glass-blur: 24px;
  52:   --scrollbar-track: #e2e8f0;
  53:   --scrollbar-thumb: #cbd5e1;
  54: }
  55: 
  56: /* ---------- Reset & Base ---------- */
  57: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  58: 
  59: html {
  60:   font-size: 16px;
  61:   scroll-behavior: smooth;
  62:   -webkit-font-smoothing: antialiased;
  63: }
  64: 
  65: body {
  66:   font-family: var(--font);
  67:   background: var(--bg-primary);
  68:   color: var(--text-primary);
  69:   min-height: 100vh;
  70:   overflow-x: hidden;
  71:   transition: background var(--transition), color var(--transition);
  72: }
  73: 
  74: a { color: var(--accent); text-decoration: none; }
  75: a:hover { text-decoration: underline; }
  76: 
  77: /* Custom scrollbar */
  78: ::-webkit-scrollbar { width: 8px; height: 8px; }
  79: ::-webkit-scrollbar-track { background: var(--scrollbar-track); border-radius: 4px; }
  80: ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }
  81: 
  82: /* ---------- Particles ---------- */
  83: .particles {
  84:   position: fixed; inset: 0;
  85:   pointer-events: none;
  86:   z-index: 0;
  87:   overflow: hidden;
  88: }
  89: 
  90: .particle {
  91:   position: absolute;
  92:   border-radius: 50%;
  93:   background: var(--accent);
  94:   opacity: 0.08;
  95:   animation: float linear infinite;
  96: }
  97: 
  98: @keyframes float {
  99:   0%   { transform: translateY(100vh) scale(0); opacity: 0; }
 100:   10%  { opacity: 0.08; }
 101:   90%  { opacity: 0.08; }
 102:   100% { transform: translateY(-10vh) scale(1); opacity: 0; }
 103: }
 104: 
 105: /* ---------- App Container ---------- */
 106: .app {
 107:   position: relative;
 108:   z-index: 1;
 109:   max-width: 900px;
 110:   margin: 0 auto;
 111:   padding: 20px 20px 40px;
 112: }
 113: 
 114: /* ---------- Utility ---------- */
 115: .hidden { display: none !important; }
 116: 
 117: /* ---------- Buttons ---------- */
 118: .btn {
 119:   display: inline-flex;
 120:   align-items: center;
 121:   justify-content: center;
 122:   gap: 6px;
 123:   border: none;
 124:   cursor: pointer;
 125:   font-family: var(--font);
 126:   font-weight: 500;
 127:   transition: all var(--transition);
 128:   border-radius: var(--radius-xs);
 129:   font-size: 0.875rem;
 130: }
 131: 
 132: .btn--icon {
 133:   width: 40px; height: 40px;
 134:   background: var(--bg-glass);
 135:   backdrop-filter: blur(var(--glass-blur));
 136:   color: var(--text-secondary);
 137:   border: 1px solid var(--border);
 138:   border-radius: var(--radius-sm);
 139: }
 140: 
 141: .btn--icon:hover {
 142:   color: var(--accent);
 143:   border-color: var(--accent);
 144:   box-shadow: 0 0 12px var(--accent-glow);
 145: }
 146: 
 147: .btn--pill {
 148:   padding: 6px 14px;
 149:   background: var(--bg-glass);
 150:   backdrop-filter: blur(var(--glass-blur));
 151:   color: var(--text-secondary);
 152:   border: 1px solid var(--border);
 153:   border-radius: 20px;
 154:   font-weight: 600;
 155: }
 156: 
 157: .btn--pill:hover { color: var(--accent); border-color: var(--accent); }
 158: .btn--pill.active { color: var(--accent); border-color: var(--accent); }
 159: 
 160: .btn--primary {
 161:   padding: 10px 22px;
 162:   background: var(--accent);
 163:   color: #0f172a;
 164:   border-radius: var(--radius-sm);
 165:   font-weight: 600;
 166: }
 167: 
 168: .btn--primary:hover {
 169:   filter: brightness(1.1);
 170:   box-shadow: 0 0 20px var(--accent-glow);
 171: }
 172: 
 173: .btn--full { width: 100%; }
 174: 
 175: /* ---------- Header ---------- */
 176: .header {
 177:   display: flex;
 178:   align-items: center;
 179:   justify-content: space-between;
 180:   padding: 12px 0;
 181:   margin-bottom: 20px;
 182: }
 183: 
 184: .header__brand { display: flex; align-items: center; gap: 10px; }
 185: .header__logo { color: var(--accent); }
 186: .header__title { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.5px; }
 187: .header__actions { display: flex; align-items: center; gap: 8px; }
 188: 
 189: /* Theme toggle icons */
 190: [data-theme="dark"] .icon-moon { display: none; }
 191: [data-theme="light"] .icon-sun { display: none; }
 192: 
 193: /* ---------- Search ---------- */
 194: .search { margin-bottom: 24px; position: relative; }
 195: 
 196: .search__wrapper {
 197:   display: flex;
 198:   align-items: center;
 199:   gap: 10px;
 200:   background: var(--bg-glass);
 201:   backdrop-filter: blur(var(--glass-blur));
 202:   border: 1px solid var(--border);
 203:   border-radius: var(--radius);
 204:   padding: 6px 6px 6px 16px;
 205:   transition: border-color var(--transition), box-shadow var(--transition);
 206: }
 207: 
 208: .search__wrapper:focus-within {
 209:   border-color: var(--accent);
 210:   box-shadow: 0 0 20px var(--accent-glow);
 211: }
 212: 
 213: .search__icon { color: var(--text-muted); flex-shrink: 0; }
 214: 
 215: .search__input {
 216:   flex: 1;
 217:   background: transparent;
 218:   border: none;
 219:   outline: none;
 220:   color: var(--text-primary);
 221:   font-family: var(--font);
 222:   font-size: 1rem;
 223:   padding: 10px 4px;
 224: }
 225: 
 226: .search__input::placeholder { color: var(--text-muted); }
 227: 
 228: .search__suggestions {
 229:   position: absolute;
 230:   top: calc(100% + 4px);
 231:   left: 0; right: 0;
 232:   background: var(--bg-secondary);
 233:   border: 1px solid var(--border);
 234:   border-radius: var(--radius-sm);
 235:   box-shadow: var(--shadow-lg);
 236:   z-index: 100;
 237:   max-height: 260px;
 238:   overflow-y: auto;
 239: }
 240: 
 241: .search__suggestion {
 242:   padding: 12px 16px;
 243:   cursor: pointer;
 244:   transition: background var(--transition);
 245:   display: flex;
 246:   align-items: center;
 247:   gap: 10px;
 248:   font-size: 0.9rem;
 249: }
 250: 
 251: .search__suggestion:hover { background: var(--accent-glow); }
 252: .search__suggestion-country { color: var(--text-muted); font-size: 0.8rem; }
 253: 
 254: .search__recent {
 255:   display: flex;
 256:   align-items: center;
 257:   gap: 8px;
 258:   margin-top: 10px;
 259:   flex-wrap: wrap;
 260: }
 261: 
 262: .search__recent-label { color: var(--text-muted); font-size: 0.8rem; }
 263: 
 264: .search__recent-list { display: flex; gap: 6px; flex-wrap: wrap; }
 265: 
 266: .search__recent-item {
 267:   padding: 4px 12px;
 268:   background: var(--bg-glass);
 269:   backdrop-filter: blur(8px);
 270:   border: 1px solid var(--border);
 271:   border-radius: 16px;
 272:   font-size: 0.8rem;
 273:   color: var(--text-secondary);
 274:   cursor: pointer;
 275:   transition: all var(--transition);
 276: }
 277: 
 278: .search__recent-item:hover {
 279:   color: var(--accent);
 280:   border-color: var(--accent);
 281: }
 282: 
 283: /* ---------- Loader ---------- */
 284: .loader {
 285:   display: flex;
 286:   flex-direction: column;
 287:   align-items: center;
 288:   gap: 16px;
 289:   padding: 60px 0;
 290: }
 291: 
 292: .loader__spinner {
 293:   width: 48px; height: 48px;
 294:   border: 3px solid var(--border);
 295:   border-top-color: var(--accent);
 296:   border-radius: 50%;
 297:   animation: spin 0.8s linear infinite;
 298: }
 299: 
 300: @keyframes spin { to { transform: rotate(360deg); } }
 301: 
 302: .loader__text { color: var(--text-muted); font-size: 0.9rem; }
 303: 
 304: /* ---------- Error ---------- */
 305: .error-card {
 306:   display: flex;
 307:   flex-direction: column;
 308:   align-items: center;
 309:   gap: 16px;
 310:   padding: 60px 20px;
 311:   text-align: center;
 312:   color: var(--text-secondary);
 313: }
 314: 
 315: .error-card svg { color: var(--danger); }
 316: .error-card__msg { font-size: 1rem; max-width: 400px; }
 317: 
 318: /* ---------- Current Weather ---------- */
 319: .current-weather {
 320:   background: var(--bg-glass);
 321:   backdrop-filter: blur(var(--glass-blur));
 322:   border: 1px solid var(--border);
 323:   border-radius: var(--radius);
 324:   padding: 28px;
 325:   margin-bottom: 20px;
 326:   animation: fadeUp 0.5s ease-out;
 327: }
 328: 
 329: @keyframes fadeUp {
 330:   from { opacity: 0; transform: translateY(20px); }
 331:   to   { opacity: 1; transform: translateY(0); }
 332: }
 333: 
 334: .current-weather__main {
 335:   display: flex;
 336:   align-items: flex-start;
 337:   justify-content: space-between;
 338:   gap: 20px;
 339:   flex-wrap: wrap;
 340: }
 341: 
 342: .current-weather__location {
 343:   display: flex;
 344:   align-items: center;
 345:   gap: 6px;
 346:   color: var(--text-secondary);
 347: }
 348: 
 349: .current-weather__city { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
 350: .current-weather__datetime { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
 351: 
 352: .current-weather__description {
 353:   font-size: 1rem;
 354:   color: var(--text-secondary);
 355:   margin-top: 8px;
 356:   text-transform: capitalize;
 357: }
 358: 
 359: .current-weather__temp-group {
 360:   display: flex;
 361:   align-items: center;
 362:   gap: 16px;
 363: }
 364: 
 365: .current-weather__icon-large {
 366:   font-size: 4rem;
 367:   line-height: 1;
 368:   filter: drop-shadow(0 4px 12px var(--accent-glow));
 369:   animation: iconBounce 2s ease-in-out infinite;
 370: }
 371: 
 372: @keyframes iconBounce {
 373:   0%, 100% { transform: translateY(0); }
 374:   50%      { transform: translateY(-6px); }
 375: }
 376: 
 377: .current-weather__temp-info { text-align: right; }
 378: 
 379: .current-weather__temp {
 380:   font-size: 3.8rem;
 381:   font-weight: 800;
 382:   letter-spacing: -3px;
 383:   line-height: 1;
 384:   background: linear-gradient(135deg, var(--text-primary), var(--accent));
 385:   -webkit-background-clip: text;
 386:   -webkit-text-fill-color: transparent;
 387:   background-clip: text;
 388: }
 389: 
 390: .current-weather__highlow {
 391:   display: flex;
 392:   gap: 10px;
 393:   justify-content: flex-end;
 394:   margin-top: 4px;
 395:   font-size: 0.9rem;
 396: }
 397: 
 398: .current-weather__high { color: var(--danger); font-weight: 600; }
 399: .current-weather__low { color: var(--accent); font-weight: 600; }
 400: 
 401: .current-weather__feels {
 402:   color: var(--text-muted);
 403:   font-size: 0.85rem;
 404:   margin-top: 2px;
 405:   display: block;
 406:   text-align: right;
 407: }
 408: 
 409: /* ---------- Alert Banner ---------- */
 410: .alert-banner {
 411:   display: flex;
 412:   align-items: center;
 413:   gap: 10px;
 414:   margin-top: 16px;
 415:   padding: 12px 16px;
 416:   background: rgba(251, 191, 36, 0.12);
 417:   border: 1px solid rgba(251, 191, 36, 0.3);
 418:   border-radius: var(--radius-sm);
 419:   color: var(--warning);
 420:   font-size: 0.875rem;
 421:   animation: fadeUp 0.5s ease-out;
 422: }
 423: 
 424: /* ---------- Details Grid ---------- */
 425: .details-grid {
 426:   display: grid;
 427:   grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
 428:   gap: 14px;
 429:   margin-bottom: 24px;
 430: }
 431: 
 432: .detail-card {
 433:   background: var(--bg-glass);
 434:   backdrop-filter: blur(var(--glass-blur));
 435:   border: 1px solid var(--border);
 436:   border-radius: var(--radius-sm);
 437:   padding: 18px;
 438:   transition: transform var(--transition), box-shadow var(--transition);
 439:   animation: fadeUp 0.5s ease-out both;
 440: }
 441: 
 442: .detail-card:nth-child(1) { animation-delay: 0.05s; }
 443: .detail-card:nth-child(2) { animation-delay: 0.1s; }
 444: .detail-card:nth-child(3) { animation-delay: 0.15s; }
 445: .detail-card:nth-child(4) { animation-delay: 0.2s; }
 446: .detail-card:nth-child(5) { animation-delay: 0.25s; }
 447: .detail-card:nth-child(6) { animation-delay: 0.3s; }
 448: .detail-card:nth-child(7) { animation-delay: 0.35s; }
 449: .detail-card:nth-child(8) { animation-delay: 0.4s; }
 450: 
 451: .detail-card:hover {
 452:   transform: translateY(-3px);
 453:   box-shadow: 0 8px 24px rgba(0,0,0,.1);
 454: }
 455: 
 456: .detail-card__header {
 457:   display: flex;
 458:   align-items: center;
 459:   gap: 8px;
 460:   color: var(--text-muted);
 461:   font-size: 0.8rem;
 462:   text-transform: uppercase;
 463:   letter-spacing: 0.5px;
 464:   margin-bottom: 10px;
 465: }
 466: 
 467: .detail-card__value {
 468:   font-size: 1.4rem;
 469:   font-weight: 700;
 470:   color: var(--text-primary);
 471: }
 472: 
 473: .detail-card__sub {
 474:   color: var(--text-muted);
 475:   font-size: 0.8rem;
 476:   margin-top: 4px;
 477: }
 478: 
 479: .detail-card__bar {
 480:   height: 4px;
 481:   background: var(--border);
 482:   border-radius: 2px;
 483:   margin-top: 8px;
 484:   overflow: hidden;
 485: }
 486: 
 487: .detail-card__bar-fill {
 488:   height: 100%;
 489:   background: var(--accent);
 490:   border-radius: 2px;
 491:   transition: width 1s ease-out;
 492: }
 493: 
 494: /* ---------- Section Title ---------- */
 495: .section-title {
 496:   display: flex;
 497:   align-items: center;
 498:   gap: 8px;
 499:   font-size: 1rem;
 500:   font-weight: 600;
 501:   color: var(--text-secondary);
 502:   margin-bottom: 14px;
 503: }
 504: 
 505: .section-title svg { color: var(--accent); }
 506: 
 507: /* ---------- Forecast Section ---------- */
 508: .forecast-section {
 509:   margin-bottom: 24px;
 510:   animation: fadeUp 0.5s ease-out both;
 511: }
 512: 
 513: /* ---------- Hourly Forecast ---------- */
 514: .hourly-forecast {
 515:   display: flex;
 516:   gap: 12px;
 517:   overflow-x: auto;
 518:   padding-bottom: 8px;
 519:   scroll-snap-type: x mandatory;
 520: }
 521: 
 522: .hourly-card {
 523:   flex: 0 0 90px;
 524:   display: flex;
 525:   flex-direction: column;
 526:   align-items: center;
 527:   gap: 6px;
 528:   padding: 14px 10px;
 529:   background: var(--bg-glass);
 530:   backdrop-filter: blur(var(--glass-blur));
 531:   border: 1px solid var(--border);
 532:   border-radius: var(--radius-sm);
 533:   scroll-snap-align: start;
 534:   transition: all var(--transition);
 535: }
 536: 
 537: .hourly-card:hover {
 538:   border-color: var(--accent);
 539:   box-shadow: 0 0 12px var(--accent-glow);
 540: }
 541: 
 542: .hourly-card.now {
 543:   border-color: var(--accent);
 544:   background: var(--accent-glow);
 545: }
 546: 
 547: .hourly-card__time {
 548:   font-size: 0.75rem;
 549:   font-weight: 600;
 550:   color: var(--text-muted);
 551: }
 552: 
 553: .hourly-card__icon { font-size: 1.5rem; }
 554: .hourly-card__temp { font-size: 1rem; font-weight: 700; }
 555: 
 556: .hourly-card__pop {
 557:   font-size: 0.7rem;
 558:   color: var(--accent);
 559:   display: flex;
 560:   align-items: center;
 561:   gap: 2px;
 562: }
 563: 
 564: /* ---------- Daily Forecast ---------- */
 565: .daily-forecast {
 566:   display: flex;
 567:   flex-direction: column;
 568:   gap: 8px;
 569: }
 570: 
 571: .daily-card {
 572:   display: grid;
 573:   grid-template-columns: 1fr auto 1fr auto;
 574:   align-items: center;
 575:   gap: 12px;
 576:   padding: 14px 18px;
 577:   background: var(--bg-glass);
 578:   backdrop-filter: blur(var(--glass-blur));
 579:   border: 1px solid var(--border);
 580:   border-radius: var(--radius-sm);
 581:   transition: all var(--transition);
 582: }
 583: 
 584: .daily-card:hover {
 585:   border-color: var(--accent);
 586:   box-shadow: 0 0 12px var(--accent-glow);
 587: }
 588: 
 589: .daily-card__day { font-weight: 600; font-size: 0.9rem; }
 590: .daily-card__icon { font-size: 1.5rem; }
 591: 
 592: .daily-card__temps {
 593:   display: flex;
 594:   align-items: center;
 595:   gap: 6px;
 596:   justify-self: end;
 597: }
 598: 
 599: .daily-card__bar-wrapper {
 600:   width: 80px;
 601:   height: 4px;
 602:   background: var(--border);
 603:   border-radius: 2px;
 604:   position: relative;
 605:   overflow: hidden;
 606: }
 607: 
 608: .daily-card__bar-fill {
 609:   position: absolute;
 610:   height: 100%;
 611:   background: linear-gradient(90deg, var(--accent), var(--danger));
 612:   border-radius: 2px;
 613:   transition: all 0.8s ease-out;
 614: }
 615: 
 616: .daily-card__high { font-weight: 700; font-size: 0.9rem; }
 617: .daily-card__low { color: var(--text-muted); font-size: 0.9rem; }
 618: 
 619: .daily-card__pop {
 620:   font-size: 0.75rem;
 621:   color: var(--accent);
 622:   display: flex;
 623:   align-items: center;
 624:   gap: 3px;
 625: }
 626: 
 627: /* ---------- AQI ---------- */
 628: .aqi-card {
 629:   display: flex;
 630:   gap: 24px;
 631:   padding: 24px;
 632:   background: var(--bg-glass);
 633:   backdrop-filter: blur(var(--glass-blur));
 634:   border: 1px solid var(--border);
 635:   border-radius: var(--radius-sm);
 636:   align-items: center;
 637:   flex-wrap: wrap;
 638: }
 639: 
 640: .aqi-card__gauge { text-align: center; min-width: 100px; }
 641: 
 642: .aqi-card__value {
 643:   font-size: 2.4rem;
 644:   font-weight: 800;
 645: }
 646: 
 647: .aqi-card__label {
 648:   font-size: 0.85rem;
 649:   font-weight: 600;
 650:   margin-top: 4px;
 651: }
 652: 
 653: .aqi-card__details {
 654:   display: grid;
 655:   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
 656:   gap: 10px;
 657:   flex: 1;
 658: }
 659: 
 660: .aqi-detail {
 661:   text-align: center;
 662:   padding: 10px;
 663:   background: var(--bg-card);
 664:   border-radius: var(--radius-xs);
 665: }
 666: 
 667: .aqi-detail__label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
 668: .aqi-detail__value { font-size: 1rem; font-weight: 600; margin-top: 2px; }
 669: 
 670: /* ---------- Summary ---------- */
 671: .summary-card {
 672:   padding: 24px;
 673:   background: var(--bg-glass);
 674:   backdrop-filter: blur(var(--glass-blur));
 675:   border: 1px solid var(--border);
 676:   border-radius: var(--radius-sm);
 677:   color: var(--text-secondary);
 678:   font-size: 0.95rem;
 679:   line-height: 1.7;
 680: }
 681: 
 682: /* ---------- Footer ---------- */
 683: .footer {
 684:   text-align: center;
 685:   padding: 20px 0;
 686:   color: var(--text-muted);
 687:   font-size: 0.8rem;
 688: }
 689: 
 690: /* ---------- Modal ---------- */
 691: .modal {
 692:   position: fixed;
 693:   inset: 0;
 694:   z-index: 1000;
 695:   display: flex;
 696:   align-items: center;
 697:   justify-content: center;
 698: }
 699: 
 700: .modal__backdrop {
 701:   position: absolute;
 702:   inset: 0;
 703:   background: rgba(0,0,0,.6);
 704:   backdrop-filter: blur(6px);
 705: }
 706: 
 707: .modal__content {
 708:   position: relative;
 709:   background: var(--bg-secondary);
 710:   border: 1px solid var(--border);
 711:   border-radius: var(--radius);
 712:   padding: 36px;
 713:   max-width: 440px;
 714:   width: 90%;
 715:   text-align: center;
 716:   box-shadow: var(--shadow-lg);
 717: }
 718: 
 719: .modal__content h2 { margin-bottom: 12px; font-size: 1.4rem; }
 720: .modal__content p { color: var(--text-secondary); margin-bottom: 16px; font-size: 0.9rem; }
 721: .modal__content .search__input { width: 100%; margin-bottom: 14px; padding: 12px 16px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); }
 722: .modal__hint { color: var(--text-muted); font-size: 0.75rem !important; margin-bottom: 0 !important; }
 723: 
 724: /* ---------- Responsive ---------- */
 725: @media (max-width: 640px) {
 726:   .app { padding: 14px 14px 32px; }
 727:   .header__title { font-size: 1.15rem; }
 728:   .current-weather { padding: 20px; }
 729:   .current-weather__main { flex-direction: column; }
 730:   .current-weather__temp-group { align-self: stretch; justify-content: space-between; }
 731:   .current-weather__temp { font-size: 3rem; }
 732:   .current-weather__temp-info { text-align: left; }
 733:   .current-weather__highlow { justify-content: flex-start; }
 734:   .current-weather__feels { text-align: left; }
 735:   .details-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
 736:   .detail-card { padding: 14px; }
 737:   .daily-card { grid-template-columns: 1fr auto auto auto; gap: 8px; padding: 12px 14px; }
 738:   .daily-card__bar-wrapper { width: 50px; }
 739:   .aqi-card { flex-direction: column; }
 740: }
 741: 
```

---
