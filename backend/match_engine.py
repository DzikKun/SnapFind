import sys
import json
import os
from deepface import DeepFace

# Mematikan log TensorFlow agar output bersih hanya JSON
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def hitung_similarity(distance, threshold):
    if distance <= 0: return 100.0
    # Logika similarity: makin kecil distance, makin besar similarity
    similarity = max(0, (1 - (distance / threshold))) * 100
    return round(similarity, 2)

def main():
    # Cek apakah ada argumen (Minimal: selfie + 1 foto target)
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Argumen kurang. Butuh: path_selfie path_foto_db1 [path_foto_db2 ... ]"}))
        return

    path_selfie = sys.argv[1]
    # Ambil sisa argumen sebagai daftar foto yang akan dibandingkan
    target_photos = sys.argv[2:]
    
    results = []

    try:
        # Loop semua foto yang dikirim dari Node.js
        for path_foto_db in target_photos:
            if not os.path.exists(path_foto_db):
                continue
                
            try:
                # Verifikasi langsung antar file
                result = DeepFace.verify(
                    img1_path=path_selfie,
                    img2_path=path_foto_db,
                    model_name="VGG-Face",
                    detector_backend="opencv", # Cepat untuk UTS
                    enforce_detection=False
                )

                distance = result["distance"]
                threshold = result["threshold"]
                similarity = hitung_similarity(distance, threshold)

                results.append({
                    "photoPath": path_foto_db,
                    "verified": result["verified"],
                    "similarity": similarity,
                    "distance": round(distance, 4)
                })
            except Exception as e:
                # Jika satu foto gagal, lanjut ke foto berikutnya
                continue

        # Print hasil akhir dalam format JSON tunggal agar Node.js mudah membacanya
        print(json.dumps(results))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()     