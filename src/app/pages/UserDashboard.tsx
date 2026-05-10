import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Camera, Search, Download, Image, History, CreditCard, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../contexts/AuthContext";

// Generate data dinamis berdasarkan username
const generateUserData = (username: string) => {
  const seed = username.length;
  const photoCount = (seed * 3) % 12 + 2;
  const searchCount = (seed * 2) % 5 + 1;
  const totalSpend = photoCount * 15000;

  const eventNames = [
    "Wisuda Universitas 2025",
    "Wedding Sarah & John",
    "Music Festival 2025",
    "Konferensi Teknologi 2025",
    "Seminar Nasional 2025",
  ];

  const methods = ["QRIS", "GoPay", "OVO", "Dana"];
  const thumbnails = [
    "https://images.unsplash.com/photo-1757143137392-0b1e1a27a7de?fit=max&fm=jpg&q=80&w=400",
    "https://images.unsplash.com/photo-1764269719300-7094d6c00533?fit=max&fm=jpg&q=80&w=400",
    "https://images.unsplash.com/photo-1577648884063-1d3d1477b8a7?fit=max&fm=jpg&q=80&w=400",
  ];

  const purchased = Array.from({ length: Math.min(searchCount, 2) }, (_, i) => ({
    id: `${i + 1}`,
    event: eventNames[i % eventNames.length],
    date: `${21 - i * 6} Mar 2025`,
    count: (seed + i) % 4 + 2,
    amount: ((seed + i) % 4 + 2) * 15000,
    method: methods[(seed + i) % methods.length],
    thumbnail: thumbnails[i % thumbnails.length],
  }));

  const history = Array.from({ length: searchCount }, (_, i) => ({
    id: `${i + 1}`,
    date: `${21 - i * 4} Mar 2025`,
    event: eventNames[i % eventNames.length],
    found: (seed + i * 3) % 10 + 3,
  }));

  return { photoCount, searchCount, totalSpend, purchased, history };
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<ReturnType<typeof generateUserData> | null>(null);

  useEffect(() => {
    if (user?.username) {
      setUserData(generateUserData(user.username));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Memuat data...</div>
      </div>
    );
  }

  const totalFound = userData.history.reduce((acc, h) => acc + h.found, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              SnapFind
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.username}</p>
              <p className="text-xs text-teal-600 capitalize">{user.role}</p>
            </div>
            <Link to="/search">
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600">
                <Search className="mr-2 h-4 w-4" />
                Cari Foto Baru
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Halo, <span className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">{user.username}!</span>
          </h1>
          <p className="text-gray-600">Kelola foto dan riwayat pencarian Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Image className="w-4 h-4 text-teal-600" />
                Foto Dibeli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{userData.photoCount}</div>
              <p className="text-xs text-gray-500 mt-1">dari {userData.purchased.length} event</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                Total Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{userData.searchCount}</div>
              <p className="text-xs text-gray-500 mt-1">{totalFound} foto ditemukan</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Total Belanja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                Rp {userData.totalSpend.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-gray-500 mt-1">bulan ini</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchased" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="purchased">Foto Saya</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          {/* Purchased Photos Tab */}
          <TabsContent value="purchased" className="space-y-4">
            <h2 className="text-2xl font-bold">Foto yang Dibeli</h2>
            <div className="space-y-4">
              {userData.purchased.map((purchase) => (
                <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={purchase.thumbnail}
                          alt={purchase.event}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{purchase.event}</h3>
                            <p className="text-sm text-gray-600">{purchase.date}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Lunas</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Jumlah Foto</div>
                            <div className="font-semibold">{purchase.count} foto</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Total Bayar</div>
                            <div className="font-semibold">Rp {purchase.amount.toLocaleString('id-ID')}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Metode</div>
                            <div className="font-semibold">{purchase.method}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-teal-500 to-purple-600">
                            <Download className="mr-2 h-3 w-3" />
                            Download Semua
                          </Button>
                          <Button size="sm" variant="outline">
                            <Image className="mr-2 h-3 w-3" />
                            Lihat Galeri
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {userData.purchased.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-12 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Belum ada foto yang dibeli</h3>
                    <p className="text-sm text-gray-600 mb-4">Mulai cari foto Anda di berbagai event</p>
                    <Link to="/search">
                      <Button className="bg-gradient-to-r from-teal-500 to-purple-600">
                        <Search className="mr-2 h-4 w-4" />
                        Cari Foto Sekarang
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-2xl font-bold">Riwayat Pencarian</h2>
            <div className="space-y-3">
              {userData.history.map((search) => (
                <Card key={search.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <History className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{search.event}</h4>
                          <p className="text-sm text-gray-600">{search.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-teal-600">{search.found} foto</div>
                        <p className="text-sm text-gray-500">ditemukan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-teal-500 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Cari Foto di Event Lainnya?</h3>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Upload selfie Anda dan temukan semua foto Anda di berbagai event dengan teknologi AI Face Recognition
            </p>
            <Link to="/search">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Mulai Pencarian Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}