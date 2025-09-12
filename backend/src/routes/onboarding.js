const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Configuration
const channelName = 'onboarding-workflow';
const chaincodeName = 'onboarding-workflow';
const touristIdentityChannel = 'tourist-identity';
const touristIdentityChaincode = 'tourist-identity';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/kyc-documents/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
        }
    }
});

class OnboardingService {
    constructor() {
        this.contract = null;
        this.touristIdentityContract = null;
        this.gateway = null;
    }

    async initialize() {
        try {
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            const identity = await wallet.get('appUser');
            if (!identity) {
                throw new Error('User identity not found in wallet');
            }

            this.gateway = new Gateway();
            await this.gateway.connect(ccpPath, {
                wallet,
                identity: 'appUser',
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get onboarding workflow contract
            const network = await this.gateway.getNetwork(channelName);
            this.contract = network.getContract(chaincodeName);

            // Get tourist identity contract
            const touristNetwork = await this.gateway.getNetwork(touristIdentityChannel);
            this.touristIdentityContract = touristNetwork.getContract(touristIdentityChaincode);

            console.log('Successfully connected to Fabric network for onboarding');
        } catch (error) {
            console.error(`Failed to initialize OnboardingService: ${error}`);
            throw error;
        }
    }

    async disconnect() {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}

const onboardingService = new OnboardingService();
onboardingService.initialize().catch(console.error);

// Middleware to ensure blockchain connection
const ensureBlockchainConnection = async (req, res, next) => {
    try {
        if (!onboardingService.contract) {
            await onboardingService.initialize();
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

// Start Onboarding Process
router.post('/start', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId, workflowId = 'TOURIST_STANDARD', entryPoint = 'online', metadata = {} } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await onboardingService.contract.submitTransaction(
            'startOnboarding',
            userId,
            workflowId,
            entryPoint,
            JSON.stringify(metadata)
        );

        const onboardingData = JSON.parse(result.toString());

        res.status(201).json({
            success: true,
            message: 'Onboarding started successfully',
            data: onboardingData
        });

    } catch (error) {
        console.error('Start onboarding error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to start onboarding'
        });
    }
});

// Get Onboarding Status
router.get('/status/:userId', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await onboardingService.contract.evaluateTransaction(
            'getOnboardingByUser',
            userId
        );

        const onboardingData = JSON.parse(result.toString());

        res.json({
            success: true,
            data: onboardingData
        });

    } catch (error) {
        console.error('Get onboarding status error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Onboarding not found'
        });
    }
});

// Complete Onboarding Step
router.post('/complete-step', ensureBlockchainConnection, async (req, res) => {
    try {
        const { onboardingId, stepId, stepData, completedBy } = req.body;

        if (!onboardingId || !stepId || !completedBy) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding ID, step ID, and completed by are required'
            });
        }

        const result = await onboardingService.contract.submitTransaction(
            'completeStep',
            onboardingId,
            stepId,
            JSON.stringify(stepData || {}),
            completedBy
        );

        const updatedOnboarding = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Step completed successfully',
            data: updatedOnboarding
        });

    } catch (error) {
        console.error('Complete step error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete step'
        });
    }
});

// Upload KYC Documents
router.post('/upload-kyc/:userId', 
    ensureBlockchainConnection,
    upload.fields([
        { name: 'identityDocument', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
        { name: 'photo', maxCount: 1 }
    ]), 
    async (req, res) => {
        try {
            const { userId } = req.params;
            const files = req.files;

            if (!files || Object.keys(files).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one document is required'
                });
            }

            // Process uploaded files
            const uploadedDocuments = {};
            for (const [fieldName, fileArray] of Object.entries(files)) {
                if (fileArray && fileArray.length > 0) {
                    uploadedDocuments[fieldName] = {
                        originalName: fileArray[0].originalname,
                        filename: fileArray[0].filename,
                        path: fileArray[0].path,
                        size: fileArray[0].size,
                        uploadedAt: new Date()
                    };
                }
            }

            // Get current onboarding
            const onboardingResult = await onboardingService.contract.evaluateTransaction(
                'getOnboardingByUser',
                userId
            );
            const onboardingData = JSON.parse(onboardingResult.toString());

            // Complete KYC upload step
            const stepResult = await onboardingService.contract.submitTransaction(
                'completeStep',
                onboardingData.onboardingId,
                'kyc_upload',
                JSON.stringify({
                    documents: uploadedDocuments,
                    uploadedBy: userId,
                    uploadedAt: new Date()
                }),
                userId
            );

            const updatedOnboarding = JSON.parse(stepResult.toString());

            res.json({
                success: true,
                message: 'KYC documents uploaded successfully',
                data: {
                    onboarding: updatedOnboarding,
                    uploadedDocuments
                }
            });

        } catch (error) {
            console.error('KYC upload error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload KYC documents'
            });
        }
    }
);

