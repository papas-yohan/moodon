export interface TrackingEvent {
  id: string;
  productId: string;
  contactId?: string;
  sendLogId?: string;
  eventType: 'CLICK' | 'READ' | 'DELIVERED';
  trackingCode: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    price?: number;
    imageUrl?: string;
  };
  contact?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface CreateTrackingEventDto {
  productId: string;
  contactId?: string;
  sendLogId?: string;
  eventType: 'CLICK' | 'READ' | 'DELIVERED';
  trackingCode: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
}

export interface QueryTrackingEventDto {
  page?: number;
  limit?: number;
  eventType?: 'CLICK' | 'READ' | 'DELIVERED';
  productId?: string;
  contactId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TrackingStats {
  total: number;
  clicks: number;
  reads: number;
  delivered: number;
  recent24h: number;
}

export interface DashboardStats {
  overview: {
    totalProducts: number;
    totalContacts: number;
    totalSent: number;
    totalRead: number;
    totalClicks: number;
    avgReadRate: number;
    avgClickRate: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSent: number;
    totalRead: number;
    totalClicks: number;
    readRate: number;
    clickRate: number;
    clickThroughRate: number;
  }>;
  recentEvents: TrackingEvent[];
  dailyStats: Array<{
    date: string;
    sent: number;
    read: number;
    clicks: number;
  }>;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSent: number;
  totalRead: number;
  totalClicks: number;
  readRate: number;
  clickRate: number;
  clickThroughRate: number;
}

export interface TimeRangeStats {
  period: string;
  totalEvents: number;
  clickEvents: number;
  readEvents: number;
  deliveredEvents: number;
  uniqueContacts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    eventCount: number;
  }>;
}

export interface HourlyStats {
  hour: number;
  clicks: number;
  reads: number;
}