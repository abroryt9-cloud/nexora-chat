export interface INFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  ownerId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: Date;
}
