/**
 * Shared type definitions used across frontend and backend
 */

export interface Client {
    id: string;
    name: string;
    address: string | null;
    zip: string | null;
    city: string | null;
    location_id?: string;
    created_at?: string;
    location?: {
        city: string;
        canton: string;
    };
}

export interface Scenario {
    id: string;
    client_id: string;
    name: string;
    data: any; // JSON blob
    created_at?: string;
    updated_at?: string;
}

export interface Location {
    id: string;
    plz: string;
    city: string;
    canton: string;
    bfs_id: number;
    multiplier_canton: number;
    multiplier_commune: number;
    multiplier_church_ref: number;
    multiplier_church_rom: number;
}
