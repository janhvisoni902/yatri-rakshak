'use strict';

const { Contract } = require('fabric-contract-api');

class UserAuthenticationContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize User Authentication Ledger ===========');
        // Initialize with default admin user if needed
        console.info('============= END : Initialize User Authentication Ledger ===========');
    }

    async registerUser(ctx, email, phoneNumber, passwordHash, userType, kycData) {
        console.info('============= START : Register User ===========');

        // Check if user already exists
        const existingUser = await this.getUserByEmail(ctx, email).catch(() => null);
        if (existingUser) {
            throw new Error(`User with email ${email} already exists`);
        }

        const userId = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            userId,
            email,
            phoneNumber,
            passwordHash, // Should be hashed on client side
            userType, // 'tourist', 'authority', 'admin'
            kycData: JSON.parse(kycData),
            status: 'pending_verification',
            emailVerified: false,
            phoneVerified: false,
            kycVerified: false,
            registrationStep: 'basic_info',
            loginAttempts: 0,
            lastLogin: null,
            accountLocked: false,
            lockoutUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        
        // Create email index for quick lookup
        await ctx.stub.putState(`EMAIL_${email}`, Buffer.from(userId));

        // Emit user registration event
        ctx.stub.setEvent('UserRegistered', Buffer.from(JSON.stringify({
            userId,
            email,
            userType,
            timestamp: new Date()
        })));

        console.info('============= END : Register User ===========');
        return JSON.stringify({ userId, email, status: user.status });
    }

    async authenticateUser(ctx, email, passwordHash) {
        console.info('============= START : Authenticate User ===========');

        try {
            const user = await this.getUserByEmail(ctx, email);
            const userData = JSON.parse(user);

            // Check if account is locked
            if (userData.accountLocked && userData.lockoutUntil && new Date(userData.lockoutUntil) > new Date()) {
                throw new Error('Account is temporarily locked due to multiple failed login attempts');
            }

            // Verify password
            if (userData.passwordHash !== passwordHash) {
                // Increment login attempts
                userData.loginAttempts = (userData.loginAttempts || 0) + 1;
                
                // Lock account after 5 failed attempts
                if (userData.loginAttempts >= 5) {
                    userData.accountLocked = true;
                    userData.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                }
                
                userData.updatedAt = new Date();
                await ctx.stub.putState(userData.userId, Buffer.from(JSON.stringify(userData)));
                
                throw new Error('Invalid credentials');
            }

            // Reset login attempts on successful login
            userData.loginAttempts = 0;
            userData.accountLocked = false;
            userData.lockoutUntil = null;
            userData.lastLogin = new Date();
            userData.updatedAt = new Date();

            await ctx.stub.putState(userData.userId, Buffer.from(JSON.stringify(userData)));

            // Create login session
            const sessionId = `SESSION_${userData.userId}_${Date.now()}`;
            const session = {
                sessionId,
                userId: userData.userId,
                email: userData.email,
                userType: userData.userType,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                isActive: true
            };

            await ctx.stub.putState(sessionId, Buffer.from(JSON.stringify(session)));

            // Emit login event
            ctx.stub.setEvent('UserLoggedIn', Buffer.from(JSON.stringify({
                userId: userData.userId,
                email: userData.email,
                sessionId,
                timestamp: new Date()
            })));

            console.info('============= END : Authenticate User ===========');
            return JSON.stringify({
                success: true,
                sessionId,
                userId: userData.userId,
                email: userData.email,
                userType: userData.userType,
                status: userData.status
            });

        } catch (error) {
            console.error('Authentication failed:', error.message);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async validateSession(ctx, sessionId) {
        const sessionAsBytes = await ctx.stub.getState(sessionId);
        if (!sessionAsBytes || sessionAsBytes.length === 0) {
            throw new Error('Invalid session');
        }

        const session = JSON.parse(sessionAsBytes.toString());
        
        // Check if session is expired
        if (new Date(session.expiresAt) < new Date() || !session.isActive) {
            throw new Error('Session expired');
        }

        // Get user data
        const user = await this.getUser(ctx, session.userId);
        const userData = JSON.parse(user);

        return JSON.stringify({
            valid: true,
            userId: userData.userId,
            email: userData.email,
            userType: userData.userType,
            status: userData.status
        });
    }

    async logout(ctx, sessionId) {
        console.info('============= START : Logout User ===========');

        const sessionAsBytes = await ctx.stub.getState(sessionId);
        if (!sessionAsBytes || sessionAsBytes.length === 0) {
            throw new Error('Session not found');
        }

        const session = JSON.parse(sessionAsBytes.toString());
        session.isActive = false;
        session.loggedOutAt = new Date();

        await ctx.stub.putState(sessionId, Buffer.from(JSON.stringify(session)));

        // Emit logout event
        ctx.stub.setEvent('UserLoggedOut', Buffer.from(JSON.stringify({
            userId: session.userId,
            sessionId,
            timestamp: new Date()
        })));

        console.info('============= END : Logout User ===========');
        return JSON.stringify({ success: true, message: 'Logged out successfully' });
    }

    async updateUserStatus(ctx, userId, newStatus, updatedBy) {
        console.info('============= START : Update User Status ===========');

        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        const oldStatus = user.status;
        
        user.status = newStatus;
        user.updatedAt = new Date();
        user.statusUpdatedBy = updatedBy;

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        // Emit status update event
        ctx.stub.setEvent('UserStatusUpdated', Buffer.from(JSON.stringify({
            userId,
            oldStatus,
            newStatus,
            updatedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Update User Status ===========');
        return JSON.stringify(user);
    }

    async verifyEmail(ctx, userId, verificationCode) {
        console.info('============= START : Verify Email ===========');

        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        
        // In a real implementation, you would verify the code
        // For now, we'll just mark as verified
        user.emailVerified = true;
        user.updatedAt = new Date();

        // Update registration step
        if (user.registrationStep === 'basic_info') {
            user.registrationStep = 'email_verified';
        }

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        // Emit email verified event
        ctx.stub.setEvent('EmailVerified', Buffer.from(JSON.stringify({
            userId,
            email: user.email,
            timestamp: new Date()
        })));

        console.info('============= END : Verify Email ===========');
        return JSON.stringify({ success: true, message: 'Email verified successfully' });
    }

    async verifyPhone(ctx, userId, verificationCode) {
        console.info('============= START : Verify Phone ===========');

        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        
        // In a real implementation, you would verify the OTP
        user.phoneVerified = true;
        user.updatedAt = new Date();

        // Update registration step
        if (user.registrationStep === 'email_verified') {
            user.registrationStep = 'phone_verified';
        }

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        // Emit phone verified event
        ctx.stub.setEvent('PhoneVerified', Buffer.from(JSON.stringify({
            userId,
            phoneNumber: user.phoneNumber,
            timestamp: new Date()
        })));

        console.info('============= END : Verify Phone ===========');
        return JSON.stringify({ success: true, message: 'Phone verified successfully' });
    }

    async updateKYCStatus(ctx, userId, kycStatus, verifiedBy, kycDocuments) {
        console.info('============= START : Update KYC Status ===========');

        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        user.kycVerified = kycStatus === 'verified';
        user.kycStatus = kycStatus; // 'pending', 'verified', 'rejected'
        user.kycVerifiedBy = verifiedBy;
        user.kycDocuments = JSON.parse(kycDocuments || '[]');
        user.updatedAt = new Date();

        // Update registration step and overall status
        if (kycStatus === 'verified') {
            user.registrationStep = 'kyc_verified';
            if (user.emailVerified && user.phoneVerified) {
                user.status = 'active';
                user.registrationStep = 'completed';
            }
        }

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        // Emit KYC status update event
        ctx.stub.setEvent('KYCStatusUpdated', Buffer.from(JSON.stringify({
            userId,
            kycStatus,
            verifiedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Update KYC Status ===========');
        return JSON.stringify(user);
    }

    async resetPassword(ctx, email, newPasswordHash, resetToken) {
        console.info('============= START : Reset Password ===========');

        try {
            const user = await this.getUserByEmail(ctx, email);
            const userData = JSON.parse(user);

            // In a real implementation, you would verify the reset token
            userData.passwordHash = newPasswordHash;
            userData.loginAttempts = 0;
            userData.accountLocked = false;
            userData.lockoutUntil = null;
            userData.updatedAt = new Date();

            await ctx.stub.putState(userData.userId, Buffer.from(JSON.stringify(userData)));

            // Emit password reset event
            ctx.stub.setEvent('PasswordReset', Buffer.from(JSON.stringify({
                userId: userData.userId,
                email,
                timestamp: new Date()
            })));

            console.info('============= END : Reset Password ===========');
            return JSON.stringify({ success: true, message: 'Password reset successfully' });

        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    async updateUserProfile(ctx, userId, profileData) {
        console.info('============= START : Update User Profile ===========');

        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        const profile = JSON.parse(profileData);

        // Update allowed profile fields
        if (profile.firstName) user.firstName = profile.firstName;
        if (profile.lastName) user.lastName = profile.lastName;
        if (profile.dateOfBirth) user.dateOfBirth = profile.dateOfBirth;
        if (profile.nationality) user.nationality = profile.nationality;
        if (profile.emergencyContacts) user.emergencyContacts = profile.emergencyContacts;
        if (profile.preferences) user.preferences = profile.preferences;

        user.updatedAt = new Date();

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        // Emit profile update event
        ctx.stub.setEvent('UserProfileUpdated', Buffer.from(JSON.stringify({
            userId,
            updatedFields: Object.keys(profile),
            timestamp: new Date()
        })));

        console.info('============= END : Update User Profile ===========');
        return JSON.stringify(user);
    }

    async getUser(ctx, userId) {
        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }
        return userAsBytes.toString();
    }

    async getUserByEmail(ctx, email) {
        const userIdAsBytes = await ctx.stub.getState(`EMAIL_${email}`);
        if (!userIdAsBytes || userIdAsBytes.length === 0) {
            throw new Error(`User with email ${email} does not exist`);
        }
        
        const userId = userIdAsBytes.toString();
        return await this.getUser(ctx, userId);
    }

    async getUsersByStatus(ctx, status) {
        const queryString = {
            selector: {
                status: status,
                userType: 'tourist'
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
                if (Record.userId) { // Only return user records
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

    async getUsersByType(ctx, userType) {
        const queryString = {
            selector: {
                userType: userType
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
                if (Record.userId) { // Only return user records
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

    async getActiveSessions(ctx, userId) {
        const queryString = {
            selector: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    $gte: new Date().toISOString()
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const session = JSON.parse(res.value.value.toString('utf8'));
                if (session.sessionId) { // Only return session records
                    allResults.push(session);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }

    async getUserAnalytics(ctx, startDate, endDate) {
        const queryString = {
            selector: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const users = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const user = JSON.parse(res.value.value.toString('utf8'));
                if (user.userId) { // Only return user records
                    users.push(user);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        // Calculate analytics
        const analytics = {
            totalUsers: users.length,
            usersByType: {},
            usersByStatus: {},
            registrationsByDay: {},
            verificationStats: {
                emailVerified: 0,
                phoneVerified: 0,
                kycVerified: 0,
                fullyVerified: 0
            }
        };

        users.forEach(user => {
            // Count by type
            analytics.usersByType[user.userType] = 
                (analytics.usersByType[user.userType] || 0) + 1;

            // Count by status
            analytics.usersByStatus[user.status] = 
                (analytics.usersByStatus[user.status] || 0) + 1;

            // Count registrations by day
            const day = new Date(user.createdAt).toISOString().split('T')[0];
            analytics.registrationsByDay[day] = 
                (analytics.registrationsByDay[day] || 0) + 1;

            // Verification stats
            if (user.emailVerified) analytics.verificationStats.emailVerified++;
            if (user.phoneVerified) analytics.verificationStats.phoneVerified++;
            if (user.kycVerified) analytics.verificationStats.kycVerified++;
            if (user.emailVerified && user.phoneVerified && user.kycVerified) {
                analytics.verificationStats.fullyVerified++;
            }
        });

        return JSON.stringify(analytics);
    }
}

module.exports = UserAuthenticationContract;