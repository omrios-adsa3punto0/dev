// src/services/maps-autocomplete.ts
export async function fetchPlacesSuggestions(input: string) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=address&language=es-419&key=${apiKey}`;

  const res = await fetch(endpoint);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Error con Google Places:", data);
    return [];
  }

  return data.predictions.map((p: any) => ({
    description: p.description,
    placeId: p.place_id,
  }));
}

export async function fetchPlaceDetails(placeId: string) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`;

  const res = await fetch(endpoint);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Error obteniendo detalles:", data);
    return null;
  }

  const result = data.result;
  return {
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
}
