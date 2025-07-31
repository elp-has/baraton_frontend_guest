// Lodging type definition for type safety (matches backend)
type Room = {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: number;
  amenities: string[];
  occupancy: string;
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
};

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Tv, Coffee, Car, Users, Bed } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Get API base URL from .env (Vite only)
const API_BASE_URL = import.meta.env.VITE_RAILWAY_API_URL || '';
import BookingDialog from './BookingDialog';
// ...existing code...
import RoomImageCarousel from './RoomImageCarousel';

const RoomShowcase = () => {
  const queryClient = useQueryClient();
  
  const { data: rooms, isLoading, error } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      if (!API_BASE_URL) {
        throw new Error('API base URL is not set. Please set VITE_RAILWAY_API_URL in your .env file and restart the dev server.');
      }
      const url = `https://${API_BASE_URL.replace(/^https?:\/\//, '')}/api/lodgings`;
      let res;
      try {
        res = await axios.get(url);
      } catch (err) {
        throw new Error('Unable to fetch rooms. Please check your network connection or try again later.');
      }
      if (!Array.isArray(res.data)) {
        console.warn('lodgings API did not return an array:', res.data);
        return [];
      }
      return res.data.map((room: any) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        price: room.price,
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
        occupancy: room.occupancy,
        image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
        created_at: room.created_at,
        updated_at: room.updated_at,
      })) as Room[];
    }
  });

  // Real-time subscription removed; backend does not support real-time updates

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6">
              Exceptional Accommodations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our available rooms...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-96 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6">
              Exceptional Accommodations
            </h2>
            <p className="text-xl text-red-500 max-w-3xl mx-auto">
              {(error as Error).message}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show a message if no rooms are available
  if (!rooms || rooms.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6 animate-fade-in">
              Exceptional Accommodations
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto animate-slide-in">
              No rooms are currently available. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Group rooms by type, then by occupancy
  const groupedByType: Record<string, Room[]> = {};
  rooms.forEach((room) => {
    if (!groupedByType[room.type]) groupedByType[room.type] = [];
    groupedByType[room.type].push(room);
  });

  // Sort types alphabetically
  const sortedTypes = Object.keys(groupedByType).sort();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6 animate-fade-in">
            Exceptional Accommodations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-in">
            Choose from our thoughtfully designed rooms and suites, each offering modern amenities 
            and stunning views of the surrounding landscape.
          </p>
        </div>
        {sortedTypes.map((type) => {
          // Group by occupancy within this type
          const roomsOfType = groupedByType[type];
          const groupedByOccupancy: Record<string, Room[]> = {};
          roomsOfType.forEach((room) => {
            if (!groupedByOccupancy[room.occupancy]) groupedByOccupancy[room.occupancy] = [];
            groupedByOccupancy[room.occupancy].push(room);
          });
          const sortedOccupancies = Object.keys(groupedByOccupancy).sort();
          return (
            <div key={type} className="mb-12">
              <h3 className="text-2xl font-bold text-hotel-gold mb-6">{type}</h3>
              {sortedOccupancies.map((occupancy) => (
                <div key={occupancy} className="mb-8">
                  <h4 className="text-xl font-semibold text-hotel-navy mb-4">{occupancy}</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {groupedByOccupancy[occupancy]
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((room, index) => (
                        <Card key={room.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`, minWidth: 0}}>
                          <div className="relative">
                            <RoomImageCarousel 
                              images={room.image_urls.map((url, idx) => ({ id: `${room.id}-img-${idx}`, image_url: url, display_order: idx, is_primary: idx === 0 }))}
                              fallbackImageUrl={room.image_urls[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop"}
                              className="w-full h-44 md:h-52 lg:h-44 object-cover rounded-t-lg overflow-hidden"
                            />
                            <Badge className="absolute top-2 right-2 bg-hotel-gold text-hotel-navy font-semibold text-xs px-2 py-1">
                              {room.price}/night
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-hotel-navy truncate" title={room.name}>{room.name}</h3>
                              <div className="text-right">
                                <div className="flex items-center text-gray-600 text-xs">
                                  <Users className="h-4 w-4 mr-1" />
                                  {room.occupancy}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2 mt-2 text-xs line-clamp-2">{room.description}</p>
                            <div className="grid grid-cols-2 gap-1 mb-3">
                              {room.amenities?.slice(0, 4).map((amenity, i) => (
                                <div key={i} className="flex items-center text-xs text-gray-600">
                                  <div className="w-2 h-2 bg-hotel-gold rounded-full mr-2"></div>
                                  {amenity}
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-1 mb-3">
                              <Wifi className="h-4 w-4 text-hotel-gold" />
                              <Tv className="h-4 w-4 text-hotel-gold" />
                              <Coffee className="h-4 w-4 text-hotel-gold" />
                              <Car className="h-4 w-4 text-hotel-gold" />
                            </div>
                            <BookingDialog 
                              room={{
                                ...room,
                                price_per_night: room.price ? room.price * 100 : 0,
                                // Optionally add price_per_hour if needed for conference rooms
                              }}
                              >
                              {/* Use Button as the trigger child, not as a wrapper */}
                              <span className="w-full block">
                                <Button className="w-full bg-hotel-navy hover:bg-hotel-charcoal text-white py-2 rounded-lg text-xs transition-all duration-300">Book Now</Button>
                              </span>
                            </BookingDialog>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoomShowcase;
