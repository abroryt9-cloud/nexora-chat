import { Router } from 'express';
import { getNFTs, buyNFT, mintNFT, getUserNFTs } from '../../controllers/nftController';
import { protect } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getNFTs);
router.get('/my', getUserNFTs);
router.post('/buy/:nftId', buyNFT);
router.post('/mint', mintNFT);

export default router;
