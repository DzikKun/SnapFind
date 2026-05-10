import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

export default function PaymentDoc() {
  const [selectedMethod, setSelectedMethod] = React.useState<string>("");
  const [amount, setAmount] = React.useState<number>(150000);
  const [status, setStatus] = React.useState<string>("");
  const navigate = useNavigate();

  const methods = [
    { id: "qris", label: "QRIS" },
    { id: "gopay", label: "GoPay" },
    { id: "ovo", label: "OVO" },
    { id: "dana", label: "Dana" },
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMethod) {
      setStatus("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    setStatus(`Pembayaran Rp ${amount.toLocaleString("id-ID")} via ${selectedMethod} diproses...`);
    setTimeout(() => {
      setStatus("Berhasil: pembayaran berhasil diselesaikan.");
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dummy Form Pembayaran</h1>
      <p className="text-sm text-gray-600">Halaman ini hanya untuk dokumentasi dan screenshot. Buka langsung: <code>/payment</code></p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nominal Pembayaran</label>
          <input
            type="number"
            min={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Pilih Metode</p>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.label)}
                className={`border rounded-lg p-3 text-sm text-left transition ${
                  selectedMethod === method.label ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold">{method.label}</div>
                <div className="text-xs text-gray-500">Contoh metode</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm">Total: <strong>Rp {amount.toLocaleString("id-ID")}</strong></p>
          <p className="text-sm">Metode yang dipilih: <strong>{selectedMethod || "Belum dipilih"}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!selectedMethod}>
            Bayar
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate("/")}>Kembali</Button>
        </div>

        {status && <p className="text-sm text-teal-700">{status}</p>}
      </form>

      <div className="text-xs text-gray-500">
        Untuk keperluan dokumentasi, Anda bisa ambil screenshot dari textbox, pilihan metode, dan status proses.
      </div>
    </div>
  );
}
