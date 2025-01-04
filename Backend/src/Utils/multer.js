import multer from "multer";

const storage =  multer.memoryStorage();

const profilephoto = multer({storage}).single('profilephoto');

const invoice = multer({storage}).single('invoice');

const logo = multer({storage}).single('logo');

export {profilephoto, invoice, logo}