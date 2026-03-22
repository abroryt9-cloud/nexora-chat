import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import NFT from '../models/NFT';
import User from '../models/User';

export const getNFTs = async (req: AuthRequest, res: Response) => {
  try {
    const nfts = await NFT.find({}).populate('ownerId', 'username avatar');
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserNFTs = async (req: AuthRequest, res: Response) => {
  try {
    const nfts = await NFT.find({ ownerId: req.user._id });
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const buyNFT = async (req: AuthRequest, res: Response) => {
  try {
    const { nftId } = req.params;
    const nft = await NFT.findById(nftId);
    if (!nft) return res.status(404).json({ message: 'NFT not found' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.wallet.balance < nft.price) return res.status(400).json({ message: 'Insufficient balance' });
    // Transfer balance
    const seller = await User.findById(nft.ownerId);
    if (seller) {
      user.wallet.balance -= nft.price;
      seller.wallet.balance += nft.price;
      await seller.save();
    }
    // Update NFT owner
    nft.ownerId = user._id;
    await nft.save();
    await user.save();
    res.json({ success: true, nft });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const mintNFT = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl, price, rarity } = req.body;
    const nft = await NFT.create({
      name,
      description,
      imageUrl,
      price,
      ownerId: req.user._id,
      rarity,
    });
    res.status(201).json(nft);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
