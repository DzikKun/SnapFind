import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { Camera, Search, Wallet, TrendingUp, Zap, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null; // Will redirect
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              SnapFind
            </span>
          </div>
          <nav className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                Untuk Fotografer
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
            Automated Event-Photo Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Temukan Foto Anda di Event dengan{" "}
            <span className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              Face Recognition AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload selfie, AI kami akan menemukan semua foto Anda di event. Cepat, akurat, dan mudah!
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link to="/search">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Cari Foto Saya
              </Button>
            </Link>
            <Link to="/photographer">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Camera className="mr-2 h-5 w-5" />
                Saya Fotografer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
          <p className="text-gray-600">Teknologi AI terdepan untuk pengalaman terbaik</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-teal-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle>Face Recognition AI</CardTitle>
              <CardDescription>
                Teknologi FaceNet dan MediaPipe untuk deteksi wajah real-time dengan akurasi tinggi
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Pencarian Instan</CardTitle>
              <CardDescription>
                Upload selfie dan temukan semua foto Anda dalam hitungan detik menggunakan vector similarity search
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-amber-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>Pembayaran Aman</CardTitle>
              <CardDescription>
                Integrasi QRIS dan E-Wallet melalui payment gateway terpercaya (Midtrans/Xendit)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-teal-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-teal-50">Proses sederhana untuk menemukan foto Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Selfie</h3>
              <p className="text-teal-50">Ambil foto selfie atau upload dari galeri Anda</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Mencari</h3>
              <p className="text-teal-50">AI kami mencocokkan wajah Anda dengan database foto event</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Download</h3>
              <p className="text-teal-50">Bayar dan download foto high-resolution tanpa watermark</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Photographers */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="text-3xl">Untuk Fotografer Event</CardTitle>
              <CardDescription className="text-lg">
                Monetisasi foto event Anda dengan mudah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload Massal</h4>
                    <p className="text-sm text-gray-600">Upload ribuan foto event sekaligus ke cloud storage</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Auto-Index AI</h4>
                    <p className="text-sm text-gray-600">AI otomatis indexing wajah dalam hitungan detik</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tracking Pendapatan</h4>
                    <p className="text-sm text-gray-600">Monitor penjualan dan earnings secara real-time</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Withdrawal Mudah</h4>
                    <p className="text-sm text-gray-600">Tarik pendapatan langsung ke rekening bank Anda</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/photographer">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    Mulai Sebagai Fotografer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">10K+</div>
              <div className="text-gray-600">Foto per Event</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">&lt;2s</div>
              <div className="text-gray-600">Face Indexing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-600 mb-2">128-dim</div>
              <div className="text-gray-600">Face Embedding</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SnapFind</span>
              </div>
              <p className="text-gray-400 text-sm">
                Platform distribusi foto event berbasis AI Face Recognition
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Untuk User</li>
                <li>Untuk Fotografer</li>
                <li>Harga</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Teknologi</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>FaceNet AI</li>
                <li>MediaPipe</li>
                <li>Vector DB</li>
                <li>Cloud Storage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">PKM-KC 2025</h4>
              <p className="text-sm text-gray-400">
                Proyek Kreativitas Mahasiswa<br />
                Kategori: Teknologi Informasi
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 SnapFind. Automated Event-Photo Hub.
          </div>
        </div>
      </footer>
    </div>
  );
}
