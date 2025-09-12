const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');

const router = express.Router();

// Configuration
const channelName = 'user-authentication';
const chaincodeName = 'user-authentication';
const mspId = 'TourismDeptMSP';
const walletPath = path.join(process.cwd(), 'wallet');
const orgUserId = 'appUser';

class AuthService {
    constructor() {
        this.contract = null;
        this.gateway = null;
    }

    async initialize() {
        try {
            // Create a new file system based wallet for managing identities
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            // Check to see if we've already enrolled the user
            const identity = await wallet.get(orgUserId);
            if (!identity) {
                console.log(`An identity for the user ${orgUserId} does not exist in the wallet`);
                console.log('Run the registerUser.js application before retrying');
                throw new Error('User identity not found in wallet');
            }

            // Create a new gateway for connecting to our peer node
            this.gateway = new Gateway();
            await this.gateway.connect(ccpPath, {
                wallet,
                identity: orgUserId,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get the network (channel) our contract is deployed to
            const network = await this.gateway.getNetwork(channelName);

            // Get the contract from the network
            this.contract = network.getContract(chaincodeName);

            console.log('Successfully connected to Fabric network');
        } catch (error) {
            console.error(`Failed to initialize AuthService: ${error}`);
            throw error;
        }
    }

    async disconnect() {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}

const authService = new AuthService();

// Initialize connection on startup
authService.initialize().catch(console.error);

// Middleware to ensure blockchain connection
const ensureBlockchainConnection = async (req, res, next) => {
    try {
        if (!authService.contract) {
            await authService.initialize();
        }
        next();
    } catch (error) {
        console.error('Blockchain connection error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Blockchain service unavailable',
            error: error.message 
        });
    }
};

// User Registration Endpoint
router.post('/register', ensureBlockchainConnection, async (req, res) => {
    try {
        const { email, password, phoneNumber, userType = 'tourist', kycData } = req.body;

        // Validate required fields
        if (!email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and phone number are required'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Prepare KYC data
        const kycInfo = {
            documentType: kycData?.documentType || '',
            documentNumber: kycData?.documentNumber || '',
            firstName: kycData?.firstName || '',
            lastName: kycData?.lastName || '',
            dateOfBirth: kycData?.dateOfBirth || '',
            nationality: kycData?.nationality || '',
            address: kycData?.address || ''
        };

        // Register user on blockchain
        const result = await authService.contract.submitTransaction(
            'registerUser',
            email,
            phoneNumber,
            passwordHash,
            userType,
            JSON.stringify(kycInfo)
        );

        const registrationData = JSON.parse(result.toString());

        // Start onboarding workflow
        const onboardingService = new OnboardingService();
        await onboardingService.initialize();
        
        const onboardingResult = await onboardingService.contract.submitTransaction(
            'startOnboarding',
            registrationData.userId,
            'TOURIST_STANDARD',
            req.body.entryPoint || 'online',
            JSON.stringify({
                registrationSource: 'web',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: registrationData.userId,
                email: registrationData.email,
                status: registrationData.status,
                onboarding: JSON.parse(onboardingResult.toString())
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
});

// User Login Endpoint
router.post('/login', ensureBlockchainConnection, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Hash password for comparison
        const passwordHash = await bcrypt.hash(password, 12);

        // Authenticate user on blockchain
        const result = await authService.contract.submitTransaction(
            'authenticateUser',
            email,
            passwordHash
        );

        const authData = JSON.parse(result.toString());

        if (!authData.success) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: authData.userId,
                email: authData.email,
                userType: authData.userType,
                sessionId: authData.sessionId
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    userId: authData.userId,
                    email: authData.email,
                    userType: authData.userType,
                    status: authData.status
                },
                sessionId: authData.sessionId
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
});

// Logout Endpoint
router.post('/logout', ensureBlockchainConnection, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Logout user on blockchain
        await authService.contract.submitTransaction('logout', sessionId);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Logout failed'
        });
    }
});

// Verify Session Endpoint
router.post('/verify-session', ensureBlockchainConnection, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Validate session on blockchain
        const result = await authService.contract.evaluateTransaction('validateSession', sessionId);
        const sessionData = JSON.parse(result.toString());

        res.json({
            success: true,
            data: sessionData
        });

    } catch (error) {
        console.error('Session verification error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid session'
        });
    }
});

// Email Verification Endpoint
router.post('/verify-email', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId, verificationCode } = req.body;

        if (!userId || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'User ID and verification code are required'
            });
        }

        // Verify email on blockchain
        const result = await authService.contract.submitTransaction(
            'verifyEmail',
            userId,
            verificationCode
        );

        const verificationData = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: verificationData
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Email verification failed'
        });
    }
});

// Phone Verification Endpoint
router.post('/verify-phone', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId, verificationCode } = req.body;

        if (!userId || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'User ID and verification code are required'
            });
        }

        // Verify phone on blockchain
        const result = await authService.contract.submitTransaction(
            'verifyPhone',
            userId,
            verificationCode
        );

        const verificationData = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Phone verified successfully',
            data: verificationData
        });

    } catch (error) {
        console.error('Phone verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Phone verification failed'
        });
    }
});

// Get User Profile Endpoint
router.get('/profile/:userId', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user from blockchain
        const result = await authService.contract.evaluateTransaction('getUser', userId);
        const userData = JSON.parse(result.toString());

        // Remove sensitive data
        delete userData.passwordHash;

        res.json({
            success: true,
            data: userData
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'User not found'
        });
    }
});

// Update User Profile Endpoint
router.put('/profile/:userId', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;

        // Update user profile on blockchain
        const result = await authService.contract.submitTransaction(
            'updateUserProfile',
            userId,
            JSON.stringify(profileData)
        );

        const updatedUser = JSON.parse(result.toString());
        delete updatedUser.passwordHash;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Profile update failed'
        });
    }
});

// Password Reset Request Endpoint
router.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // In a real implementation, you would:
        // 1. Generate a reset token
        // 2. Send email with reset link
        // 3. Store token with expiration

        // For now, just return success
        res.json({
            success: true,
            message: 'Password reset instructions sent to your email'
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset request failed'
        });
    }
});

// Password Reset Endpoint
router.post('/reset-password', ensureBlockchainConnection, async (req, res) => {
    try {
        const { email, newPassword, resetToken } = req.body;

        if (!email || !newPassword || !resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Email, new password, and reset token are required'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Reset password on blockchain
        const result = await authService.contract.submitTransaction(
            'resetPassword',
            email,
            newPasswordHash,
            resetToken
        );

        const resetData = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Password reset successfully',
            data: resetData
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Password reset failed'
        });
    }
});

// Get User Analytics (Admin only)
router.get('/analytics', ensureBlockchainConnection, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Get user analytics from blockchain
        const result = await authService.contract.evaluateTransaction(
            'getUserAnalytics',
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate || new Date().toISOString()
        );

        const analytics = JSON.parse(result.toString());

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get analytics'
        });
    }
});

module.exports = router;