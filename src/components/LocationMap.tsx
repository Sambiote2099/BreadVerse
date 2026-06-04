'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for Leaflet default icons - ONLY HERE, not in main page
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = L.icon({
    iconUrl: "https://res.cloudinary.com/diasvvkil/image/upload/v1769847944/marker-icon_jygci6.png",
    iconSize: [35, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Location {
    name: string;
    address: string;
    coordinates: [number, number];
    phone: string;
    email: string;
    hours: string;
    description: string;
}

interface LocationMapProps {
    locations: Location[];
    selectedLocation: number;
    setSelectedLocation: (index: number) => void;
}

export default function LocationMap({ locations, selectedLocation, setSelectedLocation }: LocationMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="h-[300px] sm:h-[380px] lg:h-[420px] w-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <MapContainer
            center={locations[selectedLocation].coordinates}
            zoom={15}
            scrollWheelZoom={true}
            className="h-full w-full"
            key={selectedLocation}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location, index) => (
                <Marker
                    key={index}
                    position={location.coordinates}
                    icon={customIcon}
                    eventHandlers={{
                        click: () => setSelectedLocation(index),
                    }}
                >
                    <Popup>
                        <div className="p-2">
                            <strong className="text-lg">{location.name}</strong>
                            <p className="text-sm mt-1">{location.address}</p>
                            <p className="text-sm mt-1 text-amber-600">
                                {location.phone}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}