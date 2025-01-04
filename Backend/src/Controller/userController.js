import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import Userschema from "../Model/userModel.js";
import cloudnary from "../Config/cloudnary.js";
import transport from "../Config/nodemailer.js";
import getdatauri from "../Utils/datauri.js";
import bcrypt from "bcryptjs";
import { AccessToken, RefreshToken } from "../Middleware/generateToken.js";

const UserProfiler = {
  register: async (req, res) => {
    try {
      const { fname, lname, email, password } = req.body;
      if (!fname || !lname || !email || !password) {
        return res.status(400).json({
          message: "please all have enter your fields",
          success: false,
        });
      }

      const ExitingUser = await Userschema.findOne({ email });
      if (ExitingUser) {
        return res.status(400).json({
          message: "Email already exists",
          success: false,
        });
      }

      let profilephotourl = null;
      const file = req.file;
      if (file) {
        const parser = getdatauri(file);
        const cloudResponse = await cloudnary.uploader.upload(parser.content, {
          folder: "users_profiles",
        });
        profilephotourl = cloudResponse.secure_url;
      }

      const saltrounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltrounds);

      const User = new Userschema({
        fname,
        lname,
        email,
        password: hashedPassword,
        profilephoto: profilephotourl,
      });
      await User.save();

      const mailoptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Welcome to BinkeyIt",
        text: `Thank you for signing up with BinkeyIt. kindly verfied E-mail please link this link \n \n
                ${process.env.CLIENT_URL}/verify_email?code=${User?._id}`,
      };

      transport.sendMail(mailoptions);

      res.status(201).json({
        message: "User registered successfully",
        success: true,
        data: User,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  verifyEmail: async (req, res) => {
    try {
      const { code } = req.body;

      const User = await Userschema.findOne({ _id: code });

      if (!User) {
        return res.status(404).json({ message: "code is not found" });
      }

      const UpdateUser = await Userschema.updateOne(
        { _id: code },
        {
          verify_email: true,
        }
      );

      if (!UpdateUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(201).json({
        message: "E-mail verified successfully",
        success: true,
        data: User,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: "Please all have enter your fields",
          success: false,
        });
      }

      let user = await Userschema.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "email not found ",
          success: false,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "password is incorrect ",
          success: false,
        });
      }

      if (user.status !== "active") {
        return res.status(401).json({
          message: "User is not active",
          success: false,
        });
      }

      const accessToken = await AccessToken(user._id);
      const refreshToken = await RefreshToken(user._id);
      const udpateLast_login = await Userschema.findByIdAndUpdate(user?._id, {
        lastLogin: new Date(),
      });

      if (!udpateLast_login) {
        return res.status(401).json({
          message: "User not found",
          success: false,
        });
      }

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "lax",
      };

      res.cookie("accesstoken", accessToken, cookieOptions);
      res.cookie("refreshtoken", refreshToken, cookieOptions);

      res.status(201).json({
        message: `welcome back to ${user.fname}`,
        success: true,
        data: user,
        accesstoken: accessToken,
        refreshtoken: refreshToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { fname, lname, email, phone } = req.body;
      const userId = req.user;

      // Fetch user by ID
      const user = await Userschema.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      // Handle file uploads
      const file = req.file;
      let invoiceUrl = null;

      if (file) {
        const dataUri = getdatauri(file);

        // Upload profile photo
        if (req.file.fieldname === "profilephoto") {
          const profileResponse = await cloudnary.uploader.upload(
            dataUri.content,
            {
              folder: "users_profiles",
            }
          );
          user.profilephoto = profileResponse.secure_url;
        }

        // Upload invoice
        if (req.file.fieldname === "invoice") {
          const invoiceResponse = await cloudnary.uploader.upload(
            dataUri.content,
            {
              folder: "invoices",
            }
          );
          invoiceUrl = invoiceResponse.secure_url;
        }
      }

      // Update user fields
      if (fname) user.fname = fname;
      if (lname) user.lname = lname;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (invoiceUrl) user.invoice = invoiceUrl;

      // Save user
      await user.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server error",
        success: false,
        error: error.message,
      });
    }
  },
  forgotpassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          message: "Please provide your email",
          success: false,
        });
      }

      const user = await Userschema.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      const resettoken = {
        userId: user._id,
      };

      const token = await jwt.sign(
        resettoken,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      if (!token) {
        return res.status(500).json({
          message: "Token not generated",
          success: false,
        });
      }

      const resetUrl = `${process.env.CLIENT_URL}/api/resetpassword/${token}`;

      const mailoptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Reset Password BinkeyIt",
        text: `To reset your password please click this link \n \n
                ${resetUrl}`,
      };

      transport.sendMail(mailoptions);

      res.status(201).json({
        message: "Password reset link sent successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  resetpassword: async (req, res) => {
    try {
      const { password, confirmpassword } = req.body;

      const token = req.params.token;

      if (!password || !confirmpassword) {
        return res.status(400).json({
          message: "Please provide all fields",
          success: false,
        });
      }

      if (password !== confirmpassword) {
        return res.status(400).json({
          message: "Passwords do not match",
          success: false,
        });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      let user = await Userschema.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      const saltrounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltrounds);
      user.password = hashedPassword;
      await user.save();

      res.status(201).json({
        message: "Password reset successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  logout: async (req, res) => {
    try {
      const userId = req.user;

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "lax",
      };

      res.clearCookie("accesstoken", cookieOptions);
      res.clearCookie("refreshtoken", cookieOptions);

      const updatelogout = await Userschema.findByIdAndUpdate(userId, {
        refresh_Token: " ",
      });

      res.status(201).json({
        message: `successfully logout`,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
};

export default UserProfiler;
