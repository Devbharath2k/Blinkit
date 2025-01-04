import express from 'express';
import { IsAuthroization } from '../Middleware/generateToken.js';
import UserProfiler from '../Controller/userController.js';
import {profilephoto, logo, invoice}  from '../Utils/multer.js'
const router = express.Router();

router.post('/api/register', profilephoto,UserProfiler.register);
router.post('/api/verify', UserProfiler.verifyEmail);
router.post('/api/login', UserProfiler.login);
router.post('/api/update', IsAuthroization, profilephoto,  UserProfiler.updateProfile);
router.post('/api/forgot-password', UserProfiler.forgotpassword);
router.post('/api/resetpassword/:token', UserProfiler.resetpassword);
router.post('/api/logout', UserProfiler.logout);


export default router;