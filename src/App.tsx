"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "staff-performance" | "sales-detail";

interface SubCategoryMetric {
  name: string;
  icon: string;
  qty: number;
  actual: number;
  target: number;
  achievement: number;
  variance: number;
  estimate: number;
}

interface StaffFullData {
  rank: number;
  salesId: string;
  name: string;
  target: number;
  actual: number;
  achievement: number;
  variance: number;
  estimate: number;
  status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan";
  ringkasanEvaluasi: string;
  rekomendasiTindakan: string;
  appleSub: SubCategoryMetric[];
  androidSub: SubCategoryMetric[];
  accessoriesSub: SubCategoryMetric[];
  vasSub: SubCategoryMetric[];
}

// 1. DATA TIME GONE BERJALAN (OKTOBER 2026)
const TIME_GONE_DATA = {
  daysPassed: 24,
  totalDays: 31,
  daysLeft: 7,
  percentageTimeGone: 77.4,
  actualPace: 36.1,
  dailyRunRate: 131159508,
  requiredRunRate: 797262710,
};

// 2. DATA OVERVIEW STORE (4 KATEGORI LOB)
const OVERVIEW_LOB_DATA = [
  {
    category: "Apple Devices",
    icon: "🍎",
    actual: 2519060000,
    target: 6932151006,
    achievement: 36.3,
    variance: -4413091006,
    estimate: 3253785833,
    status: "Tertinggal -41.1%",
    color: "text-sky-300",
    badge: "bg-sky-500/15 border-sky-400/30 text-sky-200",
  },
  {
    category: "Android Devices",
    icon: "🤖",
    actual: 394141000,
    target: 943691666,
    achievement: 41.8,
    variance: -549550666,
    estimate: 509098792,
    status: "Tertinggal -35.6%",
    color: "text-indigo-300",
    badge: "bg-indigo-500/15 border-indigo-400/30 text-indigo-200",
  },
  {
    category: "Accessories",
    icon: "🔌",
    actual: 60156200,
    target: 460550560,
    achievement: 13.1,
    variance: -400394360,
    estimate: 77701758,
    status: "Tertinggal -64.3%",
    color: "text-amber-300",
    badge: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  },
  {
    category: "VAS (Qoala, Telkomsel, XL, Indosat)",
    icon: "🛡️",
    actual: 45070000,
    target: 392273940,
    achievement: 11.5,
    variance: -347203940,
    estimate: 58215417,
    status: "Tertinggal -65.9%",
    color: "text-purple-300",
    badge: "bg-purple-500/15 border-purple-400/30 text-purple-200",
  },
];

const OVERVIEW_TOTAL = {
  actual: 3147828200,
  target: 8728667173,
  achievement: 36.1,
  variance: -5580838973,
  estimate: 4065944758,
};

// 3. DETAIL PRODUK PER KATEGORI OVERVIEW
const OVERVIEW_PRODUCT_BREAKDOWN: Record<string, { name: string; sku: string; brand: string; qty: number; revenue: number; share: string }[]> = {
  apple: [
    { name: "iPhone 17 Pro Max 256GB / 512GB", sku: "APPMFYM4ID/A", brand: "APPLE", qty: 48, revenue: 1248000000, share: "49.5%" },
    { name: "iPhone 17 Pro 256GB / 1TB", sku: "APPMG8P4ID/A", brand: "APPLE", qty: 26, revenue: 642000000, share: "25.5%" },
    { name: "iPhone 16 128GB / 256GB", sku: "APPMYE73ID/A", brand: "APPLE", qty: 22, revenue: 362978000, share: "14.4%" },
    { name: "iPhone 15 128GB", sku: "APPMTP13ID/A", brand: "APPLE", qty: 12, revenue: 167988000, share: "6.7%" },
    { name: "iPad 11th Gen Wi-Fi 128GB", sku: "APPMD4A4PA/A", brand: "APPLE", qty: 9, revenue: 78291000, share: "3.1%" },
    { name: "MacBook Air/Pro M-Series", sku: "APPMACNEO", brand: "APPLE", qty: 2, revenue: 19803000, share: "0.8%" },
  ],
  android: [
    { name: "Galaxy S26 Ultra 12/256GB", sku: "SSUSM-S948BZVB", brand: "SAMSUNG", qty: 12, revenue: 261120000, share: "66.2%" },
    { name: "Samsung Galaxy Z Fold 8 512GB", sku: "SSUSM-F971BZKG", brand: "SAMSUNG", qty: 2, revenue: 64998000, share: "16.5%" },
    { name: "Galaxy A17 4/128GB LTE/5G", sku: "SSUSM-A175FZKN", brand: "SAMSUNG", qty: 14, revenue: 41986000, share: "10.7%" },
    { name: "Galaxy A07 4/64GB Light Violet", sku: "SSUSM-A075FLVD", brand: "SAMSUNG", qty: 8, revenue: 18392000, share: "4.7%" },
    { name: "Motorola & Multi-brand Devices", sku: "MOT-MULTIBRAND", brand: "MOTOROLA", qty: 3, revenue: 7645000, share: "1.9%" },
  ],
  accessories: [
    { name: "20W USB-C Power Adapter", sku: "APPMD3J4ZA/A", brand: "APPLE", qty: 36, revenue: 19764000, share: "32.9%" },
    { name: "AirPods 4th Gen Wireless Audio", sku: "APPMXP63ID/A", brand: "APPLE", qty: 7, revenue: 14693000, share: "24.4%" },
    { name: "240W USB-C Charge Cable (2M)", sku: "APPMYQT3ZA/A", brand: "APPLE", qty: 16, revenue: 8784000, share: "14.6%" },
    { name: "MagSafe Silicone & Clear Case", sku: "MUUM-IP17PM-ICM", brand: "MUTUALL / ZAGG", qty: 14, revenue: 7686000, share: "12.8%" },
    { name: "Samsung Travel Adapter 25W/45W", sku: "SSUEP-T2510NBE", brand: "SAMSUNG", qty: 18, revenue: 5382000, share: "8.9%" },
    { name: "Tempered Glass 2.5D / 3D Shield", sku: "KOATGF-IP18PM", brand: "DIGI-SHIELD", qty: 6, revenue: 3847200, share: "6.4%" },
  ],
  vas: [
    { name: "Proteksi Qoala Diamond 24-25", sku: "KLADIAMOND(24-25)", brand: "QOALA", qty: 18, revenue: 35460000, share: "78.68%" },
    { name: "Proteksi Qoala Screen & Extended", sku: "KLAPROT-EXT", brand: "QOALA", qty: 3, revenue: 5170000, share: "11.47%" },
    { name: "Telkomsel Halo Pascabayar Bundling", sku: "TSL-HALO-POST", brand: "TELKOMSEL", qty: 4, revenue: 4440000, share: "9.85%" },
    { name: "XL Axiata Prioritas Bundling Data", sku: "XL-PRIORITAS-PKG", brand: "XL", qty: 0, revenue: 0, share: "0.00%" },
    { name: "Indosat Ooredoo IM3 Prime Bundling", sku: "IM3-PRIME-POST", brand: "INDOSAT", qty: 0, revenue: 0, share: "0.00%" },
  ],
};

