'use strict';

const { Contract } = require('fabric-contract-api');

class TouristIdentityContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // Initialize with any default data if needed
        console.info('============= END : Initialize Ledger ===========');
    }

    async createTouristIdentity(ctx, touristId, kycData, itinerary, emergencyContacts, validFrom, validTo) {
        console.info('============= START : Create Tourist Identity ===========');

        const exists = await this.touristIdentityExists(ctx, touristId);
        if (exists) {
            throw new Error(`Tourist identity ${touristId} already exists`);
        }

        const touristIdentity = {
            touristId,
            kycData: JSON.parse(kycData),
            itinerary: JSON.parse(itinerary),
            emergencyContacts: JSON.parse(emergencyContacts),
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            safetyScore: 75, // Default safety score
            riskLevel: 'medium',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(touristId, Buffer.from(JSON.stringify(touristIdentity)));
        console.info('============= END : Create Tourist Identity ===========');
        
        // Emit event
        ctx.stub.setEvent('TouristIdentityCreated', Buffer.from(JSON.stringify({
            touristId,
            timestamp: new Date()
        })));

        return JSON.stringify(touristIdentity);
    }

    async getTouristIdentity(ctx, touristId) {
        const touristIdentityAsBytes = await ctx.stub.getState(touristId);
        if (!touristIdentityAsBytes || touristIdentityAsBytes.length === 0) {
            throw new Error(`Tourist identity ${touristId} does not exist`);
        }
        console.log(touristIdentityAsBytes.toString());
        return touristIdentityAsBytes.toString();
    }

    async updateSafetyScore(ctx, touristId, newScore, riskLevel) {
        console.info('============= START : Update Safety Score ===========');

        const touristIdentityAsBytes = await ctx.stub.getState(touristId);
        if (!touristIdentityAsBytes || touristIdentityAsBytes.length === 0) {
            throw new Error(`Tourist identity ${touristId} does not exist`);
        }

        const touristIdentity = JSON.parse(touristIdentityAsBytes.toString());
        const oldScore = touristIdentity.safetyScore;
        
        touristIdentity.safetyScore = parseInt(newScore);
        touristIdentity.riskLevel = riskLevel;
        touristIdentity.updatedAt = new Date();

        await ctx.stub.putState(touristId, Buffer.from(JSON.stringify(touristIdentity)));
        
        // Emit event for safety score change
        ctx.stub.setEvent('SafetyScoreUpdated', Buffer.from(JSON.stringify({
            touristId,
            oldScore,
            newScore: parseInt(newScore),
            riskLevel,
            timestamp: new Date()
        })));

        console.info('============= END : Update Safety Score ===========');
        return JSON.stringify(touristIdentity);
    }

    async validateTouristIdentity(ctx, touristId) {
        const touristIdentityAsBytes = await ctx.stub.getState(touristId);
        if (!touristIdentityAsBytes || touristIdentityAsBytes.length === 0) {
            return JSON.stringify({ valid: false, reason: 'Tourist identity not found' });
        }

        const touristIdentity = JSON.parse(touristIdentityAsBytes.toString());
        const currentDate = new Date();
        const validFrom = new Date(touristIdentity.validFrom);
        const validTo = new Date(touristIdentity.validTo);

        if (currentDate < validFrom) {
            return JSON.stringify({ valid: false, reason: 'Identity not yet valid' });
        }

        if (currentDate > validTo) {
            return JSON.stringify({ valid: false, reason: 'Identity expired' });
        }

        if (touristIdentity.status !== 'active') {
            return JSON.stringify({ valid: false, reason: 'Identity is not active' });
        }

        return JSON.stringify({ 
            valid: true, 
            touristId,
            safetyScore: touristIdentity.safetyScore,
            riskLevel: touristIdentity.riskLevel
        });
    }

    async expireTouristIdentity(ctx, touristId) {
        console.info('============= START : Expire Tourist Identity ===========');

        const touristIdentityAsBytes = await ctx.stub.getState(touristId);
        if (!touristIdentityAsBytes || touristIdentityAsBytes.length === 0) {
            throw new Error(`Tourist identity ${touristId} does not exist`);
        }

        const touristIdentity = JSON.parse(touristIdentityAsBytes.toString());
        touristIdentity.status = 'expired';
        touristIdentity.updatedAt = new Date();

        await ctx.stub.putState(touristId, Buffer.from(JSON.stringify(touristIdentity)));
        
        // Emit event
        ctx.stub.setEvent('TouristIdentityExpired', Buffer.from(JSON.stringify({
            touristId,
            timestamp: new Date()
        })));

        console.info('============= END : Expire Tourist Identity ===========');
        return JSON.stringify(touristIdentity);
    }

    async getAllTouristIdentities(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async getTouristsByRiskLevel(ctx, riskLevel) {
        const queryString = {
            selector: {
                riskLevel: riskLevel,
                status: 'active'
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

    async touristIdentityExists(ctx, touristId) {
        const touristIdentityAsBytes = await ctx.stub.getState(touristId);
        return touristIdentityAsBytes && touristIdentityAsBytes.length > 0;
    }

    async getTouristHistory(ctx, touristId) {
        const resultsIterator = await ctx.stub.getHistoryForKey(touristId);
        const results = [];
        
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                results.push({
                    TxId: res.value.tx_id,
                    Timestamp: res.value.timestamp,
                    IsDelete: res.value.is_delete,
                    Value: obj
                });
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        
        return JSON.stringify(results);
    }
}

module.exports = TouristIdentityContract;