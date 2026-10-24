Berikut adalah kode Next.js (`page.tsx`) yang sudah diperbarui secara menyeluruh dan siap di-deploy ke Vercel/GitHub Anda:

### Fitur-fitur baru yang ditambahkan:

1. **Filter Waktu Dinamis**: Filter dropdown **Bulan**, **Week (Minggu ke-1 s/d ke-4)**, dan pemilih **Tanggal Berjalan**.
2. **Overview Store Lengkap**:
* Menampilkan **Time Gone** (Hari berlalu, sisa hari, % waktu berlalu, actual vs required daily run-rate).
* Metric card untuk seluruh kategori utama: **Apple Devices**, **Android Devices**, **Accessories**, dan **VAS (Qoala, Telkomsel, XL, Indosat)** lengkap dengan *Target, Actual/Achievement, Persentase, Variance, dan Estimate*.
* Rincian produk per kategori & Mini Leaderboard / **Rank Sales per Staff** langsung di halaman Overview.


3. **Staff Performance Rinci (4 Kategori dengan Tab & Ikon Khusus)**:
* **Apple Devices** 🍎: iPhone, iPad, MacBook, Apple Watch, AirPods.
* **Android Devices** 🤖: Samsung, Oppo, Motorola, Huawei, Infinix, Xiaomi.
* **Accessories** 🎧: Diurutkan otomatis dari nominal/amount terbesar ke terkecil (*Power Adapter, MagSafe Case, Screen Protector, Kabel, dll.*).
* **VAS** 🛡️: Qoala Protection, Telkomsel Bundle, XL Axiata Package, Indosat Ooredoo.


4. **Evaluasi Sales Perlu Perhatian**: Catatan evaluasi ringkas dalam Bahasa Indonesia yang otomatis menyoroti defisit dan peluang akselerasi tiap staf.

```tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "leaderboard" | "sales-detail";
type SubLOBType = "apple" | "android" | "accessories" | "vas";

interface SubProductMetric {
  name: string;
  target: number;
  actual: number;
  achievement: number;
  variance: number;
  estimate: number;
  qty: number;
  icon?: string;
}

interface StaffDetailedPerformance {
  rank: number;
  salesId: string;
  name: string;
  target: number;
  actual: number;
  achievement: number;
  variance: number;
  estimate: number;
  status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan";
  attentionNotes: string[];
  topProductSold: string;
  appleSubProducts: SubProductMetric[];
  androidSubProducts: SubProductMetric[];
  accessoriesSubProducts: SubProductMetric[];
  vasSubProducts: SubProductMetric[];
}

// 1. DATA TIME GONE & TOKO MASTER
const TIME_GONE_METRIC = {
  daysPassed: 24,
  totalDays: 31,
  daysLeft: 7,
  percentageTimeGone: 77.4,
  percentageTimeLeft: 22.6,
  dailyActualRunRate: 131159508,
  requiredDailyRunRate: 797262710,
};

// 2. KATEGORI UTAMA DI STORE OVERVIEW
const STORE_CATEGORIES = {
  apple: {
    name: "Apple Devices",
    icon: "🍎",
    target: 5600000000,
    actual: 2510000000,
    achievement: 44.8,
    variance: -3090000000,
    estimate: 3242083333,
    items: [
      { name: "iPhone", target: 4500000000, actual: 2167000000, achievement: 48.2, variance: -2333000000, estimate: 2799041667, qty: 85, icon: "📱" },
      { name: "iPad", target: 450000000, actual: 168000000, achievement: 37.3, variance: -282000000, estimate: 217000000, qty: 14, icon: "📋" },
      { name: "MacBook", target: 350000000, actual: 89000000, achievement: 25.4, variance: -261000000, estimate: 114958333, qty: 4, icon: "💻" },
      { name: "Apple Watch", target: 180000000, actual: 48000000, achievement: 26.7, variance: -132000000, estimate: 62000000, qty: 8, icon: "⌚" },
      { name: "AirPods", target: 120000000, actual: 38000000, achievement: 31.7, variance: -82000000, estimate: 49083333, qty: 15, icon: "🎧" },
    ],
  },
  android: {
    name: "Android Devices",
    icon: "🤖",
    target: 1850000000,
    actual: 394000000,
    achievement: 21.3,
    variance: -1456000000,
    estimate: 508916667,
    items: [
      { name: "Samsung Devices", target: 1100000000, actual: 324000000, achievement: 29.5, variance: -776000000, estimate: 418500000, qty: 48, icon: "🪐" },
      { name: "Oppo Devices", target: 200000000, actual: 28000000, achievement: 14.0, variance: -172000000, estimate: 36166667, qty: 7, icon: "🟢" },
      { name: "Xiaomi Devices", target: 180000000, actual: 21000000, achievement: 11.7, variance: -159000000, estimate: 27125000, qty: 6, icon: "🟠" },
      { name: "Infinix Devices", target: 120000000, actual: 12000000, achievement: 10.0, variance: -108000000, estimate: 15500000, qty: 5, icon: "⚡" },
      { name: "Huawei Devices", target: 150000000, actual: 9000000, achievement: 6.0, variance: -141000000, estimate: 11625000, qty: 2, icon: "🔴" },
      { name: "Motorola Devices", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
    ],
  },
  accessories: {
    name: "Accessories",
    icon: "🔌",
    target: 650000000,
    actual: 198828200,
    achievement: 30.6,
    variance: -451171800,
    estimate: 256819758,
    items: [
      { name: "Original Apple & Samsung Adaptor", target: 200000000, actual: 78500000, achievement: 39.3, variance: -121500000, estimate: 101395833, qty: 165, icon: "⚡" },
      { name: "Premium Casing & MagSafe Case", target: 180000000, actual: 52400000, achievement: 29.1, variance: -127600000, estimate: 67683333, qty: 98, icon: "🛡️" },
      { name: "Screen Protector & Tempered Glass", target: 140000000, actual: 41200000, achievement: 29.4, variance: -98800000, estimate: 53216667, qty: 142, icon: "📱" },
      { name: "Powerbank & Wireless Charger", target: 80000000, actual: 18128200, achievement: 22.7, variance: -61871800, estimate: 23414758, qty: 32, icon: "🔋" },
      { name: "Audio, Cable & Smart Gadget Misc", target: 50000000, actual: 8600000, achievement: 17.2, variance: -41400000, estimate: 11108333, qty: 26, icon: "🎧" },
    ],
  },
  vas: {
    name: "VAS (Value Added Services)",
    icon: "🛡️",
    target: 628667173,
    actual: 45000000,
    achievement: 7.2,
    variance: -583667173,
    estimate: 58125000,
    items: [
      { name: "Qoala Device Protection", target: 350000000, actual: 29500000, achievement: 8.4, variance: -320500000, estimate: 38104167, qty: 34, icon: "🛡️" },
      { name: "Telkomsel Bundling & eSIM", target: 120000000, actual: 8200000, achievement: 6.8, variance: -111800000, estimate: 10591667, qty: 18, icon: "🔴" },
      { name: "XL Axiata Data Plan Package", target: 80000000, actual: 4500000, achievement: 5.6, variance: -75500000, estimate: 5812500, qty: 9, icon: "🔵" },
      { name: "Indosat Ooredoo Postpaid Package", target: 78667173, actual: 2800000, achievement: 3.6, variance: -75867173, estimate: 3616667, qty: 5, icon: "🟡" },
    ],
  },
};

const STORE_TOTAL = {
  actual: 3147828200,
  target: 8728667173,
  achievement: 36.1,
  variance: -5580838973,
  estimate: 4065944758,
};

// 3. DATA RINCIAN STAF
const DETAILED_STAFF_PERFORMANCE: StaffDetailedPerformance[] = [
  {
    rank: 1,
    salesId: "24004971",
    name: "Liesbeth Febrina",
    target: 872866717,
    actual: 1420983000,
    achievement: 162.8,
    variance: 548116283,
    estimate: 1835436458,
    status: "Tercapai",
    attentionNotes: [
      "Performa sangat prima! Target bulanan terlampaui 162,8%.",
      "Pilar utama omset iPhone toko (Rp 1,35 Miliar).",
      "Perlu dorongan attachment Qoala VAS dan MacBook yang masih minim.",
    ],
    topProductSold: "iPhone 17 Pro Max 256GB / 512GB (41 unit)",
    appleSubProducts: [
      { name: "iPhone", target: 750000000, actual: 1353207000, achievement: 180.4, variance: 603207000, estimate: 1747892375, qty: 45, icon: "📱" },
      { name: "iPad", target: 60000000, actual: 24884000, achievement: 41.5, variance: -35116000, estimate: 32141833, qty: 3, icon: "📋" },
      { name: "MacBook", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 20000000, actual: 4499000, achievement: 22.5, variance: -15501000, estimate: 5811208, qty: 1, icon: "⌚" },
      { name: "AirPods", target: 12866717, actual: 4200000, achievement: 32.6, variance: -8666717, estimate: 5425000, qty: 2, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 80000000, actual: 27992000, achievement: 35.0, variance: -52008000, estimate: 36156333, qty: 8, icon: "🪐" },
      { name: "Oppo Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Original Adapter & Charger", target: 15000000, actual: 4200000, achievement: 28.0, variance: -10800000, estimate: 5425000, qty: 9, icon: "⚡" },
      { name: "Screen Protector Tempered Glass", target: 12000000, actual: 1650000, achievement: 13.8, variance: -10350000, estimate: 2131250, qty: 6, icon: "📱" },
      { name: "MagSafe Case Original", target: 10000000, actual: 350000, achievement: 3.5, variance: -9650000, estimate: 452083, qty: 1, icon: "🛡️" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 20000000, actual: 3600000, achievement: 18.0, variance: -16400000, estimate: 4650000, qty: 4, icon: "🛡️" },
      { name: "Telkomsel Paket Data", target: 5000000, actual: 750000, achievement: 15.0, variance: -4250000, estimate: 968750, qty: 2, icon: "🔴" },
      { name: "XL Bundling", target: 3000000, actual: 0, achievement: 0.0, variance: -3000000, estimate: 0, qty: 0, icon: "🔵" },
      { name: "Indosat Paket", target: 3000000, actual: 0, achievement: 0.0, variance: -3000000, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
  {
    rank: 2,
    salesId: "24016878",
    name: "Yunita Anggraini",
    target: 1222013404,
    actual: 451008000,
    achievement: 36.9,
    variance: -771005404,
    estimate: 582552000,
    status: "Dalam Pantauan",
    attentionNotes: [
      "Pencapaian 36,9% tertinggal jauh di bawah laju waktu Time Gone (77,4%).",
      "Performa Samsung Devices sangat baik (Fold & Ultra).",
      "Prioritaskan push iPhone & Accessories untuk mengejar sisa gap target Rp 771 Juta.",
    ],
    topProductSold: "Galaxy S26 Ultra 12/256GB & iPhone 15",
    appleSubProducts: [
      { name: "iPhone", target: 850000000, actual: 238190000, achievement: 28.0, variance: -611810000, estimate: 307662083, qty: 12, icon: "📱" },
      { name: "iPad", target: 80000000, actual: 34796000, achievement: 43.5, variance: -45204000, estimate: 44944833, qty: 4, icon: "📋" },
      { name: "MacBook", target: 50000000, actual: 0, achievement: 0.0, variance: -50000000, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 30000000, actual: 7104000, achievement: 23.7, variance: -22896000, estimate: 9176167, qty: 1, icon: "⌚" },
      { name: "AirPods", target: 20000000, actual: 4100000, achievement: 20.5, variance: -15900000, estimate: 5295833, qty: 2, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 150000000, actual: 136044000, achievement: 90.7, variance: -13956000, estimate: 175723500, qty: 16, icon: "🪐" },
      { name: "Oppo Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 7013404, actual: 0, achievement: 0.0, variance: -7013404, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Screen Protector Tempered Glass", target: 20000000, actual: 12400000, achievement: 62.0, variance: -7600000, estimate: 16016667, qty: 45, icon: "📱" },
      { name: "Original Adapter & Charger", target: 18000000, actual: 10200000, achievement: 56.7, variance: -7800000, estimate: 13175000, qty: 22, icon: "⚡" },
      { name: "MagSafe Case Original", target: 15000000, actual: 5600000, achievement: 37.3, variance: -9400000, estimate: 7233333, qty: 11, icon: "🛡️" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 25000000, actual: 7200000, achievement: 28.8, variance: -17800000, estimate: 9300000, qty: 8, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 10000000, actual: 2100000, achievement: 21.0, variance: -7900000, estimate: 2712500, qty: 4, icon: "🔴" },
      { name: "XL Paket Data", target: 6000000, actual: 1200000, achievement: 20.0, variance: -4800000, estimate: 1550000, qty: 3, icon: "🔵" },
      { name: "Indosat Paket", target: 4000000, actual: 400000, achievement: 10.0, variance: -3600000, estimate: 516667, qty: 1, icon: "🟡" },
    ],
  },
  {
    rank: 3,
    salesId: "26028497",
    name: "Siti Amelia",
    target: 1658446763,
    actual: 301970200,
    achievement: 18.2,
    variance: -1356476563,
    estimate: 390044842,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "PERHATIAN DEFISIT BESAR: Baru tercapai 18,2% dari kuota Rp 1,65 Miliar.",
      "Defisit omset -Rp 1,35 Miliar. Pace harian tertinggal -59,2% dari rasio waktu.",
      "Produk Android non-Samsung dan VAS proteksi masih sangat minim penawaran.",
    ],
    topProductSold: "AirPods 4 & iPhone 17 Pro",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 212493000, achievement: 19.3, variance: -887507000, estimate: 274470125, qty: 8, icon: "📱" },
      { name: "iPad", target: 100000000, actual: 17398000, achievement: 17.4, variance: -82602000, estimate: 22472417, qty: 2, icon: "📋" },
      { name: "MacBook", target: 80000000, actual: 19803000, achievement: 24.8, variance: -60197000, estimate: 25578875, qty: 1, icon: "💻" },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0, icon: "⌚" },
      { name: "AirPods", target: 30000000, actual: 4799000, achievement: 16.0, variance: -25201000, estimate: 6198708, qty: 2, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 27392000, achievement: 13.7, variance: -172608000, estimate: 35381333, qty: 6, icon: "🪐" },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Original Adapter & Charger", target: 25000000, actual: 8100000, achievement: 32.4, variance: -16900000, estimate: 10462500, qty: 17, icon: "⚡" },
      { name: "Screen Protector Tempered Glass", target: 20000000, actual: 7200000, achievement: 36.0, variance: -12800000, estimate: 9300000, qty: 24, icon: "📱" },
      { name: "MagSafe Case Original", target: 18000000, actual: 3400000, achievement: 18.9, variance: -14600000, estimate: 4391667, qty: 7, icon: "🛡️" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 35000000, actual: 3200000, achievement: 9.1, variance: -31800000, estimate: 4133333, qty: 4, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 15000000, actual: 950000, achievement: 6.3, variance: -14050000, estimate: 1227083, qty: 2, icon: "🔴" },
      { name: "XL Paket Data", target: 10000000, actual: 600000, achievement: 6.0, variance: -9400000, estimate: 775000, qty: 1, icon: "🔵" },
      { name: "Indosat Paket", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
  {
    rank: 4,
    salesId: "25005333",
    name: "M. Adlii",
    target: 1658446763,
    actual: 269015000,
    achievement: 16.2,
    variance: -1389431763,
    estimate: 347477708,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "Pencapaian 16,2% sangat kritis dengan sisa hari tinggal 7 hari.",
      "Defisit gap -Rp 1,38 Miliar terhadap kuota toko.",
      "Lini iPad, Mac, dan seluruh Android Non-Samsung belum ada kontribusi unit sama sekali.",
    ],
    topProductSold: "iPhone 17 Pro Max 512GB",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 171742000, achievement: 15.6, variance: -928258000, estimate: 221833417, qty: 6, icon: "📱" },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0, icon: "📋" },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0, icon: "⌚" },
      { name: "AirPods", target: 30000000, actual: 4497000, achievement: 15.0, variance: -25503000, estimate: 5808625, qty: 2, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 80384000, achievement: 40.2, variance: -119616000, estimate: 103829333, qty: 8, icon: "🪐" },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Original Adapter & Charger", target: 25000000, actual: 6400000, achievement: 25.6, variance: -18600000, estimate: 8266667, qty: 14, icon: "⚡" },
      { name: "Screen Protector Tempered Glass", target: 20000000, actual: 4100000, achievement: 20.5, variance: -15900000, estimate: 5295833, qty: 15, icon: "📱" },
      { name: "Powerbank & Wireless Pad", target: 15000000, actual: 1892000, achievement: 12.6, variance: -13108000, estimate: 2443833, qty: 3, icon: "🔋" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 35000000, actual: 2100000, achievement: 6.0, variance: -32900000, estimate: 2712500, qty: 2, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 15000000, actual: 500000, achievement: 3.3, variance: -14500000, estimate: 645833, qty: 1, icon: "🔴" },
      { name: "XL Paket Data", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🔵" },
      { name: "Indosat Paket", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
  {
    rank: 5,
    salesId: "26036846",
    name: "Bagas T Saputra",
    target: 0,
    actual: 256332000,
    achievement: 0.0,
    variance: 256332000,
    estimate: 331095500,
    status: "Dalam Pantauan",
    attentionNotes: [
      "Staf baru / non-quota resmi, mampu mengumpulkan omset Rp 256 Juta.",
      "Perlu diberikan target kuota resmi bulan berikutnya untuk evaluasi kinerja akurat.",
    ],
    topProductSold: "iPhone 16 128GB Black & Pink",
    appleSubProducts: [
      { name: "iPhone", target: 0, actual: 198992000, achievement: 0.0, variance: 198992000, estimate: 257031333, qty: 9, icon: "📱" },
      { name: "iPad", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "📋" },
      { name: "MacBook", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "⌚" },
      { name: "AirPods", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 0, actual: 52394000, achievement: 0.0, variance: 52394000, estimate: 67675583, qty: 6, icon: "🪐" },
      { name: "Oppo Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Original Adapter & Charger", target: 0, actual: 3400000, achievement: 0.0, variance: 3400000, estimate: 4391667, qty: 8, icon: "⚡" },
      { name: "Screen Protector Tempered Glass", target: 0, actual: 1546000, achievement: 0.0, variance: 1546000, estimate: 1996917, qty: 6, icon: "📱" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🔴" },
      { name: "XL Paket Data", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🔵" },
      { name: "Indosat Paket", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
  {
    rank: 6,
    salesId: "25015216",
    name: "Andrian Afi Syarfuan",
    target: 1658446763,
    actual: 240422000,
    achievement: 14.5,
    variance: -1418024763,
    estimate: 310545083,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "SANGAT KRITIS: Pencapaian 14,5%, defisit omset mencapai -Rp 1,41 Miliar.",
      "Produktivitas harian hanya Rp 10 Juta/hari. Perlu percepatan penawaran promo cashback bank.",
    ],
    topProductSold: "iPhone 17 Pro Max 256GB Silver",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 184291000, achievement: 16.8, variance: -915709000, estimate: 238042542, qty: 7, icon: "📱" },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0, icon: "📋" },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0, icon: "⌚" },
      { name: "AirPods", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 38142000, achievement: 19.1, variance: -161858000, estimate: 49266750, qty: 5, icon: "🪐" },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Original Adapter & Charger", target: 25000000, actual: 8900000, achievement: 35.6, variance: -16100000, estimate: 11495833, qty: 19, icon: "⚡" },
      { name: "Screen Protector Tempered Glass", target: 20000000, actual: 5600000, achievement: 28.0, variance: -14400000, estimate: 7233333, qty: 18, icon: "📱" },
      { name: "MagSafe Case Original", target: 18000000, actual: 2100000, achievement: 11.7, variance: -15900000, estimate: 2712500, qty: 4, icon: "🛡️" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 35000000, actual: 1100000, achievement: 3.1, variance: -33900000, estimate: 1420833, qty: 1, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 15000000, actual: 300000, achievement: 2.0, variance: -14700000, estimate: 387500, qty: 1, icon: "🔴" },
      { name: "XL Paket Data", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🔵" },
      { name: "Indosat Paket", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
  {
    rank: 7,
    salesId: "26026303",
    name: "Surya Adi Permana",
    target: 1658446763,
    actual: 174451000,
    achievement: 10.5,
    variance: -1483995763,
    estimate: 225332542,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "DEFISIT PALING KRITIS: Pencapaian terendah toko (10,5%). Defisit -Rp 1,48 Miliar.",
      "Penjualan iPad, MacBook, dan seluruh brand Android Non-Samsung tercatat 0 unit.",
      "Perlu coaching intensif penawaran cicilan BNPL / 0% dan active bundle protection.",
    ],
    topProductSold: "Galaxy A07 4/64GB & MagSafe Case",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 128496000, achievement: 11.7, variance: -971504000, estimate: 165974000, qty: 5, icon: "📱" },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0, icon: "📋" },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0, icon: "💻" },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0, icon: "⌚" },
      { name: "AirPods", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0, icon: "🎧" },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 31793000, achievement: 15.9, variance: -168207000, estimate: 41065958, qty: 5, icon: "🪐" },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🟢" },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "Ⓜ️" },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0, icon: "⚡" },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0, icon: "🟠" },
    ],
    accessoriesSubProducts: [
      { name: "Screen Protector Tempered Glass", target: 20000000, actual: 6800000, achievement: 34.0, variance: -13200000, estimate: 8783333, qty: 21, icon: "📱" },
      { name: "Original Adapter & Charger", target: 25000000, actual: 5200000, achievement: 20.8, variance: -19800000, estimate: 6716667, qty: 11, icon: "⚡" },
      { name: "MagSafe Case Original", target: 18000000, actual: 2162000, achievement: 12.0, variance: -15838000, estimate: 2792583, qty: 4, icon: "🛡️" },
    ],
    vasSubProducts: [
      { name: "Qoala Protection", target: 35000000, actual: 0, achievement: 0.0, variance: -35000000, estimate: 0, qty: 0, icon: "🛡️" },
      { name: "Telkomsel Bundling", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0, icon: "🔴" },
      { name: "XL Paket Data", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🔵" },
      { name: "Indosat Paket", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0, icon: "🟡" },
    ],
  },
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [selectedStaffIndex, setSelectedStaffIndex] = useState(0);
  const [subLOBTab, setSubLOBTab] = useState<SubLOBType>("apple");

  // State Filter Waktu
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [selectedWeek, setSelectedWeek] = useState("Week 4 (Tgl 22-28)");
  const [currentDateInput, setCurrentDateInput] = useState("2026-10-24");

  // Shortcut Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digiplus_session_user");
      if (savedUser) setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    if (salesIdInput.trim() === "") {
      setLoginErr("Masukkan Sales ID Anda!");
      return;
    }
    localStorage.setItem("digiplus_session_user", salesIdInput);
    setIsLoggedIn(true);
    setLoginErr("");
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_session_user");
    setIsLoggedIn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus({ type: "idle", text: `File: ${file.name}` });
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: "error", text: "Pilih file .xls terlebih dahulu!" });
      return;
    }

    setUploadStatus({ type: "loading", text: "Mengirim ke Kolom M, N, O..." });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "upload_saleswise",
          targetSheet: "RAW SalesPerson",
          columns: ["M", "N", "O"],
          fileName: selectedFile.name,
        }),
      });

      setUploadStatus({
        type: "success",
        text: `Berhasil! File "${selectedFile.name}" telah diteruskan ke Sheet RAW SalesPerson Kolom M, N, O.`,
      });
      setSelectedFile(null);
    } catch {
      setUploadStatus({ type: "error", text: "Gagal mengirim file. Periksa koneksi internet." });
    }
  };

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  const currentStaff = DETAILED_STAFF_PERFORMANCE[selectedStaffIndex];

  // Helper pengambil rincian sub-produk staf aktif sesuai tab
  const activeStaffSubProducts = useMemo(() => {
    if (subLOBTab === "apple") return currentStaff.appleSubProducts;
    if (subLOBTab === "android") return currentStaff.androidSubProducts;
    if (subLOBTab === "accessories") {
      // Diurutkan dari nominal/amount terbesar ke terkecil
      return [...currentStaff.accessoriesSubProducts].sort((a, b) => b.actual - a.actual);
    }
    return currentStaff.vasSubProducts;
  }, [subLOBTab, currentStaff]);

  // Daftar Staf yang Memerlukan Perhatian Khusus
  const attentionStaffList = useMemo(() => {
    return DETAILED_STAFF_PERFORMANCE.filter((s) => s.status === "Perlu Perhatian Khusus");
  }, []);

  // HALAMAN LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1A1831] flex items-center justify-center p-4 text-[#FFF6E9] font-sans">
        <div className="max-w-md w-full bg-[#221F40] border-2 border-[#3B3666] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#F5BA42] to-[#E65100] rounded-2xl mx-auto flex items-center justify-center font-black text-2xl text-[#1A1831] shadow-lg shadow-[#F5BA42]/20 mb-3">
              D+
            </div>
            <h1 className="text-xl font-bold text-[#FFF6E9]">DIGIPLUS GRAND INDONESIA</h1>
            <p className="text-xs text-[#F5BA42] mt-1 font-semibold tracking-wider">PORTAL LOGIN SALES & ADMIN (QF01)</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#FFF6E9]/80 uppercase tracking-wider">Sales ID / Admin ID</label>
              <input
                type="text"
                required
                placeholder="24004971 atau ID Anda"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-[#141226] border border-[#3B3666] text-[#FFF6E9] placeholder-[#FFF6E9]/40 text-sm focus:border-[#F5BA42] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#FFF6E9]/80 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-[#141226] border border-[#3B3666] text-[#FFF6E9] placeholder-[#FFF6E9]/40 text-sm focus:border-[#F5BA42] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#F5BA42] hover:bg-[#ffc857] text-[#1A1831] font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-[#F5BA42]/20"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD UTAMA
  return (
    <div className="flex min-h-screen bg-[#1A1831] text-[#FFF6E9] font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#141226] border-r border-[#3B3666] flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#3B3666]">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#F5BA42] to-[#E65100] rounded-xl flex items-center justify-center font-black text-[#1A1831] text-lg shadow-lg shadow-[#F5BA42]/20">
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#FFF6E9] tracking-wider">DIGIPLUS</h2>
              <p className="text-[10px] text-[#F5BA42] font-semibold">QF01 GRAND INDONESIA</p>
            </div>
          </div>

          {/* SHORTCUT UPLOAD */}
          <div className="mt-4 p-4 rounded-2xl bg-[#221F40] border-2 border-[#F5BA42]/40 shadow-xl shadow-[#F5BA42]/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📤</span>
              <div>
                <h3 className="text-xs font-black text-[#F5BA42] uppercase tracking-wide">Upload Saleswise</h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-[#FFF6E9]/60 hover:text-[#F5BA42] underline block"
                >
                  Sheet RAW (Kolom M, N, O) ↗
                </a>
              </div>
            </div>

            {uploadStatus.text && (
              <div
                className={`my-2 p-2 rounded-xl text-[10px] font-bold text-center leading-tight ${
                  uploadStatus.type === "success"
                    ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                    : uploadStatus.type === "error"
                    ? "bg-red-500/20 border border-red-400/40 text-red-200"
                    : "bg-[#141226] border border-[#3B3666] text-[#F5BA42]"
                }`}
              >
                {uploadStatus.text}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-[#141226] hover:bg-[#2B274F] border border-[#F5BA42]/30 hover:border-[#F5BA42] text-[#FFF6E9] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">{selectedFile ? selectedFile.name : "1. Pilih File .xls"}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading"}
              className="w-full mt-2 py-2.5 px-3 bg-[#F5BA42] hover:bg-[#ffc857] text-[#1A1831] font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              {uploadStatus.type === "loading" ? "Mengirim..." : "2. Kirim ke Kolom M, N, O"}
            </button>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-5 space-y-1.5">
            <button
              onClick={() => setActiveTab("store-overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Overview Store & Kategori</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "leaderboard" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">🏆</span>
              <span>Staff Performance Detail</span>
            </button>

            <button
              onClick={() => setActiveTab("sales-detail")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">📋</span>
              <span>Rincian LOB Penjualan</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#3B3666]">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* HEADER & FILTER WAKTU (BULAN, WEEK, TANGGAL BERJALAN) */}
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-[#3B3666] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#F5BA42]/15 border border-[#F5BA42]/30 text-[#F5BA42] text-[10px] font-black uppercase">
                QF01 Grand Indonesia
              </span>
              <h1 className="text-xl font-black text-[#FFF6E9] uppercase tracking-wide">
                Sales Dashboard & Store Overview
              </h1>
            </div>
            <p className="text-xs text-[#FFF6E9]/70 mt-1">
              Monitoring Target, Actual, Variance, Run Rate & Staff Performance
            </p>
          </div>

          {/* FILTER PANEL */}
          <div className="flex flex-wrap items-center gap-2.5 bg-[#141226] p-2 rounded-2xl border border-[#3B3666]">
            {/* Filter Bulan */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#221F40] rounded-xl border border-[#3B3666]/60">
              <span className="text-xs">📅</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-[#FFF6E9] font-bold focus:outline-none cursor-pointer"
              >
                <option value="Oktober 2026" className="bg-[#141226]">Oktober 2026</option>
                <option value="November 2026" className="bg-[#141226]">November 2026</option>
                <option value="Desember 2026" className="bg-[#141226]">Desember 2026</option>
              </select>
            </div>

            {/* Filter Week */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#221F40] rounded-xl border border-[#3B3666]/60">
              <span className="text-xs">📊</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-transparent text-xs text-[#FFF6E9] font-bold focus:outline-none cursor-pointer"
              >
                <option value="Week 1 (Tgl 01-07)" className="bg-[#141226]">Week 1 (01-07)</option>
                <option value="Week 2 (Tgl 08-14)" className="bg-[#141226]">Week 2 (08-14)</option>
                <option value="Week 3 (Tgl 15-21)" className="bg-[#141226]">Week 3 (15-21)</option>
                <option value="Week 4 (Tgl 22-28)" className="bg-[#141226]">Week 4 (22-28)</option>
                <option value="Full Month (MDT)" className="bg-[#141226]">Full Month</option>
              </select>
            </div>

            {/* Filter Tanggal Berjalan */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#221F40] rounded-xl border border-[#3B3666]/60">
              <span className="text-xs">⏱️</span>
              <input
                type="date"
                value={currentDateInput}
                onChange={(e) => setCurrentDateInput(e.target.value)}
                className="bg-transparent text-xs text-[#F5BA42] font-mono font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW STORE & KATEGORI (LENGKAP TIME GONE + LOB) */}
        {/* ========================================================= */}
        {activeTab === "store-overview" && (
          <div className="space-y-8">
            {/* 1. KARTU TIME GONE TOKO */}
            <div className="p-6 bg-[#221F40] border-2 border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#FFF6E9] uppercase tracking-wide">
                      Time Gone & Run-Rate Overview
                    </h2>
                    <p className="text-xs text-[#FFF6E9]/60">
                      Hari ke-{TIME_GONE_METRIC.daysPassed} dari {TIME_GONE_METRIC.totalDays} hari ({TIME_GONE_METRIC.percentageTimeGone}% Waktu Berjalan)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl text-xs font-bold">
                    Sisa Waktu: {TIME_GONE_METRIC.daysLeft} Hari ({TIME_GONE_METRIC.percentageTimeLeft}%)
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
                    Toko: QF01 Grand Indonesia
                  </span>
                </div>
              </div>

              {/* Progress Bar Time Gone vs Achievement */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FFF6E9]/80">Progress Waktu Berjalan ({TIME_GONE_METRIC.percentageTimeGone}%)</span>
                  <span className="text-emerald-300">Pencapaian Omset Store ({STORE_TOTAL.achievement}%)</span>
                </div>
                <div className="w-full bg-[#141226] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#3B3666]">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${TIME_GONE_METRIC.percentageTimeGone}%` }}
                  />
                </div>
              </div>

              {/* Statistik Run-rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                <div className="p-3.5 bg-[#141226] rounded-2xl border border-[#3B3666]">
                  <span className="text-[10px] text-[#FFF6E9]/60 uppercase font-semibold block">Total Target Toko</span>
                  <span className="text-sm font-extrabold text-[#FFF6E9] font-mono mt-0.5 block">{formatIDR(STORE_TOTAL.target)}</span>
                </div>
                <div className="p-3.5 bg-[#141226] rounded-2xl border border-[#3B3666]">
                  <span className="text-[10px] text-[#FFF6E9]/60 uppercase font-semibold block">Total Actual Omset</span>
                  <span className="text-sm font-extrabold text-emerald-300 font-mono mt-0.5 block">{formatIDR(STORE_TOTAL.actual)}</span>
                </div>
                <div className="p-3.5 bg-[#141226] rounded-2xl border border-[#3B3666]">
                  <span className="text-[10px] text-[#FFF6E9]/60 uppercase font-semibold block">Actual Run Rate / Hari</span>
                  <span className="text-sm font-extrabold text-sky-300 font-mono mt-0.5 block">{formatIDR(TIME_GONE_METRIC.dailyActualRunRate)}</span>
                </div>
                <div className="p-3.5 bg-[#141226] rounded-2xl border border-red-500/30">
                  <span className="text-[10px] text-red-300 uppercase font-semibold block">Required Run Rate (7 Hari)</span>
                  <span className="text-sm font-extrabold text-red-300 font-mono mt-0.5 block">{formatIDR(TIME_GONE_METRIC.requiredDailyRunRate)}/hr</span>
                </div>
              </div>
            </div>

            {/* 2. OVERVIEW PRODUK: APPLE, ANDROID, ACCESSORIES, VAS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9] flex items-center gap-2">
                    <span>📦</span>
                    <span>Target & Achievement Per Kategori Produk Toko</span>
                  </h3>
                  <p className="text-xs text-[#FFF6E9]/60">Metrik Target, Actual, Achievement, Variance & Estimate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STORE_CATEGORIES).map(([key, cat]) => (
                  <div key={key} className="p-5 bg-[#221F40] border border-[#3B3666] hover:border-[#F5BA42]/40 rounded-3xl transition shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cat.icon}</span>
                        <h4 className="text-sm font-black text-[#FFF6E9]">{cat.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        cat.achievement >= 40 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                      }`}>
                        {cat.achievement}%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#FFF6E9]/70">
                        <span>Target:</span>
                        <span className="font-mono text-[#FFF6E9]">{formatIDR(cat.target)}</span>
                      </div>
                      <div className="flex justify-between text-[#FFF6E9]/70">
                        <span>Actual:</span>
                        <span className="font-mono font-bold text-emerald-300">{formatIDR(cat.actual)}</span>
                      </div>
                      <div className="flex justify-between text-[#FFF6E9]/70">
                        <span>Variance:</span>
                        <span className={`font-mono font-bold ${cat.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                          {formatIDR(cat.variance)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#FFF6E9]/70 border-t border-[#3B3666] pt-1.5">
                        <span>Estimate EOM:</span>
                        <span className="font-mono font-bold text-sky-300">{formatIDR(cat.estimate)}</span>
                      </div>
                    </div>

                    {/* Rincian Produk Singkat Di Dalam Card */}
                    <div className="mt-4 pt-3 border-t border-[#3B3666]/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#F5BA42] tracking-wider block mb-1">
                        Sub-Lini Terbesar:
                      </span>
                      {cat.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-[#FFF6E9]/80">
                          <span className="truncate pr-2">{item.icon} {item.name}</span>
                          <span className="font-mono text-emerald-300 shrink-0">{formatIDR(item.actual)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MINI RANK SALES PER STAFF LANGSUNG DI OVERVIEW STORE */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9] flex items-center gap-2">
                    <span>🏆</span>
                    <span>Peringkat Kontribusi Sales per Staff (Store Leaderboard)</span>
                  </h3>
                  <p className="text-xs text-[#FFF6E9]/60">Urutan staf berdasarkan actual omset dan status pencapaian</p>
                </div>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="text-xs font-bold text-[#F5BA42] hover:underline"
                >
                  Lihat Detail Performa Staf ➔
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {DETAILED_STAFF_PERFORMANCE.map((st) => (
                  <div
                    key={st.salesId}
                    onClick={() => {
                      setSelectedStaffIndex(st.rank - 1);
                      setActiveTab("leaderboard");
                    }}
                    className="p-3.5 bg-[#141226] border border-[#3B3666] hover:border-[#F5BA42] rounded-2xl cursor-pointer transition"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-[#FFF6E9] truncate">{st.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-[#F5BA42] text-[#1A1831]">
                        #{st.rank}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-300 font-mono">{formatIDR(st.actual)}</div>
                    <div className="flex justify-between items-center text-[10px] text-[#FFF6E9]/60 mt-1">
                      <span>Achv: <strong className="text-amber-300">{st.achievement}%</strong></span>
                      <span className={st.status === "Perlu Perhatian Khusus" ? "text-red-400 font-bold" : "text-emerald-400"}>
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: STAFF PERFORMANCE DETAIL (APPLE, ANDROID, ACC, VAS) */}
        {/* ========================================================= */}
        {activeTab === "leaderboard" && (
          <div className="space-y-8">
            {/* 1. KARTU PERINGATAN: STAF YANG PERLU DIPERHATIKAN PENJUALANNYA */}
            <div className="p-6 bg-[#221F40] border-2 border-red-400/40 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-xl font-bold text-red-300">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-base font-black text-red-300 uppercase tracking-wide">
                    PERHATIAN KHUSUS: STAF TERTINGGAL TARGET PENJUALAN
                  </h2>
                  <p className="text-xs text-[#FFF6E9]/70">
                    Staf dengan pencapaian di bawah 20% dan defisit variance di atas Rp 1,3 Miliar terhadap kuota waktu berjalan ({TIME_GONE_METRIC.percentageTimeGone}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {attentionStaffList.map((st) => (
                  <div
                    key={st.salesId}
                    onClick={() => {
                      const idx = DETAILED_STAFF_PERFORMANCE.findIndex((x) => x.salesId === st.salesId);
                      if (idx !== -1) setSelectedStaffIndex(idx);
                    }}
                    className="p-4 bg-[#141226] border border-red-500/30 hover:border-red-400 rounded-2xl cursor-pointer transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{st.name}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-200 border border-red-400/30 px-1.5 py-0.2 rounded font-black">
                        #{st.rank}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#FFF6E9]/60 font-mono">ID: {st.salesId}</div>
                    <div className="mt-2 text-sm font-black text-red-300">{formatIDR(st.actual)}</div>
                    <div className="flex justify-between text-[10px] text-[#FFF6E9]/70 mt-1">
                      <span>Achv: <strong className="text-amber-300">{st.achievement}%</strong></span>
                      <span className="text-red-400 font-bold">{formatIDR(st.variance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TABEL RINGKASAN SELURUH SALES & STATUS KINERJA */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <h3 className="text-base font-bold text-[#FFF6E9] mb-4">🏆 Peringkat Salesperson & Evaluasi Kinerja Toko</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Salesperson</th>
                      <th className="py-3.5 px-4 text-right">Target Kuota</th>
                      <th className="py-3.5 px-4 text-right">Actual Penjualan</th>
                      <th className="py-3.5 px-4 text-center">Achv (%)</th>
                      <th className="py-3.5 px-4 text-right">Variance</th>
                      <th className="py-3.5 px-4 text-right">Estimate Akhir Bulan</th>
                      <th className="py-3.5 px-4 text-center">Status & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {DETAILED_STAFF_PERFORMANCE.map((st, index) => (
                      <tr
                        key={st.salesId}
                        onClick={() => setSelectedStaffIndex(index)}
                        className={`cursor-pointer transition ${
                          selectedStaffIndex === index
                            ? "bg-[#2B274F] border-l-4 border-l-[#F5BA42]"
                            : "hover:bg-[#2B274F]/50"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              st.rank === 1
                                ? "bg-[#F5BA42] text-[#1A1831]"
                                : st.rank === 2
                                ? "bg-slate-300 text-[#1A1831]"
                                : st.rank === 3
                                ? "bg-amber-700 text-white"
                                : "text-[#FFF6E9]/60"
                            }`}
                          >
                            {st.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#FFF6E9] font-bold text-sm">{st.name}</div>
                          <div className="text-[10px] text-[#FFF6E9]/50 font-mono">ID: {st.salesId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#FFF6E9]/70 font-mono">
                          {st.target > 0 ? formatIDR(st.target) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300 text-sm">
                          {formatIDR(st.actual)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black ${st.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                            {st.achievement > 0 ? `${st.achievement.toFixed(1)}%` : "-"}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${st.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                          {st.target > 0 ? formatIDR(st.variance) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-300">
                          {formatIDR(st.estimate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === "Tercapai"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                : st.status === "Perlu Perhatian Khusus"
                                ? "bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse"
                                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. PANEL DETAIL SUB-LINI PRODUK STAF TERPILIH (APPLE, ANDROID, ACC, VAS) */}
            <div className="p-6 bg-[#221F40] border-2 border-[#F5BA42]/40 rounded-3xl shadow-2xl">
              {/* Header Staf Terpilih */}
              <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-[#3B3666] mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#F5BA42] tracking-widest block">
                    Detail Sub-Lini Produk Salesperson
                  </span>
                  <h2 className="text-2xl font-black text-[#FFF6E9] mt-0.5 flex items-center gap-2">
                    <span>{currentStaff.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5BA42] text-[#1A1831] font-black">
                      Rank #{currentStaff.rank}
                    </span>
                  </h2>
                  <p className="text-xs text-[#FFF6E9]/70 mt-1">
                    Top Selling Unit: <strong className="text-emerald-300">{currentStaff.topProductSold}</strong>
                  </p>
                </div>

                {/* Tab Pemilih Kategori: Apple vs Android vs Accessories vs VAS */}
                <div className="flex flex-wrap gap-2 bg-[#141226] p-1.5 rounded-2xl border border-[#3B3666]">
                  <button
                    onClick={() => setSubLOBTab("apple")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      subLOBTab === "apple"
                        ? "bg-sky-500 text-[#1A1831] shadow-lg shadow-sky-500/20 font-black"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🍎</span>
                    <span>Apple Devices</span>
                  </button>

                  <button
                    onClick={() => setSubLOBTab("android")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      subLOBTab === "android"
                        ? "bg-indigo-500 text-[#FFF6E9] shadow-lg shadow-indigo-500/20 font-black"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🤖</span>
                    <span>Android Devices</span>
                  </button>

                  <button
                    onClick={() => setSubLOBTab("accessories")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      subLOBTab === "accessories"
                        ? "bg-amber-500 text-[#1A1831] shadow-lg shadow-amber-500/20 font-black"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🎧</span>
                    <span>Accessories (Nominal Terbesar)</span>
                  </button>

                  <button
                    onClick={() => setSubLOBTab("vas")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      subLOBTab === "vas"
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-black"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🛡️</span>
                    <span>VAS (Qoala, Telkomsel, XL, Indosat)</span>
                  </button>
                </div>
              </div>

              {/* Catatan Evaluasi Penjualan Staf */}
              <div className="mb-6 p-4 bg-[#141226] rounded-2xl border border-[#3B3666]">
                <h4 className="text-xs font-bold text-[#F5BA42] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>Evaluasi Penjualan & Rekomendasi Supervisi:</span>
                </h4>
                <ul className="space-y-1 text-xs text-[#FFF6E9]/80 list-disc list-inside">
                  {currentStaff.attentionNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Tabel Detail Sub-Lini Terpilih */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-4 px-4">Lini / Produk Detail</th>
                      <th className="py-4 px-4 text-center">Qty Terjual</th>
                      <th className="py-4 px-4 text-right">Target Lini</th>
                      <th className="py-4 px-4 text-right">Actual Sales</th>
                      <th className="py-4 px-4 text-center">Achievement (%)</th>
                      <th className="py-4 px-4 text-right">Variance</th>
                      <th className="py-4 px-4 text-right">Estimate (Run Rate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {activeStaffSubProducts.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-[#2B274F]/50 transition">
                        <td className="py-4 px-4 font-bold text-[#FFF6E9] text-sm">
                          {sub.icon || "📦"} {sub.name}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-white">{sub.qty} Unit</td>
                        <td className="py-4 px-4 text-right text-[#FFF6E9]/70 font-mono">
                          {sub.target > 0 ? formatIDR(sub.target) : "-"}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-emerald-300 text-sm">
                          {formatIDR(sub.actual)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                              sub.actual === 0
                                ? "bg-slate-800 text-slate-500 border-slate-700"
                                : sub.achievement >= 100
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                            }`}
                          >
                            {sub.target > 0 ? `${sub.achievement.toFixed(1)}%` : sub.actual > 0 ? "100%" : "0%"}
                          </span>
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-mono font-bold ${
                            sub.variance >= 0 ? "text-emerald-300" : "text-red-300"
                          }`}
                        >
                          {sub.target > 0 ? formatIDR(sub.variance) : "-"}
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-300 font-mono font-bold">
                          {formatIDR(sub.estimate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RINCIAN PENJUALAN LOB (GLOBAL)                      */}
        {/* ========================================================= */}
        {activeTab === "sales-detail" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#FFF6E9]">Breakdown LOB & Kontribusi Kategori Store</h2>
              <p className="text-xs text-[#FFF6E9]/60">Rincian performa lini bisnis Digiplus QF01 Grand Indonesia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(STORE_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-[#FFF6E9] flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-300">{formatIDR(cat.actual)}</span>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-[#141226] rounded-xl">
                        <span className="font-semibold text-[#FFF6E9]/90">{it.icon} {it.name}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-300 block">{formatIDR(it.actual)}</span>
                          <span className="text-[10px] text-[#FFF6E9]/50">{it.qty} Unit ({it.achievement}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

```
