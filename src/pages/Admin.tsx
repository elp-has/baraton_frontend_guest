import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Users, Calendar, Home, LogOut, Trash2, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/AdminLogin';
import RoomEditDialog from '@/components/RoomEditDialog';

const Admin = () => {
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'standard',
    price_per_night: '',
    capacity: '',
    size_sqm: '',
    description: '',
    amenities: '',
    image_url: '',
    quantity: '1'
  });
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { admin, loading, logout, isAuthenticated } = useAdminAuth();


  // Handle image upload for new rooms
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `room-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(fileName);

      setNewRoom(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated
  });

  // Fetch bookings with room details
  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_booking_summary')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: isAuthenticated
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['booking-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_analytics')
        .select('*')
        .limit(12);
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const quantity = parseInt(roomData.quantity) || 1;
      const roomsToInsert = [];

      // Create multiple rooms of the same type
      for (let i = 0; i < quantity; i++) {
        roomsToInsert.push({
          name: quantity > 1 ? `${roomData.name} ${i + 1}` : roomData.name,
          type: roomData.type,
          price_per_night: parseInt(roomData.price_per_night) * 100,
          capacity: parseInt(roomData.capacity),
          size_sqm: roomData.size_sqm ? parseInt(roomData.size_sqm) : null,
          description: roomData.description,
          amenities: roomData.amenities ? roomData.amenities.split(',').map((a: string) => a.trim()) : [],
          image_url: roomData.image_url
        });
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert(roomsToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Success",
        description: "Room added successfully!",
      });
      setNewRoom({
        name: '',
        type: 'standard',
        price_per_night: '',
        capacity: '',
        size_sqm: '',
        description: '',
        amenities: '',
        image_url: '',
        quantity: '1'
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete room mutation - Fixed to properly delete
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      // First check if room has any bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .limit(1);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        throw new Error('Cannot delete room with existing bookings');
      }

      // Delete the room
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      
      return roomId;
    },
    onSuccess: (deletedRoomId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setDeletingRoomId(null);
      toast({
        title: "Success",
        description: "Room deleted successfully!",
      });
    },
    onError: (error: any) => {
      setDeletingRoomId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to delete room. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    addRoomMutation.mutate(newRoom);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (deletingRoomId === roomId) {
      deleteRoomMutation.mutate(roomId);
    } else {
      setDeletingRoomId(roomId);
      setTimeout(() => {
        setDeletingRoomId(null);
      }, 3000);
    }
  };

  const totalRevenue = analytics?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0;
  const totalBookings = analytics?.reduce((sum, item) => sum + (item.total_bookings || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-navy mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-hotel-navy">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {admin?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">KSh {(totalRevenue / 100).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Home className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold">{rooms?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                  <p className="text-2xl font-bold">{rooms?.filter(r => r.is_available).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Room
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddRoom} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                        required
                        placeholder="e.g., Deluxe Suite"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Room Type</Label>
                        <Select value={newRoom.type} onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                            <SelectItem value="executive_suite">Executive Suite</SelectItem>
                            <SelectItem value="conference_suite">Conference Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">How many rooms?</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="20"
                          value={newRoom.quantity}
                          onChange={(e) => setNewRoom({...newRoom, quantity: e.target.value})}
                          required
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price per Night (KSh)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newRoom.price_per_night}
                          onChange={(e) => setNewRoom({...newRoom, price_per_night: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="size">Size (sqm)</Label>
                      <Input
                        id="size"
                        type="number"
                        value={newRoom.size_sqm}
                        onChange={(e) => setNewRoom({...newRoom, size_sqm: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="amenities">Amenities (comma separated)</Label>
                      <Input
                        id="amenities"
                        value={newRoom.amenities}
                        onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                        placeholder="WiFi, TV, Air Conditioning, Mini Bar"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Room Image</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="flex-1"
                          />
                          <Button type="button" disabled={uploading} variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                        {newRoom.image_url && (
                          <div className="mt-2">
                            <img 
                              src={newRoom.image_url} 
                              alt="Room preview" 
                              className="h-20 w-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={addRoomMutation.isPending}>
                      {addRoomMutation.isPending ? 'Adding...' : 'Add Room'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Rooms List */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Room count summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Available Rooms by Type</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(
                        rooms?.filter(r => r.is_available).reduce((acc: Record<string, number>, room) => {
                          const type = room.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {}) || {}
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-600">{type}:</span>
                          <span className="font-medium">{count} available</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {roomsLoading ? (
                      <p>Loading rooms...</p>
                    ) : (
                      rooms?.map((room) => (
                        <div key={room.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              {room.image_url && (
                                <img 
                                  src={room.image_url} 
                                  alt={room.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold">{room.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{room.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={room.is_available ? "default" : "secondary"}>
                                {room.is_available ? "Available" : "Unavailable"}
                              </Badge>
                              <RoomEditDialog room={room} />
                              <Button
                                variant={deletingRoomId === room.id ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                                disabled={deleteRoomMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {deletingRoomId === room.id && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              Click delete again to confirm removal
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          <div className="text-sm space-y-1">
                            <p><strong>Type:</strong> {room.type.replace('_', ' ')}</p>
                            <p><strong>Price:</strong> KSh {(room.price_per_night / 100).toLocaleString()}/night</p>
                            <p><strong>Capacity:</strong> {room.capacity} guests</p>
                            {room.size_sqm && <p><strong>Size:</strong> {room.size_sqm} sqm</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings?.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{booking.guest_name}</h3>
                            <p className="text-sm text-gray-600">{booking.guest_email}</p>
                            {booking.guest_phone && (
                              <p className="text-sm text-gray-600">{booking.guest_phone}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={`${
                          booking.status === 'confirmed' ? 'bg-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500' :
                          booking.status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-500'
                        } text-white`}>
                          {booking.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Room</p>
                          <p className="font-medium">{booking.room_name}</p>
                          <p className="text-xs text-gray-500">{booking.room_type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{booking.guests} guests</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium">KSh {booking.total_amount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            Payment: <span className={`${
                              booking.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {booking.payment_status || 'pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                      {booking.special_requests && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Special Requests:</p>
                          <p className="text-sm">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.map((item) => (
                      <div key={item.month} className="flex justify-between items-center">
                        <span>{new Date(item.month || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="font-semibold">KSh {((item.total_revenue || 0) / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.map((item) => (
                      <div key={item.month} className="flex justify-between items-center">
                        <span>{new Date(item.month || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="font-semibold">{item.total_bookings || 0} bookings</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
