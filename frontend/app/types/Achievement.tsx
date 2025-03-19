export type Achievement = {
  id: number;
  name: string;
  image: string;
  status: 'achieved' | 'claimable' | 'locked';
  progress: number; // 0-100
}
