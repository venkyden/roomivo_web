export interface Property {
    id: string;
    name: string;
    price: number;
    currency: string;
    rooms: number;
    location: string;
    amenities: string[];
    description: string;
    neighborhood_rating?: number;
    transport_score?: number;
    legal_status?: string;
    match_score?: number;
    match_reason?: string;
    images: string[];
    coordinates?: {
        lat: number;
        lng: number;
    };
    landlord_id?: string;
}

export interface TenantProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    budget_min?: number;
    budget_max?: number;
    preferred_locations?: string[];
    move_in_date?: string;
    employment_status?: string;
    guarantor?: boolean;
}

export interface Application {
    id: string;
    property_id: string;
    tenant_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    message?: string;
    created_at: string;
    tenant?: TenantProfile;
    property?: Property;
}

export interface Payment {
    id: string;
    tenant_id: string;
    landlord_id: string;
    property_id: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'overdue' | 'failed';
    payment_date?: string;
    due_date: string;
    invoice_url?: string;
    description?: string;
    created_at: string;
    property?: Property;
    tenant?: TenantProfile;
}

export interface Incident {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'reported' | 'in_progress' | 'resolved' | 'closed';
    photos?: string[];
    tenant_id: string;
    property_id: string;
    created_at: string;
    updated_at: string;
    property?: Property;
    tenant?: TenantProfile;
}

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    conversation_id: string;
    is_read?: boolean;
}

export interface Conversation {
    id: string;
    participant_id: string;
    participant_name: string;
    participant_avatar?: string;
    last_message?: string;
    last_message_at?: string;
    unread_count: number;
}

export interface Document {
    id: string;
    user_id: string;
    property_id?: string;
    type: string;
    name: string;
    file_url: string;
    status: 'pending' | 'verified' | 'rejected';
    created_at: string;
}
