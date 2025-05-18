
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Layers } from "lucide-react";

export interface Scan {
  id: string;
  label: string;
  dicom_path: string;
  display_order: number;
}

interface ScanSelectorProps {
  scans: Scan[];
  onSelectScan: (scan: Scan) => void;
  currentScanId?: string;
}

export const ScanSelector = ({ scans, onSelectScan, currentScanId }: ScanSelectorProps) => {
  // If no scans or just one scan, no need to show selector
  if (!scans || scans.length <= 1) return null;
  
  // Sort scans by display_order
  const sortedScans = [...scans].sort((a, b) => a.display_order - b.display_order);
  
  // Find currently selected scan or default to first scan
  const currentScan = currentScanId 
    ? sortedScans.find(scan => scan.id === currentScanId) 
    : sortedScans[0];
    
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center text-radiology-light text-sm">
        <Layers className="h-4 w-4 mr-1" />
        <span>View:</span>
      </div>
      <Select 
        value={currentScan?.id} 
        onValueChange={(value) => {
          const selected = sortedScans.find(scan => scan.id === value);
          if (selected) onSelectScan(selected);
        }}
      >
        <SelectTrigger className="bg-gray-700 border-gray-600 text-radiology-light h-8 w-[180px]">
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600 text-radiology-light">
          {sortedScans.map((scan) => (
            <SelectItem key={scan.id} value={scan.id}>
              {scan.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-gray-500 text-xs">
        {scans.length} {scans.length === 1 ? 'scan' : 'scans'} available
      </span>
    </div>
  );
};
