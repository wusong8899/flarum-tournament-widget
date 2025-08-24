export interface TournamentPlatform {
  id: string;
  name: string;
  iconUrl: string | null;
  iconClass: string | null;
  isActive: boolean;
  displayOrder: number;
}