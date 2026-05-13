import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Camera, Users, Image, TrendingUp, CheckCircle, XCircle, Clock, LogOut, Trash2, Loader2, MapPin, CalendarDays } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeEvents } from "../hooks/useRealtimeEvents";
import { API_BASE_URL, type EventData, type Transaction, type Withdrawal } from "../types";

const initialTransactions: Transaction[] = [
  { id: "1", code: "#TRX-2025-0347", user: "Sarah Johnson", desc: '5 foto dari event "Wisuda Universitas 2025"', amount: "Rp 75.000", method: "QRIS", time: "2 menit lalu", status: "pending" },
  { id: "2", code: "#TRX-2025-0346", user: "Michael Chen", desc: '3 foto dari event "Wedding Sarah & John"', amount: "Rp 45.000", method: "OVO", time: "15 menit lalu", status: "pending" },
  { id: "3", code: "#TRX-2025-0345", user: "Amanda Lee", desc: '8 foto dari event "Music Festival 2025"', amount: "Rp 120.000", method: "GoPay", time: "1 jam lalu", status: "success" },
];

const initialWithdrawals: Withdrawal[] = [
  { id: "1", code: "#WD-2025-0089", name: "John Photographer", bank: "BCA - 1234567890", amount: "Rp 850.000", initial: "Rp 850.000", time: "30 menit lalu", status: "pending" },
  { id: "2", code: "#WD-2025-0088", name: "Sarah Photography", bank: "Mandiri - 9876543210", amount: "Rp 1.200.000", initial: "Rp 1.200.000", time: "1 jam lalu", status: "pending" },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data: EventData[] = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat daftar event");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useRealtimeEvents({
    onEventCreated: (event) => {
      setEvents(prev => {
        if (prev.some(item => item.eventId === event.eventId)) return prev;
        return [event, ...prev];
      });
      toast.success(`Event baru masuk: ${event.name}`);
    },
    onEventDeleted: ({ eventId, eventName }) => {
      setEvents(prev => prev.filter(event => event.eventId !== eventId));
      toast.info(`Event dihapus${eventName ? `: ${eventName}` : ""}`);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleApprove = (type: "transaction" | "withdrawal", id: string) => {
    if (type === "transaction") {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: "success" } : t));
      toast.success("Transaksi berhasil disetujui");
    } else {
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: "success" } : w));
      toast.success("Withdrawal berhasil disetujui");
    }
  };

  const handleReject = (type: "transaction" | "withdrawal", id: string) => {
    if (type === "transaction") {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: "rejected" } : t));
      toast.error("Transaksi ditolak");
    } else {
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: "rejected" } : w));
      toast.error("Withdrawal ditolak");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setDeletingEventId(eventId);
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete event");
      }
      setEvents(prev => prev.filter(event => event.eventId !== eventId));
      toast.success(`Event dihapus. ${result.deletedPhotos || 0} foto terkait ikut dihapus.`);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus event");
    } finally {
      setDeletingEventId(null);
    }
  };

  const pendingTransactions = transactions.filter(t => t.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;
  const totalPhotos = events.reduce((sum, event) => sum + (event.foundCount || 0), 0);

  const getStatusBadge = (status: string) => {
    if (status === "pending") return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
    if (status === "success") return <Badge className="bg-green-100 text-green-700">Success</Badge>;
    return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
  };

  const getBorderColor = (status: string) => {
    if (status === "pending") return "border-l-amber-500";
    if (status === "success") return "border-l-green-500";
    return "border-l-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SnapFind Admin
            </span>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor dan kelola sistem SnapFind</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <p className="text-xs text-gray-500 mt-1">+23 bulan ini</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />Fotografer Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">89</div>
              <p className="text-xs text-gray-500 mt-1">{events.length} total events</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Image className="w-4 h-4 text-green-600" />Total Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPhotos}</div>
              <p className="text-xs text-gray-500 mt-1">foto tersimpan</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />GMV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">Rp 85.2M</div>
              <p className="text-xs text-gray-500 mt-1">bulan ini</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Verifikasi Transaksi</h2>
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {pendingTransactions} pending
              </Badge>
            </div>
            <div className="space-y-3">
              {transactions.map(t => (
                <Card key={t.id} className={`border-l-4 ${getBorderColor(t.status)} ${t.status !== "pending" ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(t.status)}
                          <span className="text-sm text-gray-500">{t.code}</span>
                        </div>
                        <h4 className="font-semibold mb-1">User: {t.user}</h4>
                        <p className="text-sm text-gray-600 mb-2">{t.desc}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-gray-600">Jumlah:</span><span className="font-semibold ml-2">{t.amount}</span></div>
                          <div><span className="text-gray-600">Metode:</span><span className="font-semibold ml-2">{t.method}</span></div>
                          <div><span className="text-gray-600">Waktu:</span><span className="font-semibold ml-2">{t.time}</span></div>
                        </div>
                      </div>
                      {t.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove("transaction", t.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject("transaction", t.id)}>
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Kelola Event</h2>
              <Badge variant="outline" className="text-sm">
                <Camera className="w-3 h-3 mr-1" />
                {events.length} event
              </Badge>
            </div>

            {loadingEvents ? (
              <Card>
                <CardContent className="p-8 flex items-center justify-center text-gray-600">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memuat event...
                </CardContent>
              </Card>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-600">
                  Belum ada event yang tersimpan.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <Card key={event.eventId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-100 text-blue-700">{event.status}</Badge>
                            <span className="text-sm text-gray-500">{event.eventId}</span>
                          </div>
                          <h4 className="font-semibold mb-2">{event.name}</h4>
                          <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{event.foundCount || 0}</span> foto
                            </div>
                            <div>
                              Rp {Number(event.price || 0).toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingEventId === event.eventId}
                            >
                              {deletingEventId === event.eventId ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                              )}
                              Hapus
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus event ini?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Event "{event.name}" akan dihapus permanen bersama semua data foto dan file gambar yang terkait. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDeleteEvent(event.eventId)}
                              >
                                Hapus Event
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Verifikasi Withdrawal</h2>
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {pendingWithdrawals} pending
              </Badge>
            </div>
            <div className="space-y-3">
              {withdrawals.map(w => (
                <Card key={w.id} className={`border-l-4 ${w.status === "pending" ? "border-l-purple-500" : getBorderColor(w.status)} ${w.status !== "pending" ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(w.status)}
                          <span className="text-sm text-gray-500">{w.code}</span>
                        </div>
                        <h4 className="font-semibold mb-1">Fotografer: {w.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{w.bank}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-gray-600">Jumlah:</span><span className="font-semibold ml-2">{w.amount}</span></div>
                          <div><span className="text-gray-600">Saldo Awal:</span><span className="font-semibold ml-2">{w.initial}</span></div>
                          <div><span className="text-gray-600">Waktu:</span><span className="font-semibold ml-2">{w.time}</span></div>
                        </div>
                      </div>
                      {w.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove("withdrawal", w.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject("withdrawal", w.id)}>
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">System Monitor</h2>
              <Badge className="bg-green-100 text-green-700">All Systems Operational</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI/ML Pipeline</CardTitle>
                  <CardDescription>Face recognition processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Face Detection (MediaPipe)", "Face Embedding (FaceNet)", "Vector Search (HNSW)", "Watermark Generator"].map(item => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Database Status</CardTitle>
                  <CardDescription>Data layer monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[["MySQL Database", "99.9% Uptime"], ["Vector DB (Pinecone)", "Connected"], ["AWS S3 Storage", "Healthy"], ["CDN (CloudFront)", "Optimized"]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Badge className="bg-green-100 text-green-700">{val}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Gateway</CardTitle>
                  <CardDescription>Transaction processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Midtrans Integration", "QRIS Support", "E-Wallet (GoPay/OVO/Dana)"].map(item => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  <CardDescription>System performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[["Face Indexing Speed", "< 2s"], ["Face Matching Query", "Real-time"], ["Payment Processing", "Instant"], ["Average Match Accuracy", "95.8%"]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <span className="font-semibold text-green-600">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
