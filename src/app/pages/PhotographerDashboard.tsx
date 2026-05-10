import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Camera, Wallet, TrendingUp, Image, DollarSign, Calendar, Users, Loader2, Upload, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import type { EventData } from "../types";

export default function PhotographerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newPhotoPrice, setNewPhotoPrice] = useState('15000');

  const [photoUploadEventId, setPhotoUploadEventId] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch('http://localhost:4000/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Gagal memuat data event');
    } finally {
      setIsLoadingEvents(false);
    }
  };



  const handleCreateEvent = async () => {
    if (!newEventName || !newEventDate || !newEventLocation) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEventName,
          date: newEventDate,
          location: newEventLocation,
          price: parseInt(newPhotoPrice) || 15000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setEvents(prev => [newEvent, ...prev]);
      toast.success('Event baru berhasil dibuat!');

      setNewEventName('');
      setNewEventDate('');
      setNewEventLocation('');
      setNewPhotoPrice('15000');

    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Gagal membuat event. Silakan coba lagi.');
    }
  };

  const handleWithdraw = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowWithdrawDialog(false);
    toast.success("Permintaan withdrawal berhasil! Dana akan diproses dalam 1-3 hari kerja");
  };

  const handleUploadPhotoClick = (eventId: string) => {
    setPhotoUploadEventId(eventId);
    const inputEl = document.getElementById('event-photo-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.value = '';
      inputEl.click();
    }
  };

  const handleEventPhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !photoUploadEventId) {
      return;
    }

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:4000/api/events/${photoUploadEventId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal upload foto event');
      }

      const data = await response.json();
      toast.success('Foto event berhasil ditambahkan');

      // Update local event list
      setEvents(prev => prev.map(ev => ev.eventId === photoUploadEventId ? data.event : ev));
    } catch (error) {
      console.error('Upload photo error:', error);
      toast.error('Gagal upload foto. Coba lagi.');
    } finally {
      setPhotoUploading(false);
      setPhotoUploadEventId(null);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SnapFind Pro
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Fotografer</h1>
          <p className="text-gray-600">Kelola event dan foto Anda dengan mudah</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Rp 2.450.000</div>
              <p className="text-xs text-gray-500 mt-1">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-600" />
                Total Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">3,247</div>
              <p className="text-xs text-gray-500 mt-1">Across 8 events</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Foto Terjual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">163</div>
              <p className="text-xs text-gray-500 mt-1">5% conversion rate</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-600" />
                Saldo Tersedia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">Rp 850.000</div>
              <Button 
                size="sm" 
                className="mt-2 bg-teal-500 hover:bg-teal-600"
                onClick={() => setShowWithdrawDialog(true)}
              >
                Tarik Saldo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Buat Event Baru</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="new-event-name">Nama Event</Label>
              <Input
                id="new-event-name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., Wisuda Universitas 2025"
              />
            </div>
            <div>
              <Label htmlFor="new-event-date">Tanggal Event</Label>
              <Input
                id="new-event-date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-event-location">Lokasi</Label>
              <Input
                id="new-event-location"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                placeholder="e.g., Jakarta"
              />
            </div>
            <div>
              <Label htmlFor="new-photo-price">Harga per Foto (Rp)</Label>
              <Input
                id="new-photo-price"
                type="number"
                value={newPhotoPrice}
                onChange={(e) => setNewPhotoPrice(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-600"
            onClick={handleCreateEvent}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Buat Event
          </Button>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold">Event Anda</h2>
        </div>

        {isLoadingEvents ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-purple-600">Memuat events...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-gray-500 mb-4">Belum ada event</div>
            <p className="text-sm text-gray-600">Silakan buat event melalui form di atas.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.eventId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>
                        {new Date(event.date).toLocaleDateString('id-ID')} · {event.location}
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status === 'active' ? 'Active' : 
                        event.status === 'processing' ? 'Processing' : 'Inactive'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{event.foundCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Foto</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{Math.floor(event.foundCount * 0.07)}</div>
                      <div className="text-xs text-gray-500">Terjual</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">Rp {(Math.floor(event.foundCount * 0.07) * event.price / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI Indexing Progress</span>
                      <span className="font-semibold">
                        {event.status === 'active' ? '100%' : event.status === 'processing' ? '67%' : '0%'}
                      </span>
                    </div>
                    <Progress value={event.status === 'active' ? 100 : event.status === 'processing' ? 67 : 0} className="h-2" />
                    {event.status === 'processing' && (<p className="text-xs text-gray-500">Estimasi selesai: 15 menit</p>)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/gallery/${event.eventId}`)}
                      disabled={event.status !== 'active'}
                    >
                      <Users className="mr-2 h-3 w-3" />Lihat Foto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.info('Statistik event akan segera hadir')}
                    >
                      <TrendingUp className="mr-2 h-3 w-3" />Statistik
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUploadPhotoClick(event.eventId)}
                      disabled={photoUploading}
                    >
                      <Upload className="mr-2 h-3 w-3" />Tambah Foto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <input
        id="event-photo-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleEventPhotoSelect}
      />

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tarik Saldo</DialogTitle>
            <DialogDescription>
              Masukkan jumlah yang ingin ditarik ke rekening bank Anda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-teal-50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">Saldo Tersedia</div>
                <div className="text-2xl font-bold text-teal-600">Rp 850.000</div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="amount">Jumlah Penarikan</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0" 
                defaultValue="850000"
              />
            </div>

            <div>
              <Label htmlFor="bank">Rekening Bank</Label>
              <Input 
                id="bank" 
                placeholder="BCA - 1234567890 (John Doe)" 
                defaultValue="BCA - 1234567890 (John Doe)"
                disabled
              />
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum penarikan: Rp 100.000</li>
                <li>Proses: 1-3 hari kerja</li>
                <li>Biaya admin: Rp 5.000</li>
              </ul>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-purple-600"
              onClick={handleWithdraw}
            >
              Ajukan Penarikan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
