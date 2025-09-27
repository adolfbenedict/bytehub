const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const helmet = require("helmet");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://bytehubonline.vercel.app",
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

if (
  !EMAIL_PASSWORD ||
  !EMAIL_USERNAME ||
  !FRONTEND_URL ||
  !MONGODB_URI ||
  !JWT_SECRET ||
  !REFRESH_TOKEN_SECRET ||
  !FRONTEND_DOMAIN
) {
  console.error("Missing one or more required environment variables.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
  connectionTimeout: 10000 
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Database connection error:", err));

const userInfoSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
  refreshTokens: [String],
});

const UserInfo = mongoose.model("userINFO", userInfoSchema);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again after 15 minutes.",
});

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        console.error("JWT Verification Error (Access Token):", err.message);
        return res.status(403).json({ error: "Invalid or expired access token" });
    }
    req.user = user;
    next();
  });
};

const signupValidation = [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters long.'),
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const passwordResetValidation = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
];

const emailValidation = [
  body('email').isEmail().withMessage('Must be a valid email address.'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const checkLockout = (user) => {
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingSeconds = Math.ceil((user.lockUntil - Date.now()) / 1000);
        return `Account locked. Please try again in ${remainingSeconds} seconds.`;
    }
    return null;
};

// EMAIL FUNCTIONS
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: email,
    subject: "Byte Hub - Your Verification Code",
    html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
                <div style="background-color: #fff; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p style="color: #666;">Thank you for signing up with Byte Hub. To complete your registration, please use the following verification code:</p>
                    <div style="background-color: #00d3ff; color: #fff; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block; margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="color: #666;">This code is valid for 1 hour. If you did not request this, please ignore this email.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">&copy; 2025 Byte Hub. All rights reserved.</p>
                </div>
            </div>
        `,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/reset-password?token=${token}`;
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: email,
    subject: "Byte Hub - Password Reset",
    html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
                <div style="background-color: #fff; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #666;">You are receiving this because you have requested the reset of the password for your account.</p>
                    <p style="color: #666;">Please click on the following button to reset your password:</p>
                    <a href="${resetUrl}" style="background-color: #00d3ff; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0;">Reset Password</a>
                    <p style="color: #666;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">&copy; 2025 Byte Hub. All rights reserved.</p>
                </div>
            </div>
        `,
  };
  await transporter.sendMail(mailOptions);
};

// AUTHENTICATION ROUTES
app.post("/signup", authLimiter, signupValidation, handleValidationErrors, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await UserInfo.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserInfo({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = Date.now() + 3600000;

    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      message:
        "User registered successfully! A verification token has been sent to your email.",
      email: newUser.email,
    });
  } catch (err) {
    console.error("Error occurred during signup:", err.message);
    res.status(500).json({ error: "Error registering user." });
  }
});

app.post("/verification", authLimiter, emailValidation, handleValidationErrors, async (req, res) => {
  const { email, code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Verification token is required." });
  }

  try {
    const user = await UserInfo.findOne({ email });

    if (!user || user.verificationToken !== code) {
      return res.status(400).json({ error: "Invalid email or verification token." });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({
          error: "Verification token has expired. Please request a new one.",
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified successfully!" });
  } catch (err) {
    console.error("Error during code verification:", err.message);
    res.status(500).json({ error: "Error verifying code." });
  }
});

app.post("/resend-code", authLimiter, emailValidation, handleValidationErrors, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserInfo.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified." });
    }

    const newVerificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpires = Date.now() + 3600000;

    await user.save();

    await sendVerificationEmail(user.email, newVerificationToken);

    res
      .status(200)
      .json({
        message: "A new verification token has been sent to your email.",
      });
  } catch (err) {
    console.error("Error in resend-code:", err.message);
    res.status(500).json({ error: "Error processing request." });
  }
});

app.post("/login", authLimiter, loginValidation, handleValidationErrors, async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserInfo.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const lockError = checkLockout(user);
    if (lockError) {
        return res.status(403).json({ error: lockError });
    }

    if (!user.isVerified) {
      const newVerificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = newVerificationToken;
      user.verificationTokenExpires = Date.now() + 3600000;
      await user.save();
      await sendVerificationEmail(user.email, newVerificationToken);

      return res
        .status(403)
        .json({
          error: "Please verify your email first. A new token has been sent.",
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshTokens.push(refreshToken);
      await user.save();

      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          domain: FRONTEND_DOMAIN 
      });

      res.status(200).json({
          message: "Login successful!",
          accessToken: accessToken,
          email: user.email,
      });

    } else {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;

      if (user.loginAttempts >= MAX_ATTEMPTS) {
          user.lockUntil = Date.now() + 15 * 60 * 1000;
          user.loginAttempts = 0;
          await user.save();
          return res.status(401).json({ error: "Invalid credentials. Account locked for 15 minutes." });
      }

      await user.save();
      res.status(401).json({ 
          error: "Invalid credentials.",
          attemptsLeft: MAX_ATTEMPTS - user.loginAttempts
      });
    }
  } catch (err) {
    console.error("Error occurred during login:", err.message);
    res.status(500).json({ error: "Error logging in." });
  }
});

app.post("/token", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken == null) return res.status(401).json({ error: "Refresh token missing" });

    try {
        const user = await UserInfo.findOne({ refreshTokens: refreshToken });

        if (!user) {
            console.error("Invalid refresh token found in request.");
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decodedUser) => {
            if (err) {
                user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
                user.save();
                res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None', domain: FRONTEND_DOMAIN });
                console.error("Expired refresh token removed.");
                return res.status(403).json({ error: "Refresh token expired. Please login again." });
            }

            const newAccessToken = generateAccessToken(user);
            res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (err) {
        console.error("Error in token refresh:", err.message);
        res.status(500).json({ error: "Token refresh failed." });
    }
});

app.post("/forgot-password", authLimiter, emailValidation, handleValidationErrors, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserInfo.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({
          message:
            "If a user with that email exists, a password reset link has been sent.",
        });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendPasswordResetEmail(user.email, resetPasswordToken);

    res
      .status(200)
      .json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
  } catch (error) {
    console.error("Error in /forgot-password:", error.message);
    res.status(500).json({ error: "Error sending password reset email." });
  }
});

app.post("/reset-password", authLimiter, passwordResetValidation, handleValidationErrors, async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await UserInfo.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in /reset-password:", error.message);
    res.status(500).json({ error: "Error resetting password." });
  }
});

app.post("/contact", [body('email').isEmail().withMessage('Must be a valid email address.'), body('message').notEmpty().withMessage('Message cannot be empty.')], handleValidationErrors, async (req, res) => {
  const { email, message } = req.body;

  const mailOptions = {
    from: email,
    to: EMAIL_USERNAME,
    subject: "New Contact Form Submission from Byte Hub",
    html: `
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form email:", error.message);
    res.status(500).json({ error: "Error sending message." });
  }
});

app.delete("/delete-account", authenticateToken, async (req, res) => {
  const email = req.user.email; 

  try {
    const result = await UserInfo.deleteOne({ email: email });

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None', domain: FRONTEND_DOMAIN });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Account not found." });
    }
    res.status(200).json({ message: "Account deleted successfully!" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the account." });
  }
});


app.post("/logout", authenticateToken, async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const user = await UserInfo.findById(req.user.id);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
                await user.save();
            }
        } catch (error) {
            console.error("Error revoking refresh token on logout:", error.message);
        }
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None', domain: FRONTEND_DOMAIN });
    res.status(200).json({ message: "Logout successful" });
});

app.get("/protected-data", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Access granted. This data is protected by JWT.",
        user: { 
            id: req.user.id, 
            username: req.user.username, 
            email: req.user.email 
        }
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});