import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Calendar } from 'lucide-react';
import ewayLogo from '@/assets/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

interface StudentIdCardUIProps {
  studentName: string;
  studentId: string;
  expiryDate: string;
  issuedDate: string;
  photoUrl?: string;
  qrValue?: string;
}

export function StudentIdCardUI({
  studentName,
  studentId,
  expiryDate,
  issuedDate,
  photoUrl,
  qrValue
}: StudentIdCardUIProps) {
  return (
    <div className="w-full max-w-2xl min-w-[600px] sm:min-w-0 transition-all duration-500 mx-auto print:mx-0 print:w-full">
      <div className="overflow-hidden border-0 shadow-2xl relative group pb-0 aspect-[1.58/1] bg-white rounded-2xl ring-1 ring-black/5">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0a0f2c] via-[#1a237e] to-[#0a0f2c] p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
          <div className="z-10 bg-black p-1.5 rounded-full shadow-lg overflow-hidden flex items-center justify-center w-14 h-14 ring-2 ring-white/10">
            <img src={ewayLogo} alt="Logo" className="w-10 h-10 object-contain rounded-full" />
          </div>
          <div className="z-10 flex-1">
            <h2 className="text-white font-black text-xl tracking-wider uppercase leading-none mb-1">EWAY INSTITUTE</h2>
            <div className="flex items-center gap-2">
              <div className="h-[1px] bg-white/30 flex-1" />
              <span className="text-white/70 text-[10px] uppercase tracking-[0.3em] font-light">Excellence in Education</span>
              <div className="h-[1px] bg-white/30 flex-1" />
            </div>
            <p className="text-white/90 text-xs font-bold uppercase tracking-widest mt-1">Student Identity Card</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 grid grid-cols-[140px_1fr_120px] gap-8 items-center h-[calc(100%-88px)] relative overflow-hidden bg-white">
          {/* Background Accents */}
          <div className="absolute top-1/4 -left-10 w-40 h-40 bg-blue-400/5 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
          
          {/* 1. Portrait Photo */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <User className="text-gray-300" size={60} />
              )}
            </div>
          </div>

          {/* 2. Demographic Details */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">Full Name</label>
              <p className="text-gray-900 font-black text-lg leading-none truncate overflow-ellipsis max-w-[300px]">
                {studentName}
              </p>
            </div>
            
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">Student No</label>
              <p className="text-gray-800 font-bold text-base">{studentId}</p>
            </div>

            <div className="flex gap-10">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">Valid Till</label>
                <p className="text-gray-800 font-bold text-sm tracking-tight">{expiryDate}</p>
              </div>
              
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">Status</label>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* 3. Verification QR */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-2 border-2 border-gray-100 rounded-xl shadow-md bg-white ring-4 ring-gray-50/50">
              <QRCodeSVG value={qrValue || studentId} size={90} level="H" includeMargin={false} />
            </div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] text-center leading-tight">
              Digital Login QR
            </p>
          </div>
        </div>

        {/* Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}
