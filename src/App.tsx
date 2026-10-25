"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "weekly-sales" | "staff-performance" | "bnpl" | "sales-detail" | "admin-audit";
type ThemeMode = "dark" | "light";

interface RawTransaction {
  date: string;
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  productName: string;
  qty: number;
  amount: number;
  productType: string;
  brand: string;
  groupCategory: string;
  weekLabel: string;
}

interface BnplItem {
  date: string;
  invoice: string;
  amount: number;
  tender: string;
  product: string;
  qty: number;
  month: string;
}

interface ActivityLog {
  id: string;
  salesId: string;
  salesName: string;
  timestamp: string;
  deviceType: string;
  browser: string;
  location: string;
  coords: string;
}

export default function DigiplusLivePortal() {
  // Theme & Navigasi State
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [overviewDetailCategory, setOverviewDetailCategory] = useState<"apple" | "android" | "accessories" | "vas">("apple");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication & Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [salesIdInput, setSalesIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginErr, setLoginErr] = useState<string>("");
  const [currentSalesId, setCurrentSalesId] = useState<string>("");
  const [currentSalesName, setCurrentSalesName] = useState<string>("");

  // Live Sheets Data State
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Activity Staff Log (Khusus Admin 22008089)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Filter Bar State
  const [filterMonth, setFilterMonth] = useState<string>("2026-10");
  const [filterWeek, setFilterWeek] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("2026-10-24");

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

  // ==============================================================
  // 1. LIVE FETCHING HOOK (GOOGLE VISUALIZATION API)
  // ==============================================================
  const fetchGoogleSheetsData = async () => {
    setIsLoading(true);
    try {
      const dbGvizUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=602901290`;
      const bnplGvizUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=2697970`;

      const [resDb, resBnpl] = await Promise.all([fetch(dbGvizUrl), fetch(bnplGvizUrl)]);
      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();

      // Parse JSONP Tab DATABASE
      const jsonStartDb = textDb.indexOf("{");
      const jsonEndDb = textDb.lastIndexOf("}") + 1;
      const dataDb = JSON.parse(textDb.substring(jsonStartDb, jsonEndDb));
      const rowsDb = dataDb.table.rows;

      const parsedTrx: RawTransaction[] = [];
      rowsDb.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const date = c[0]?.f || c[0]?.v || "";
        const salesId = String(c[1]?.v || "").trim();
        const salesName = String(c[2]?.v || "").trim();
        const invoice = String(c[3]?.v || "").trim();
        const sapArticle = String(c[4]?.v || "").trim();
        const productName = String(c[5]?.v || "").trim();
        const qty = Number(c[7]?.v) || 1;
        const rawAmount = c[8]?.v;
        const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount || 0).replace(/[^0-9]/g, ""));
        const productType = String(c[9]?.v || "").trim();
        const brand = String(c[10]?.v || "").trim().toUpperCase();
        const groupCategory = String(c[11]?.v || "ACCESSORIES").trim().toUpperCase();
        const weekLabel = String(c[14]?.v || "").trim();

        if (invoice && amount > 0 && salesName) {
          parsedTrx.push({
            date,
            salesId,
            salesName,
            invoice,
            sapArticle,
            productName,
            qty,
            amount,
            productType,
            brand,
            groupCategory,
            weekLabel,
          });
        }
      });

      // Parse JSONP Tab BNPL DATABASE
      const jsonStartBnpl = textBnpl.indexOf("{");
      const jsonEndBnpl = textBnpl.lastIndexOf("}") + 1;
      const dataBnpl = JSON.parse(textBnpl.substring(jsonStartBnpl, jsonEndBnpl));
      const rowsBnpl = dataBnpl.table.rows;

      const parsedBnpl: BnplItem[] = [];
      rowsBnpl.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const date = c[0]?.f || c[0]?.v || "";
        const invoice = String(c[1]?.v || "").trim();
        const rawAmount = c[2]?.v;
        const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount || 0).replace(/[^0-9]/g, ""));
        const tender = String(c[3]?.v || "Other").trim();
        const product = String(c[4]?.v || "").trim();
        const qty = Number(c[5]?.v) || 1;
        const month = String(c[6]?.v || "").trim();

        if (invoice && amount > 0) {
          parsedBnpl.push({
            date,
            invoice,
            amount,
            tender,
            product,
            qty,
            month,
          });
        }
      });

      setTransactions(parsedTrx);
      setBnplRecords(parsedBnpl);
      setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));

      // Update Nama Sales Login bila belum terisi
      if (currentSalesId && !currentSalesName) {
        const staff = parsedTrx.find((t) => t.salesId === currentSalesId);
        if (staff) setCurrentSalesName(staff.salesName);
      }
    } catch (err) {
      console.error("Gagal melakukan live fetch dari Google Sheets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetsData();

    // Pulihkan Session & Theme
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digiplus_session_user");
      const savedName = localStorage.getItem("digiplus_session_name");
      const savedTheme = localStorage.getItem("digiplus_theme") as ThemeMode;
      if (savedTheme) setTheme(savedTheme);
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentSalesId(savedUser);
        setCurrentSalesName(savedName || `Sales ${savedUser}`);
      }
      const savedLogs = localStorage.getItem("digiplus_admin_activity");
      if (savedLogs) {
        try {
          setActivityLogs(JSON.parse(savedLogs));
        } catch (e) {}
      }
    }
  }, []);

  // Format IDR Helper
  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  // Helper Device Detection
  const getDeviceType = (): string => {
    if (typeof window === "undefined") return "Komputer / PC";
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
    if (/Mobile|Android|iP(hone|od)/i.test(ua)) return "Handphone / Mobile";
    return "Komputer / PC";
  };

  // Login Handler & Activity Audit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    const cleanId = salesIdInput.trim();
    if (!cleanId) {
      setLoginErr("Masukkan Sales ID Anda!");
      return;
    }

    let detectedName = `Sales ${cleanId}`;
    if (cleanId === ADMIN_ID) {
      detectedName = "Store Leader Admin";
    } else {
      const found = transactions.find((t) => t.salesId === cleanId);
      if (found) detectedName = found.salesName;
    }

    localStorage.setItem("digiplus_session_user", cleanId);
    localStorage.setItem("digiplus_session_name", detectedName);
    setCurrentSalesId(cleanId);
    setCurrentSalesName(detectedName);
    setIsLoggedIn(true);
    setLoginErr("");

    // Catat Activity Log
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      salesId: cleanId,
      salesName: detectedName,
      timestamp: new Date().toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
      deviceType: getDeviceType(),
      browser: navigator.userAgent.includes("Chrome") ? "Google Chrome" : "Browser",
      location: "Grand Indonesia Store",
      coords: "-6.1953, 106.8219",
    };

    setActivityLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 49)];
      localStorage.setItem("digiplus_admin_activity", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_session_user");
    localStorage.removeItem("digiplus_session_name");
    setIsLoggedIn(false);
    setCurrentSalesId("");
    setCurrentSalesName("");
  };

  // ==============================================================
  // 2. KALKULASI OVERVIEW STORE DINAMIS DARI TRANSAKSI
  // ==============================================================
  const storeOverviewCalculated = useMemo(() => {
    let list = transactions;

    if (filterWeek !== "ALL") {
      list = list.filter((t) => t.weekLabel.toLowerCase().includes(filterWeek.toLowerCase()));
    }

    const actualTotal = list.reduce((acc, curr) => acc + curr.amount, 0);
    const targetTotal = 8728667173;
    const achievementTotal = targetTotal > 0 ? Number(((actualTotal / targetTotal) * 100).toFixed(1)) : 0;
    const varianceTotal = actualTotal - targetTotal;
    const estimateTotal = Math.round(actualTotal * 1.29);

    // Filter Khusus LOB
    const appleList = list.filter((t) => t.brand === "APPLE" || t.productName.toUpperCase().includes("IPHONE"));
    const appleActual = appleList.reduce((acc, curr) => acc + curr.amount, 0);
    const appleTarget = 6932151006;

    const androidList = list.filter((t) => 
      ["SAMSUNG", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX", "XIAOMI"].includes(t.brand) || 
      t.groupCategory === "DEVICES" && t.brand !== "APPLE"
    );
    const androidActual = androidList.reduce((acc, curr) => acc + curr.amount, 0);
    const androidTarget = 943691666;

    const accList = list.filter((t) => t.groupCategory === "ACCESSORIES" || t.groupCategory === "ACC");
    const accActual = accList.reduce((acc, curr) => acc + curr.amount, 0);
    const accTarget = 460550560;

    // VAS (Qoala, Telkomsel, XL, Indosat)
    const vasList = list.filter((t) => 
      t.groupCategory === "VAS" || 
      ["QOALA", "TELKOMSEL", "XL", "INDOSAT"].includes(t.brand) ||
      t.productName.toUpperCase().includes("QOALA") ||
      t.productName.toUpperCase().includes("PROTEKSI") ||
      t.productName.toUpperCase().includes("TELKOMSEL")
    );
    const vasActual = vasList.reduce((acc, curr) => acc + curr.amount, 0);
    const vasTarget = 392273940;

    return {
      actualTotal,
      targetTotal,
      achievementTotal,
      varianceTotal,
      estimateTotal,
      lobs: [
        {
          name: "Apple Devices",
          icon: "🍎",
          actual: appleActual,
          target: appleTarget,
          achv: Number(((appleActual / appleTarget) * 100).toFixed(1)),
          variance: appleActual - appleTarget,
          estimate: Math.round(appleActual * 1.29),
          color: "text-sky-400",
        },
        {
          name: "Android Devices",
          icon: "🤖",
          actual: androidActual,
          target: androidTarget,
          achv: Number(((androidActual / androidTarget) * 100).toFixed(1)),
          variance: androidActual - androidTarget,
          estimate: Math.round(androidActual * 1.29),
          color: "text-indigo-400",
        },
        {
          name: "Accessories",
          icon: "🔌",
          actual: accActual,
          target: accTarget,
          achv: Number(((accActual / accTarget) * 100).toFixed(1)),
          variance: accActual - accTarget,
          estimate: Math.round(accActual * 1.29),
          color: "text-amber-400",
        },
        {
          name: "VAS (Qoala, Telkomsel, XL, Indosat)",
          icon: "🛡️",
          actual: vasActual,
          target: vasTarget,
          achv: Number(((vasActual / vasTarget) * 100).toFixed(1)),
          variance: vasActual - vasTarget,
          estimate: Math.round(vasActual * 1.29),
          color: "text-purple-400",
        },
      ],
      appleList,
      androidList,
      accList,
      vasList,
    };
  }, [transactions, filterWeek]);

  // ==============================================================
  // 3. KALKULASI WEEKLY SALES (BERDASARKAN SHEET DATABASE KOLOM O)
  // ==============================================================
  const weeklyCalculated = useMemo(() => {
    const weekMap: Record<string, { total: number; apple: number; android: number; acc: number; vas: number; qty: number; invoices: Set<string> }> = {};

    transactions.forEach((t) => {
      const wLabel = t.weekLabel || "Lainnya";
      if (!weekMap[wLabel]) {
        weekMap[wLabel] = { total: 0, apple: 0, android: 0, acc: 0, vas: 0, qty: 0, invoices: new Set() };
      }
      weekMap[wLabel].total += t.amount;
      weekMap[wLabel].qty += t.qty;
      if (t.invoice) weekMap[wLabel].invoices.add(t.invoice);

      if (t.brand === "APPLE" || t.productName.toUpperCase().includes("IPHONE")) weekMap[wLabel].apple += t.amount;
      else if (["SAMSUNG", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX", "XIAOMI"].includes(t.brand)) weekMap[wLabel].android += t.amount;
      else if (t.groupCategory === "ACCESSORIES") weekMap[wLabel].acc += t.amount;
      else if (t.groupCategory === "VAS" || t.brand === "QOALA") weekMap[wLabel].vas += t.amount;
    });

    const entries = Object.entries(weekMap).map(([label, val]) => ({
      weekLabel: label,
      totalSales: val.total,
      appleSales: val.apple,
      androidSales: val.android,
      accessoriesSales: val.acc,
      vasSales: val.vas,
      qty: val.qty,
      invoicesCount: val.invoices.size,
    }));

    return entries;
  }, [transactions]);

  // ==============================================================
  // 4. KALKULASI STAFF PERFORMANCE LENGKAP & DINAMIS
  // ==============================================================
  const staffPerformanceCalculated = useMemo(() => {
    const staffMap: Record<string, { 
      salesId: string; 
      salesName: string; 
      total: number; 
      qty: number; 
      invoices: Set<string>;
      appleMap: Record<string, { actual: number; qty: number; icon: string }>;
      androidMap: Record<string, { actual: number; qty: number; icon: string }>;
      accMap: Record<string, { actual: number; qty: number; icon: string }>;
      vasMap: Record<string, { actual: number; qty: number; icon: string }>;
      weeksMap: Record<string, number>;
    }> = {};

    transactions.forEach((t) => {
      const id = t.salesId || "UNKNOWN";
      if (!staffMap[id]) {
        staffMap[id] = {
          salesId: id,
          salesName: t.salesName || `Sales ${id}`,
          total: 0,
          qty: 0,
          invoices: new Set(),
          appleMap: {
            "iPhone": { actual: 0, qty: 0, icon: "📱" },
            "iPad": { actual: 0, qty: 0, icon: "📟" },
            "MacBook": { actual: 0, qty: 0, icon: "💻" },
            "Apple Watch": { actual: 0, qty: 0, icon: "⌚" },
            "AirPods": { actual: 0, qty: 0, icon: "🎧" },
          },
          androidMap: {
            "Samsung Devices": { actual: 0, qty: 0, icon: "📱" },
            "Oppo Devices": { actual: 0, qty: 0, icon: "🟢" },
            "Motorola Devices": { actual: 0, qty: 0, icon: "Ⓜ️" },
            "Huawei Devices": { actual: 0, qty: 0, icon: "🔴" },
            "Infinix Devices": { actual: 0, qty: 0, icon: "⚡" },
            "Xiaomi Devices": { actual: 0, qty: 0, icon: "🟠" },
          },
          accMap: {},
          vasMap: {
            "Qoala Proteksi Gadget": { actual: 0, qty: 0, icon: "🛡️" },
            "Telkomsel Pascabayar/Data": { actual: 0, qty: 0, icon: "🔴" },
            "XL Prioritas Bundling": { actual: 0, qty: 0, icon: "🔵" },
            "Indosat IM3 Postpaid": { actual: 0, qty: 0, icon: "🟡" },
          },
          weeksMap: {},
        };
      }

      staffMap[id].total += t.amount;
      staffMap[id].qty += t.qty;
      if (t.invoice) staffMap[id].invoices.add(t.invoice);

      // Rekam per Week
      const wLabel = t.weekLabel || "W_Other";
      staffMap[id].weeksMap[wLabel] = (staffMap[id].weeksMap[wLabel] || 0) + t.amount;

      // Sub-Lini Apple
      const pName = t.productName.toUpperCase();
      if (t.brand === "APPLE" || pName.includes("IPHONE")) {
        if (pName.includes("IPHONE")) { staffMap[id].appleMap["iPhone"].actual += t.amount; staffMap[id].appleMap["iPhone"].qty += t.qty; }
        else if (pName.includes("IPAD")) { staffMap[id].appleMap["iPad"].actual += t.amount; staffMap[id].appleMap["iPad"].qty += t.qty; }
        else if (pName.includes("MAC") || pName.includes("BOOK")) { staffMap[id].appleMap["MacBook"].actual += t.amount; staffMap[id].appleMap["MacBook"].qty += t.qty; }
        else if (pName.includes("WATCH")) { staffMap[id].appleMap["Apple Watch"].actual += t.amount; staffMap[id].appleMap["Apple Watch"].qty += t.qty; }
        else if (pName.includes("AIRPOD")) { staffMap[id].appleMap["AirPods"].actual += t.amount; staffMap[id].appleMap["AirPods"].qty += t.qty; }
      }

      // Sub-Lini Android
      if (t.brand === "SAMSUNG" || pName.includes("GALAXY")) { staffMap[id].androidMap["Samsung Devices"].actual += t.amount; staffMap[id].androidMap["Samsung Devices"].qty += t.qty; }
      else if (t.brand === "OPPO") { staffMap[id].androidMap["Oppo Devices"].actual += t.amount; staffMap[id].androidMap["Oppo Devices"].qty += t.qty; }
      else if (t.brand === "MOTOROLA") { staffMap[id].androidMap["Motorola Devices"].actual += t.amount; staffMap[id].androidMap["Motorola Devices"].qty += t.qty; }
      else if (t.brand === "HUAWEI") { staffMap[id].androidMap["Huawei Devices"].actual += t.amount; staffMap[id].androidMap["Huawei Devices"].qty += t.qty; }
      else if (t.brand === "INFINIX") { staffMap[id].androidMap["Infinix Devices"].actual += t.amount; staffMap[id].androidMap["Infinix Devices"].qty += t.qty; }
      else if (t.brand === "XIAOMI") { staffMap[id].androidMap["Xiaomi Devices"].actual += t.amount; staffMap[id].androidMap["Xiaomi Devices"].qty += t.qty; }

      // Sub-Lini Accessories (Grouping by Product Name)
      if (t.groupCategory === "ACCESSORIES" || t.productType.toUpperCase().includes("CHARGER") || t.productType.toUpperCase().includes("CASE")) {
        const itemKey = t.productName.trim() || "Aksesoris Lain";
        if (!staffMap[id].accMap[itemKey]) {
          staffMap[id].accMap[itemKey] = { actual: 0, qty: 0, icon: "🔌" };
        }
        staffMap[id].accMap[itemKey].actual += t.amount;
        staffMap[id].accMap[itemKey].qty += t.qty;
      }

      // Sub-Lini VAS (Qoala, Telkomsel, XL, Indosat)
      if (t.brand === "QOALA" || pName.includes("QOALA") || pName.includes("PROTEKSI")) {
        staffMap[id].vasMap["Qoala Proteksi Gadget"].actual += t.amount;
        staffMap[id].vasMap["Qoala Proteksi Gadget"].qty += t.qty;
      } else if (t.brand === "TELKOMSEL" || pName.includes("TELKOMSEL") || pName.includes("HALO")) {
        staffMap[id].vasMap["Telkomsel Pascabayar/Data"].actual += t.amount;
        staffMap[id].vasMap["Telkomsel Pascabayar/Data"].qty += t.qty;
      } else if (t.brand === "XL") {
        staffMap[id].vasMap["XL Prioritas Bundling"].actual += t.amount;
        staffMap[id].vasMap["XL Prioritas Bundling"].qty += t.qty;
      } else if (t.brand === "INDOSAT") {
        staffMap[id].vasMap["Indosat IM3 Postpaid"].actual += t.amount;
        staffMap[id].vasMap["Indosat IM3 Postpaid"].qty += t.qty;
      }
    });

    // Urutkan staf berdasarkan Total Omset
    const sorted = Object.values(staffMap).sort((a, b) => b.total - a.total);

    return sorted.map((s, idx) => {
      const invCount = s.invoices.size;
      const upt = invCount > 0 ? Number((s.qty / invCount).toFixed(2)) : 0;
      const targetQuota = 1658446763; // Standar target toko per head
      const achv = Number(((s.total / targetQuota) * 100).toFixed(1));
      const variance = s.total - targetQuota;

      // Inisial Nama
      const names = s.salesName.split(" ");
      const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].slice(0, 2).toUpperCase();

      // Urutkan Accessories Dari Amount Besar ke Kecil
      const sortedAcc = Object.entries(s.accMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.actual - a.actual);

      const totalAccActual = sortedAcc.reduce((acc, curr) => acc + curr.actual, 0);
      const totalVasActual = Object.values(s.vasMap).reduce((acc, curr) => acc + curr.actual, 0);

      // Evaluasi Ringkas Bahasa Indonesia
      let ringkasan = `Pencapaian omset mencapai ${achv}% terhadap kuota.`;
      let rekomendasi = "Tingkatkan closing rate device dan lakukan penawaran bundling aksesoris pada setiap struk.";
      let status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan" = "Dalam Pantauan";

      if (achv >= 100) {
        status = "Tercapai";
        ringkasan = `Performa sangat prima! Target bulanan terlampaui ${achv}% dengan total transaksi ${invCount} struk.`;
        rekomendasi = "Pertahankan momentum dan dorong penjualan proteksi Qoala untuk memaksimalkan margin insentif.";
      } else if (achv < 20) {
        status = "Perlu Perhatian Khusus";
        ringkasan = `Pencapaian sangat tertinggal (${achv}%), defisit omset mencapai ${formatIDR(variance)}.`;
        rekomendasi = "Perlu evaluasi harian terhadap prospek walk-in dan tawarkan program cicilan/BNPL 0%.";
      }

      return {
        rank: idx + 1,
        salesId: s.salesId,
        name: s.salesName,
        initials,
        total: s.total,
        qty: s.qty,
        invoicesCount: invCount,
        upt,
        target: targetQuota,
        achievement: achv,
        variance,
        totalAccActual,
        totalVasActual,
        appleSub: Object.entries(s.appleMap).map(([name, d]) => ({ name, ...d })),
        androidSub: Object.entries(s.androidMap).map(([name, d]) => ({ name, ...d })),
        accessoriesSub: sortedAcc,
        vasSub: Object.entries(s.vasMap).map(([name, d]) => ({ name, ...d })),
        status,
        ringkasan,
        rekomendasi,
      };
    });
  }, [transactions]);

  // ==============================================================
  // 5. KALKULASI BNPL DINAMIS (DARI GID 2697970)
  // ==============================================================
  const bnplCalculated = useMemo(() => {
    const totalBnplAmount = bnplRecords.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBnplQty = bnplRecords.reduce((acc, curr) => acc + curr.qty, 0);
    const storeTotalSales = storeOverviewCalculated.actualTotal;

    const tenderMap: Record<string, { amount: number; qty: number }> = {};
    bnplRecords.forEach((t) => {
      const key = t.tender || "Other";
      if (!tenderMap[key]) tenderMap[key] = { amount: 0, qty: 0 };
      tenderMap[key].amount += t.amount;
      tenderMap[key].qty += t.qty;
    });

    const tenders = Object.entries(tenderMap).map(([tender, val]) => {
      const shareToStore = storeTotalSales > 0 ? Number(((val.amount / storeTotalSales) * 100).toFixed(1)) : 0;
      const estimate = Math.round((val.amount / 24) * 31);
      return {
        tender,
        amount: val.amount,
        qty: val.qty,
        shareToStore,
        estimate,
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      totalBnplAmount,
      totalBnplQty,
      tenders,
      records: bnplRecords,
    };
  }, [bnplRecords, storeOverviewCalculated.actualTotal]);

  // Styling Dinamis
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#1A1831]" : "bg-[#F9F8F3]";
  const textMain = isDark ? "text-[#FFF6E9]" : "text-[#1E293B]";
  const textMuted = isDark ? "text-[#FFF6E9]/70" : "text-slate-600";
  const cardBg = isDark ? "bg-[#221F40] border-[#3B3666]" : "bg-white border-[#E5E2D9]";
  const innerBg = isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]";
  const accentText = isDark ? "text-[#F5BA42]" : "text-[#054ff0]";
  const activeTabBtn = isDark ? "bg-[#F5BA42] text-[#1A1831] font-black" : "bg-[#054ff0] text-white font-black";

  // HALAMAN LOGIN
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 ${textMain} font-sans`}>
        <div className={`max-w-md w-full ${cardBg} border-2 rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <div className="text-center mb-6">
            <div className={`w-14 h-14 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg mb-3`}>
              D+
            </div>
            <h1 className="text-xl font-bold">DIGIPLUS GRAND INDONESIA</h1>
            <p className={`text-xs ${accentText} mt-1 font-semibold`}>PORTAL LOGIN RESMI OPERASIONAL</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider">Sales ID / NIK Karyawan</label>
              <input
                type="text"
                required
                placeholder="Contoh: 24004971 atau 22008089"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm focus:outline-none`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} font-black rounded-xl text-xs uppercase tracking-wider transition mt-2`}
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${bgMain} ${textMain} font-sans relative`}>
      {/* MOBILE HAMBURGER TOGGLE */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`w-14 h-14 rounded-full ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} font-black text-2xl flex items-center justify-center shadow-2xl transition`}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
      )}

      {/* SIDEBAR SEBELAH KIRI */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-72 ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]"} border-r flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-inherit">
            <div className={`w-10 h-10 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} rounded-xl flex items-center justify-center font-black text-lg`}>
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider">DIGIPLUS</h2>
              <p className={`text-[10px] ${accentText} font-semibold`}>STORE OPERATIONS QF01</p>
            </div>
          </div>

          {/* User Tag */}
          <div className={`mt-3 p-3 rounded-2xl ${cardBg} border flex items-center justify-between`}>
            <div>
              <span className="text-[9px] uppercase tracking-wider opacity-60 block font-bold">User Terotentikasi</span>
              <span className="text-xs font-bold truncate block">{currentSalesName}</span>
              <span className={`text-[10px] font-mono ${accentText}`}>ID: {currentSalesId}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-5 space-y-1.5">
            <button
              onClick={() => { setActiveTab("store-overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📊</span>
              <span>Overview Store</span>
            </button>

            <button
              onClick={() => { setActiveTab("weekly-sales"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "weekly-sales" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📈</span>
              <span>Weekly sales (WoW)</span>
            </button>

            <button
              onClick={() => { setActiveTab("staff-performance"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "staff-performance" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>🏆</span>
              <span>Staff Performance Detail</span>
            </button>

            <button
              onClick={() => { setActiveTab("bnpl"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "bnpl" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>💳</span>
              <span>BNPL Transactions</span>
            </button>

            {currentSalesId === ADMIN_ID && (
              <button
                onClick={() => { setActiveTab("admin-audit"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition border border-emerald-500/40 ${
                  activeTab === "admin-audit" ? "bg-emerald-500 text-white font-black" : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span>🛡️</span>
                <span>Activity Staff (Admin)</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab("sales-detail"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📋</span>
              <span>Rincian Transaksi Log</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-inherit space-y-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`w-full py-2 px-3 ${innerBg} border rounded-xl text-xs font-bold transition flex items-center justify-center gap-2`}
          >
            <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* HEADER: SAPAAN PERSONAL & LIVE SYNC BUTTON */}
        <header className="mb-6 border-b border-inherit pb-5">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <div className={`text-xl sm:text-2xl font-black ${accentText} flex items-center gap-2`}>
                <span>Halo, {currentSalesName} 👋</span>
              </div>
              <p className={`text-xs ${textMuted} mt-1`}>
                Live Feed Google Sheets: <code>DATABASE</code> (gid: 602901290) & <code>BNPL DATABASE</code> (gid: 2697970)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchGoogleSheetsData}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${innerBg}`}
              >
                <span>🔄</span>
                <span>{isLoading ? "Mengambil Data..." : "Sinkronkan Sekarang"}</span>
              </button>

              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                Actual MTD: {formatIDR(storeOverviewCalculated.actualTotal)}
              </span>
            </div>
          </div>

          {/* FILTER BARIS DINAMIS */}
          <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs`}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="opacity-70 font-semibold">📅 Bulan:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                >
                  <option value="2026-10">Oktober 2026</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="opacity-70 font-semibold">📊 Week:</span>
                <select
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                >
                  <option value="ALL">Semua Minggu</option>
                  <option value="Week 1">Week 1 (03/10/26)</option>
                  <option value="W2">W2 (10OKT 2026)</option>
                  <option value="W3">W3 (17OKT 2026)</option>
                  <option value="W4">W4 (24OKT 2026)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="opacity-70 font-semibold">🗓️ Cut-off:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                />
              </div>
            </div>

            <div className={`text-[11px] ${accentText} font-semibold flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terakhir Sync: {lastSyncTime ? `${lastSyncTime} WIB` : "Menghubungkan..."} • {transactions.length} Baris Transaksi Terbaca</span>
            </div>
          </div>
        </header>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="py-16 text-center text-sm font-semibold opacity-60 animate-pulse">
            ⏳ Mengambil data langsung dari Google Sheets...
          </div>
        )}

        {!isLoading && (
          <>
            {/* ========================================================= */}
            {/* TAB 1: OVERVIEW STORE                                     */}
            {/* ========================================================= */}
            {activeTab === "store-overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* TIME GONE ANALYTICS CARD */}
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${innerBg} border flex items-center justify-center text-2xl font-bold ${accentText}`}>
                        ⏳
                      </div>
                      <div>
                        <h2 className="text-base font-black tracking-wide">TIME GONE ANALYTICS (OKTOBER 2026)</h2>
                        <p className={`text-xs ${textMuted}`}>
                          Hari Berjalan: <strong className={textMain}>{TIME_GONE_DATA.daysPassed} hari</strong> dari {TIME_GONE_DATA.totalDays} hari ({TIME_GONE_DATA.daysLeft} hari tersisa)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Time Elapsed</span>
                        <span className={`text-2xl font-black ${accentText}`}>{TIME_GONE_DATA.percentageTimeGone}%</span>
                      </div>
                      <div className="h-8 w-px bg-inherit mx-1 opacity-20"></div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Achv Pace</span>
                        <span className="text-2xl font-black text-emerald-500">{storeOverviewCalculated.achievementTotal}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className={textMuted}>Waktu Berjalan (Time Gone):</span>
                        <span className={`font-bold ${accentText}`}>{TIME_GONE_DATA.percentageTimeGone}%</span>
                      </div>
                      <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                        <div className={`${isDark ? "bg-[#F5BA42]" : "bg-[#054ff0]"} h-full rounded-full`} style={{ width: `${TIME_GONE_DATA.percentageTimeGone}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className={textMuted}>Pencapaian Omset Aktual:</span>
                        <span className="font-bold text-emerald-500">{storeOverviewCalculated.achievementTotal}% ({formatIDR(storeOverviewCalculated.actualTotal)})</span>
                      </div>
                      <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(storeOverviewCalculated.achievementTotal, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-inherit text-xs">
                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Kesenjangan Pace Toko:</span>
                      <div className="text-sm font-black text-red-500 mt-0.5">-{(TIME_GONE_DATA.percentageTimeGone - storeOverviewCalculated.achievementTotal).toFixed(1)}% (Tertinggal)</div>
                    </div>

                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Daily Run Rate Aktual:</span>
                      <div className="text-sm font-black text-sky-500 mt-0.5">{formatIDR(TIME_GONE_DATA.dailyRunRate)} / hari</div>
                    </div>

                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Required Daily Run Rate:</span>
                      <div className={`text-sm font-black ${accentText} mt-0.5`}>{formatIDR(TIME_GONE_DATA.requiredRunRate)} / hari</div>
                    </div>
                  </div>
                </div>

                {/* MATRIKS LOB TARGET, ACTUAL, %, VARIANCE, ESTIMATE */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold">Matriks Kategori Produk (Apple, Android, Accessories & VAS)</h2>
                    <span className={`text-[11px] ${textMuted} hidden sm:inline`}>VAS: Qoala + Telkomsel + XL + Indosat</span>
                  </div>

                  <div className={`${cardBg} border rounded-2xl overflow-x-auto shadow-xl`}>
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-4 px-4">Kategori Produk</th>
                          <th className="py-4 px-4 text-right">Actual Sales</th>
                          <th className="py-4 px-4 text-right">Target</th>
                          <th className="py-4 px-4 text-center">Achievement (%)</th>
                          <th className="py-4 px-4 text-right">Variance</th>
                          <th className="py-4 px-4 text-right">Estimate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {storeOverviewCalculated.lobs.map((row, idx) => (
                          <tr key={idx} className="hover:opacity-90 transition">
                            <td className="py-4 px-4 font-bold text-sm">
                              <span className="mr-2">{row.icon}</span>
                              <span>{row.name}</span>
                            </td>
                            <td className={`py-4 px-4 text-right font-extrabold text-sm ${row.color}`}>{formatIDR(row.actual)}</td>
                            <td className="py-4 px-4 text-right font-mono opacity-80">{formatIDR(row.target)}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${innerBg}`}>
                                {row.achv}%
                              </span>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-bold ${row.variance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {formatIDR(row.variance)}
                            </td>
                            <td className="py-4 px-4 text-right text-emerald-500 font-mono font-bold">{formatIDR(row.estimate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RANK SALES PER STAFF & UPT */}
                <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl shadow-xl`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold">🏆 Rank Sales per Staff & UPT Toko</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4 text-center">Rank</th>
                          <th className="py-3.5 px-4">Nama Salesperson</th>
                          <th className="py-3.5 px-4 text-right">Actual Omset</th>
                          <th className="py-3.5 px-4 text-center">Unit</th>
                          <th className="py-3.5 px-4 text-center">Struk</th>
                          <th className="py-3.5 px-4 text-center">UPT</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {staffPerformanceCalculated.map((s) => (
                          <tr key={s.salesId} className="hover:opacity-90 transition">
                            <td className="py-3.5 px-4 text-center">
                              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                                s.rank === 1 ? (isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white") : "opacity-60"
                              }`}>
                                {s.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold">{s.name}</div>
                              <div className="text-[10px] opacity-60 font-mono">ID: {s.salesId}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-500 text-sm">{formatIDR(s.total)}</td>
                            <td className="py-3.5 px-4 text-center font-bold">{s.qty}</td>
                            <td className="py-3.5 px-4 text-center opacity-70">{s.invoicesCount}</td>
                            <td className="py-3.5 px-4 text-center font-black text-sky-500">{s.upt}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === "Tercapai" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RINCIAN PRODUK DETAIL PER KATEGORI (BERBASIS TABS) */}
                <div className={`p-6 ${cardBg} border rounded-3xl shadow-xl`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                    <div>
                      <h3 className="text-base font-bold">Rincian Detail Produk Terjual per Kategori</h3>
                      <p className={`text-xs ${textMuted} mt-0.5`}>Pilih kategori untuk melihat produk yang terjual dari live feed sheet</p>
                    </div>

                    <div className={`flex flex-wrap gap-2 ${innerBg} p-1.5 rounded-2xl border`}>
                      {(["apple", "android", "accessories", "vas"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setOverviewDetailCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            overviewDetailCategory === cat ? activeTabBtn : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {cat === "apple" && "🍎 Apple"}
                          {cat === "android" && "🤖 Android"}
                          {cat === "accessories" && "🔌 Accessories"}
                          {cat === "vas" && "🛡️ VAS (Qoala/Tsel/XL/Indosat)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3 px-4">Nama Produk</th>
                          <th className="py-3 px-4">SKU / SAP Article</th>
                          <th className="py-3 px-4">Brand</th>
                          <th className="py-3 px-4 text-center">Qty Terjual</th>
                          <th className="py-3 px-4 text-right">Nilai Penjualan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {(overviewDetailCategory === "apple"
                          ? storeOverviewCalculated.appleList
                          : overviewDetailCategory === "android"
                          ? storeOverviewCalculated.androidList
                          : overviewDetailCategory === "accessories"
                          ? storeOverviewCalculated.accList
                          : storeOverviewCalculated.vasList
                        ).slice(0, 15).map((p, i) => (
                          <tr key={i} className="hover:opacity-90 transition">
                            <td className="py-3.5 px-4 font-bold">{p.productName}</td>
                            <td className="py-3.5 px-4 font-mono opacity-60 text-[11px]">{p.sapArticle}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                {p.brand}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold">{p.qty}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-500">
                              {formatIDR(p.amount)}
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
            {/* TAB 2: WEEKLY SALES (WoW DARI KOLOM O)                    */}
            {/* ========================================================= */}
            {activeTab === "weekly-sales" && (
              <div className="space-y-6 sm:space-y-8">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                  <div>
                    <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                      <span>📈</span>
                      <span>WEEKLY SALES & WEEK-OVER-WEEK (WOW) DARI DATABASE KOLOM O</span>
                    </h2>
                    <p className={`text-xs ${textMuted} mt-1`}>
                      Data dikelompokkan secara otomatis berdasarkan entri label minggu di Kolom O sheet <code>DATABASE</code>.
                    </p>
                  </div>

                  {/* Grid Minggu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weeklyCalculated.map((w, idx) => (
                      <div key={idx} className={`p-4 ${innerBg} border rounded-2xl`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${accentText}`}>{w.weekLabel}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700/30">
                            {w.invoicesCount} Struk
                          </span>
                        </div>
                        <div className="text-lg font-black mt-1">{formatIDR(w.totalSales)}</div>
                        <div className={`flex justify-between text-[11px] ${textMuted} mt-2`}>
                          <span>Unit: {w.qty}</span>
                          <span>Apple: {formatIDR(w.appleSales)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tabel Breakdown Mingguan Kolom O */}
                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-4 px-4">Label Kolom O</th>
                          <th className="py-4 px-4 text-center">Unit</th>
                          <th className="py-4 px-4 text-center">Struk</th>
                          <th className="py-4 px-4 text-right text-sky-400">🍎 Apple Devices</th>
                          <th className="py-4 px-4 text-right text-indigo-400">🤖 Android Devices</th>
                          <th className="py-4 px-4 text-right text-amber-400">🔌 Accessories</th>
                          <th className="py-4 px-4 text-right text-purple-400">🛡️ VAS</th>
                          <th className="py-4 px-4 text-right">Total Penjualan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {weeklyCalculated.map((w, i) => (
                          <tr key={i} className="hover:opacity-90 transition">
                            <td className="py-4 px-4 font-bold text-white">{w.weekLabel}</td>
                            <td className="py-4 px-4 text-center font-bold">{w.qty}</td>
                            <td className="py-4 px-4 text-center opacity-70">{w.invoicesCount}</td>
                            <td className="py-4 px-4 text-right font-mono text-sky-400">{formatIDR(w.appleSales)}</td>
                            <td className="py-4 px-4 text-right font-mono text-indigo-400">{formatIDR(w.androidSales)}</td>
                            <td className="py-4 px-4 text-right font-mono text-amber-400">{formatIDR(w.accessoriesSales)}</td>
                            <td className="py-4 px-4 text-right font-mono text-purple-400">{formatIDR(w.vasSales)}</td>
                            <td className="py-4 px-4 text-right font-extrabold text-emerald-400 text-sm">{formatIDR(w.totalSales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: STAFF PERFORMANCE DETAIL (SEMUA STAF DITAMPILKAN SEKALIGUS)       */}
            {/* ========================================================================= */}
            {activeTab === "staff-performance" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                    <span>👥</span>
                    <span>RINCIAN DETAIL SELURUH STAF SALES ({staffPerformanceCalculated.length} ORANG)</span>
                  </h2>
                </div>

                {staffPerformanceCalculated.map((staff) => (
                  <div key={staff.salesId} className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden space-y-5`}>
                    {/* Header Staf */}
                    <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-inherit">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl tracking-wider shadow-lg ${staff.rank === 1 ? "bg-amber-500/20 border-2 border-[#F5BA42] text-[#F5BA42]" : `${innerBg} border`}`}>
                            {staff.initials}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                            staff.rank === 1 ? (isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white") : `${innerBg} border`
                          }`}>
                            #{staff.rank}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                            <span>{staff.name}</span>
                            {staff.rank === 1 && (
                              <span className={`text-[10px] ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} px-2 py-0.5 rounded-full font-black uppercase`}>
                                Top 1 👑
                              </span>
                            )}
                          </h3>
                          <p className={`text-xs ${textMuted} font-mono`}>ID Staf: {staff.salesId} • {staff.invoicesCount} Struk Terbit</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-right">
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">Actual Omset</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-400">{formatIDR(staff.total)}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">Achievement</span>
                          <span className={`text-xs sm:text-sm font-black ${staff.achievement >= 100 ? "text-emerald-400" : accentText}`}>
                            {staff.achievement}%
                          </span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">UPT Staf</span>
                          <span className="text-xs sm:text-sm font-black text-sky-400">{staff.upt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluasi Ringkas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border ${innerBg}`}>
                        <span className={`font-bold ${accentText} block mb-1`}>📌 Evaluasi Kinerja:</span>
                        <p className="opacity-80 leading-relaxed">{staff.ringkasan}</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${innerBg}`}>
                        <span className="font-bold text-emerald-400 block mb-1">⚡ Rekomendasi Tindakan:</span>
                        <p className="opacity-80 leading-relaxed">{staff.rekomendasi}</p>
                      </div>
                    </div>

                    {/* Target & Pencapaian Acc / VAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <span>🔌</span>
                            <span>Accessories Pencapaian</span>
                          </span>
                          <span className="text-xs font-black text-amber-400">{formatIDR(staff.totalAccActual)}</span>
                        </div>
                        <p className="text-[11px] opacity-60">Kontribusi produk aksesoris resmi.</p>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <span>🛡️</span>
                            <span>VAS Pencapaian (Qoala/Tsel/XL/Indosat)</span>
                          </span>
                          <span className="text-xs font-black text-purple-400">{formatIDR(staff.totalVasActual)}</span>
                        </div>
                        <p className="text-[11px] opacity-60">Kontribusi proteksi garansi dan data bundling.</p>
                      </div>
                    </div>

                    {/* Sub-Lini Apple Devices */}
                    <div>
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🍎</span>
                        <span>Apple Devices (iPhone, iPad, MacBook, Apple Watch, AirPods)</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Produk</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual Omset</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.appleSub.map((p, idx) => (
                              <tr key={idx} className="hover:opacity-90 transition">
                                <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(p.actual)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sub-Lini Android Devices */}
                    <div>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🤖</span>
                        <span>Android Devices (Samsung, Oppo, Motorola, Huawei, Infinix, Xiaomi)</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Brand</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual Omset</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.androidSub.map((p, idx) => (
                              <tr key={idx} className="hover:opacity-90 transition">
                                <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(p.actual)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sub-Lini Accessories (Urut dari Terbesar ke Terkecil) */}
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🔌</span>
                        <span>Accessories (Diurutkan dari Nominal Besar ke Kecil)</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Nama Aksesoris</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.accessoriesSub.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="py-3 px-3 text-center opacity-60">Belum ada transaksi aksesoris tercatat.</td>
                              </tr>
                            ) : (
                              staff.accessoriesSub.map((p, idx) => (
                                <tr key={idx} className="hover:opacity-90 transition">
                                  <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                    <span>{p.icon}</span>
                                    <span>{p.name}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-amber-400">{formatIDR(p.actual)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sub-Lini VAS (Qoala, Telkomsel, XL, Indosat) */}
                    <div>
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>VAS (Qoala, Telkomsel, XL, Indosat)</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Layanan Provider</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.vasSub.map((p, idx) => (
                              <tr key={idx} className="hover:opacity-90 transition">
                                <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-purple-400">{formatIDR(p.actual)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: BNPL TRANSACTIONS (LIVE FEED GID 2697970)          */}
            {/* ========================================================= */}
            {activeTab === "bnpl" && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                        <span>💳</span>
                        <span>TRANSAKSI PEMBIAYAAN KONSUMEN (BNPL DATABASE)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Sumber Data Live: Sheet <code>BNPL DATABASE</code> (gid: 2697970). Metrik dihitung otomatis.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
                        Total BNPL: {formatIDR(bnplCalculated.totalBnplAmount)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-400/30">
                        {bnplCalculated.totalBnplQty} Unit
                      </span>
                    </div>
                  </div>

                  {/* Kartu Pencapaian Masing-Masing Tender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {bnplCalculated.tenders.map((t, idx) => (
                      <div key={idx} className={`p-4 ${innerBg} border rounded-2xl space-y-1.5`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black uppercase ${accentText}`}>{t.tender}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700/40 text-slate-300">
                            {t.shareToStore}% Kontribusi Toko
                          </span>
                        </div>
                        <div className="text-base font-black">{formatIDR(t.amount)}</div>
                        <div className="flex justify-between text-[11px] opacity-70">
                          <span>Qty: <strong>{t.qty} Unit</strong></span>
                          <span>Est: <strong>{formatIDR(t.estimate)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Log Transaksi BNPL */}
                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4">Tanggal</th>
                          <th className="py-3.5 px-4">No. Invoice</th>
                          <th className="py-3.5 px-4">Mitra BNPL</th>
                          <th className="py-3.5 px-4">Detail Produk</th>
                          <th className="py-3.5 px-4 text-center">QTY</th>
                          <th className="py-3.5 px-4 text-right">Nilai Pembiayaan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {bnplCalculated.records.map((b, idx) => (
                          <tr key={idx} className="hover:opacity-90 transition">
                            <td className="py-3 px-4 font-mono opacity-80 whitespace-nowrap">{b.date}</td>
                            <td className={`py-3 px-4 font-mono font-bold ${accentText}`}>{b.invoice}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                {b.tender}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold max-w-md">{b.product}</td>
                            <td className="py-3 px-4 text-center font-bold">{b.qty}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                              {formatIDR(b.amount)}
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
            {/* TAB 5: KHUSUS ADMIN (22008089) - ACTIVITY STAFF           */}
            {/* ========================================================= */}
            {activeTab === "admin-audit" && currentSalesId === ADMIN_ID && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-2xl`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-emerald-400 flex items-center gap-2">
                        <span>🛡️</span>
                        <span>MONITORING ACTIVITY STAFF (PORTAL KHUSUS ADMIN)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Merekam waktu login, tipe perangkat, dan lokasi/GPS setiap kali staf mengakses website dashboard.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        localStorage.removeItem("digiplus_admin_activity");
                        setActivityLogs([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition"
                    >
                      Bersihkan Log
                    </button>
                  </div>

                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4">Waktu Akses (WIB)</th>
                          <th className="py-3.5 px-4">Sales ID & Nama Staf</th>
                          <th className="py-3.5 px-4">Tipe Perangkat</th>
                          <th className="py-3.5 px-4">Browser</th>
                          <th className="py-3.5 px-4">Lokasi Terdeteksi</th>
                          <th className="py-3.5 px-4">Koordinat GPS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {activityLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center opacity-60">
                              Belum ada aktivitas staf baru yang terekam.
                            </td>
                          </tr>
                        ) : (
                          activityLogs.map((log) => (
                            <tr key={log.id} className="hover:opacity-90 transition">
                              <td className={`py-3.5 px-4 font-mono ${accentText}`}>{log.timestamp}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold">{log.salesName}</div>
                                <div className="text-[10px] opacity-60 font-mono">ID: {log.salesId}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                  {log.deviceType}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 opacity-80">{log.browser}</td>
                              <td className="py-3.5 px-4 text-emerald-400 font-bold">{log.location}</td>
                              <td className="py-3.5 px-4 font-mono opacity-60 text-[10px]">{log.coords}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: DETAIL LOG TRANSAKSI                               */}
            {/* ========================================================= */}
            {activeTab === "sales-detail" && (
              <div className="space-y-4">
                <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl overflow-x-auto`}>
                  <h3 className="text-base font-bold mb-4">Rincian Seluruh Transaksi Penjualan (Live Data)</h3>
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">No. Invoice</th>
                        <th className="p-3">Salesperson</th>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {transactions.slice(0, 30).map((t, idx) => (
                        <tr key={idx} className="hover:opacity-90">
                          <td className="p-3 font-mono opacity-80 whitespace-nowrap">{t.date}</td>
                          <td className={`p-3 font-mono font-bold ${accentText}`}>{t.invoice}</td>
                          <td className="p-3 font-semibold">{t.salesName}</td>
                          <td className="p-3">{t.productName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                              {t.groupCategory}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{t.qty}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                            {formatIDR(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
