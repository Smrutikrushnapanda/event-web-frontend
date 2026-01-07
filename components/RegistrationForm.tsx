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
import { Upload, User, CheckCircle } from "lucide-react";
import Image from "next/image";
import {
  odishaDistricts,
  odishaBlocks,
  odishaDepartments,
} from "@/lib/odisha-data";

export default function RegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState
    Omit<CreateRegistrationData, "photo">
  ({
    name: "",
    village: "",
    gp: "",
    district: "",
    block: "",
    mobile: "",
    aadhaarOrId: "",
    category: "General",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);

  // Already Registered Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aadhaarCheck, setAadhaarCheck] = useState("");
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  // Update blocks when district changes
  const handleDistrictChange = (district: string) => {
    setFormData((prev) => ({ ...prev, district, block: "" }));
    setAvailableBlocks(odishaBlocks[district] || []);
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (!aadhaarCheck || aadhaarCheck.length < 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setCheckingAadhaar(true);
    try {
      const response = await registrationApi.checkAadhaar(aadhaarCheck);
      
      if (response.exists) {
        // Redirect to QR code page with registration data
        router.push(`/qr-code/${response.qrCode}`);
      } else {
        alert("No registration found with this Aadhaar number. Please register first.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error checking Aadhaar number");
    } finally {
      setCheckingAadhaar(false);
      setIsDialogOpen(false);
      setAadhaarCheck("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
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

    if (formData.aadhaarOrId.length !== 12) {
      setError("Aadhaar number must be 12 digits");
      setLoading(false);
      return;
    }

    try {
      const data: CreateRegistrationData = {
        ...formData,
        ...(photo && { photo }),
      };

      const response = await registrationApi.create(data);
      
      // Redirect to QR code page
      router.push(`/qr-code/${response.qrCode}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">MPSO Event Registration</CardTitle>
            <CardDescription>
              Fill in your details to register for the event
            </CardDescription>
            
            {/* Already Registered Button */}
            <div className="pt-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Already Registered? Get Your QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Retrieve Your QR Code</DialogTitle>
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
                        onChange={(e) => setAadhaarCheck(e.target.value)}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        pattern="[0-9]{12}"
                      />
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
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Village and GP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleChange("village", e.target.value)}
                    placeholder="Village"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gp">GP *</Label>
                  <Input
                    id="gp"
                    value={formData.gp}
                    onChange={(e) => handleChange("gp", e.target.value)}
                    placeholder="GP"
                    required
                  />
                </div>
              </div>

              {/* District and Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    value={formData.district}
                    onValueChange={handleDistrictChange}
                  >
                    <SelectTrigger className={!formData.district && error ? "border-red-500" : ""}>
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
                  <Label htmlFor="block">Block *</Label>
                  <Select
                    value={formData.block}
                    onValueChange={(value) => handleChange("block", value)}
                    disabled={!formData.district}
                  >
                    <SelectTrigger
                      className={!formData.block && error ? "border-red-500" : ""}
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
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="10 digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarOrId">Aadhaar Number *</Label>
                  <Input
                    id="aadhaarOrId"
                    type="tel"
                    value={formData.aadhaarOrId}
                    onChange={(e) => handleChange("aadhaarOrId", e.target.value)}
                    placeholder="12 digit Aadhaar number"
                    pattern="[0-9]{12}"
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Department / Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className={!formData.category && error ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {odishaDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload photo</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
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

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Registering..." : "Register Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}