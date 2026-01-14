"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  FileText, 
  BarChart3,
  QrCode,
  Users,
  Hash,
  Filter,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { odishaBlocks } from "@/lib/odisha-data";

interface ExportStats {
  totalRegistrations: number;
  totalBlocks: number;
  estimatedExcelSizeMB: number;
  estimatedCSVSizeKB: number;
  estimatedExcelTimeMinutes: number;
  recommendBlockWiseExport: boolean;
}

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // ✅ Range inputs
  const [rangeStart, setRangeStart] = useState<string>("1");
  const [rangeEnd, setRangeEnd] = useState<string>("500");

  // ✅ District and Block filters for range export
  const [rangeDistrict, setRangeDistrict] = useState<string>("");
  const [rangeBlock, setRangeBlock] = useState<string>("");
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const allBlocks = Object.keys(odishaBlocks).flatMap((district) =>
    odishaBlocks[district].map((block) => ({ district, block }))
  );

  const districts = Object.keys(odishaBlocks);

  // Get blocks for selected district
  const availableBlocks = rangeDistrict ? odishaBlocks[rangeDistrict] || [] : [];

  useEffect(() => {
    fetchStats();
  }, []);

  // ✅ Fetch filtered count when district/block changes
  useEffect(() => {
    fetchFilteredCount();
  }, [rangeDistrict, rangeBlock]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/registrations/export/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ Fetch filtered count
  const fetchFilteredCount = async () => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams();
      if (rangeDistrict) params.append('district', rangeDistrict);
      if (rangeBlock) params.append('block', rangeBlock);

      const response = await fetch(`${API_URL}/registrations/export/count?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch filtered count:', error);
      setFilteredCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  // ✅ Handle Range Export with filters
  const handleExportRange = async () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      alert("Invalid range. Please enter valid numbers where end >= start.");
      return;
    }

    const maxCount = filteredCount || stats?.totalRegistrations || 0;
    if (end > maxCount) {
      alert(`End number (${end}) exceeds available registrations (${maxCount})`);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeDistrict) params.append('district', rangeDistrict);
      if (rangeBlock) params.append('block', rangeBlock);

      const response = await fetch(
        `${API_URL}/registrations/export/qr-pdf/range/${start}/${end}?${params.toString()}`
      );
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const filterName = rangeBlock ? `${rangeBlock}_` : rangeDistrict ? `${rangeDistrict}_` : '';
      a.download = `${filterName}QR_Codes_${start}-${end}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      const filterText = rangeBlock ? ` from ${rangeBlock}` : rangeDistrict ? ` from ${rangeDistrict}` : '';
      alert(`✅ QR codes ${start}-${end}${filterText} downloaded successfully!`);
    } catch (error: any) {
      alert(`Failed to export range: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportQRPDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/registrations/export/qr-pdf`);
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MPSO_QR_Codes_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      alert('✅ QR code PDF downloaded successfully!');
    } catch (error: any) {
      alert(`Failed to export QR PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBlockQRPDF = async () => {
    if (!selectedBlock) {
      alert("Please select a block first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/registrations/export/qr-pdf/${encodeURIComponent(selectedBlock)}`
      );
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedBlock}_QR_Codes_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      alert(`✅ ${selectedBlock} QR code PDF downloaded successfully!`);
    } catch (error: any) {
      alert(`Failed to export QR PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    if (stats && stats.recommendBlockWiseExport) {
      const confirm = window.confirm(
        `⚠️ You have ${stats.totalRegistrations} registrations!\n\n` +
        `Estimated file size: ${stats.estimatedExcelSizeMB}MB\n` +
        `Estimated time: ${stats.estimatedExcelTimeMinutes} minutes\n\n` +
        `We recommend using block-wise export instead.\n\n` +
        `Do you still want to export all?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/registrations/export/excel`);
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MPSO_All_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      alert('✅ Excel file downloaded successfully!');
    } catch (error: any) {
      alert(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBlock = async () => {
    if (!selectedBlock) {
      alert("Please select a block first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/registrations/export/excel/${encodeURIComponent(selectedBlock)}`
      );
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedBlock}_Block_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      alert(`✅ ${selectedBlock} block exported successfully!`);
    } catch (error: any) {
      alert(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/registrations/export/csv`);
      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MPSO_All_Registrations_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      alert('✅ CSV file downloaded successfully!');
    } catch (error: any) {
      alert(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8" />
              Export Data
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Download registrations and guest passes with QR codes (Ordered by District & Block)
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Card */}
        {!loadingStats && stats && (
          <Card className="shadow-xl border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Export Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalRegistrations}</p>
                <p className="text-sm text-gray-600">Total Registrations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalBlocks}</p>
                <p className="text-sm text-gray-600">Blocks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.estimatedExcelSizeMB}MB</p>
                <p className="text-sm text-gray-600">Excel Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.estimatedExcelTimeMinutes}min</p>
                <p className="text-sm text-gray-600">Est. Time</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning for large datasets */}
        {stats && stats.recommendBlockWiseExport && (
          <Card className="bg-yellow-50 border-l-4 border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-900">Large Dataset Detected</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    With {stats.totalRegistrations} registrations, we recommend using district/block filters 
                    for faster downloads and better performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================== */}
        {/* SECTION 1: FARMER REGISTRATIONS EXPORT */}
        {/* ========================================== */}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Farmer Registrations Export
          </h2>

          {/* ✅ Export QR Code PDF by Range with Filters */}
          <Card className="shadow-xl border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <Hash className="w-6 h-6 text-green-600" />
                Export QR Code PDF by Range (Recommended)
              </CardTitle>
              <CardDescription>
                Print specific ranges with district/block filters (e.g., 1-500 from Khurda district)
                {filteredCount !== null && ` - ${filteredCount} registrations available`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ✅ District and Block Filters */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Optional Filters</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Filter by District (Optional)
                    </label>
                    <div className="relative">
                      <Select 
                        value={rangeDistrict} 
                        onValueChange={(value) => {
                          setRangeDistrict(value);
                          setRangeBlock(""); // Reset block when district changes
                        }}
                      >
                        <SelectTrigger className="w-full h-12 text-base">
                          <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rangeDistrict && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => {
                            setRangeDistrict("");
                            setRangeBlock("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Filter by Block (Optional)
                    </label>
                    <div className="relative">
                      <Select 
                        value={rangeBlock} 
                        onValueChange={setRangeBlock}
                        disabled={!rangeDistrict}
                      >
                        <SelectTrigger className="w-full h-12 text-base">
                          <SelectValue placeholder={rangeDistrict ? "All Blocks" : "Select District First"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availableBlocks.map((block) => (
                            <SelectItem key={block} value={block}>
                              {block}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rangeBlock && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setRangeBlock("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {loadingCount && (
                  <div className="text-center text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                    Counting registrations...
                  </div>
                )}

                {filteredCount !== null && (
                  <div className="text-center text-sm font-semibold text-blue-700">
                    📊 {filteredCount} registrations found
                    {rangeBlock ? ` in ${rangeBlock}` : rangeDistrict ? ` in ${rangeDistrict}` : ' (all regions)'}
                  </div>
                )}
              </div>

              {/* Range Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Start Number
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    placeholder="1"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    End Number
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    placeholder="500"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Quick Range Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  onClick={() => {
                    setRangeStart("1");
                    setRangeEnd("500");
                  }}
                  variant="outline"
                  size="sm"
                >
                  1-500
                </Button>
                <Button
                  onClick={() => {
                    setRangeStart("501");
                    setRangeEnd("1000");
                  }}
                  variant="outline"
                  size="sm"
                >
                  501-1K
                </Button>
                <Button
                  onClick={() => {
                    setRangeStart("1001");
                    setRangeEnd("1500");
                  }}
                  variant="outline"
                  size="sm"
                >
                  1K-1.5K
                </Button>
                <Button
                  onClick={() => {
                    setRangeStart("1501");
                    setRangeEnd("2000");
                  }}
                  variant="outline"
                  size="sm"
                >
                  1.5K-2K
                </Button>
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExportRange}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg h-14"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating Range PDF...
                  </>
                ) : (
                  <>
                    <QrCode className="w-6 h-6 mr-3" />
                    Export QR Codes #{rangeStart} to #{rangeEnd}
                    {rangeBlock && ` (${rangeBlock})`}
                    {!rangeBlock && rangeDistrict && ` (${rangeDistrict})`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export QR Code PDF (All) */}
          <Card className="shadow-xl border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-orange-600" />
                Export All QR Code Labels (PDF)
              </CardTitle>
              <CardDescription>
                Download all QR codes ordered by district and block for printing
                {stats && ` (${stats.totalRegistrations} labels)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportQRPDF}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg h-14"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating QR PDF...
                  </>
                ) : (
                  <>
                    <QrCode className="w-6 h-6 mr-3" />
                    Export All QR Codes to PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export All (Excel) */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Export All Registrations (Excel)
              </CardTitle>
              <CardDescription>
                Download complete registration data ordered by district and block
                {stats && ` (${stats.estimatedExcelSizeMB}MB, ~${stats.estimatedExcelTimeMinutes} min)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportAll}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg h-14"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating Excel...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 mr-3" />
                    Export All to Excel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export All (CSV) */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Export All Registrations (CSV)
              </CardTitle>
              <CardDescription>
                Fast download ordered by district and block - includes QR code text
                {stats && ` (${stats.estimatedCSVSizeKB}KB, instant)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportCSV}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-14"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating CSV...
                  </>
                ) : (
                  <>
                    <FileText className="w-6 h-6 mr-3" />
                    Export All to CSV (Fast)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export by Block */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Export by Block
              </CardTitle>
              <CardDescription>
                Download registration data for a specific block
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Select Block
                </label>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Choose a block" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {allBlocks.map((item, index) => (
                      <SelectItem key={index} value={item.block}>
                        {item.block} ({item.district})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleExportBlock}
                  disabled={loading || !selectedBlock}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Excel...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Export Excel
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleExportBlockQRPDF}
                  disabled={loading || !selectedBlock}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-14"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      QR PDF...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" />
                      Export QR PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: GUEST PASSES EXPORT */}
        {/* ========================================== */}

        <div className="space-y-4 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-purple-600" />
            Guest Passes Export (DELEGATE/VVIP/VISITOR)
          </h2>

          <Card className="shadow-xl border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-purple-600" />
                Guest Passes Export
              </CardTitle>
              <CardDescription>
                Export DELEGATE, VVIP, and VISITOR passes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Export All Guest Passes - QR PDF */}
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `${API_URL}/guest-passes/export/qr-pdf`;
                  link.download = `Guest_Passes_QR_${new Date().toISOString().split("T")[0]}.pdf`;
                  link.click();
                }}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Export All Guest QR Codes (PDF)
              </Button>

              {/* Export All Guest Passes - Excel */}
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `${API_URL}/guest-passes/export/excel`;
                  link.download = `Guest_Passes_${new Date().toISOString().split("T")[0]}.xlsx`;
                  link.click();
                }}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Export All Guest Passes (Excel)
              </Button>

              {/* Export All Guest Passes - CSV */}
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `${API_URL}/guest-passes/export/csv`;
                  link.download = `Guest_Passes_${new Date().toISOString().split("T")[0]}.csv`;
                  link.click();
                }}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <FileText className="w-5 h-5 mr-2" />
                Export All Guest Passes (CSV)
              </Button>

              {/* Category-wise Export Buttons */}
              <div className="pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Export by Category:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `${API_URL}/guest-passes/export/qr-pdf/DELEGATE`;
                      link.download = `DELEGATE_QR_${new Date().toISOString().split("T")[0]}.pdf`;
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    DELEGATE PDF
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `${API_URL}/guest-passes/export/qr-pdf/VVIP`;
                      link.download = `VVIP_QR_${new Date().toISOString().split("T")[0]}.pdf`;
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    VVIP PDF
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `${API_URL}/guest-passes/export/qr-pdf/VISITOR`;
                      link.download = `VISITOR_QR_${new Date().toISOString().split("T")[0]}.pdf`;
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    VISITOR PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-yellow-900">
              <span className="text-2xl">📋</span>
              How to Use
            </h3>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>
                  <strong>✨ NEW:</strong> Use <strong>Range Export with Filters</strong> to export specific batches from selected districts/blocks
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>
                  All exports are now <strong>automatically ordered by District → Block → Name</strong> for easy organization
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>
                  Use district filter to export QR codes for specific regions (e.g., only Khurda district)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>
                  Use block filter for even more precision (e.g., only Bhubaneswar block)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">5.</span>
                <span>
                  Quick range buttons (1-500, 501-1K, etc.) help you export in manageable batches
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}