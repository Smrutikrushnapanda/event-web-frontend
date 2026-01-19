"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { registrationApi, RegistrationResponse } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, ArrowLeft, Download } from "lucide-react";
import QRCode from "qrcode";

export default function QRCodePage() {
  const router = useRouter();
  const params = useParams();
  const qrCode = params?.qrCode as string;

  const [registration, setRegistration] = useState<RegistrationResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to safely format Aadhaar number
  const formatAadhaar = (aadhaar: string | undefined) => {
    if (!aadhaar) return "N/A";
    if (aadhaar.length === 12) {
      return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
    }
    return aadhaar;
  };

  const fetchRegistration = useCallback(async () => {
    if (!qrCode) {
      setError("No QR code provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await registrationApi.getByQrCode(qrCode);
      setRegistration(response);

      const dataUrl = await QRCode.toDataURL(response.qrCode, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#1E40AF",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch registration:", err);
      setError(err.response?.data?.message || err.message || "Failed to load registration");
    } finally {
      setLoading(false);
    }
  }, [qrCode]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  const handlePrint = async () => {
    if (!registration || !qrCodeDataUrl) return;

    let photoBase64 = "";
    if (registration.photoUrl) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const photoUrl = registration.photoUrl.startsWith('http') 
          ? registration.photoUrl 
          : `${baseUrl}${registration.photoUrl}`;
        
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        photoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Failed to load photo for print:", error);
      }
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${registration.name}</title>
        <style>
          @page {
            size: 8cm 10cm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background: white;
          }
          .sticker {
            width: 8cm;
            height: 10cm;
            border: 3px solid #1E40AF;
            padding: 0.6cm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white;
            box-sizing: border-box;
          }
          .header {
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #1E40AF;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .photo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid #3B82F6;
            margin-bottom: 8px;
            object-fit: cover;
          }
          .name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
            max-width: 90%;
            color: #1E40AF;
            line-height: 1.2;
          }
          .qr-code {
            width: 4.5cm;
            height: 4.5cm;
            margin: 8px 0;
          }
          .code {
            font-size: 13px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 8px;
            letter-spacing: 1.5px;
          }
          .location {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            color: #1E40AF;
            margin-bottom: 4px;
            max-width: 90%;
            line-height: 1.3;
          }
          .details {
            font-size: 9px;
            text-align: center;
            color: #666;
            max-width: 90%;
          }
        </style>
      </head>
      <body>
        <div class="sticker">
          <div class="header">MPSO EVENT 2025</div>
          ${photoBase64 ? `<img src="${photoBase64}" class="photo" alt="Photo" />` : ""}
          <div class="name">${registration.name}</div>
          <img src="${qrCodeDataUrl}" class="qr-code" alt="QR Code" />
          <div class="code">${registration.qrCode}</div>
          <div class="location">${registration.block} Block</div>
          <div class="details">${registration.village}, ${registration.district}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl || !registration) return;

    const link = document.createElement("a");
    link.download = `QR-${registration.qrCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">
            Loading registration...
          </p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                Registration Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                {error || "Could not find registration with this QR code"}
              </p>
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const photoUrl = registration.photoUrl 
    ? (registration.photoUrl.startsWith('http') 
        ? registration.photoUrl 
        : `${baseUrl}${registration.photoUrl}`)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-white">
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-lg text-white">
                Your QR code has been generated successfully
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            {/* QR Code Display */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-4 border-blue-500">
              <div className="flex flex-col items-center space-y-4">
                {photoUrl && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold text-blue-900 text-center">
                  {registration.name}
                </h2>

                {qrCodeDataUrl && (
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="mx-auto"
                      style={{ width: "300px", height: "300px" }}
                    />
                  </div>
                )}

                <div className="text-center space-y-1">
                  <p className="text-xl font-bold text-blue-700 tracking-wider">
                    {registration.qrCode}
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    {registration.block} Block
                  </p>
                  <p className="text-sm text-gray-600">
                    {registration.village}, {registration.district}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-blue-500 pb-2">
                Registration Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailBox label="Name" value={registration.name || "N/A"} />
                <DetailBox label="Mobile" value={registration.mobile || "N/A"} />
                <DetailBox label="Village" value={registration.village || "N/A"} />
                <DetailBox label="GP" value={registration.gp || "N/A"} />
                <DetailBox label="District" value={registration.district || "N/A"} />
                <DetailBox label="Block" value={registration.block || "N/A"} />
                <DetailBox label="Category" value={registration.category || "N/A"} />
                <DetailBox 
                  label="Aadhaar/ID" 
                  value={formatAadhaar(registration.aadhaarOrId)} 
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg p-4 text-sm text-yellow-900">
              <p className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Important Instructions:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-6">
                <li>Save or print this QR code</li>
                <li>Bring it to the MPSO event venue</li>
                <li>Show it at registration desk for quick check-in</li>
                <li>Do not share this QR code with anyone</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handlePrint}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print QR Code
              </Button>

              <Button
                onClick={handleDownload}
                size="lg"
                variant="outline"
                className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Download QR
              </Button>

              <Button
                onClick={() => router.push("/")}
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                New Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}