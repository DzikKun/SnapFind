import { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import { Camera, ArrowLeft, Download, CreditCard, Check, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import type { SearchResult } from "../hooks/useFaceRecognition";

/** Typed photo for gallery display */
interface GalleryPhoto {
  id: string;
  url: string;
  price: number;
  watermark: boolean;
  purchased: boolean;
  similarity?: number;
}

export default function Gallery() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchResult = location.state?.searchResult as SearchResult | undefined;

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [eventName, setEventName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Capture searchResult once to avoid object reference changes re-triggering the effect
  const searchResultRef = useRef(searchResult);
  useEffect(() => {
    searchResultRef.current = searchResult;
  }, [searchResult]);

  useEffect(() => {
    let cancelled = false;
    const fetchGallery = async () => {
      setIsLoading(true);
      const result = searchResultRef.current;

      // Kalau ada hasil face matching, pakai itu
      if (result && result.matches.length > 0) {
        const matchedPhotos: GalleryPhoto[] = result.matches.map(match => ({
          id: match.photoId,
          url: match.url,
          price: 15000,
          watermark: true,
          purchased: false,
          similarity: match.similarity,
        }));
        if (!cancelled) {
          setPhotos(matchedPhotos);
          setEventName('Hasil Pencarian');
          setIsLoading(false);
        }
        return;
      }

      // Fallback: ambil semua foto dari event
      try {
        const resp = await fetch(`http://localhost:4000/api/events/${eventId}/photos`);
        if (!resp.ok) throw new Error('Gagal memuat gallery');
        const data = await resp.json();

        if (cancelled) return;
        setEventName(data.name || 'Event');

        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos.map((p: GalleryPhoto) => ({
            ...p,
            purchased: false,
          })));
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error('Gagal memuat foto dari server.');
          setPhotos([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchGallery();
    return () => { cancelled = true; };
  }, [eventId]);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAll = () => {
    const unpurchased = photos.filter(p => !p.purchased).map(p => p.id);
    setSelectedPhotos(unpurchased);
  };

  const totalPrice = selectedPhotos.length * 15000;

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    setIsPaying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPhotos(prev => prev.map(photo =>
      selectedPhotos.includes(photo.id)
        ? { ...photo, purchased: true, watermark: false }
        : photo
    ));

    setIsPaying(false);
    setShowPaymentDialog(false);
    setSelectedPhotos([]);
    setSelectedMethod(null);
    toast.success(`Pembayaran berhasil! ${selectedPhotos.length} foto telah dibuka aksesnya`);
  };

  const handleDownload = async (photo: GalleryPhoto) => {
    if (!photo.purchased) {
      toast.error('Silakan beli foto terlebih dahulu');
      return;
    }
    try {
      // Use fetch + blob for cross-origin download support
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `snapfind-photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download dimulai...');
    } catch {
      toast.error('Gagal mendownload foto.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Memuat foto...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            {selectedPhotos.length > 0 && (
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                onClick={() => setShowPaymentDialog(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Bayar ({selectedPhotos.length}) · Rp {totalPrice.toLocaleString('id-ID')}
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold">{eventName}</h1>
              <p className="text-gray-600 mt-1">
                {photos.length > 0
                  ? <>Ditemukan <span className="font-semibold text-teal-600">{photos.length} foto</span></>
                  : 'Belum ada foto di event ini'}
                {searchResult && (
                  <span className="ml-2 text-purple-600 font-medium">
                    · {searchResult.matchedFaces} wajah cocok
                  </span>
                )}
              </p>
            </div>
            {photos.filter(p => !p.purchased).length > 1 && (
              <Button variant="outline" size="sm" onClick={selectAll}>
                Pilih Semua
              </Button>
            )}
          </div>

          {/* Info Banner */}
          {photos.length > 0 && (
            <Card className="bg-gradient-to-r from-teal-500 to-purple-600 text-white border-0 mt-4">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Pilih foto yang ingin dibeli</p>
                  <p className="text-sm text-teal-50">Harga: Rp 15.000 per foto · High-resolution tanpa watermark setelah pembayaran</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada foto</h3>
            <p className="text-gray-500">Fotografer belum mengunggah foto untuk event ini</p>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden transition-all cursor-pointer ${
                  selectedPhotos.includes(photo.id)
                    ? 'ring-4 ring-teal-500 shadow-lg scale-[1.02]'
                    : 'hover:shadow-md hover:scale-[1.01]'
                }`}
                onClick={() => !photo.purchased && togglePhotoSelection(photo.id)}
              >
                <div className="relative aspect-square">
                  <ImageWithFallback
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Watermark */}
                  {photo.watermark && !photo.purchased && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-white/50 text-2xl font-black transform -rotate-12 select-none tracking-widest drop-shadow-lg">
                        SNAPFIND
                      </div>
                    </div>
                  )}

                  {/* Overlay gelap saat dipilih */}
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-teal-500/20 pointer-events-none" />
                  )}

                  {/* Purchased badge */}
                  {photo.purchased && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 shadow">
                        <Check className="w-3 h-3 mr-1" />
                        Dibeli
                      </Badge>
                    </div>
                  )}

                  {/* Checkbox */}
                  {!photo.purchased && (
                    <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPhotos.includes(photo.id)}
                        onCheckedChange={() => togglePhotoSelection(photo.id)}
                        className="bg-white shadow"
                      />
                    </div>
                  )}

                  {/* Similarity badge */}
                  {photo.similarity && (
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-purple-500 shadow text-xs">
                        {Math.round(photo.similarity)}% match
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      Rp {(photo.price || 15000).toLocaleString('id-ID')}
                    </span>
                    {photo.purchased && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-teal-600 hover:text-teal-700"
                        onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating checkout bar */}
        {selectedPhotos.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border px-6 py-4 flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">{selectedPhotos.length} foto dipilih</p>
                <p className="text-xl font-bold text-teal-600">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
              <Button
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 px-8 h-11 rounded-xl"
                onClick={() => setShowPaymentDialog(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Bayar Sekarang
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Pembayaran Foto</DialogTitle>
            <DialogDescription>Pilih metode pembayaran untuk melanjutkan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah foto</span>
                  <span className="font-semibold">{selectedPhotos.length} foto</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga per foto</span>
                  <span className="font-semibold">Rp 15.000</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-teal-600">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Metode Pembayaran</p>

              {[
                { id: 'qris', label: 'QRIS', desc: 'Scan QR untuk bayar dengan semua e-wallet', icon: '🔲' },
                { id: 'gopay', label: 'GoPay', desc: 'Transfer langsung dari aplikasi Gojek', icon: '💚' },
                { id: 'ovo', label: 'OVO', desc: 'Transfer langsung dari aplikasi OVO', icon: '💜' },
                { id: 'dana', label: 'Dana', desc: 'Transfer langsung dari aplikasi Dana', icon: '💙' },
              ].map(method => (
                <button
                  key={method.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Pembayaran diproses secara aman oleh Midtrans/Xendit
            </p>

            <Button
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 rounded-xl"
              onClick={handlePayment}
              disabled={isPaying || !selectedMethod}
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses Pembayaran...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Bayar Rp {totalPrice.toLocaleString('id-ID')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
