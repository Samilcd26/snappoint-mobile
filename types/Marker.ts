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
}




export interface FilterOptions {
    hideVisited: boolean;
    categories: string[];
    radius: number;
    zoomLevel: number;
  }
  

  export interface MarkerResponse {
    markers: Marker[];
    filters: FilterOptions;
}