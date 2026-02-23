export type WidgetType = 'apps' | 'info-list' | 'tips' | 'emergency' | 'link-card';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  iosUrl?: string;
  androidUrl?: string;
}

export interface TipItem {
  id: string;
  title: string;
  description: string;
}

export interface InfoItem {
  id: string;
  title: string;
  description: string;
  iconText?: string;
}

export interface EmergencyItem {
  id: string;
  label: string;
  number: string;
}

export interface ConnectionWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  icon: string; // String representation of a Lucide icon
  colorClass?: string;
  iconColorClass?: string;
  
  // Payloads based on type
  apps?: AppItem[];
  tips?: TipItem[];
  infoItems?: InfoItem[];
  emergencyItems?: EmergencyItem[];
  
  // for simple link cards
  linkText?: string;
  url?: string;
  
  // Layout helpers
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}
