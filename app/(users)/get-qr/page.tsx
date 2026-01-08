"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Search, ArrowLeft, User } from "lucide-react";

export default function RetrieveQRPage() {
  const router = useRouter();
  const [aadhaarCheck, setAadhaarCheck] = useState("");
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");

  const handleCheckAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aadhaarCheck || aadhaarCheck.length !== 12) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setCheckingAadhaar(true);
    setAadhaarError("");
    
    try {
      const response = await registrationApi.checkAadhaar(aadhaarCheck);
      
      if (response.exists) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <User className="w-8 h-8" />
                  Retrieve Your QR Code
                </CardTitle>
                <CardDescription className="text-indigo-100 text-lg mt-2">
                  Already registered? Enter your Aadhaar number to get your QR code
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            <form onSubmit={handleCheckAadhaar} className="space-y-6">
              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Enter the same 12-digit Aadhaar number you used during registration to retrieve your QR code.
                </p>
              </div>

              {/* Aadhaar Input */}
              <div className="space-y-2">
                <Label htmlFor="aadhaar-check" className="text-lg font-semibold">
                  Aadhaar Number <span className="text-red-500">*</span>
                </Label>
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
                  className={`h-14 text-lg ${aadhaarError ? "border-red-500" : ""}`}
                  autoFocus
                />
                {aadhaarError && (
                  <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {aadhaarError}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={checkingAadhaar || aadhaarCheck.length !== 12}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {checkingAadhaar ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Get My QR Code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full h-12 text-base border-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Registration
                </Button>
              </div>
            </form>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Make sure you enter the same Aadhaar number used during registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>If you haven't registered yet, please click "Back to Registration" to register first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>For any issues, please contact the event organizers</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}