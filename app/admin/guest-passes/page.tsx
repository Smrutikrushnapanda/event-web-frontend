"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  QrCode,
  Download,
  Users,
  UserPlus,
  BarChart3,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { guestPassApi, GuestStatisticsResponse, GuestPass } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GuestPassesDataTable } from "../../../components/manage-pass/table/data-table";
import { createGuestPassColumns } from "../../../components/manage-pass/table/columns";

export default function GuestPassesPage() {
  const [loading, setLoading] = useState(false);
  const [delegates, setDelegates] = useState(500);
  const [vvip, setVvip] = useState(100);
  const [visitors, setVisitors] = useState(1000);
  const [stats, setStats] = useState<GuestStatisticsResponse | null>(null);
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [filteredPasses, setFilteredPasses] = useState<GuestPass[]>([]);
  const [searchQR, setSearchQR] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterAssigned, setFilterAssigned] = useState<string>("ALL");
  
  // Assignment Dialog
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [assignName, setAssignName] = useState("");
  const [assignMobile, setAssignMobile] = useState("");

  useEffect(() => {
    fetchStatistics();
    fetchPasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [passes, searchQR, filterCategory, filterAssigned]);

  const fetchStatistics = async () => {
    try {
      const data = await guestPassApi.getStatistics(true);
      setStats(data);
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const fetchPasses = async () => {
    try {
      const data = await guestPassApi.getAll();
      setPasses(data);
    } catch (error: any) {
      console.error("Failed to fetch passes:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...passes];

    // Search by QR Code
    if (searchQR) {
      filtered = filtered.filter((p) =>
        p.qrCode.toLowerCase().includes(searchQR.toLowerCase())
      );
    }

    // Filter by Category
    if (filterCategory !== "ALL") {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Filter by Assignment Status
    if (filterAssigned === "ASSIGNED") {
      filtered = filtered.filter((p) => p.isAssigned);
    } else if (filterAssigned === "UNASSIGNED") {
      filtered = filtered.filter((p) => !p.isAssigned);
    }

    setFilteredPasses(filtered);
  };

  const handleGenerate = async () => {
    if (delegates === 0 && vvip === 0 && visitors === 0) {
      alert("Please enter at least one pass count");
      return;
    }

    setLoading(true);
    try {
      const data = await guestPassApi.generate({ delegates, vvip, visitors });
      alert(
        `✅ Generated ${data.generated} passes!\n\n` +
          Object.entries(data.categories)
            .map(([cat, info]: any) => `${cat}: ${info.range}`)
            .join("\n")
      );
      
      // Refresh data
      await fetchStatistics();
      await fetchPasses();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAssignDialog = (pass: GuestPass) => {
    setSelectedPass(pass);
    setAssignName("");
    setAssignMobile("");
    setShowAssignDialog(true);
  };

  const handleAssign = async () => {
    if (!selectedPass) return;
    
    if (!assignName || !assignMobile) {
      alert("Please fill all fields");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(assignMobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await guestPassApi.assignDetails(selectedPass.qrCode, {
        name: assignName,
        mobile: assignMobile,
        assignedBy: "Admin",
      });

      alert(`✅ Details assigned to ${selectedPass.qrCode}`);
      setShowAssignDialog(false);
      
      // Refresh data
      await fetchStatistics();
      await fetchPasses();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create columns for the data table
  const columns = createGuestPassColumns(openAssignDialog);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <QrCode className="w-8 h-8" />
              Guest Pass Management
            </CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              Generate and manage DELEGATE, VVIP, and VISITOR passes
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-lg border-l-4 border-blue-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.totalPasses}</p>
                  <p className="text-sm text-gray-600">Total Passes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.totalAssigned}</p>
                  <p className="text-sm text-gray-600">Assigned</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.assignmentPercentage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-orange-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{stats.totalUnassigned}</p>
                  <p className="text-sm text-gray-600">Unassigned</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-purple-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.checkIns.total}</p>
                  <p className="text-sm text-gray-600">Total Check-ins</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Breakdown */}
        {stats && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.byCategory.DELEGATE}</p>
                  <p className="text-sm text-gray-600">DELEGATE</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.byCategory.VVIP}</p>
                  <p className="text-sm text-gray-600">VVIP</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.byCategory.VISITOR}</p>
                  <p className="text-sm text-gray-600">VISITOR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Passes */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Generate Guest Passes
            </CardTitle>
            <CardDescription>
              Create pre-numbered QR codes. Numbers continue from last generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>DELEGATE Passes</Label>
                <Input
                  type="number"
                  value={delegates}
                  onChange={(e) => setDelegates(Number(e.target.value))}
                  min={0}
                  max={10000}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>VVIP Passes</Label>
                <Input
                  type="number"
                  value={vvip}
                  onChange={(e) => setVvip(Number(e.target.value))}
                  min={0}
                  max={10000}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>VISITOR Passes</Label>
                <Input
                  type="number"
                  value={visitors}
                  onChange={(e) => setVisitors(Number(e.target.value))}
                  min={0}
                  max={10000}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-6 h-6 mr-3" />
                  Generate {delegates + vvip + visitors} Passes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Passes List */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  Manage Passes ({filteredPasses.length})
                </CardTitle>
                <CardDescription>
                  Search and assign details to guest passes
                </CardDescription>
              </div>
              
              <Button
                onClick={fetchPasses}
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Search QR Code</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by QR code..."
                    value={searchQR}
                    onChange={(e) => setSearchQR(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="DELEGATE">DELEGATE</SelectItem>
                    <SelectItem value="VVIP">VVIP</SelectItem>
                    <SelectItem value="VISITOR">VISITOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filterAssigned} onValueChange={setFilterAssigned}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Table */}
            <GuestPassesDataTable
              columns={columns}
              data={filteredPasses}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Details to {selectedPass?.qrCode}</DialogTitle>
              <DialogDescription>
                Add name and mobile number to this guest pass
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={assignName}
                  onChange={(e) => setAssignName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  placeholder="10-digit mobile number"
                  value={assignMobile}
                  onChange={(e) => setAssignMobile(e.target.value)}
                  maxLength={10}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Details
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}