import React, { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle, UploadCloud } from 'lucide-react';
import { dbService } from '../dbService';

interface ImagePickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ label, value, onChange, folder = 'general' }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await dbService.uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      console.error(err);
      alert('ইমেজ আপলোড করতে সমস্যা হয়েছে: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="image-picker-container" className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`w-full aspect-[19/6] bg-slate-50 rounded-2xl border border-dashed border-gray-200 hover:border-[#FFC107] hover:bg-amber-50/20 cursor-pointer flex flex-col items-center justify-center p-4 transition-all relative overflow-hidden group`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {value ? (
          <>
            <img 
              src={value} 
              alt="Selected Preview" 
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 rounded-2xl">
              <Camera size={20} className="text-[#FFC107] animate-bounce" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">গ্যালারি থেকে পরিবর্তন করুন</span>
            </div>
            
            {/* Success Pill */}
            <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[8px] font-bold py-1 px-2 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs">
              <CheckCircle size={10} /> আপলোড সম্পন্ন
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center">
            {uploading ? (
              <>
                <Loader2 size={24} className="text-[#FFC107] animate-spin mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 animate-pulse">গ্যালারি থেকে আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <UploadCloud size={24} className="text-gray-300 group-hover:text-[#FFC107] transition-colors mb-0.5" />
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">গ্যালারি থেকে ছবি সিলেক্ট করুন</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">কোনো লিংক দিতে হবে না, সরাসরি আপলোড</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
