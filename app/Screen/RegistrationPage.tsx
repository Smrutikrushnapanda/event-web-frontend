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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, User, CheckCircle, AlertCircle } from "lucide-react";
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
  
  // ✅ FIX: Keep type annotation on same line
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

  // Already Registered Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aadhaarCheck, setAadhaarCheck] = useState("");
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");

  // Get available blocks based on selected district
  const availableBlocks = formData.district ? (odishaBlocks[formData.district] || []) : [];

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  // Handle district change separately
  const handleDistrictChange = (district: string) => {
    setFormData({
      ...formData,
      district,
      block: "", // Reset block when district changes
    });
    if (error) setError("");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB)
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

  // Check if Aadhaar already exists
  const handleCheckAadhaar = async () => {
    if (!aadhaarCheck || aadhaarCheck.length !== 12) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setCheckingAadhaar(true);
    setAadhaarError("");
    
    try {
      const response = await registrationApi.checkAadhaar(aadhaarCheck);
      
      if (response.exists) {
        // Redirect to QR code page
        setIsDialogOpen(false);
        router.push(`/qr-code/${response.qrCode}`);
      } else {
        setAadhaarError("No registration found with this Aadhaar number. Please register first.");
      }
    } catch (err: any) {
      setAadhaarError(err.response?.data?.message || "Error checking Aadhaar number");
    } finally {
      setCheckingAadhaar(false);
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

  console.log("=== FORM DATA BEFORE SUBMISSION ===");
  console.log("Name:", formData.name);
  console.log("Village:", formData.village);
  console.log("GP:", formData.gp);
  console.log("District:", formData.district);
  console.log("Block:", formData.block);
  console.log("Mobile:", formData.mobile);
  console.log("Aadhaar:", formData.aadhaarOrId);
  console.log("Category:", formData.category);
  console.log("Has Photo:", !!photo);

  try {
    const data: CreateRegistrationData = {
      ...formData,
      ...(photo && { photo }),
    };

    console.log("Submitting registration...");
    const response = await registrationApi.create(data);
    console.log("Registration successful, redirecting...");
    
    // Redirect to QR code page
    router.push(`/qr-code/${response.qrCode}`);
  } catch (err: any) {
    console.error("❌ Registration error:", err);
    
    // Extract error message
    let errorMessage = "Registration failed. Please try again.";
    
    if (err.message) {
      errorMessage = err.message;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

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
            {/* Already Registered Button */}
            <div className="mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-blue-500 hover:bg-blue-50 text-blue-700 font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Already Registered? Get Your QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-xl">Retrieve Your QR Code</DialogTitle>
                    <DialogDescription>
                      Enter your 12-digit Aadhaar number to retrieve your registration QR code
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar-check">Aadhaar Number</Label>
                      <Input
                        id="aadhaar-check"
                        type="tel"
                        value={aadhaarCheck}
                        onChange={(e) => {
                          setAadhaarCheck(e.target.value.replace(/\D/g, ''));
                          setAadhaarError("");
                        }}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        className={aadhaarError ? "border-red-500" : ""}
                      />
                      {aadhaarError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {aadhaarError}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleCheckAadhaar}
                      disabled={checkingAadhaar || aadhaarCheck.length !== 12}
                      className="w-full"
                    >
                      {checkingAadhaar ? "Checking..." : "Get QR Code"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                    <SelectTrigger 
                      className={`w-full h-11 ${!formData.district && error ? "border-red-500" : ""}`}
                    >
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
                    <SelectTrigger
                      className={`w-full h-11 ${!formData.block && error ? "border-red-500" : ""}`}
                      disabled={!formData.district}
                    >
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
                  Department / Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger 
                    className={`w-full h-11 ${!formData.category && error ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select department" />
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

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Photo (Optional)
                </Label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}