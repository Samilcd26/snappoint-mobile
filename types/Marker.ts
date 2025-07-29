export interface Marker {
    id: number;
    latitude: number;
    longitude: number;
    point_value: number;
    is_verified: boolean;
    distance: number;
    post_radius: number;
    coverage_area: number;
    radius_type: string;
    radius_description: string;
}

export interface FilterOptions {
    hideVisited: boolean;
    categories: string[];
    radius: number;
    zoomLevel: number;
}

export interface MarkerFilters {
    radius: number;
    zoomLevel: number;
    hideVisited: boolean;
    category: string;
    minPoints: number;    // New field from backend
    maxMarkers: number;   // New field from backend
}

export interface MarkerResponse {
    markers: Marker[];
    filters: MarkerFilters; // Use the extended filters
}