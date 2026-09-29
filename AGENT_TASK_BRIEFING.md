# 🎯 AI AGENT REFACTOR TASK BRIEFING

**Status**: Ready for Execution  
**Target Project**: DzikKun/SnapFind  
**Objective**: Complete codebase refactoring & optimization  
**Complexity**: Medium-High  
**Estimated Duration**: 4-6 hours (if executed sequentially)

---

## 📌 KONTEKS & TUJUAN

Kamu menerima blueprint ini karena project **SnapFind** (platform agregator fotografi event berbasis Face-Matching AI) memerlukan refactoring menyeluruh. 

### 🔴 Masalah Saat Ini:
- **Frontend Berantakan**: 50+ UI components ter-import, tapi hanya ~20% yang dipakai
- **Backend Monolitik**: 17.5KB `server.cjs` dengan semua logic tercampur (routes, auth, database, logic)
- **File Tracking Buruk**: `node_modules/`, `struktur*.txt`, `.env` ter-commit ke Git (wasting space & security issue)
- **Folder Structure Unclear**: Sulit membedakan mana business logic, service layer, utils, types
- **Tidak Ada Separation of Concerns**: Frontend API calls scatter di berbagai pages
- **Dokumentasi Minimal**: Backend API endpoints tidak terdokumentasi

### 🎯 Tujuan Refactor:
1. **Clean Architecture**: Routes → Controllers → Services → Database (backend)
2. **Proper Gitignore**: Remove unnecessary files, prevent future commits
3. **UI Component Cleanup**: Keep only used components, remove bloat
4. **Frontend Organization**: API calls → services, Types → centralized, Utils → organized
5. **Scalability**: Setup siap untuk team collaboration & production deployment
6. **Documentation**: API docs, Setup guide, Architecture overview

---

## 📄 APA ITU REFACTOR_BLUEPRINT.md?

File ini adalah **step-by-step execution guide** yang berisi:

✅ **Folder structure target** yang sudah direncanakan (jangan improvisasi)  
✅ **Checklist files** yang harus dipindah, dibuat, atau dihapus  
✅ **Code examples** untuk refactoring pattern (before-after)  
✅ **Phase-by-phase plan** (6 phases, masing-masing ~30-60 min)  
✅ **Testing checklist** untuk validate bahwa refactor tidak break functionality  
✅ **Documentation templates** untuk docs yang harus dibuat  

**PENTING**: Blueprint ini bukan sekedar draft, tapi **execution-ready plan**. Ikuti sesuai urutan!

---

## 🚀 CARA MENGGUNAKAN BLUEPRINT INI

### Langkah 1: BACA MENYELURUH (15-20 min)
Pahami:
- Folder structure target (section "PROPOSED NEW FOLDER STRUCTURE")
- Masalah yang diselesaikan masing-masing phase
- Contoh refactoring (section "IMPLEMENTATION EXAMPLES")

### Langkah 2: PILIH STARTING POINT (Sesuai Prioritas)

**Opsi A - Full Sequential (Recommended)**:
Jalankan Phase 1 → 2 → 3 → 4 → 5 → 6 (urutan wajib)

**Opsi B - Quick Win (Frontend Only)**:
Jalankan Phase 1 + 2 + 4 + 5 (skip backend refactoring)

**Opsi C - Backend Focus**:
Jalankan Phase 1 + 2 + 3 + 5 (prioritas backend)

### Langkah 3: EXECUTE PHASE BY PHASE

Masing-masing phase punya **checklist** yang harus di-complete sebelum lanjut ke phase berikutnya.

### Langkah 4: TEST SETELAH SETIAP PHASE

Jangan skip testing! Gunakan "Testing Checklist" di blueprint.

### Langkah 5: COMMIT SETELAH SETIAP PHASE

Jangan commit sekaligus semua. Per-phase → git commit → next phase.

---

## 📋 QUICK REFERENCE - PHASES

