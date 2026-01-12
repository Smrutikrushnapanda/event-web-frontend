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
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, ArrowLeft, Search, User, Phone, MapPin, Award, CreditCard, Home } from "lucide-react";
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
    district: string;
    block: string;
    mobile: string;
    aadhaarOrId: string;
    category: string;
  };

  const [formData, setFormData] = useState<RegistrationFormState>({
    name: "",
    village: "",
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

  // Aadhaar Lookup States
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

  // ✅ FIXED: Aadhaar Lookup - NO TRIM()
  const handleAadhaarLookup = async () => {
    // ✅ Changed from: if (!aadhaarLookup.trim())
    if (!aadhaarLookup || aadhaarLookup.length === 0) {
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
        const registration = await registrationApi.getByQrCode(response.qrCode);
        
        const completeRegistration = {
          ...registration,
          aadhaarOrId: registration.aadhaarOrId || aadhaarLookup,
        };
        
        setFoundRegistration(completeRegistration);
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

  // ✅ FIXED: Form Submit - NO TRIM()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Changed from: if (!formData.name || !formData.name.trim())
    if (!formData.name || formData.name.length === 0) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    // ✅ Changed from: if (!formData.village || !formData.village.trim())
    if (!formData.village || formData.village.length === 0) {
      setError("Please enter your village");
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

    if (!formData.mobile || formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid Indian mobile number starting with 6-9");
      setLoading(false);
      return;
    }

    if (!formData.aadhaarOrId || formData.aadhaarOrId.length !== 12) {
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
      setShowVerification(false);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setShowVerification(false);
    setError("");
  };

  // Registration Details Modal (for Aadhaar Lookup)
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
                icon={<CreditCard className="w-5 h-5 text-blue-600" />}
                label="Aadhaar Number" 
                value={foundRegistration.aadhaarOrId || "Not available"}
              />
              <DetailCard 
                icon={<Award className="w-5 h-5 text-blue-600" />}
                label="Category" 
                value={foundRegistration.category} 
              />
              <DetailCard 
                icon={<Home className="w-5 h-5 text-blue-600" />}
                label="Village" 
                value={foundRegistration.village} 
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

  // Verification Modal (for form submission review)
  const VerificationModal = () => {
    return (
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-green-700 flex items-center gap-2">
              <CheckCircle className="w-7 h-7 md:w-8 md:h-8" />
              Verify Your Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Please review your information carefully before final submission
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {photoPreview && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                  <Image
                    src={photoPreview}
                    alt="Your photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div>
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <DetailCard 
                  icon={<User className="w-5 h-5 text-sky-600" />}
                  label="Full Name" 
                  value={formData.name} 
                />
                <DetailCard 
                  icon={<Phone className="w-5 h-5 text-sky-600" />}
                  label="Mobile Number" 
                  value={formData.mobile} 
                />
                <DetailCard 
                  icon={<CreditCard className="w-5 h-5 text-sky-600" />}
                  label="Aadhaar Number" 
                  value={formData.aadhaarOrId}
                />
                <DetailCard 
                  icon={<Award className="w-5 h-5 text-sky-600" />}
                  label="Category" 
                  value={formData.category} 
                />
              </div>
            </div>

            {/* Location Information Section */}
            <div>
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <DetailCard 
                  icon={<Home className="w-5 h-5 text-green-600" />}
                  label="Village" 
                  value={formData.village} 
                />
                <DetailCard 
                  icon={<MapPin className="w-5 h-5 text-green-600" />}
                  label="District" 
                  value={formData.district} 
                />
                <DetailCard 
                  icon={<MapPin className="w-5 h-5 text-green-600" />}
                  label="Block" 
                  value={formData.block} 
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Important:</span> Please verify all details are correct before submitting. 
                You will not be able to edit them after submission.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
              <Button
                variant="outline"
                onClick={handleBackToEdit}
                disabled={submitting}
                className="flex-1 h-11 md:h-12 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Edit
              </Button>
              
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 h-11 md:h-12 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Main Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white relative overflow-hidden">
      {/* Rotating watermark circle */}
      <img
        src="/images/circle.png"
        alt="Decorative Circle"
        className="absolute -top-32 -right-36 w-[300px] h-[300px] md:w-[450px] md:h-[400px] opacity-20 pointer-events-none animate-spin-slow"
      />

      {/* Header */}
      <header className="w-full py-4 relative z-10">
        <div className="w-full px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4"
          style={{ alignItems: 'center' }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain flex-shrink-0"
            />
            <h1
              className="text-2xl sm:text-3xl md:text-4xl  lg:text-4xl font-semibold text-center md:text-left"
              style={{ color: "#0ea5e9" }}
            >
              Matsya Pranee Samavesh Odisha 2026
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 w-full px-4 md:px-6 py-6 md:py-10 pb-32 md:pb-44">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Section - Registration Form */}
          <div className="lg:col-span-6 bg-white rounded-xl shadow-md p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg">
                  <p className="font-semibold flex items-center gap-2 text-xs md:text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-800">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-10 md:h-11 border-gray-300 text-sm md:text-base capitalize"
                  style={{ textTransform: 'capitalize' }}
                  required
                />
              </div>

              {/* Village */}
              <div className="space-y-1.5">
                <Label htmlFor="village" className="text-sm font-semibold text-gray-800">
                  Village <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleChange("village", e.target.value)}
                  placeholder="Village name"
                  className="h-10 md:h-11 border-gray-300 text-sm md:text-base capitalize"
                  style={{ textTransform: 'capitalize' }}
                  required
                />
              </div>

              {/* District and Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="district" className="text-sm font-semibold text-gray-800">
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={handleDistrictChange}
                  >
                    <SelectTrigger className="h-10 md:h-11 border-gray-300 text-sm md:text-base w-full">
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
                <div className="space-y-1.5">
                  <Label htmlFor="block" className="text-sm font-semibold text-gray-800">
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.block}
                    onValueChange={(value) => handleChange("block", value)}
                    disabled={!formData.district}
                  >
                    <SelectTrigger className="h-10 md:h-11 border-gray-300 text-sm md:text-base w-full" disabled={!formData.district}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-sm font-semibold text-gray-800">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="h-10 md:h-11 border-gray-300 text-sm md:text-base"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aadhaarOrId" className="text-sm font-semibold text-gray-800">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="aadhaarOrId"
                    type="tel"
                    value={formData.aadhaarOrId}
                    onChange={(e) => handleChange("aadhaarOrId", e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    className="h-10 md:h-11 border-gray-300 text-sm md:text-base"
                    required
                  />
                  {formData.aadhaarOrId && formData.aadhaarOrId.length > 0 && formData.aadhaarOrId.length < 12 && (
                    <p className="text-xs text-gray-500 mt-1 border border-gray-300 rounded px-2 py-1 inline-block">
                      Please fill out this field
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-800">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="h-10 md:h-11 border-gray-300 text-sm md:text-base w-full">
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
                className="w-full h-11 md:h-12 text-base md:text-lg font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl shadow-lg" 
                disabled={loading}
              >
                {loading ? "Validating..." : "Continue to Verify"}
              </Button>
            </form>

            {/* Aadhaar Lookup Section */}
            <div className="mt-5 md:mt-6">
              <div className="bg-[#D4F4DD] rounded-xl md:rounded-2xl p-4 md:p-5">
                <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Already Registered? Check Your Details
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Input
                    type="tel"
                    placeholder="Enter your 12-digit Aadhaar number"
                    value={aadhaarLookup}
                    onChange={(e) => {
                      setAadhaarLookup(e.target.value.replace(/\D/g, ''));
                      setLookupError("");
                    }}
                    maxLength={12}
                    className="flex-1 h-10 md:h-11 text-sm md:text-base bg-white border-gray-300"
                  />
                  <Button
                    onClick={handleAadhaarLookup}
                    disabled={lookupLoading}
                    className="h-10 md:h-11 px-6 md:px-8 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm md:text-base"
                  >
                    {lookupLoading ? (
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>

                {lookupError && (
                  <p className="text-red-600 text-xs md:text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {lookupError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Information Panel */}
          <div className="lg:col-span-4 p-4 md:p-6 pt-0 lg:pt-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-sky-100">
              {/* Title Badge */}
              <div className="inline-block mb-3 md:mb-4">
                <span className="bg-sky-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">
                  Important Registration Information:
                </span>
              </div>

              {/* Event Details */}
              <div className="space-y-1.5 md:space-y-2 text-sm md:text-base text-gray-700 mb-3 md:mb-4">
                <p><span className="font-semibold">Event:</span> Matsya Pranee Samavesh Odisha 2026</p>
                <p><span className="font-semibold">Date:</span> 21st – 23rd January 2026</p>
                <p><span className="font-semibold">Venue:</span> Janta Maidan, Bhubaneswar</p>
              </div>

              {/* Bullet List */}
              <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-700">
                <li className="flex items-start gap-2 md:gap-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    Details collected solely for attendance verification purposes
                  </span>
                </li>

                <li className="flex items-start gap-2 md:gap-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    Please provide Name & Contact Number exactly as per Aadhaar card
                  </span>
                </li>

                <li className="flex items-start gap-2 md:gap-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    Registration Deadline: 16th January 2026
                    <br />
                    For technical assistance or queries:
                    <br />
                    <strong>+91 91141 40846</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Spacer Column */}
          <div className="lg:col-span-2 hidden lg:block" />
        </div>
      </section>

      {/* Fish–Cow Illustration */}
      <img
        src="/images/fish-cow.png"
        alt="Fish & Cow Illustration"
        className="absolute bottom-0 md:bottom-0 right-4 md:right-6 w-[180px] md:w-[220px] lg:w-[260px] xl:w-[300px] pointer-events-none z-15"
      />

      {/* Grass Footer */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <div
          className="w-full h-[100px] md:h-[140px] bg-repeat-x"
          style={{
            backgroundImage: "url('/images/grass.png')",
            backgroundSize: "contain",
          }}
        />
      </div>

      {/* Modals */}
      <RegistrationDetailsModal />
      <VerificationModal />
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs md:text-sm text-gray-600 font-medium">{label}</p>
      </div>
      <p className="text-sm md:text-base font-semibold text-gray-900">{value || "Not provided"}</p>
    </div>
  );
}