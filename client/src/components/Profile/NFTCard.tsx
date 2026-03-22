import React from 'react';
import { INFT } from '@nexora/shared';

interface NFTCardProps {
  nft: INFT | null;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  if (!nft) {
    return (
      <div className="border rounded-lg p-4 text-center text-gray-500">
        No NFTs yet
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <img src={nft.imageUrl} alt={nft.name} className="w-full h-48 object-cover" />
      <div className="p-3">
        <h3 className="font-semibold">{nft.name}</h3>
        <p className="text-sm text-gray-500">{nft.rarity}</p>
        <p className="text-blue-500 font-bold mt-1">{nft.price} NXR</p>
      </div>
    </div>
  );
};

export default NFTCard;