| Phase | Nama | Durasi | Priority | Deskripsi |
|-------|------|--------|----------|-----------|
| 1 | Preparation | 20 min | 🔴 WAJIB | Create .gitignore, .env templates, audit components |
| 2 | Folder Structure | 40 min | 🔴 WAJIB | Reorganisasi folder sesuai proposal, update imports |
| 3 | Backend Refactor | 60 min | 🟡 Penting | Split server.cjs → routes/controllers/services |
| 4 | Frontend Services | 50 min | 🟡 Penting | Centralize API calls, create services layer |
| 5 | Cleanup | 30 min | 🟢 Opsional | Delete unused UI components, struktur*.txt |
| 6 | Documentation | 30 min | 🟢 Opsional | Create docs/SETUP.md, API.md, ARCHITECTURE.md |

---

## ⚠️ CRITICAL RULES

1. **IKUTI URUTAN**: Jangan skip phase atau mengubah urutan (kecuali Option B/C)
2. **BACKUP DULU**: Clone ke branch baru `git checkout -b refactor/main`
3. **UPDATE IMPORTS**: Setiap file pindah = update semua import statements
4. **TEST SETELAH SETIAP FASE**: Jangan lanjut kalau test gagal
5. **COMMIT FREQUENTLY**: Per-phase atau per-task commit (bukan final commit)
6. **DOKUMENTASI**: Update README, add CONTRIBUTING.md untuk future clarity

---

## 🎬 NEXT ACTION (Sesuai Pilihan)

**Jika ingin SEQUENTIAL (Phase 1 → 6)**:
```
→ Mulai Phase 1: Preparation
  - Create .gitignore file
  - Create .env.example & backend/.env.example
  - Audit UI components usage
  - Report hasil audit ke user
```

**Jika ingin FRONTEND ONLY (Phase 1,2,4,5)**:
```
→ Mulai Phase 1: Preparation
  - Create .gitignore file
  - Create docs/ folder
  - Skip backend refactoring planning
```

**Jika ingin BACKEND FOCUS (Phase 1,2,3,5)**:
```
→ Mulai Phase 1: Preparation
  - Create .gitignore file
  - Create backend config structure
  - Prepare for server.cjs modularization
```

---

## 🔗 RESOURCES AVAILABLE

- **REFACTOR_BLUEPRINT.md**: Main execution guide (this directory)
- **DOKUMENTASI_LOGIKA_SISTEM.md**: System logic reference (keep as-is, tidak di-refactor)
- **package.json**: Dependency review needed
- **GitHub Repo**: DzikKun/SnapFind (source of truth)

---

## ❓ QUESTIONS TO ASK BEFORE STARTING

Sebelum lanjut, clarify dengan user:

1. **Prioritas Mana?** Sequential / Frontend Only / Backend Focus?
2. **Testing Environment**: Bisa run `npm install`, `npm run dev`, `node backend/server.cjs`?
3. **Branch Strategy**: Create new branch atau langsung di main?
4. **Timeline**: Selesai dalam satu sitting atau multiple sessions?
5. **Dependencies Review**: Perlu update/cleanup npm packages juga?

---

## ✅ COMPLETION CRITERIA

Refactoring dianggap **SELESAI** jika:

- ✅ Folder structure sesuai blueprint
- ✅ Semua phase completed & tested
- ✅ No broken imports
- ✅ App bisa startup: frontend & backend
- ✅ All pages render correctly
- ✅ No TypeScript compilation errors
- ✅ Testing checklist passed 100%
- ✅ Documentation created
- ✅ .gitignore properly configured
- ✅ Clean git history (meaningful commits per phase)

---

## 🎁 BONUS - Setelah Refactoring

Dengan struktur baru ini, kamu bisa:

1. **Mudah add features**: Tahu persis kemana file baru harus diletakkan
2. **Lebih testable**: Services bisa di-unit test tanpa UI
3. **Team-ready**: Clear structure untuk new developers
4. **Production-ready**: Mudah migrate ke real database & cloud
5. **Scalable**: Add more pages/features tanpa folder chaos

---

## 🚦 START HERE

**Confirmation needed**: Pilih execution path kamu:

```
A) Full Sequential Refactor (6 phases, ~4-6 jam)
B) Frontend Only (4 phases, ~2-3 jam)  
C) Backend Focus (4 phases, ~3-4 jam)
```

Berikan jawaban, kemudian aku siap guide ke **Phase 1** dengan detail checklist! 🚀

---

**Status**: Awaiting user confirmation & execution path selection  
**Next Step**: Prepare detailed Phase 1 checklist  
**Estimated Start**: When confirmed

