export interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  points: number;
  rank: number;
}

export interface LeaderboardPagination {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface LeaderboardFilter {
  category_id: string;
  is_category: boolean;
  is_nearby: boolean;
  max_distance: number;
  time_filter: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  user_rank: LeaderboardUser;
  pagination: LeaderboardPagination;
  filter: LeaderboardFilter;
}
