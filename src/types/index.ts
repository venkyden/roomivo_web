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
    created_at: string;
    updated_at: string;
    property: Property;
}