// 4. DATA DETAIL SELURUH STAF TOKO QF01 (DITAMPILKAN SEMUANYA)
const ALL_STAFF_DETAILS: StaffFullData[] = [
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
    ringkasanEvaluasi: "Pencapaian sangat memuaskan (162,8%). Lini iPhone menyumbang lebih dari Rp 1,35 Miliar.",
    rekomendasiTindakan: "Tingkatkan attachment Aksesoris dan VAS Qoala pada setiap unit iPhone agar margin toko semakin maksimal.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 45, actual: 1353207000, target: 750000000, achievement: 180.4, variance: 603207000, estimate: 1747892375 },
      { name: "iPad", icon: "📟", qty: 3, actual: 24884000, target: 60000000, achievement: 41.5, variance: -35116000, estimate: 32141833 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 30000000, achievement: 0.0, variance: -30000000, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 1, actual: 4499000, target: 20000000, achievement: 22.5, variance: -15501000, estimate: 5811208 },
      { name: "AirPods", icon: "🎧", qty: 2, actual: 4200000, target: 12866717, achievement: 32.6, variance: -8666717, estimate: 5425000 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 8, actual: 27992000, target: 80000000, achievement: 35.0, variance: -52008000, estimate: 36156333 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 5000000, achievement: 0.0, variance: -5000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 5000000, achievement: 0.0, variance: -5000000, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 4, actual: 1647000, target: 5000000, achievement: 32.9, variance: -3353000, estimate: 2127375 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 2, actual: 798000, target: 3000000, achievement: 26.6, variance: -2202000, estimate: 1030750 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 1, actual: 266000, target: 2000000, achievement: 13.3, variance: -1734000, estimate: 343583 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 2, actual: 3490000, target: 10000000, achievement: 34.9, variance: -6510000, estimate: 4507917 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 2000000, achievement: 0.0, variance: -2000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1000000, achievement: 0.0, variance: -1000000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1000000, achievement: 0.0, variance: -1000000, estimate: 0 },
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
    ringkasanEvaluasi: "Pencapaian 36,9% tertinggal dari Time Gone (77,4%). Samsung Flagship (S26 Ultra & Fold 8) terjual kuat.",
    rekomendasiTindakan: "Fokus closing pada seri iPhone 17 dan MacBook untuk memangkas selisih minus Rp 771 Juta di sisa 7 hari.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 12, actual: 238190000, target: 850000000, achievement: 28.0, variance: -611810000, estimate: 307662083 },
      { name: "iPad", icon: "📟", qty: 4, actual: 34796000, target: 80000000, achievement: 43.5, variance: -45204000, estimate: 44944833 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 50000000, achievement: 0.0, variance: -50000000, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 1, actual: 7104000, target: 30000000, achievement: 23.7, variance: -22896000, estimate: 9176167 },
      { name: "AirPods", icon: "🎧", qty: 2, actual: 4100000, target: 20000000, achievement: 20.5, variance: -15900000, estimate: 5295833 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 16, actual: 136044000, target: 150000000, achievement: 90.7, variance: -13956000, estimate: 175723500 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 10000000, achievement: 0.0, variance: -10000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 5000000, achievement: 0.0, variance: -5000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 7013404, achievement: 0.0, variance: -7013404, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 12, actual: 6588000, target: 12000000, achievement: 54.9, variance: -5412000, estimate: 8509500 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 8, actual: 4392000, target: 8000000, achievement: 54.9, variance: -3608000, estimate: 5673000 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 7, actual: 2470000, target: 5000000, achievement: 49.4, variance: -2530000, estimate: 3190417 },
      { name: "Samsung Travel Adapter 25W/45W", icon: "⚡", qty: 6, actual: 1794000, target: 3000000, achievement: 59.8, variance: -1206000, estimate: 2317250 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 5, actual: 13120000, target: 20000000, achievement: 65.6, variance: -6880000, estimate: 16946667 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 3000000, achievement: 0.0, variance: -3000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
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
    ringkasanEvaluasi: "Defisit kritis minus Rp 1,35 Miliar. Penjualan brand Android selain Samsung masih nol.",
    rekomendasiTindakan: "Tawarkan simulasi cicilan 0% dan bundling proteksi Qoala pada setiap prospek perangkat flagship.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 8, actual: 212493000, target: 1100000000, achievement: 19.3, variance: -887507000, estimate: 274470125 },
      { name: "iPad", icon: "📟", qty: 2, actual: 17398000, target: 100000000, achievement: 17.4, variance: -82602000, estimate: 22472417 },
      { name: "MacBook", icon: "💻", qty: 1, actual: 19803000, target: 80000000, achievement: 24.8, variance: -60197000, estimate: 25578875 },
      { name: "Apple Watch", icon: "⌚", qty: 0, actual: 0, target: 40000000, achievement: 0.0, variance: -40000000, estimate: 0 },
      { name: "AirPods", icon: "🎧", qty: 2, actual: 4799000, target: 30000000, achievement: 16.0, variance: -25201000, estimate: 6198708 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 6, actual: 27392000, target: 200000000, achievement: 13.7, variance: -172608000, estimate: 35381333 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 15000000, achievement: 0.0, variance: -15000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 18446763, achievement: 0.0, variance: -18446763, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 9, actual: 5291000, target: 12000000, achievement: 44.1, variance: -6709000, estimate: 6834208 },
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 8, actual: 4392000, target: 10000000, achievement: 43.9, variance: -5608000, estimate: 5673000 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 6, actual: 2340000, target: 6000000, achievement: 39.0, variance: -3660000, estimate: 3022500 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 3, actual: 5750000, target: 18000000, achievement: 31.9, variance: -12250000, estimate: 7427083 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 3000000, achievement: 0.0, variance: -3000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
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
    ringkasanEvaluasi: "Defisit mencapai minus Rp 1,38 Miliar. Lini iPad, MacBook, dan Android non-Samsung kosong.",
    rekomendasiTindakan: "Review harian terhadap traffic walk-in dan proaktif tawarkan iPad dan Samsung A-Series.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 6, actual: 171742000, target: 1100000000, achievement: 15.6, variance: -928258000, estimate: 221833417 },
      { name: "iPad", icon: "📟", qty: 0, actual: 0, target: 100000000, achievement: 0.0, variance: -100000000, estimate: 0 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 80000000, achievement: 0.0, variance: -80000000, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 0, actual: 0, target: 40000000, achievement: 0.0, variance: -40000000, estimate: 0 },
      { name: "AirPods", icon: "🎧", qty: 2, actual: 4497000, target: 30000000, achievement: 15.0, variance: -25503000, estimate: 5808625 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 8, actual: 80384000, target: 200000000, achievement: 40.2, variance: -119616000, estimate: 103829333 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 15000000, achievement: 0.0, variance: -15000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 18446763, achievement: 0.0, variance: -18446763, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 7, actual: 3843000, target: 10000000, achievement: 38.4, variance: -6157000, estimate: 4963875 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 6, actual: 3294000, target: 8000000, achievement: 41.2, variance: -4706000, estimate: 4254750 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 4, actual: 1395000, target: 4000000, achievement: 34.9, variance: -2605000, estimate: 1801875 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 2, actual: 3860000, target: 15000000, achievement: 25.7, variance: -11140000, estimate: 4985833 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 3000000, achievement: 0.0, variance: -3000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
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
    ringkasanEvaluasi: "Staf non-quota resmi, mencatatkan omset Rp 256 Juta melalui iPhone 16 dan Samsung A-Series.",
    rekomendasiTindakan: "Berikan target kuota resmi bulan depan dan dorong penawaran proteksi Qoala.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 9, actual: 198992000, target: 0, achievement: 0.0, variance: 198992000, estimate: 257031333 },
      { name: "iPad", icon: "📟", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "AirPods", icon: "🎧", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 6, actual: 52394000, target: 0, achievement: 0.0, variance: 52394000, estimate: 67675583 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 2, actual: 1098000, target: 0, achievement: 0.0, variance: 1098000, estimate: 1418250 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 1, actual: 549000, target: 0, achievement: 0.0, variance: 549000, estimate: 709125 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 1, actual: 299000, target: 0, achievement: 0.0, variance: 299000, estimate: 386208 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 2, actual: 3000000, target: 0, achievement: 0.0, variance: 3000000, estimate: 3875000 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 0, achievement: 0.0, variance: 0, estimate: 0 },
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
    ringkasanEvaluasi: "Pencapaian sangat tertinggal (14,5%), defisit omset mencapai minus Rp 1,41 Miliar.",
    rekomendasiTindakan: "Proaktif tawarkan promo cicilan kartu kredit dan trade-in untuk mendorong closing unit handphone.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 7, actual: 184291000, target: 1100000000, achievement: 16.8, variance: -915709000, estimate: 238042542 },
      { name: "iPad", icon: "📟", qty: 0, actual: 0, target: 100000000, achievement: 0.0, variance: -100000000, estimate: 0 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 80000000, achievement: 0.0, variance: -80000000, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 0, actual: 0, target: 40000000, achievement: 0.0, variance: -40000000, estimate: 0 },
      { name: "AirPods", icon: "🎧", qty: 0, actual: 0, target: 30000000, achievement: 0.0, variance: -30000000, estimate: 0 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 5, actual: 38142000, target: 200000000, achievement: 19.1, variance: -161858000, estimate: 49266750 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 15000000, achievement: 0.0, variance: -15000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 18446763, achievement: 0.0, variance: -18446763, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 8, actual: 4392000, target: 10000000, achievement: 43.9, variance: -5608000, estimate: 5673000 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 5, actual: 2745000, target: 8000000, achievement: 34.3, variance: -5255000, estimate: 3545625 },
      { name: "Samsung Travel Adapter 25W/45W", icon: "⚡", qty: 5, actual: 1495000, target: 4000000, achievement: 37.4, variance: -2505000, estimate: 1931042 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 3, actual: 1102000, target: 4000000, achievement: 27.6, variance: -2898000, estimate: 1423417 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 4, actual: 8255000, target: 18000000, achievement: 45.9, variance: -9745000, estimate: 10662708 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 3000000, achievement: 0.0, variance: -3000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
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
    ringkasanEvaluasi: "Peringkat terendah di toko dengan pencapaian 10,5% dan defisit terbesar minus Rp 1,48 Miliar.",
    rekomendasiTindakan: "Coaching intensif teknik closing dan targetkan minimal 2 transaksi perangkat per hari.",
    appleSub: [
      { name: "iPhone", icon: "📱", qty: 5, actual: 128496000, target: 1100000000, achievement: 11.7, variance: -971504000, estimate: 165974000 },
      { name: "iPad", icon: "📟", qty: 0, actual: 0, target: 100000000, achievement: 0.0, variance: -100000000, estimate: 0 },
      { name: "MacBook", icon: "💻", qty: 0, actual: 0, target: 80000000, achievement: 0.0, variance: -80000000, estimate: 0 },
      { name: "Apple Watch", icon: "⌚", qty: 0, actual: 0, target: 40000000, achievement: 0.0, variance: -40000000, estimate: 0 },
      { name: "AirPods", icon: "🎧", qty: 0, actual: 0, target: 30000000, achievement: 0.0, variance: -30000000, estimate: 0 },
    ],
    androidSub: [
      { name: "Samsung Devices", icon: "📱", qty: 5, actual: 31793000, target: 200000000, achievement: 15.9, variance: -168207000, estimate: 41065958 },
      { name: "Oppo Devices", icon: "🟢", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Motorola Devices", icon: "Ⓜ️", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Huawei Devices", icon: "🔴", qty: 0, actual: 0, target: 25000000, achievement: 0.0, variance: -25000000, estimate: 0 },
      { name: "Infinix Devices", icon: "⚡", qty: 0, actual: 0, target: 15000000, achievement: 0.0, variance: -15000000, estimate: 0 },
      { name: "Xiaomi Devices", icon: "🟠", qty: 0, actual: 0, target: 18446763, achievement: 0.0, variance: -18446763, estimate: 0 },
    ],
    accessoriesSub: [
      { name: "Apple Power Adapter 20W/35W", icon: "🔌", qty: 7, actual: 3843000, target: 10000000, achievement: 38.4, variance: -6157000, estimate: 4963875 },
      { name: "AirPods Case & MagSafe Cover", icon: "🧲", qty: 6, actual: 3294000, target: 8000000, achievement: 41.2, variance: -4706000, estimate: 4254750 },
      { name: "Samsung Travel Adapter 25W/45W", icon: "⚡", qty: 6, actual: 1794000, target: 4000000, achievement: 44.9, variance: -2206000, estimate: 2317250 },
      { name: "Tempered Glass Shield Screen", icon: "🛡️", qty: 4, actual: 1371000, target: 4000000, achievement: 34.3, variance: -2629000, estimate: 1770875 },
    ],
    vasSub: [
      { name: "Qoala Proteksi Gadget Diamond", icon: "🛡️", qty: 2, actual: 3860000, target: 15000000, achievement: 25.7, variance: -11140000, estimate: 4985833 },
      { name: "Telkomsel Halo Bundling Postpaid", icon: "🔴", qty: 0, actual: 0, target: 3000000, achievement: 0.0, variance: -3000000, estimate: 0 },
      { name: "XL Prioritas Paket Data", icon: "🔵", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
      { name: "Indosat IM3 Postpaid Plan", icon: "🟡", qty: 0, actual: 0, target: 1500000, achievement: 0.0, variance: -1500000, estimate: 0 },
    ],
  },
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [overviewDetailCategory, setOverviewDetailCategory] = useState<"apple" | "android" | "accessories" | "vas">("apple");

  // Filter Bar State
  const [filterMonth, setFilterMonth] = useState("2026-10");
  const [filterWeek, setFilterWeek] = useState("ALL");
  const [filterDate, setFilterDate] = useState("2026-10-24");

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
    } catch (err) {
      setUploadStatus({ type: "error", text: "Gagal mengirim file. Periksa koneksi internet." });
    }
  };

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  // Daftar Staf yang Memerlukan Perhatian Khusus
  const attentionStaffList = useMemo(() => {
    return ALL_STAFF_DETAILS.filter((s) => s.status === "Perlu Perhatian Khusus");
  }, []);

  // HALAMAN LOGIN DENGAN BACKGROUND DEEP INDIGO (#1A1831) & TEKS WARM CLOUD (#FFF6E9)
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
                placeholder="22008089 atau ID Anda"
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
      {/* SIDEBAR KIRI */}
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

          {/* KOTAK SHORTCUT UPLOAD */}
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
              onClick={() => setActiveTab("staff-performance")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "staff-performance" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
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
              <span>Rincian Penjualan LOB</span>
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
        {/* HEADER DENGAN FILTER BULAN, WEEK, DAN TANGGAL BERJALAN */}
        <header className="mb-6 border-b border-[#3B3666] pb-5">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#F5BA42]/15 border border-[#F5BA42]/30 text-[#F5BA42] text-[10px] font-black uppercase">
                  QF01 Grand Indonesia
                </span>
                <h1 className="text-xl font-bold text-[#FFF6E9]">RETAIL STORE PERFORMANCE ENGINE</h1>
              </div>
              <p className="text-xs text-[#FFF6E9]/70 mt-1">
                Data Master: Sheet `TIME GONE`, `Dashboard QF01`, & `DATABASE`
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                Actual MTD: {formatIDR(OVERVIEW_TOTAL.actual)}
              </span>
            </div>
          </div>

          {/* BARIS FILTER INTERAKTIF */}
          <div className="p-3 bg-[#221F40] border border-[#3B3666] rounded-2xl flex flex-wrap items-center gap-4 justify-between text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Bulan */}
              <div className="flex items-center gap-2">
                <span className="text-[#FFF6E9]/60 font-semibold">📅 Bulan:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-[#141226] border border-[#3B3666] rounded-xl px-3 py-1.5 text-[#FFF6E9] font-bold focus:outline-none focus:border-[#F5BA42]"
                >
                  <option value="2026-10">Oktober 2026</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-08">Agustus 2026</option>
                </select>
              </div>

              {/* Filter Week */}
              <div className="flex items-center gap-2">
                <span className="text-[#FFF6E9]/60 font-semibold">📊 Week:</span>
                <select
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  className="bg-[#141226] border border-[#3B3666] rounded-xl px-3 py-1.5 text-[#FFF6E9] font-bold focus:outline-none focus:border-[#F5BA42]"
                >
                  <option value="ALL">Semua Week (W1 - W4)</option>
                  <option value="W1">Week 1 (01 - 07 Okt)</option>
                  <option value="W2">Week 2 (08 - 14 Okt)</option>
                  <option value="W3">Week 3 (15 - 21 Okt)</option>
                  <option value="W4">Week 4 (22 - 31 Okt)</option>
                </select>
              </div>

              {/* Filter Tanggal Berjalan */}
              <div className="flex items-center gap-2">
                <span className="text-[#FFF6E9]/60 font-semibold">🗓️ Tanggal Berjalan:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-[#141226] border border-[#3B3666] rounded-xl px-3 py-1.5 text-[#FFF6E9] font-bold focus:outline-none focus:border-[#F5BA42]"
                />
              </div>
            </div>

            <div className="text-[11px] text-[#F5BA42] font-semibold">
              ● Data Cut-off: {filterDate}
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW STORE & KATEGORI                          */}
        {/* ========================================================= */}
        {activeTab === "store-overview" && (
          <div className="space-y-8">
            {/* 1. MODUL TIME GONE ANALYTICS */}
            <div className="p-6 bg-[#221F40] border-2 border-[#F5BA42]/35 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5BA42]/20 border border-[#F5BA42]/40 flex items-center justify-center text-2xl font-bold text-[#F5BA42]">
                    ⏳
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#FFF6E9] tracking-wide">TIME GONE ANALYTICS (OKTOBER 2026)</h2>
                    <p className="text-xs text-[#FFF6E9]/70">
                      Hari Berjalan: <strong className="text-[#FFF6E9]">{TIME_GONE_DATA.daysPassed} hari</strong> dari {TIME_GONE_DATA.totalDays} hari ({TIME_GONE_DATA.daysLeft} hari tersisa)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#FFF6E9]/60 block">Time Elapsed</span>
                    <span className="text-2xl font-black text-[#F5BA42]">{TIME_GONE_DATA.percentageTimeGone}%</span>
                  </div>
                  <div className="h-8 w-px bg-[#3B3666] mx-1"></div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#FFF6E9]/60 block">Achv Pace</span>
                    <span className="text-2xl font-black text-emerald-300">{OVERVIEW_TOTAL.achievement}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Time Gone vs Actual Achv */}
              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FFF6E9]/70">Waktu Berjalan (Time Gone):</span>
                    <span className="font-bold text-[#F5BA42]">{TIME_GONE_DATA.percentageTimeGone}% ({TIME_GONE_DATA.daysPassed}/{TIME_GONE_DATA.totalDays} Hari)</span>
                  </div>
                  <div className="w-full bg-[#141226] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#F5BA42] h-full rounded-full" style={{ width: `${TIME_GONE_DATA.percentageTimeGone}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FFF6E9]/70">Pencapaian Omset (Actual Revenue):</span>
                    <span className="font-bold text-emerald-300">{OVERVIEW_TOTAL.achievement}% ({formatIDR(OVERVIEW_TOTAL.actual)})</span>
                  </div>
                  <div className="w-full bg-[#141226] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${OVERVIEW_TOTAL.achievement}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Status Pace & Run Rate Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#3B3666] text-xs">
                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Kesenjangan Pace Toko:</span>
                  <div className="text-sm font-black text-red-300 mt-0.5">
                    -{(TIME_GONE_DATA.percentageTimeGone - OVERVIEW_TOTAL.achievement).toFixed(1)}% (Tertinggal)
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Omset tertinggal dibanding laju hari</p>
                </div>

                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Daily Run Rate Aktual:</span>
                  <div className="text-sm font-black text-sky-300 mt-0.5">
                    {formatIDR(TIME_GONE_DATA.dailyRunRate)} / hari
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Rata-rata omset harian saat ini</p>
                </div>

                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Required Run Rate (7 Hari Sisa):</span>
                  <div className="text-sm font-black text-[#F5BA42] mt-0.5">
                    {formatIDR(TIME_GONE_DATA.requiredRunRate)} / hari
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Target harian untuk capai 100%</p>
                </div>
              </div>
            </div>

            {/* 2. TABEL LENGKAP TARGET, ACHV, VARIANCE, ESTIMATE 4 KATEGORI (VAS: QOALA, TSEL, XL, INDOSAT) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-[#FFF6E9]">Matriks Kategori Produk (Apple, Android, Accessories & VAS)</h2>
                <span className="text-[11px] text-[#FFF6E9]/60">VAS: Qoala + Telkomsel + XL + Indosat</span>
              </div>

              <div className="bg-[#221F40] border border-[#3B3666] rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-4 px-4">Kategori Produk</th>
                      <th className="py-4 px-4 text-right">Actual Sales</th>
                      <th className="py-4 px-4 text-right">Target</th>
                      <th className="py-4 px-4 text-center">Achievement (%)</th>
                      <th className="py-4 px-4 text-right">Variance (Selisih)</th>
                      <th className="py-4 px-4 text-right">Estimate (Run Rate)</th>
                      <th className="py-4 px-4 text-center">Pace Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {OVERVIEW_LOB_DATA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#2B274F]/50 transition">
                        <td className="py-4 px-4 font-bold text-[#FFF6E9] text-sm">
                          <span className="mr-2">{row.icon}</span>
                          <span>{row.category}</span>
                        </td>
                        <td className={`py-4 px-4 text-right font-extrabold text-sm ${row.color}`}>
                          {formatIDR(row.actual)}
                        </td>
                        <td className="py-4 px-4 text-right text-[#FFF6E9]/80 font-mono">
                          {formatIDR(row.target)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${row.badge}`}>
                            {row.achievement}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-red-300 font-mono font-bold">
                          {formatIDR(row.variance)}
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-300 font-mono font-bold">
                          {formatIDR(row.estimate)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-200 border border-red-500/30">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. RANK SALES PER STAFF DI OVERVIEW STORE */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9]">🏆 Rank Sales per Staff & Komparasi Pace</h3>
                  <p className="text-xs text-[#FFF6E9]/70 mt-0.5">Peringkat resmi seluruh staf toko terhadap target kuota dan Time Gone (77,4%)</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Nama Salesperson</th>
                      <th className="py-3.5 px-4 text-right">Target</th>
                      <th className="py-3.5 px-4 text-right">Actual Penjualan</th>
                      <th className="py-3.5 px-4 text-center">Achv %</th>
                      <th className="py-3.5 px-4 text-center">Status Quota</th>
                      <th className="py-3.5 px-4 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {ALL_STAFF_DETAILS.map((s) => (
                      <tr
                        key={s.rank}
                        className={`hover:bg-[#2B274F]/50 transition ${
                          s.rank === 1 ? "bg-[#F5BA42]/10 font-bold" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              s.rank === 1
                                ? "bg-[#F5BA42] text-[#1A1831]"
                                : s.rank === 2
                                ? "bg-slate-300 text-[#1A1831]"
                                : s.rank === 3
                                ? "bg-amber-700 text-white"
                                : "text-[#FFF6E9]/60"
                            }`}
                          >
                            {s.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#FFF6E9] font-bold flex items-center gap-2">
                            <span>{s.name}</span>
                            {s.rank === 1 && (
                              <span className="text-[9px] bg-[#F5BA42] text-[#1A1831] px-2 py-0.2 rounded-full font-black uppercase">
                                Top 1 👑
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#FFF6E9]/50 font-mono">ID: {s.salesId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#FFF6E9]/70 font-mono">
                          {s.target > 0 ? formatIDR(s.target) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300 text-sm">
                          {formatIDR(s.actual)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black ${s.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                            {s.achievement > 0 ? `${s.achievement.toFixed(1)}%` : "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === "Tercapai"
                                ? "bg-blue-500/15 text-blue-300 border border-blue-400/30"
                                : "bg-red-500/15 text-red-300 border border-red-400/30"
                            }`}
                          >
                            {s.status === "Tercapai" ? "🔵 Tercapai" : "🔻 Belum"}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${s.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                          {s.target > 0 ? formatIDR(s.variance) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. DETAIL PRODUK PER KATEGORI OVERVIEW */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9]">Rincian Detail Produk Terjual per Kategori</h3>
                  <p className="text-xs text-[#FFF6E9]/70 mt-0.5">Komposisi item, revenue kontribusi, dan share produk (termasuk multi-provider VAS)</p>
                </div>

                <div className="flex flex-wrap gap-2 bg-[#141226] p-1.5 rounded-2xl border border-[#3B3666]">
                  <button
                    onClick={() => setOverviewDetailCategory("apple")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      overviewDetailCategory === "apple" ? "bg-sky-500 text-[#1A1831] shadow-md shadow-sky-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🍎 Apple Devices
                  </button>
                  <button
                    onClick={() => setOverviewDetailCategory("android")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      overviewDetailCategory === "android" ? "bg-indigo-500 text-[#FFF6E9] shadow-md shadow-indigo-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🤖 Android Devices
                  </button>
                  <button
                    onClick={() => setOverviewDetailCategory("accessories")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      overviewDetailCategory === "accessories" ? "bg-[#F5BA42] text-[#1A1831] shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🔌 Accessories
                  </button>
                  <button
                    onClick={() => setOverviewDetailCategory("vas")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      overviewDetailCategory === "vas" ? "bg-purple-500 text-[#FFF6E9] shadow-md shadow-purple-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🛡️ VAS (Qoala/Tsel/XL/Indosat)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3 px-4">Nama Produk & Layanan</th>
                      <th className="py-3 px-4">Artikel SAP</th>
                      <th className="py-3 px-4">Brand / Provider</th>
                      <th className="py-3 px-4 text-center">Qty Terjual</th>
                      <th className="py-3 px-4 text-right">Nilai Penjualan (Rp)</th>
                      <th className="py-3 px-4 text-right">Kontribusi Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {OVERVIEW_PRODUCT_BREAKDOWN[overviewDetailCategory].map((p, i) => (
                      <tr key={i} className="hover:bg-[#2B274F]/50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#FFF6E9]">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[#FFF6E9]/60 text-[11px]">{p.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.brand === "QOALA" ? "bg-purple-500/20 border-purple-400/40 text-purple-200" :
                            p.brand === "TELKOMSEL" ? "bg-red-500/20 border-red-400/40 text-red-200" :
                            p.brand === "XL" ? "bg-blue-500/20 border-blue-400/40 text-blue-200" :
                            p.brand === "INDOSAT" ? "bg-amber-500/20 border-amber-400/40 text-amber-200" :
                            "bg-[#141226] border-[#3B3666] text-[#FFF6E9]/80"
                          }`}>
                            {p.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#FFF6E9]">{p.qty} Unit</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300">
                          {formatIDR(p.revenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#F5BA42] font-bold">{p.share}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STAFF PERFORMANCE DETAIL (SEMUA STAF DITAMPILKAN SEKALIGUS)       */}
        {/* ========================================================================= */}
        {activeTab === "staff-performance" && (
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
                    Staf dengan pencapaian di bawah 20% dan defisit variance di atas Rp 1,3 Miliar terhadap kuota waktu berjalan (77,4%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {attentionStaffList.map((st) => (
                  <div
                    key={st.salesId}
                    className="p-4 bg-[#141226] border border-red-500/40 rounded-2xl shadow-md"
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

            {/* 2. DAFTAR SELURUH STAF TOKO (DITAMPILKAN SEMUANYA SATU PER SATU DARI RANK 1 SAMPAI 7) */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#FFF6E9] tracking-wide flex items-center gap-2">
                  <span>👥</span>
                  <span>RINCIAN DETAIL SELURUH STAF SALES ({ALL_STAFF_DETAILS.length} ORANG)</span>
                </h2>
                <span className="text-xs text-[#F5BA42] font-semibold">Semua rincian produk ditampilkan lengkap tanpa dropdown</span>
              </div>

              {ALL_STAFF_DETAILS.map((staff) => (
                <div
                  key={staff.salesId}
                  className="p-6 bg-[#221F40] border-2 border-[#3B3666] rounded-3xl shadow-2xl relative overflow-hidden space-y-6"
                >
                  {/* Header Staf */}
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-[#3B3666]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full inline-flex items-center justify-center font-black text-sm ${
                            staff.rank === 1
                              ? "bg-[#F5BA42] text-[#1A1831] shadow-lg shadow-[#F5BA42]/30"
                              : staff.rank === 2
                              ? "bg-slate-300 text-[#1A1831]"
                              : staff.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-[#141226] text-[#FFF6E9]/80 border border-[#3B3666]"
                          }`}
                        >
                          #{staff.rank}
                        </span>
                        <div>
                          <h3 className="text-xl font-black text-[#FFF6E9] flex items-center gap-2">
                            <span>{staff.name}</span>
                            {staff.rank === 1 && (
                              <span className="text-[10px] bg-[#F5BA42] text-[#1A1831] px-2 py-0.5 rounded-full font-black uppercase">
                                Top 1 👑
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-[#FFF6E9]/60 font-mono">ID Staf: {staff.salesId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Angka Utama Staf */}
                    <div className="flex flex-wrap items-center gap-3 text-right">
                      <div className="bg-[#141226] px-3.5 py-2 rounded-xl border border-[#3B3666]">
                        <span className="text-[10px] text-[#FFF6E9]/60 uppercase block">Actual Omset</span>
                        <span className="text-sm font-black text-emerald-300">{formatIDR(staff.actual)}</span>
                      </div>
                      <div className="bg-[#141226] px-3.5 py-2 rounded-xl border border-[#3B3666]">
                        <span className="text-[10px] text-[#FFF6E9]/60 uppercase block">Target Kuota</span>
                        <span className="text-sm font-bold text-slate-300">{staff.target > 0 ? formatIDR(staff.target) : "-"}</span>
                      </div>
                      <div className="bg-[#141226] px-3.5 py-2 rounded-xl border border-[#3B3666]">
                        <span className="text-[10px] text-[#FFF6E9]/60 uppercase block">Achievement</span>
                        <span className={`text-sm font-black ${staff.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                          {staff.achievement > 0 ? `${staff.achievement.toFixed(1)}%` : "-"}
                        </span>
                      </div>
                      <div className="bg-[#141226] px-3.5 py-2 rounded-xl border border-[#3B3666]">
                        <span className="text-[10px] text-[#FFF6E9]/60 uppercase block">Variance</span>
                        <span className={`text-sm font-bold ${staff.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                          {staff.target > 0 ? formatIDR(staff.variance) : "-"}
                        </span>
                      </div>
                      <div className="bg-[#141226] px-3.5 py-2 rounded-xl border border-[#3B3666]">
                        <span className="text-[10px] text-[#FFF6E9]/60 uppercase block">Estimate</span>
                        <span className="text-sm font-bold text-emerald-400">{formatIDR(staff.estimate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Evaluasi & Rekomendasi Staf Ringkas Bahasa Indonesia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#141226] rounded-2xl border border-[#3B3666]">
                      <h4 className="text-xs font-bold text-[#F5BA42] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span>📌</span>
                        <span>Ringkasan Evaluasi Penjualan:</span>
                      </h4>
                      <p className="text-xs text-[#FFF6E9]/80 leading-relaxed">
                        {staff.ringkasanEvaluasi}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#141226] rounded-2xl border border-[#3B3666]">
                      <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>Rekomendasi Tindakan Leader:</span>
                      </h4>
                      <p className="text-xs text-[#FFF6E9]/80 leading-relaxed">
                        {staff.rekomendasiTindakan}
                      </p>
                    </div>
                  </div>

                  {/* Tabel 1: Sub-Lini Apple Devices */}
                  <div>
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>🍎</span>
                      <span>Apple Devices (iPhone, iPad, MacBook, Apple Watch, AirPods)</span>
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-[#3B3666]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[10px] border-b border-[#3B3666]">
                          <tr>
                            <th className="py-2.5 px-3">Produk Apple</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Actual Sales</th>
                            <th className="py-2.5 px-3 text-right">Target</th>
                            <th className="py-2.5 px-3 text-center">Achv (%)</th>
                            <th className="py-2.5 px-3 text-right">Variance</th>
                            <th className="py-2.5 px-3 text-right">Estimate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3B3666] font-medium">
                          {staff.appleSub.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#2B274F]/40 transition">
                              <td className="py-2.5 px-3 font-bold text-[#FFF6E9] flex items-center gap-1.5">
                                <span>{p.icon}</span>
                                <span>{p.name}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-white">{p.qty}</td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-emerald-300">{formatIDR(p.actual)}</td>
                              <td className="py-2.5 px-3 text-right text-[#FFF6E9]/70 font-mono">{p.target > 0 ? formatIDR(p.target) : "-"}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.actual === 0 ? "text-slate-500" : p.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                                  {p.target > 0 ? `${p.achievement.toFixed(1)}%` : p.actual > 0 ? "100%" : "0%"}
                                </span>
                              </td>
                              <td className={`py-2.5 px-3 text-right font-mono font-bold ${p.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                {p.target > 0 ? formatIDR(p.variance) : "-"}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-300 font-mono">{formatIDR(p.estimate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabel 2: Sub-Lini Android Devices */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>🤖</span>
                      <span>Android Devices (Samsung, Oppo, Motorola, Huawei, Infinix, Xiaomi)</span>
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-[#3B3666]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[10px] border-b border-[#3B3666]">
                          <tr>
                            <th className="py-2.5 px-3">Brand Android</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Actual Sales</th>
                            <th className="py-2.5 px-3 text-right">Target</th>
                            <th className="py-2.5 px-3 text-center">Achv (%)</th>
                            <th className="py-2.5 px-3 text-right">Variance</th>
                            <th className="py-2.5 px-3 text-right">Estimate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3B3666] font-medium">
                          {staff.androidSub.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#2B274F]/40 transition">
                              <td className="py-2.5 px-3 font-bold text-[#FFF6E9] flex items-center gap-1.5">
                                <span>{p.icon}</span>
                                <span>{p.name}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-white">{p.qty}</td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-emerald-300">{formatIDR(p.actual)}</td>
                              <td className="py-2.5 px-3 text-right text-[#FFF6E9]/70 font-mono">{p.target > 0 ? formatIDR(p.target) : "-"}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.actual === 0 ? "text-slate-500" : p.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                                  {p.target > 0 ? `${p.achievement.toFixed(1)}%` : p.actual > 0 ? "100%" : "0%"}
                                </span>
                              </td>
                              <td className={`py-2.5 px-3 text-right font-mono font-bold ${p.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                {p.target > 0 ? formatIDR(p.variance) : "-"}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-300 font-mono">{formatIDR(p.estimate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grid 2 Kolom: Accessories (Besar ke Kecil) & VAS (Qoala, Telkomsel, XL, Indosat) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Accessories */}
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🔌</span>
                        <span>Accessories (Diurutkan dari Nominal Besar ke Kecil)</span>
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-[#3B3666]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[10px] border-b border-[#3B3666]">
                            <tr>
                              <th className="py-2.5 px-3">Item Aksesoris</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual</th>
                              <th className="py-2.5 px-3 text-right">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3B3666] font-medium">
                            {staff.accessoriesSub.map((p, idx) => (
                              <tr key={idx} className="hover:bg-[#2B274F]/40 transition">
                                <td className="py-2 px-3 font-bold text-[#FFF6E9] flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-white">{p.qty}</td>
                                <td className="py-2 px-3 text-right font-extrabold text-amber-300">{formatIDR(p.actual)}</td>
                                <td className={`py-2 px-3 text-right font-mono font-bold ${p.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                  {p.target > 0 ? formatIDR(p.variance) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* VAS */}
                    <div>
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>VAS (Qoala, Telkomsel, XL, Indosat)</span>
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-[#3B3666]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[10px] border-b border-[#3B3666]">
                            <tr>
                              <th className="py-2.5 px-3">Layanan VAS</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual</th>
                              <th className="py-2.5 px-3 text-right">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3B3666] font-medium">
                            {staff.vasSub.map((p, idx) => (
                              <tr key={idx} className="hover:bg-[#2B274F]/40 transition">
                                <td className="py-2 px-3 font-bold text-[#FFF6E9] flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-white">{p.qty}</td>
                                <td className="py-2 px-3 text-right font-extrabold text-purple-300">{formatIDR(p.actual)}</td>
                                <td className={`py-2 px-3 text-right font-mono font-bold ${p.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                  {p.target > 0 ? formatIDR(p.variance) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RINCIAN PENJUALAN LOB                             */}
        {/* ========================================================= */}
        {activeTab === "sales-detail" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#FFF6E9]">Breakdown LOB Sales</h2>
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-2xl">
              <p className="text-xs text-[#FFF6E9]/80 leading-relaxed">
                Total penjualan store terdiri dari <strong>Apple Devices</strong> senilai Rp 2,51 Miliar (80,0%), <strong>Android Devices</strong> Rp 394 Juta (12,5%), <strong>Accessories</strong> Rp 60,1 Juta (1,9%), dan <strong>VAS</strong> (Qoala, Telkomsel, XL, Indosat) sebesar Rp 45,0 Juta (1,4%).
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
