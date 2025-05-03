import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaUpload } from 'react-icons/fa';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';

const ReceiptScanner = ({ onScanComplete }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL for image display
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a receipt image to scan");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post(
        API_PATHS.OCR.SCAN_RECEIPT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        toast.success("Receipt scanned successfully");
        onScanComplete(response.data);
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <p className="texts-xs text-gray-400 mb-4">
        Upload a receipt image and our OCR technology will automatically extract and categorize the expenses.
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Upload Receipt Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        />
      </div>
      
      {previewUrl && (
        <div className="mb-6">
          <p className="block text-sm font-medium mb-2">Receipt Preview</p>
          <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Receipt preview" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleUpload}
          disabled={isUploading || !file}
        >
          {isUploading ? (
            <>
              <FaSpinner className="text-lg animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <FaUpload className="text-lg" />
              Scan Receipt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReceiptScanner;