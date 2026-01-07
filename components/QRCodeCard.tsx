'use client';

import QRCode from 'react-qr-code';
import Image from 'next/image';
import { RegistrationResponse } from '@/lib/api';

interface QRCodeCardProps {
  registration: RegistrationResponse;
}

export default function QRCodeCard({ registration }: QRCodeCardProps) {
  return (
    <div>
      {/* Screen View */}
      <div className="bg-white rounded-xl p-8 border-2 border-blue-200 text-center screen-only">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              value={registration.qrCode}
              size={200}
              level="H"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Registration Code</p>
          <p className="text-3xl font-bold text-blue-600 tracking-wider">
            {registration.qrCode}
          </p>
        </div>
      </div>

      {/* Print-Only Sticker Layout */}
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{
          width: '8cm',
          height: '8cm',
          border: '2px solid #333',
          padding: '0.5cm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          pageBreakAfter: 'always'
        }}>
          {/* Photo */}
          {registration.photoUrl && (
            <div style={{ marginBottom: '8px' }}>
              <Image
                src={`http://localhost:5000${registration.photoUrl}`}
                alt="Profile"
                width={60}
                height={60}
                style={{ borderRadius: '50%', border: '2px solid #3B82F6' }}
              />
            </div>
          )}
          
          {/* Name */}
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            {registration.name}
          </div>
          
          {/* QR Code */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px',
            marginBottom: '8px'
          }}>
            <QRCode
              value={registration.qrCode}
              size={150}
              level="H"
            />
          </div>
          
          {/* Registration Code */}
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: '#3B82F6',
            marginBottom: '8px',
            letterSpacing: '1px'
          }}>
            {registration.qrCode}
          </div>
          
          {/* Details */}
          <div style={{ 
            fontSize: '9px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {registration.village} • {registration.category}
          </div>
        </div>
      </div>
    </div>
  );
}