// Verify KYC Documents (Admin/Authority only)
router.post('/verify-kyc', ensureBlockchainConnection, async (req, res) => {
    try {
        const { userId, onboardingId, verification, verifiedBy, notes } = req.body;

        if (!userId || !onboardingId || !verification || !verifiedBy) {
            return res.status(400).json({
                success: false,
                message: 'User ID, onboarding ID, verification status, and verifier are required'
            });
        }

        // Complete KYC verification step
        const stepResult = await onboardingService.contract.submitTransaction(
            'completeStep',
            onboardingId,
            'kyc_verification',
            JSON.stringify({
                verificationStatus: verification, // 'approved', 'rejected', 'pending_review'
                verifiedBy,
                verificationDate: new Date(),
                notes: notes || '',
                kycScore: verification === 'approved' ? 100 : 0
            }),
            verifiedBy
        );

        const updatedOnboarding = JSON.parse(stepResult.toString());

        // If KYC is approved, proceed with tourist identity creation
        if (verification === 'approved') {
            try {
                // Get user details from authentication service
                // This would typically be done through a service call
                const kycData = {
                    documentType: 'aadhaar', // or passport
                    documentNumber: 'XXXX-XXXX-XXXX',
                    name: 'Tourist Name',
                    nationality: 'Indian'
                };

                const itinerary = {
                    destinations: ['Guwahati', 'Kaziranga'],
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    accommodation: ['Hotel XYZ']
                };

                const emergencyContacts = [
                    {
                        name: 'Emergency Contact',
                        phone: '+91-XXXXXXXXXX',
                        relationship: 'family'
                    }
                ];

                // Create tourist identity on blockchain
                const identityResult = await onboardingService.touristIdentityContract.submitTransaction(
                    'createTouristIdentity',
                    userId,
                    JSON.stringify(kycData),
                    JSON.stringify(itinerary),
                    JSON.stringify(emergencyContacts),
                    new Date().toISOString(),
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days validity
                );

                const touristIdentity = JSON.parse(identityResult.toString());

                // Complete blockchain ID generation step
                await onboardingService.contract.submitTransaction(
                    'completeStep',
                    onboardingId,
                    'blockchain_id_generation',
                    JSON.stringify({
                        touristId: userId,
                        blockchainId: touristIdentity.touristId,
                        generatedAt: new Date(),
                        qrCode: `QR_${userId}`,
                        validUntil: touristIdentity.validTo
                    }),
                    'system'
                );

            } catch (identityError) {
                console.error('Tourist identity creation error:', identityError);
                // Continue with onboarding even if identity creation fails
            }
        }

        res.json({
            success: true,
            message: 'KYC verification completed successfully',
            data: updatedOnboarding
        });

    } catch (error) {
        console.error('KYC verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify KYC'
        });
    }
});

// Get Onboarding Analytics
router.get('/analytics', ensureBlockchainConnection, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await onboardingService.contract.evaluateTransaction(
            'getOnboardingAnalytics',
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate || new Date().toISOString()
        );

        const analytics = JSON.parse(result.toString());

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Get onboarding analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get analytics'
        });
    }
});

// Get Onboardings by Status
router.get('/by-status/:status', ensureBlockchainConnection, async (req, res) => {
    try {
        const { status } = req.params;

        const result = await onboardingService.contract.evaluateTransaction(
            'getOnboardingsByStatus',
            status
        );

        const onboardings = JSON.parse(result.toString());

        res.json({
            success: true,
            data: onboardings
        });

    } catch (error) {
        console.error('Get onboardings by status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get onboardings'
        });
    }
});

// Get Onboardings by Entry Point
router.get('/by-entry-point/:entryPoint', ensureBlockchainConnection, async (req, res) => {
    try {
        const { entryPoint } = req.params;

        const result = await onboardingService.contract.evaluateTransaction(
            'getOnboardingsByEntryPoint',
            entryPoint
        );

        const onboardings = JSON.parse(result.toString());

        res.json({
            success: true,
            data: onboardings
        });

    } catch (error) {
        console.error('Get onboardings by entry point error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get onboardings'
        });
    }
});

// Add Note to Onboarding
router.post('/add-note', ensureBlockchainConnection, async (req, res) => {
    try {
        const { onboardingId, stepId, note, addedBy } = req.body;

        if (!onboardingId || !note || !addedBy) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding ID, note, and added by are required'
            });
        }

        const result = await onboardingService.contract.submitTransaction(
            'addStepNote',
            onboardingId,
            stepId || 'general',
            note,
            addedBy
        );

        const noteData = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Note added successfully',
            data: noteData
        });

    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add note'
        });
    }
});

// Add Blocker to Onboarding
router.post('/add-blocker', ensureBlockchainConnection, async (req, res) => {
    try {
        const { onboardingId, description, severity, assignedTo } = req.body;

        if (!onboardingId || !description || !severity) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding ID, description, and severity are required'
            });
        }

        const blockerId = `BLK_${Date.now()}`;

        const result = await onboardingService.contract.submitTransaction(
            'addBlocker',
            onboardingId,
            blockerId,
            description,
            severity,
            assignedTo || ''
        );

        const updatedOnboarding = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Blocker added successfully',
            data: updatedOnboarding
        });

    } catch (error) {
        console.error('Add blocker error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add blocker'
        });
    }
});

// Resolve Blocker
router.post('/resolve-blocker', ensureBlockchainConnection, async (req, res) => {
    try {
        const { onboardingId, blockerId, resolution, resolvedBy } = req.body;

        if (!onboardingId || !blockerId || !resolution || !resolvedBy) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding ID, blocker ID, resolution, and resolver are required'
            });
        }

        const result = await onboardingService.contract.submitTransaction(
            'resolveBlocker',
            onboardingId,
            blockerId,
            resolution,
            resolvedBy
        );

        const updatedOnboarding = JSON.parse(result.toString());

        res.json({
            success: true,
            message: 'Blocker resolved successfully',
            data: updatedOnboarding
        });

    } catch (error) {
        console.error('Resolve blocker error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to resolve blocker'
        });
    }
});

// Get Workflow Templates
router.get('/workflows', ensureBlockchainConnection, async (req, res) => {
    try {
        const result = await onboardingService.contract.evaluateTransaction('getAllWorkflows');
        const workflows = JSON.parse(result.toString());

        res.json({
            success: true,
            data: workflows
        });

    } catch (error) {
        console.error('Get workflows error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflows'
        });
    }
});

module.exports = router;