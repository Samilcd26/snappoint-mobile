export interface Marker {
    id: number;
    latitude: number;
    longitude: number;
    pointValue: number;
    isVerified: boolean;
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