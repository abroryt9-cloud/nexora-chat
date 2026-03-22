import { Router } from 'express';
import { register, login, verifyTwoFactor, setupTwoFactor, enableTwoFactor } from '../../controllers/authController';
import { protect } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { registerSchema, loginSchema, twoFactorSchema } from '../../utils/validators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-2fa', validate(twoFactorSchema), verifyTwoFactor);
router.post('/logout', protect, (req, res) => res.json({ message: 'Logged out' }));
router.post('/2fa/setup', protect, setupTwoFactor);
router.post('/2fa/enable', protect, enableTwoFactor);

export default router;
