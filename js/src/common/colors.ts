// Tournament Widget Color Constants
// These match the LESS variables in less/variables.less

export const TOURNAMENT_COLORS = {
  // Primary gradient (matches @tournament-primary-gradient)
  PRIMARY_GRADIENT: 'linear-gradient(75.2deg, #2129a7 0.57%, #132cd1 72.59%)',
  
  // Individual primary colors
  PRIMARY_START: '#2129a7',
  PRIMARY_END: '#132cd1',
  
  // Gold colors
  GOLD: '#ffd700',
  GOLD_DARK: '#e9b424',
  
  // Status colors
  SUCCESS: '#28a745',
  SUCCESS_LIGHT: '#4caf50',
  SUCCESS_BORDER: '#1e7e34',
  ERROR: '#dc3545',
  ERROR_ALT: '#ff4444',
  ERROR_BORDER: '#c82333',
  
  // Ranking colors
  RANK_GOLD: '#ffd700',
  RANK_SILVER: '#c0c0c0',
  RANK_BRONZE: '#cd7f32',
  
  // Neutral colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#888888',
  GRAY_DARK: '#333333',
  
  // Background colors
  MODAL_BG: '#2a2a3e',
  CONTROL_BG: '#f8f9fa',
  BORDER: '#ddd',
  PLATFORM_COLOR: '#00bcd4',
} as const;

// Helper function to create background style with image and gradient
export function createTournamentBackground(imageUrl?: string): string {
  if (imageUrl) {
    return `url(${imageUrl}) center/cover no-repeat, ${TOURNAMENT_COLORS.PRIMARY_GRADIENT}`;
  }
  return TOURNAMENT_COLORS.PRIMARY_GRADIENT;
}