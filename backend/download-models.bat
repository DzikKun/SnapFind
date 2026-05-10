@echo off
echo Downloading face-api.js models...

REM Tiny Face Detector
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json" -o "tiny_face_detector_model-weights_manifest.json"
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model.shard" -o "tiny_face_detector_model.shard"

REM Face Landmark 68
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json" -o "face_landmark_68_model-weights_manifest.json"
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model.shard" -o "face_landmark_68_model.shard"

REM Face Recognition
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json" -o "face_recognition_model-weights_manifest.json"
curl -L "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model.shard" -o "face_recognition_model.shard"

echo Models downloaded successfully!