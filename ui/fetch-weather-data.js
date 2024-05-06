
export async function fetch_weather_data(lat, long) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherApiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "Failed to fetch weather data");
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
