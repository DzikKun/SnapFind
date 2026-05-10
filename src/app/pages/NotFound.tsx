import { Link } from "react-router";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold mt-4 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600 text-lg">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
              <Home className="mr-2 h-5 w-5" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to="/search">
            <Button size="lg" variant="outline">
              <Search className="mr-2 h-5 w-5" />
              Cari Foto
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
