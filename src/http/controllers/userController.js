const {User, Presence} = require ('../../../config/associations')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { body, validationResult } = require('express-validator');

// VALIDATIONS
exports.validateRegister = [
    body('username').notEmpty().withMessage('Username is required'),
    body('nickname').notEmpty().withMessage('Nickname is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

exports.validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// REGISTER
exports.register = async (req, res) => {
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

    const { username, nickname, email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use',
                data: {
                    msg: 'A user with this email already exists',
                    content: null,
                },
            });
        }

        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Username is already in use',
                data: {
                    msg: 'A user with this username already exists',
                    content: null,
                },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            nickname,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                msg: 'Account created successfully',
                content: {
                    id: newUser.id,
                    username: newUser.username,
                    nickname: newUser.nickname,
                    email: newUser.email,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                msg: err.message,
                content: null,
            },
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            data: {
                msg: firstError.msg,
                content: errors.array(),
            },
        });
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect username or password',
                data: {
                    msg: 'Invalid credentials',
                    content: null,
                },
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect username or password',
                data: {
                    msg: 'Invalid credentials',
                    content: null,
                },
            });
        }

        const presence = await Presence.findOne({ where: { userId: user.id } });
        if (presence && ['online', 'in_match', 'busy'].includes(presence.status)) {
            return res.status(403).json({
                success: false,
                message: 'User already logged in',
                data: {
                    msg: 'This account is already active in another session.',
                    content: {
                        status: presence.status,
                    },
                },
            });
        }


        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '96h' }
        );

        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                msg: 'Authentication successful',
                content: {
                    user: {
                        id: user.id,
                        username: user.username,
                        nickname: user.nickname,
                        email: user.email,
                    },
                    token,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                msg: err.message,
                content: null,
            },
        });
    }
};
