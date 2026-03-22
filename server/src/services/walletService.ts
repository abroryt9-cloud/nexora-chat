import axios from 'axios';
import { randomBytes } from 'crypto';

export const generateWalletAddress = (): string => {
  return `0x${randomBytes(20).toString('hex')}`;
};

export const getNXRPrice = async (): Promise<number> => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=nexora&vs_currencies=usd`,
      { headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } }
    );
    return response.data.nexora?.usd || 0;
  } catch (error) {
    console.error('Failed to fetch NXR price', error);
    return 0;
  }
};

export const recordTransaction = async (from: string, to: string, amount: number): Promise<string> => {
  // Здесь можно записать в блокчейн
  return `tx_${Date.now()}`;
};
