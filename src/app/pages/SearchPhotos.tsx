import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Camera, Upload, Search, ArrowLeft, Loader2, Calendar, MapPin, ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useFaceRecognition } from "../hooks/useFaceRecognition";
import type { EventData } from "../types";

export default function SearchPhotos() {
  const navigate = useNavigate();
  const { eventId: urlEventId } = useParams();

  // --- State ---
  const [selectedEventId, setSelectedEventId] = useState<string | null>(urlEventId ?? null);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { isModelLoaded, searchSimilarFaces } = useFaceRecognition();

  // --- Sync URL param if it arrives later (e.g. direct navigation) ---
  useEffect(() => {
    if (urlEventId) {
      setSelectedEventId(urlEventId);
    }
  }, [urlEventId]);

  // --- Fetch events when no eventId is present (Step 1) ---
  useEffect(() => {
    if (selectedEventId) return; // Already have an event selected
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await fetch("http://localhost:4000/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data: EventData[] = await response.json();
        setEvents(data.filter((e) => e.status === "active"));
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Gagal memuat daftar event");
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [selectedEventId]);

  // --- File handler ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Search handler ---
  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error("Silakan upload foto selfie terlebih dahulu");
      return;
    }
    if (!selectedEventId) {
      toast.error("Silakan pilih event terlebih dahulu");
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchSimilarFaces(selectedFile, selectedEventId);

      if (result) {
        if (result.matchedFaces === 0) {
          toast.error("Tidak ditemukan wajah yang cocok.");
          return;
        }
        toast.success(`Berhasil menemukan ${result.matchedFaces} foto!`);
        navigate(`/gallery/${selectedEventId}`, {
          state: { searchResult: result },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mencari.");
    } finally {
      setIsSearching(false);
    }
  };

  // --- Select event handler ---
  const handleSelectEvent = (event: EventData) => {
    setSelectedEventId(event.eventId);
    setSelectedEventName(event.name);
    // Update the URL so it persists on refresh / shareable
    navigate(`/search/${event.eventId}`, { replace: true });
  };

  // =====================================================================
  // RENDER
  // =====================================================================
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
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Cari Foto dengan <span className="text-teal-600">Selfie</span>
            </h1>
            <p className="text-gray-600">
              AI akan mencocokkan wajah Anda dengan database foto event
            </p>
          </div>

          {/* ===== STEP 1: Event Picker (shown when no event selected) ===== */}
          {!selectedEventId && (
            <div className="space-y-6">
              <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-teal-600" />
                    Pilih Event
                  </CardTitle>
                  <CardDescription>
                    Pilih event yang ingin Anda cari fotonya
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEvents ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <span className="ml-3 text-gray-600">Memuat event...</span>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-600 mb-1">
                        Belum ada event aktif
                      </h3>
                      <p className="text-sm text-gray-500">
                        Hubungi fotografer untuk membuat event baru
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <button
                          key={event.eventId}
                          type="button"
                          onClick={() => handleSelectEvent(event)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left group"
                        >
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Camera className="w-6 h-6 text-white" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">
                              {event.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(event.date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            </div>
                          </div>

                          {/* Badge + Arrow */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {event.foundCount ?? 0} foto
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== STEP 2: Selfie Upload & Search (shown when event IS selected) ===== */}
          {selectedEventId && (
            <div className="space-y-4">
              {/* Selected event info bar */}
              <Card className="bg-gradient-to-r from-teal-500 to-purple-600 text-white border-0">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {selectedEventName || `Event: ${selectedEventId}`}
                      </p>
                      <p className="text-sm text-teal-100">
                        Upload selfie untuk mencari foto Anda di event ini
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      setSelectedEventId(null);
                      setSelectedEventName("");
                      setSelectedFile(null);
                      setPreview(null);
                      navigate("/search", { replace: true });
                    }}
                  >
                    Ganti Event
                  </Button>
                </CardContent>
              </Card>

              {/* Selfie upload card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Upload Selfie</CardTitle>
                  <CardDescription>
                    Ambil foto wajah Anda dengan jelas untuk hasil terbaik
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                          }}
                        >
                          Ganti Foto
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="space-y-4">
                          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-teal-600" />
                          </div>
                          <p className="text-lg font-semibold">
                            Klik untuk upload foto selfie
                          </p>
                          <p className="text-sm text-gray-500">
                            Format: JPG, PNG · Maks 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                    onClick={handleSearch}
                    disabled={!selectedFile || isSearching || !isModelLoaded}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" /> AI sedang
                        mencocokkan wajah...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" /> Cari Foto Saya
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}