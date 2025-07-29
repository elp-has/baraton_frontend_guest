// Room type definition for type safety
export type RoomType =
  | "standard"
  | "deluxe"
  | "executive_suite"
  | "conference_suite"
  | "superior"
  | "suite"
  | "presidential_suite"
  | "small_meeting_room"
  | "large_conference_hall"
  | "boardroom"
  | "training_room"
  | "seminar_hall";

type Room = {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  price_per_night: number;
  image_url?: string;
  images?: { id: string; image_url: string; alt_text?: string; display_order: number; is_primary: boolean }[];
  amenities: string[];
  capacity: number;
  size_sqm: number;
  created_at: string;
  updated_at: string;
  is_available: boolean;
  room_number: string;
};

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Tv, Coffee, Car, Users, Bed } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BookingDialog from './BookingDialog';
import RoomAvailabilityInfo from './RoomAvailabilityInfo';
import RoomImageCarousel from './RoomImageCarousel';

const RoomShowcase = () => {
  const queryClient = useQueryClient();
  
  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await axios.get('/api/lodgings');
      // Group rooms by type and return one representative room per type
      const roomsByType = res.data?.reduce((acc: any, room: any) => {
        if (!acc[room.type]) {
          acc[room.type] = room;
        }
        return acc;
      }, {} as Record<string, any>);
      const uniqueRooms = roomsByType ? Object.values(roomsByType) : [];
      // Ensure all required fields for Room type are present
      return uniqueRooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        price_per_night: room.price_per_night,
        image_url: room.image_url,
        images: room.images || [],
        amenities: room.amenities || [],
        capacity: room.capacity,
        size_sqm: room.size_sqm,
        created_at: room.created_at || '',
        updated_at: room.updated_at || '',
        is_available: room.is_available ?? true,
        room_number: room.room_number || '',
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {(rooms as Room[] | undefined)?.map((room, index) => (
            <Card key={room.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative">
                <RoomImageCarousel 
                  images={Array.isArray(room.images) ? room.images : []}
                  fallbackImageUrl={room.image_url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop"}
                  className="h-64"
                />
                <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-navy font-semibold">
                  KSh {(room.price_per_night / 100).toLocaleString()}/night
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-hotel-navy">{room.name}</h3>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {room.capacity} Guests
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Bed className="h-4 w-4 mr-1" />
                      {room.size_sqm} sqm
                    </div>
                  </div>
                </div>

                <RoomAvailabilityInfo roomType={room.type as any} />
                
                <p className="text-gray-600 mb-4 mt-4">{room.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.amenities?.slice(0, 4).map((amenity, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-hotel-gold rounded-full mr-2"></div>
                      {amenity}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 mb-6">
                  <Wifi className="h-5 w-5 text-hotel-gold" />
                  <Tv className="h-5 w-5 text-hotel-gold" />
                  <Coffee className="h-5 w-5 text-hotel-gold" />
                  <Car className="h-5 w-5 text-hotel-gold" />
                </div>
                
                <BookingDialog room={room as any}>
                  <Button className="w-full bg-hotel-navy hover:bg-hotel-charcoal text-white py-3 rounded-lg transition-all duration-300">
                    Book Now
                  </Button>
                </BookingDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomShowcase;
