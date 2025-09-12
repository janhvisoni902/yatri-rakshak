'use strict';

const { Contract } = require('fabric-contract-api');

class OnboardingWorkflowContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Onboarding Workflow Ledger ===========');
        
        // Initialize with default workflow templates
        const defaultWorkflows = [
            {
                workflowId: 'TOURIST_STANDARD',
                name: 'Standard Tourist Onboarding',
                description: 'Standard onboarding flow for tourists',
                steps: [
                    {
                        stepId: 'registration',
                        name: 'User Registration',
                        description: 'Basic user registration with email and password',
                        required: true,
                        order: 1,
                        estimatedTime: 5 // minutes
                    },
                    {
                        stepId: 'email_verification',
                        name: 'Email Verification',
                        description: 'Verify email address with OTP',
                        required: true,
                        order: 2,
                        estimatedTime: 2
                    },
                    {
                        stepId: 'phone_verification',
                        name: 'Phone Verification',
                        description: 'Verify phone number with SMS OTP',
                        required: true,
                        order: 3,
                        estimatedTime: 2
                    },
                    {
                        stepId: 'kyc_upload',
                        name: 'KYC Document Upload',
                        description: 'Upload identity documents (Aadhaar/Passport)',
                        required: true,
                        order: 4,
                        estimatedTime: 10
                    },
                    {
                        stepId: 'kyc_verification',
                        name: 'KYC Verification',
                        description: 'Manual or automated KYC verification',
                        required: true,
                        order: 5,
                        estimatedTime: 1440 // 24 hours
                    },
                    {
                        stepId: 'profile_completion',
                        name: 'Profile Completion',
                        description: 'Complete tourist profile with preferences',
                        required: false,
                        order: 6,
                        estimatedTime: 10
                    },
                    {
                        stepId: 'blockchain_id_generation',
                        name: 'Blockchain ID Generation',
                        description: 'Generate blockchain-based tourist ID',
                        required: true,
                        order: 7,
                        estimatedTime: 1
                    }
                ],
                isActive: true,
                createdAt: new Date()
            }
        ];

        for (const workflow of defaultWorkflows) {
            await ctx.stub.putState(workflow.workflowId, Buffer.from(JSON.stringify(workflow)));
        }

        console.info('============= END : Initialize Onboarding Workflow Ledger ===========');
    }

    async startOnboarding(ctx, userId, workflowId, entryPoint, userMetadata) {
        console.info('============= START : Start Onboarding ===========');

        // Check if onboarding already exists for this user
        const existingOnboarding = await this.getOnboardingByUser(ctx, userId).catch(() => null);
        if (existingOnboarding) {
            const data = JSON.parse(existingOnboarding);
            if (data.status !== 'completed' && data.status !== 'abandoned') {
                throw new Error(`Onboarding already in progress for user ${userId}`);
            }
        }

        // Get workflow template
        const workflowAsBytes = await ctx.stub.getState(workflowId);
        if (!workflowAsBytes || workflowAsBytes.length === 0) {
            throw new Error(`Workflow ${workflowId} does not exist`);
        }
        const workflow = JSON.parse(workflowAsBytes.toString());

        const onboardingId = `ONBOARD_${userId}_${Date.now()}`;
        const onboarding = {
            onboardingId,
            userId,
            workflowId,
            entryPoint, // 'airport', 'hotel', 'border', 'online'
            userMetadata: JSON.parse(userMetadata),
            status: 'in_progress',
            currentStep: workflow.steps[0].stepId,
            currentStepOrder: 1,
            completedSteps: [],
            stepStatuses: {},
            stepData: {},
            estimatedCompletionTime: this.calculateEstimatedTime(workflow.steps),
            actualStartTime: new Date(),
            estimatedEndTime: null,
            actualEndTime: null,
            blockers: [],
            notes: [],
            assignedOfficer: null,
            priority: 'normal', // 'low', 'normal', 'high', 'urgent'
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Initialize step statuses
        workflow.steps.forEach(step => {
            onboarding.stepStatuses[step.stepId] = 'pending';
        });

        // Mark first step as in_progress
        onboarding.stepStatuses[workflow.steps[0].stepId] = 'in_progress';

        await ctx.stub.putState(onboardingId, Buffer.from(JSON.stringify(onboarding)));
        
        // Create user index for quick lookup
        await ctx.stub.putState(`ONBOARD_USER_${userId}`, Buffer.from(onboardingId));

        // Emit onboarding started event
        ctx.stub.setEvent('OnboardingStarted', Buffer.from(JSON.stringify({
            onboardingId,
            userId,
            workflowId,
            entryPoint,
            timestamp: new Date()
        })));

        console.info('============= END : Start Onboarding ===========');
        return JSON.stringify(onboarding);
    }

    async completeStep(ctx, onboardingId, stepId, stepData, completedBy) {
        console.info('============= START : Complete Step ===========');

        const onboardingAsBytes = await ctx.stub.getState(onboardingId);
        if (!onboardingAsBytes || onboardingAsBytes.length === 0) {
            throw new Error(`Onboarding ${onboardingId} does not exist`);
        }

        const onboarding = JSON.parse(onboardingAsBytes.toString());
        
        // Validate step completion
        if (onboarding.stepStatuses[stepId] === 'completed') {
            throw new Error(`Step ${stepId} is already completed`);
        }

        if (onboarding.currentStep !== stepId) {
            throw new Error(`Cannot complete step ${stepId}. Current step is ${onboarding.currentStep}`);
        }

        // Mark step as completed
        onboarding.stepStatuses[stepId] = 'completed';
        onboarding.completedSteps.push({
            stepId,
            completedBy,
            completedAt: new Date(),
            stepData: JSON.parse(stepData)
        });
        onboarding.stepData[stepId] = JSON.parse(stepData);

        // Get workflow to determine next step
        const workflowAsBytes = await ctx.stub.getState(onboarding.workflowId);
        const workflow = JSON.parse(workflowAsBytes.toString());
        
        const currentStepIndex = workflow.steps.findIndex(step => step.stepId === stepId);
        const nextStep = workflow.steps[currentStepIndex + 1];

        if (nextStep) {
            // Move to next step
            onboarding.currentStep = nextStep.stepId;
            onboarding.currentStepOrder = nextStep.order;
            onboarding.stepStatuses[nextStep.stepId] = 'in_progress';
        } else {
            // All steps completed
            onboarding.status = 'completed';
            onboarding.actualEndTime = new Date();
            onboarding.currentStep = null;
            
            // Generate blockchain ID if onboarding is completed
            if (stepId === 'kyc_verification') {
                await this.generateBlockchainID(ctx, onboarding.userId, onboardingId);
            }
        }

        onboarding.updatedAt = new Date();
        await ctx.stub.putState(onboardingId, Buffer.from(JSON.stringify(onboarding)));

        // Emit step completed event
        ctx.stub.setEvent('OnboardingStepCompleted', Buffer.from(JSON.stringify({
            onboardingId,
            userId: onboarding.userId,
            stepId,
            completedBy,
            nextStep: nextStep ? nextStep.stepId : null,
            onboardingCompleted: onboarding.status === 'completed',
            timestamp: new Date()
        })));

        console.info('============= END : Complete Step ===========');
        return JSON.stringify(onboarding);
    }

    async addStepNote(ctx, onboardingId, stepId, note, addedBy) {
        console.info('============= START : Add Step Note ===========');

        const onboardingAsBytes = await ctx.stub.getState(onboardingId);
        if (!onboardingAsBytes || onboardingAsBytes.length === 0) {
            throw new Error(`Onboarding ${onboardingId} does not exist`);
        }

        const onboarding = JSON.parse(onboardingAsBytes.toString());
        
        const noteEntry = {
            noteId: `NOTE_${Date.now()}`,
            stepId,
            note,
            addedBy,
            timestamp: new Date()
        };

        onboarding.notes.push(noteEntry);
        onboarding.updatedAt = new Date();

        await ctx.stub.putState(onboardingId, Buffer.from(JSON.stringify(onboarding)));

        console.info('============= END : Add Step Note ===========');
        return JSON.stringify(noteEntry);
    }

    async addBlocker(ctx, onboardingId, blockerId, description, severity, assignedTo) {
        console.info('============= START : Add Blocker ===========');

        const onboardingAsBytes = await ctx.stub.getState(onboardingId);
        if (!onboardingAsBytes || onboardingAsBytes.length === 0) {
            throw new Error(`Onboarding ${onboardingId} does not exist`);
        }

        const onboarding = JSON.parse(onboardingAsBytes.toString());
        
        const blocker = {
            blockerId,
            description,
            severity, // 'low', 'medium', 'high', 'critical'
            assignedTo,
            status: 'open',
            createdAt: new Date(),
            resolvedAt: null,
            resolution: null
        };

        onboarding.blockers.push(blocker);
        onboarding.status = 'blocked';
        onboarding.updatedAt = new Date();

        await ctx.stub.putState(onboardingId, Buffer.from(JSON.stringify(onboarding)));

        // Emit blocker added event
        ctx.stub.setEvent('OnboardingBlocked', Buffer.from(JSON.stringify({
            onboardingId,
            userId: onboarding.userId,
            blockerId,
            severity,
            timestamp: new Date()
        })));

        console.info('============= END : Add Blocker ===========');
        return JSON.stringify(onboarding);
    }

    async resolveBlocker(ctx, onboardingId, blockerId, resolution, resolvedBy) {
        console.info('============= START : Resolve Blocker ===========');

        const onboardingAsBytes = await ctx.stub.getState(onboardingId);
        if (!onboardingAsBytes || onboardingAsBytes.length === 0) {
            throw new Error(`Onboarding ${onboardingId} does not exist`);
        }

        const onboarding = JSON.parse(onboardingAsBytes.toString());
        
        const blockerIndex = onboarding.blockers.findIndex(b => b.blockerId === blockerId);
        if (blockerIndex === -1) {
            throw new Error(`Blocker ${blockerId} not found`);
        }

        onboarding.blockers[blockerIndex].status = 'resolved';
        onboarding.blockers[blockerIndex].resolution = resolution;
        onboarding.blockers[blockerIndex].resolvedAt = new Date();
        onboarding.blockers[blockerIndex].resolvedBy = resolvedBy;

        // Check if all blockers are resolved
        const openBlockers = onboarding.blockers.filter(b => b.status === 'open');
        if (openBlockers.length === 0) {
            onboarding.status = 'in_progress';
        }

        onboarding.updatedAt = new Date();
        await ctx.stub.putState(onboardingId, Buffer.from(JSON.stringify(onboarding)));

        // Emit blocker resolved event
        ctx.stub.setEvent('OnboardingBlockerResolved', Buffer.from(JSON.stringify({
            onboardingId,
            userId: onboarding.userId,
            blockerId,
            resolvedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Resolve Blocker ===========');
        return JSON.stringify(onboarding);
    }

    async generateBlockchainID(ctx, userId, onboardingId) {
        console.info('============= START : Generate Blockchain ID ===========');

        // This would interact with the tourist-identity chaincode
        // For now, we'll create a blockchain ID record
        const blockchainId = `BCID_${userId}_${Date.now()}`;
        const blockchainIdRecord = {
            blockchainId,
            userId,
            onboardingId,
            status: 'active',
            generatedAt: new Date(),
            expiresAt: null, // Set based on visa/stay duration
            qrCode: this.generateQRCode(blockchainId),
            verificationHash: this.generateVerificationHash(userId, blockchainId)
        };

        await ctx.stub.putState(blockchainId, Buffer.from(JSON.stringify(blockchainIdRecord)));

        // Emit blockchain ID generated event
        ctx.stub.setEvent('BlockchainIDGenerated', Buffer.from(JSON.stringify({
            blockchainId,
            userId,
            onboardingId,
            timestamp: new Date()
        })));

        console.info('============= END : Generate Blockchain ID ===========');
        return JSON.stringify(blockchainIdRecord);
    }

    async getOnboarding(ctx, onboardingId) {
        const onboardingAsBytes = await ctx.stub.getState(onboardingId);
        if (!onboardingAsBytes || onboardingAsBytes.length === 0) {
            throw new Error(`Onboarding ${onboardingId} does not exist`);
        }
        return onboardingAsBytes.toString();
    }

    async getOnboardingByUser(ctx, userId) {
        const onboardingIdAsBytes = await ctx.stub.getState(`ONBOARD_USER_${userId}`);
        if (!onboardingIdAsBytes || onboardingIdAsBytes.length === 0) {
            throw new Error(`No onboarding found for user ${userId}`);
        }
        
        const onboardingId = onboardingIdAsBytes.toString();
        return await this.getOnboarding(ctx, onboardingId);
    }

    async getOnboardingsByStatus(ctx, status) {
        const queryString = {
            selector: {
                status: status
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                const Record = JSON.parse(res.value.value.toString('utf8'));
                if (Record.onboardingId) { // Only return onboarding records
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }

    async getOnboardingsByEntryPoint(ctx, entryPoint) {
        const queryString = {
            selector: {
                entryPoint: entryPoint,
                status: {
                    $ne: 'completed'
                }
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                const Record = JSON.parse(res.value.value.toString('utf8'));
                if (Record.onboardingId) { // Only return onboarding records
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }

    async getOnboardingAnalytics(ctx, startDate, endDate) {
        const queryString = {
            selector: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const onboardings = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const onboarding = JSON.parse(res.value.value.toString('utf8'));
                if (onboarding.onboardingId) { // Only return onboarding records
                    onboardings.push(onboarding);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        // Calculate analytics
        const analytics = {
            totalOnboardings: onboardings.length,
            onboardingsByStatus: {},
            onboardingsByEntryPoint: {},
            completionRate: 0,
            averageCompletionTime: 0,
            bottleneckSteps: {},
            blockerStats: {
                totalBlockers: 0,
                blockersBySeverity: {},
                averageResolutionTime: 0
            }
        };

        let completedOnboardings = 0;
        let totalCompletionTime = 0;
        let totalBlockers = 0;

        onboardings.forEach(onboarding => {
            // Count by status
            analytics.onboardingsByStatus[onboarding.status] = 
                (analytics.onboardingsByStatus[onboarding.status] || 0) + 1;

            // Count by entry point
            analytics.onboardingsByEntryPoint[onboarding.entryPoint] = 
                (analytics.onboardingsByEntryPoint[onboarding.entryPoint] || 0) + 1;

            // Completion metrics
            if (onboarding.status === 'completed') {
                completedOnboardings++;
                if (onboarding.actualEndTime && onboarding.actualStartTime) {
                    const completionTime = new Date(onboarding.actualEndTime) - new Date(onboarding.actualStartTime);
                    totalCompletionTime += completionTime;
                }
            }

            // Blocker stats
            totalBlockers += onboarding.blockers.length;
            onboarding.blockers.forEach(blocker => {
                analytics.blockerStats.blockersBySeverity[blocker.severity] = 
                    (analytics.blockerStats.blockersBySeverity[blocker.severity] || 0) + 1;
            });
        });

        analytics.completionRate = onboardings.length > 0 ? 
            (completedOnboardings / onboardings.length * 100) : 0;
        analytics.averageCompletionTime = completedOnboardings > 0 ? 
            (totalCompletionTime / completedOnboardings) / (1000 * 60 * 60) : 0; // in hours
        analytics.blockerStats.totalBlockers = totalBlockers;

        return JSON.stringify(analytics);
    }

    async updateWorkflow(ctx, workflowId, workflowData, updatedBy) {
        console.info('============= START : Update Workflow ===========');

        const workflowAsBytes = await ctx.stub.getState(workflowId);
        if (!workflowAsBytes || workflowAsBytes.length === 0) {
            throw new Error(`Workflow ${workflowId} does not exist`);
        }

        const workflow = JSON.parse(workflowAsBytes.toString());
        const updates = JSON.parse(workflowData);

        // Update allowed fields
        if (updates.name) workflow.name = updates.name;
        if (updates.description) workflow.description = updates.description;
        if (updates.steps) workflow.steps = updates.steps;
        if (updates.isActive !== undefined) workflow.isActive = updates.isActive;

        workflow.updatedAt = new Date();
        workflow.updatedBy = updatedBy;

        await ctx.stub.putState(workflowId, Buffer.from(JSON.stringify(workflow)));

        console.info('============= END : Update Workflow ===========');
        return JSON.stringify(workflow);
    }

    // Helper functions
    calculateEstimatedTime(steps) {
        return steps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
    }

    generateQRCode(blockchainId) {
        // In a real implementation, this would generate an actual QR code
        return `QR_${blockchainId}`;
    }

    generateVerificationHash(userId, blockchainId) {
        // In a real implementation, this would generate a cryptographic hash
        return `HASH_${userId}_${blockchainId}`;
    }

    async getWorkflow(ctx, workflowId) {
        const workflowAsBytes = await ctx.stub.getState(workflowId);
        if (!workflowAsBytes || workflowAsBytes.length === 0) {
            throw new Error(`Workflow ${workflowId} does not exist`);
        }
        return workflowAsBytes.toString();
    }

    async getAllWorkflows(ctx) {
        const queryString = {
            selector: {
                workflowId: {
                    $regex: "^TOURIST"
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                const Record = JSON.parse(res.value.value.toString('utf8'));
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }
}

module.exports = OnboardingWorkflowContract;