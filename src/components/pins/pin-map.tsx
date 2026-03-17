"use client";

import { useRef, useMemo } from "react";
import MapGL, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface Pin {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
}

interface PinMapProps {
  pins: Pin[];
  selectedPinId: string | null;
  onPinSelect: (id: string | null) => void;
}

const categoryColors: Record<string, string> = {
  food: "#ef4444",
  nature: "#22c55e",
  culture: "#8b5cf6",
  nightlife: "#f59e0b",
  shopping: "#ec4899",
  accommodation: "#3b82f6",
  activity: "#f97316",
  transport: "#6b7280",
  other: "#6b7280",
};

export function PinMap({ pins, selectedPinId, onPinSelect }: PinMapProps) {
  const mapRef = useRef(null);

  const geoLocatedPins = useMemo(
    () => pins.filter((p) => p.latitude != null && p.longitude != null),
    [pins]
  );

  // Calculate initial view state to fit all pins
  const initialViewState = useMemo(() => {
    if (geoLocatedPins.length === 0) {
      return { latitude: 20, longitude: 0, zoom: 2 };
    }
    if (geoLocatedPins.length === 1) {
      return {
        latitude: geoLocatedPins[0].latitude!,
        longitude: geoLocatedPins[0].longitude!,
        zoom: 12,
      };
    }

    const lats = geoLocatedPins.map((p) => p.latitude!);
    const lngs = geoLocatedPins.map((p) => p.longitude!);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    return { latitude: centerLat, longitude: centerLng, zoom: 5 };
  }, [geoLocatedPins]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapGL
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={token}
      onClick={() => onPinSelect(null)}
    >
      <NavigationControl position="top-right" />

      {geoLocatedPins.map((pin) => {
        const isSelected = pin.id === selectedPinId;
        const color =
          categoryColors[pin.category ?? "other"] ?? categoryColors.other;

        return (
          <Marker
            key={pin.id}
            latitude={pin.latitude!}
            longitude={pin.longitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPinSelect(pin.id);
            }}
          >
            <div
              className={`flex flex-col items-center transition-transform ${
                isSelected ? "scale-125" : "hover:scale-110"
              }`}
            >
              <div
                className="rounded-full p-1.5 shadow-md"
                style={{ backgroundColor: color }}
              >
                <MapPin className="h-4 w-4 text-white" />
              </div>
              {isSelected && (
                <span className="mt-1 max-w-[120px] truncate rounded bg-white px-1.5 py-0.5 text-xs font-medium shadow">
                  {pin.name}
                </span>
              )}
            </div>
          </Marker>
        );
      })}
    </MapGL>
  );
}
