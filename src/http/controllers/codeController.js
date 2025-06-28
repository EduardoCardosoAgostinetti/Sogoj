const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { validationResult, body } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const {Code, User} = require ('../../../config/associations')



function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.validateRequestCode = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
];
exports.validateVerifyCode = [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
];
exports.validateResetPassword = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
];
exports.requestPasswordResetCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: 'Validation error on fields',
      data: {
        msg: firstError.msg,
        content: errors.array(),
      },
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
        data: {
          msg: 'No user found with this email',
          content: null,
        },
      });
    }

    const code = generate6DigitCode();

    await Code.create({
      id: uuidv4(),
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password reset code',
      text: `Your password reset code is: ${code}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Code sent to your email',
      data: {
        msg: 'Password reset code sent successfully',
        content: { code }, // Remove this in production
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {
        msg: err.message,
        content: null,
      },
    });
  }
};
exports.verifyCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: 'Validation error on fields',
      data: {
        msg: firstError.msg,
        content: errors.array(),
      },
    });
  }

  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
        data: {
          msg: 'No user found with this email',
          content: null,
        },
      });
    }

    const foundCode = await Code.findOne({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!foundCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, expired, or already used code',
        data: {
          msg: 'The provided code is invalid, expired, or already used',
          content: null,
        },
      });
    }

    res.json({
      success: true,
      message: 'Code successfully verified',
      data: {
        msg: 'Valid code',
        content: null,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {
        msg: err.message,
        content: null,
      },
    });
  }
};
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: 'Validation error on fields',
      data: {
        msg: firstError.msg,
        content: errors.array(),
      },
    });
  }

  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
        data: {
          msg: 'No user found with this email',
          content: null,
        },
      });
    }

    const foundCode = await Code.findOne({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!foundCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, expired, or already used code',
        data: {
          msg: 'The provided code is invalid, expired, or already used',
          content: null,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    foundCode.used = true;
    await foundCode.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        msg: 'Password reset successfully',
        content: null,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {
        msg: err.message,
        content: null,
      },
    });
  }
};
