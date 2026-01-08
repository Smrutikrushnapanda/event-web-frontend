"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registrationApi,
  CreateRegistrationData,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, ArrowLeft, Search, User, Phone, MapPin, Award } from "lucide-react";
import Image from "next/image";
import {
  odishaDistricts,
  odishaBlocks,
  odishaCategory,
} from "@/lib/odisha-data";

export default function RegistrationPage() {
  const router = useRouter();

  type RegistrationFormState = {
    name: string;
    village: string;
    gp: string;
    district: string;
    block: string;
    mobile: string;
    aadhaarOrId: string;
    category: string;
  };

  const [formData, setFormData] = useState<RegistrationFormState>({
    name: "",
    village: "",
    gp: "",
    district: "",
    block: "",
    mobile: "",
    aadhaarOrId: "",
    category: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Aadhaar Lookup States
  const [aadhaarLookup, setAadhaarLookup] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [foundRegistration, setFoundRegistration] = useState<any>(null);

  const availableBlocks = formData.district ? (odishaBlocks[formData.district] || []) : [];

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handleDistrictChange = (district: string) => {
    setFormData({
      ...formData,
      district,
      block: "",
    });
    if (error) setError("");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size should be less than 5MB");
        return;
      }
      
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Aadhaar Lookup Function
  const handleAadhaarLookup = async () => {
    if (!aadhaarLookup.trim()) {
      setLookupError("Please enter Aadhaar number");
      return;
    }

    if (aadhaarLookup.length !== 12 || !/^\d{12}$/.test(aadhaarLookup)) {
      setLookupError("Aadhaar number must be exactly 12 digits");
      return;
    }

    setLookupLoading(true);
    setLookupError("");

    try {
      const response = await registrationApi.checkAadhaar(aadhaarLookup);
      
      if (response.exists) {
        // Fetch full registration details
        const registration = await registrationApi.getByQrCode(response.qrCode);
        setFoundRegistration(registration);
        setShowDetailsModal(true);
      } else {
        setLookupError("No registration found with this Aadhaar number");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setLookupError("Failed to check registration. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    if (!formData.village.trim()) {
      setError("Please enter your village");
      setLoading(false);
      return;
    }

    if (!formData.gp.trim()) {
      setError("Please enter your GP");
      setLoading(false);
      return;
    }

    if (!formData.district) {
      setError("Please select a district");
      setLoading(false);
      return;
    }

    if (!formData.block) {
      setError("Please select a block");
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid Indian mobile number starting with 6-9");
      setLoading(false);
      return;
    }

    if (formData.aadhaarOrId.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits");
      setLoading(false);
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaarOrId)) {
      setError("Aadhaar number must contain only digits");
      setLoading(false);
      return;
    }

    setShowVerification(true);
    setLoading(false);
  };


  const resetForm = () => {
  setFormData({
    name: "",
    village: "",
    gp: "",
    district: "",
    block: "",
    mobile: "",
    aadhaarOrId: "",
    category: "",
  });

  setPhoto(null);
  setPhotoPreview(null);
  setError("");
  setShowVerification(false);
  setSubmitting(false);
};


  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const data: CreateRegistrationData = {
        ...formData,
        ...(photo && { photo }),
      };

      const response = await registrationApi.create(data);
      
      alert(`✅ Registration Successful! Ready for next registration.`);

// reset form for next entry
resetForm();
      
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      alert(`❌ Registration Failed!\n\n${errorMessage}`);
      setShowVerification(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setShowVerification(false);
    setError("");
  };

  // ✅ Registration Details Modal
  const RegistrationDetailsModal = () => {
    if (!foundRegistration) return null;

    return (
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <CheckCircle className="w-7 h-7" />
              Registration Found!
            </DialogTitle>
            <DialogDescription className="text-base">
              Your registration details for MPSO Event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Photo */}
            {foundRegistration.photoUrl && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${foundRegistration.photoUrl}`}
                    alt={foundRegistration.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard 
                icon={<User className="w-5 h-5 text-blue-600" />}
                label="Full Name" 
                value={foundRegistration.name} 
              />
              <DetailCard 
                icon={<Phone className="w-5 h-5 text-blue-600" />}
                label="Mobile Number" 
                value={foundRegistration.mobile} 
              />
              <DetailCard 
                icon={<Award className="w-5 h-5 text-blue-600" />}
                label="Aadhaar Number" 
                value={foundRegistration.aadhaarOrId} 
              />
              <DetailCard 
                icon={<Award className="w-5 h-5 text-blue-600" />}
                label="Category" 
                value={foundRegistration.category} 
              />
              <DetailCard 
                icon={<MapPin className="w-5 h-5 text-blue-600" />}
                label="Village" 
                value={foundRegistration.village} 
              />
              <DetailCard 
                icon={<MapPin className="w-5 h-5 text-blue-600" />}
                label="Gram Panchayat" 
                value={foundRegistration.gp} 
              />
              <DetailCard 
                icon={<MapPin className="w-5 h-5 text-blue-600" />}
                label="District" 
                value={foundRegistration.district} 
              />
              <DetailCard 
                icon={<MapPin className="w-5 h-5 text-blue-600" />}
                label="Block" 
                value={foundRegistration.block} 
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setAadhaarLookup("");
                  setFoundRegistration(null);
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Verification/Review Screen
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                Verify Your Details
              </CardTitle>
              <CardDescription className="text-green-100 text-lg">
                Please review your information before final submission
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </p>
                </div>
              )}

              {photoPreview && (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                    <Image
                      src={photoPreview}
                      alt="Your photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Full Name" value={formData.name} />
                <DetailItem label="Mobile Number" value={formData.mobile} />
                <DetailItem label="Aadhaar Number" value={formData.aadhaarOrId} />
                <DetailItem label="Category" value={formData.category} />
                <DetailItem label="Village" value={formData.village} />
                <DetailItem label="Gram Panchayat" value={formData.gp} />
                <DetailItem label="District" value={formData.district} />
                <DetailItem label="Block" value={formData.block} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBackToEdit}
                  disabled={submitting}
                  className="flex-1 h-12 text-lg border-2"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Edit
                </Button>
                
                <Button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm & Submit
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-600 text-center pt-4">
                Please verify all details are correct before submitting. 
                You can go back to edit if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Original Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl border-0 pt-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">MPSO Event Registration</CardTitle>
            <CardDescription className="text-blue-100">
              Matsya Pranee Samavesh Odisha - Fill in your details to register
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* ✅ Aadhaar Lookup Section */}
            <div className="mb-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Already Registered? Check Your Details
                  </h3>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="tel"
                        placeholder="Enter your 12-digit Aadhaar number"
                        value={aadhaarLookup}
                        onChange={(e) => {
                          setAadhaarLookup(e.target.value.replace(/\D/g, ''));
                          setLookupError("");
                        }}
                        maxLength={12}
                        className="h-12 text-base"
                      />
                    </div>
                    <Button
                      onClick={handleAadhaarLookup}
                      disabled={lookupLoading}
                      className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {lookupLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Check
                        </>
                      )}
                    </Button>
                  </div>

                  {lookupError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {lookupError}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </p>
                </div>
              )}


              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11"
                  required
                />
              </div>

              {/* Village and GP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village" className="text-base font-semibold">
                    Village <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleChange("village", e.target.value)}
                    placeholder="Village name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gp" className="text-base font-semibold">
                    Gram Panchayat <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gp"
                    value={formData.gp}
                    onChange={(e) => handleChange("gp", e.target.value)}
                    placeholder="GP name"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* District and Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-base font-semibold">
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={handleDistrictChange}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {odishaDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block" className="text-base font-semibold">
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.block}
                    onValueChange={(value) => handleChange("block", value)}
                    disabled={!formData.district}
                  >
                    <SelectTrigger className="w-full h-11" disabled={!formData.district}>
                      <SelectValue
                        placeholder={formData.district ? "Select block" : "Select district first"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBlocks.map((block) => (
                        <SelectItem key={block} value={block}>
                          {block}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile and Aadhaar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-base font-semibold">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarOrId" className="text-base font-semibold">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="aadhaarOrId"
                    type="tel"
                    value={formData.aadhaarOrId}
                    onChange={(e) => handleChange("aadhaarOrId", e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {odishaCategory.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={loading}
              >
                {loading ? "Validating..." : "Continue to Verify"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Registration Details Modal */}
      <RegistrationDetailsModal />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// ✅ Detail Card Component for Modal
function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-gray-600 font-medium">{label}</p>
      </div>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// ✅ Status Badge Component
function StatusBadge({ label, status }: { label: string; status?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${
      status ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
    }`}>
      {status ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
      )}
      <span className={`text-xs font-semibold ${
        status ? 'text-green-700' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </div>
  );
}