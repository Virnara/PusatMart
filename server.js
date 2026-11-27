const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let client;

// Konfigurasi 16 Toko Anggota sesuai Tabel Bab 2 & Bab 3 Dokumen Draft UTS
const KONFIGURASI_16_TOKO = [
  // Kelompok 1 - Fashion (Jalur Sub-Tim 3A: Uta, Wisnu, Jusan, Hassan)
  { kode_toko: "TK-K1-01", pemilik_anggota: "Abdurrahman", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_abdurrahman", nama_collection: "produk", nama_toko: "Abdurrahman Menswear", sample: { kode_barang: "FSH-01", nama_produk: "Kemeja Koko Linen Putih", harga: 135000, stok: 20 } },
  { kode_toko: "TK-K1-02", pemilik_anggota: "Maulana", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_maulana", nama_collection: "produk", nama_toko: "Maulana Denim Co.", sample: { kode_barang: "FSH-02", nama_produk: "Jaket Denim Washed", harga: 240000, stok: 15 } },
  { kode_toko: "TK-K1-03", pemilik_anggota: "Maul", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_maul", nama_collection: "produk", nama_toko: "Maul Streetwear", sample: { kode_barang: "FSH-03", nama_produk: "Hoodie Boxy Fleece Hitam", harga: 185000, stok: 25 } },
  { kode_toko: "TK-K1-04", pemilik_anggota: "Karin", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_karin", nama_collection: "produk", nama_toko: "Karin Apparel Studio", sample: { kode_barang: "FSH-04", nama_produk: "Blazer Kasual Wanita", harga: 145000, stok: 18 } },
  { kode_toko: "TK-K1-05", pemilik_anggota: "Mozza", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_mozza", nama_collection: "produk", nama_toko: "Mozza Hijab & Scarf", sample: { kode_barang: "FSH-05", nama_produk: "Pashmina Silk Premium", harga: 65000, stok: 40 } },
  { kode_toko: "TK-K1-06", pemilik_anggota: "Zidan", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_zidan", nama_collection: "produk", nama_toko: "Zidan Footwear", sample: { kode_barang: "FSH-06", nama_produk: "Sneakers Kanvas Low-Cut", harga: 210000, stok: 14 } },
  { kode_toko: "TK-K1-07", pemilik_anggota: "Chika", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_chika", nama_collection: "produk", nama_toko: "Chika Boutique", sample: { kode_barang: "FSH-07", nama_produk: "Cardigan Rajut Pastel", harga: 115000, stok: 22 } },
  { kode_toko: "TK-K1-08", pemilik_anggota: "Bagus", asal_kelompok: "Kelompok 1", sub_tim: "Sub-Tim 3A", kategori_usaha: "Fashion", nama_database: "db_k1_bagus", nama_collection: "produk", nama_toko: "Bagus Basic Tee", sample: { kode_barang: "FSH-08", nama_produk: "Kaos Cotton Combed 24s", harga: 75000, stok: 35 } },

  // Kelompok 2 - Alat Rumah Tangga (Jalur Sub-Tim 3B: Apiat, Iya, Radel, Rishy)
  { kode_toko: "TK-K2-01", pemilik_anggota: "Anisa", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_anisa", nama_collection: "produk", nama_toko: "Anisa Home Living", sample: { sku: "RT-01", nama_item: "Set Toples Kaca Kedap Udara", harga_satuan: 95000, stok: 30 } },
  { kode_toko: "TK-K2-02", pemilik_anggota: "Farid", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_farid", nama_collection: "produk", nama_toko: "Farid Perkakas Rumah", sample: { sku: "RT-02", nama_item: "Rak Dapur Stainless 3 Susun", harga_satuan: 165000, stok: 16 } },
  { kode_toko: "TK-K2-03", pemilik_anggota: "April", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_april", nama_collection: "produk", nama_toko: "April Kitchen Corner", sample: { sku: "RT-03", nama_item: "Wajan Anti Lengket 28cm", harga_satuan: 140000, stok: 20 } },
  { kode_toko: "TK-K2-04", pemilik_anggota: "Abrar", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_abrar", nama_collection: "produk", nama_toko: "Abrar Clean & Tidy", sample: { sku: "RT-04", nama_item: "Alat Pel Lantai Spin Mop", harga_satuan: 125000, stok: 19 } },
  { kode_toko: "TK-K2-05", pemilik_anggota: "Azza", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_azza", nama_collection: "produk", nama_toko: "Azza Cozy Room", sample: { sku: "RT-05", nama_item: "Lampu Meja Tidur Minimalis", harga_satuan: 85000, stok: 24 } },
  { kode_toko: "TK-K2-06", pemilik_anggota: "Ridwan", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_ridwan", nama_collection: "produk", nama_toko: "Ridwan Elektronik Rumah", sample: { sku: "RT-06", nama_item: "Teko Listrik Pemanas Air 1.8L", harga_satuan: 110000, stok: 28 } },
  { kode_toko: "TK-K2-07", pemilik_anggota: "Farrel", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_farrel", nama_collection: "produk", nama_toko: "Farrel Storage Mart", sample: { sku: "RT-07", nama_item: "Container Box Lipat 50L", harga_satuan: 78000, stok: 32 } },
  { kode_toko: "TK-K2-08", pemilik_anggota: "Ahmad", asal_kelompok: "Kelompok 2", sub_tim: "Sub-Tim 3B", kategori_usaha: "Alat Rumah Tangga", nama_database: "db_k2_ahmad", nama_collection: "produk", nama_toko: "Ahmad Dapur Sehat", sample: { sku: "RT-08", nama_item: "Blender Portable Mini USB", harga_satuan: 90000, stok: 25 } }
];

// Fungsi mengisi data simulasi ke 16 database anggota (K1 pakai skema kode_barang, K2 pakai skema sku)
async function seed16DatabaseAnggota() {
  for (const toko of KONFIGURASI_16_TOKO) {
    const dbAnggota = client.db(toko.nama_database);
    const col = dbAnggota.collection(toko.nama_collection);
    await col.deleteMany({});

    if (toko.asal_kelompok === "Kelompok 1") {
      await col.insertOne({
        kode_barang: toko.sample.kode_barang,
        nama_toko: toko.nama_toko,
        nama_produk: toko.sample.nama_produk,
        harga: toko.sample.harga,
        stok: toko.sample.stok
      });
    } else {
      await col.insertOne({
        sku: toko.sample.sku,
        asal_toko: toko.nama_toko,
        nama_item: toko.sample.nama_item,
        harga_satuan: toko.sample.harga_satuan,
        stok: toko.sample.stok
      });
    }
  }
}

// Fungsi inti: menarik seluruh 16 database ke db_database_center (daftar_toko & katalog_terintegrasi)
async function sinkronkanDatabaseCenter() {
  const dbCenter = client.db("db_database_center");

  // 1. Perbarui koleksi daftar_toko (16 Toko Anggota)
  const daftarTokoDocs = KONFIGURASI_16_TOKO.map((t) => ({
    kode_toko: t.kode_toko,
    nama_toko: t.nama_toko,
    pemilik_anggota: t.pemilik_anggota,
    asal_kelompok: t.asal_kelompok,
    sub_tim_integrator: t.sub_tim,
    kategori_usaha: t.kategori_usaha,
    nama_database: t.nama_database,
    nama_collection: t.nama_collection,
    status_aktif: true
  }));

  await dbCenter.collection("daftar_toko").deleteMany({});
  await dbCenter.collection("daftar_toko").insertMany(daftarTokoDocs);

  // 2. Tarik dan lakukan Schema Mapping dari 16 database anggota ke katalog_terintegrasi
  const semuaKatalog = [];

  for (const toko of KONFIGURASI_16_TOKO) {
    const dbSumber = client.db(toko.nama_database);
    const items = await dbSumber.collection(toko.nama_collection).find().toArray();

    for (const item of items) {
      semuaKatalog.push({
        kode_produk: item.kode_barang || item.sku || item.id_produk,
        kode_toko: toko.kode_toko,
        kategori_kelompok: `${toko.asal_kelompok} - ${toko.kategori_usaha}`,
        asal_kelompok: toko.asal_kelompok,
        sub_tim_integrator: toko.sub_tim,
        nama_toko: item.nama_toko || item.asal_toko || toko.nama_toko,
        nama_produk: item.nama_produk || item.nama_item,
        harga: Number(item.harga ?? item.harga_satuan ?? 0),
        stok: Number(item.stok ?? item.qty ?? item.jumlah_stok ?? 0),
        sumber_db: toko.nama_database,
        sumber_collection: toko.nama_collection,
        raw_asli: item
      });
    }
  }

  await dbCenter.collection("katalog_terintegrasi").deleteMany({});
  if (semuaKatalog.length > 0) {
    await dbCenter.collection("katalog_terintegrasi").insertMany(semuaKatalog);
  }

  return { totalToko: daftarTokoDocs.length, totalProduk: semuaKatalog.length };
}

// Endpoint 1: Ambil katalog terintegrasi & daftar toko dari db_database_center
app.get("/api/center-data", async (req, res) => {
  try {
    const dbCenter = client.db("db_database_center");
    const katalog = await dbCenter.collection("katalog_terintegrasi").find().toArray();
    const toko = await dbCenter.collection("daftar_toko").find().toArray();
    const transaksi = await dbCenter.collection("transaksi_pusat").find().sort({ _id: -1 }).toArray();
    res.json({ sukses: true, katalog, toko, transaksi });
  } catch (err) {
    res.status(500).json({ sukses: false, pesan: err.message });
  }
});

// Endpoint 2: Sinkronkan ulang ke-16 database anggota ke db_database_center
app.post("/api/integrasi", async (req, res) => {
  try {
    const hasil = await sinkronkanDatabaseCenter();
    res.json({
      sukses: true,
      pesan: `Sinkronisasi selesai: ${hasil.totalToko} toko & ${hasil.totalProduk} produk masuk ke db_database_center.`
    });
  } catch (err) {
    res.status(500).json({ sukses: false, pesan: err.message });
  }
});

// Endpoint 3: Generate ulang 16 database simulasi anggota
app.post("/api/seed-16-db", async (req, res) => {
  try {
    await seed16DatabaseAnggota();
    const hasil = await sinkronkanDatabaseCenter();
    res.json({
      sukses: true,
      pesan: `16 database anggota (db_k1_* & db_k2_*) berhasil dibuat ulang (${hasil.totalProduk} produk).`
    });
  } catch (err) {
    res.status(500).json({ sukses: false, pesan: err.message });
  }
});

// Endpoint 4: Tambah produk baru ke salah satu database anggota & sinkronkan ke center
app.post("/api/produk", async (req, res) => {
  try {
    const { nama_database, kode, nama_produk, harga, stok } = req.body;
    const toko = KONFIGURASI_16_TOKO.find((t) => t.nama_database === nama_database);
    if (!toko) return res.status(400).json({ sukses: false, pesan: "Database toko tidak ditemukan." });

    const dbAnggota = client.db(toko.nama_database);
    if (toko.asal_kelompok === "Kelompok 1") {
      await dbAnggota.collection(toko.nama_collection).insertOne({
        kode_barang: kode,
        nama_toko: toko.nama_toko,
        nama_produk,
        harga: Number(harga),
        stok: Number(stok)
      });
    } else {
      await dbAnggota.collection(toko.nama_collection).insertOne({
        sku: kode,
        asal_toko: toko.nama_toko,
        nama_item: nama_produk,
        harga_satuan: Number(harga),
        stok: Number(stok)
      });
    }

    await sinkronkanDatabaseCenter();
    res.json({ sukses: true, pesan: `Produk masuk ke ${toko.nama_database} & tersinkron ke db_database_center!` });
  } catch (err) {
    res.status(500).json({ sukses: false, pesan: err.message });
  }
});

// Endpoint 5: Checkout keranjang (Two-Way Sync: potong stok di db_database_center & DB anggota asal)
app.post("/api/checkout", async (req, res) => {
  try {
    const { items, metode_pembayaran } = req.body;
    const dbCenter = client.db("db_database_center");
    const colKatalog = dbCenter.collection("katalog_terintegrasi");

    let totalBelanja = 0;
    for (const item of items) {
      totalBelanja += item.harga * item.qty;

      // 1. Potong stok di db_database_center.katalog_terintegrasi
      await colKatalog.updateOne(
        { kode_produk: item.kode_produk, sumber_db: item.sumber_db },
        { $inc: { stok: -item.qty } }
      );

      // 2. Write-back: potong stok di database anggota asal (db_k1_* atau db_k2_*)
      const dbSumber = client.db(item.sumber_db);
      const fieldKode = item.asal_kelompok === "Kelompok 1" ? "kode_barang" : "sku";
      await dbSumber.collection(item.sumber_collection).updateOne(
        { [fieldKode]: item.kode_produk },
        { $inc: { stok: -item.qty } }
      );
    }

    const buktiTransaksi = {
      kode_transaksi: "TRX-" + Date.now(),
      tanggal: new Date().toISOString(),
      metode_pembayaran: metode_pembayaran || "QRIS / Transfer",
      total_pembayaran: totalBelanja,
      detail_item: items
    };

    await dbCenter.collection("transaksi_pusat").insertOne(buktiTransaksi);
    res.json({ sukses: true, transaksi: buktiTransaksi });
  } catch (err) {
    res.status(500).json({ sukses: false, pesan: err.message });
  }
});

async function startServer() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("Terhubung ke MongoDB Lokal (127.0.0.1:27017)");

    const dbCenter = client.db("db_database_center");
    const count = await dbCenter.collection("katalog_terintegrasi").countDocuments();
    if (count === 0) {
      console.log("Menginisialisasi 16 database anggota & db_database_center...");
      await seed16DatabaseAnggota();
      await sinkronkanDatabaseCenter();
    }

    app.listen(PORT, () => {
      console.log(`Server PusatMart (Database Center) berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Gagal terhubung ke MongoDB:", err.message);
  }
}

startServer();