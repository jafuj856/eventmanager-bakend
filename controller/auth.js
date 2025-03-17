const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendOtpEmail } = require("../handler/nodemailer");
const { generateToken } = require("../handler/jwtGenarate");
const { encrypt } = require("../handler/crypto");
const register = async (req, res) => {
  try {
    const {
      name,

      email,
      password,
    } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please Provide name" });
    }

    if (!email) {
      return res.status(400).json({ message: "Please Provide mail id" });
    }
    if (!password) {
      return res.status(400).json({ message: "Please Provide password" });
    }

    const userData = await User.findOne({ email });
    if (userData) {
      return res.status(401).json({ message: "User Already Exists" });
    }

    const passwordEncrypted = await bcrypt.hash(password, 10);
    const response = await sendOtpEmail(email);
    if (!response) {
      return res.status(402).json({ message: "Something Wrong in Otp " });
    }
    const expires = new Date(new Date().getTime() + 3 * 60000);
    const newUser = new User({
      name,
      email,
      otp: response,
      otpExpires: expires,
      password: passwordEncrypted,
    });

    await newUser.save();
    return res
      .status(200)
      .json({ message: "Otp sent to Registered Email Address", email });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please Provide All Required Data",
        error: error.message,
      });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // || !fcmToken
    if (!email || !otp) {
      return res.status(401).json({ message: "Email , and Otp is Required" });
    }
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ message: "User Not Found" });
    }

    if (new Date() > userData.otpExpires) {
      return res.status(401).json({ message: "Otp Expired" });
    }

    if (otp != userData.otp) {
      return res.status(401).json({ message: "Incorrect Otp" });
    }

    userData.otp = "";
    userData.isOtpVerified = true;

    const token = generateToken(userData._id, "365d");
    const encryptedToken = encrypt(token);
    await userData.save();
    return res.status(200).json({
      message: "Otp Verified Success",
      token: encryptedToken,
      vendorId: userData?._id,
      isOtpVerified: userData.isOtpVerified,
      role: userData.role,
      email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const resentOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({ message: "Email is Required" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const response = await sendOtpEmail(email);
    if (!response) {
      return res.status(402).json({ message: "Something Wrong in Otp " });
    }
    const expires = new Date(new Date().getTime() + 3 * 60000);

    userData.otp = response;
    userData.otpExpires = expires;
    userData.isOtpVerified = false;

    await userData.save();
    return res.status(200).json({ message: "Successfully  Resent Otp " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const setNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Provide All Required Data - email,fcmToken and password",
      });
    }
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const sPassword = await bcrypt.hash(password, 10);
    userData.password = sPassword;
    await userData.save();
    return res.status(200).json({ message: "Successfully  Set New Password" });
  } catch (error) {
    if (error.name == "ValidationError") {
      return res.status(401).json({ message: "Invalid Password" });
    }
    if (error.name == "CastError") {
      return res.status(401).json({ message: "Invalid Password" });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // || !fcmToken
    if (!email || !password) {
      return res.status(401).json({
        message: "Provide All Required Data - email and password",
      });
    }

    if (email == "admin@gmail.com" && password == "admin@123") {
      const adminId = process.env.ADMIN_ID;

      const token = generateToken(adminId, "365d");
      const encryptedToken = encrypt(token);
      return res.status(200).json({
        message: "Successfully Login",
        token: encryptedToken,
        role: "admin",
      });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    if (userData.isOtpVerified == false) {
      const response = await sendOtpEmail(email);
      const expires = new Date(new Date().getTime() + 3 * 60000);

      userData.otp = response;
      userData.isOtpVerified = false;
      userData.otpExpires = expires;
      await userData.save();

      return res.status(200).json({
        message: "Your OTP Not Verified - Please Verify",
        isOtpVerified: userData.isOtpVerified,
        email,
      });
    }

    const token = generateToken(userData._id, "365d");
    const encryptedToken = encrypt(token);
    await userData.save();
    return res.status(200).json({
      message: "Successfully Login",
      token: encryptedToken,
      vendorId: userData?._id,
      isOtpVerified: userData?.isOtpVerified,
      role: userData?.role,
      profileImage: userData?.profileImage,
      coverImage: userData?.coverImage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
module.exports = {
  register,
  verifyOtp,
  resentOtp,
  setNewPassword,
  login,
};
