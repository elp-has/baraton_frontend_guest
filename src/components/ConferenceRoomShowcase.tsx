

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Tv, Coffee, Car, Users, Bed } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import BookingDialog from './BookingDialog';
import RoomImageCarousel from './RoomImageCarousel';

const ConferenceRoomShowcase = () => {
  const queryClient = useQueryClient();
  const { data: conferenceRoomsRaw, isLoading } = useQuery({
    queryKey: ['conference-rooms'],
    queryFn: async () => {
      const res = await axios.get('/api/conferences');
      return res.data || [];
    }
  });
  const conferenceRooms = Array.isArray(conferenceRoomsRaw) ? conferenceRoomsRaw : [];

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6">
              Conference & Event Spaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our available conference rooms...
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
            Conference & Event Spaces
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-in">
            Host your meetings, seminars, and events in our modern, flexible conference rooms.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {conferenceRooms.map((room, index) => (
            <Card key={room.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative">
                <RoomImageCarousel 
                  images={Array.isArray(room.images) ? room.images.filter(Boolean).map((img: any, idx: number) => ({
                    id: img?.id || `${room.id}-img-${idx}`,
                    image_url: typeof img === 'string' ? img : img?.image_url || img?.url || '',
                    display_order: img?.display_order ?? idx,
                    is_primary: img?.is_primary ?? idx === 0,
                  })) : []}
                  fallbackImageUrl={room.image_url || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&h=300&fit=crop"}
                  className="h-64"
                />
                <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-navy font-semibold">
                  KSh {(room.price_per_hour / 100).toLocaleString()}/hour
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-hotel-navy">{room.name}</h3>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {room.capacity} Capacity
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      Room {room.room_number}
                    </div>
                  </div>
                </div>
                {/* You can add a RoomAvailabilityInfo-like component for conference rooms if needed */}
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
                <BookingDialog room={{
                  ...room,
                  price_per_night: room.price_per_hour,
                  type: room.type as
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
                    | "seminar_hall"
                }}>
                  <Button className="w-full bg-hotel-navy hover:bg-hotel-charcoal text-white py-3 rounded-lg transition-all duration-300">
                    Book Conference Room
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

export default ConferenceRoomShowcase;
