'use strict';

const { Contract } = require('fabric-contract-api');

class SafetyScoringContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Safety Scoring Ledger ===========');
        
        // Initialize with default safety parameters
        const defaultParameters = {
            parameterId: 'DEFAULT_PARAMS',
            baseScore: 75,
            locationRiskWeights: {
                'safe': 1.0,
                'medium-risk': 0.8,
                'high-risk': 0.5,
                'restricted': 0.2
            },
            timeFactors: {
                'day': 1.0,
                'evening': 0.9,
                'night': 0.7,
                'late-night': 0.5
            },
            weatherFactors: {
                'clear': 1.0,
                'cloudy': 0.95,
                'rain': 0.8,
                'storm': 0.5,
                'extreme': 0.3
            },
            groupSizeFactors: {
                'solo': 0.7,
                'pair': 1.0,
                'small-group': 1.1,
                'large-group': 1.2
            },
            experienceFactors: {
                'first-time': 0.8,
                'experienced': 1.0,
                'expert': 1.2
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState('DEFAULT_PARAMS', Buffer.from(JSON.stringify(defaultParameters)));
        console.info('============= END : Initialize Safety Scoring Ledger ===========');
    }

    async calculateSafetyScore(ctx, touristId, locationData, contextData) {
        console.info('============= START : Calculate Safety Score ===========');

        const location = JSON.parse(locationData);
        const context = JSON.parse(contextData);
        
        // Get scoring parameters
        const parametersAsBytes = await ctx.stub.getState('DEFAULT_PARAMS');
        const parameters = JSON.parse(parametersAsBytes.toString());

        let score = parameters.baseScore;

        // Apply location risk factor
        const locationRiskFactor = parameters.locationRiskWeights[location.riskLevel] || 0.8;
        score *= locationRiskFactor;

        // Apply time factor
        const timeFactor = parameters.timeFactors[context.timeOfDay] || 0.8;
        score *= timeFactor;

        // Apply weather factor
        const weatherFactor = parameters.weatherFactors[context.weather] || 0.9;
        score *= weatherFactor;

        // Apply group size factor
        const groupSizeFactor = parameters.groupSizeFactors[context.groupSize] || 1.0;
        score *= groupSizeFactor;

        // Apply experience factor
        const experienceFactor = parameters.experienceFactors[context.experience] || 1.0;
        score *= experienceFactor;

        // Apply additional contextual factors
        if (context.hasEmergencyContacts) score *= 1.1;
        if (context.hasLocalGuide) score *= 1.15;
        if (context.hasFirstAidKit) score *= 1.05;
        if (context.hasCommunicationDevice) score *= 1.1;

        // Apply penalty factors
        if (context.isAlone && context.timeOfDay === 'night') score *= 0.7;
        if (context.isOffTrail) score *= 0.8;
        if (context.hasRecentIncidents) score *= 0.6;

        // Ensure score is within bounds (0-100)
        score = Math.max(0, Math.min(100, Math.round(score)));

        // Determine risk level based on score
        let riskLevel;
        if (score >= 80) riskLevel = 'low';
        else if (score >= 60) riskLevel = 'medium';
        else if (score >= 40) riskLevel = 'high';
        else riskLevel = 'critical';

        const safetyScoreRecord = {
            scoreId: `SCORE_${touristId}_${Date.now()}`,
            touristId,
            score,
            riskLevel,
            location,
            context,
            factors: {
                locationRiskFactor,
                timeFactor,
                weatherFactor,
                groupSizeFactor,
                experienceFactor
            },
            calculatedAt: new Date(),
            validUntil: new Date(Date.now() + 60 * 60 * 1000) // Valid for 1 hour
        };

        await ctx.stub.putState(safetyScoreRecord.scoreId, Buffer.from(JSON.stringify(safetyScoreRecord)));

        // Emit safety score calculated event
        ctx.stub.setEvent('SafetyScoreCalculated', Buffer.from(JSON.stringify({
            touristId,
            score,
            riskLevel,
            timestamp: new Date()
        })));

        console.info('============= END : Calculate Safety Score ===========');
        return JSON.stringify(safetyScoreRecord);
    }

    async getCurrentSafetyScore(ctx, touristId) {
        const queryString = {
            selector: {
                touristId: touristId,
                validUntil: {
                    $gte: new Date().toISOString()
                }
            },
            sort: [{ calculatedAt: 'desc' }],
            limit: 1
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const result = await iterator.next();
        
        if (result.value && result.value.value.toString()) {
            const Record = JSON.parse(result.value.value.toString('utf8'));
            await iterator.close();
            return JSON.stringify(Record);
        }
        
        await iterator.close();
        throw new Error(`No current safety score found for tourist ${touristId}`);
    }

    async updateSafetyParameters(ctx, newParameters, updatedBy) {
        console.info('============= START : Update Safety Parameters ===========');

        const parametersAsBytes = await ctx.stub.getState('DEFAULT_PARAMS');
        const currentParameters = JSON.parse(parametersAsBytes.toString());
        
        const updatedParameters = {
            ...currentParameters,
            ...JSON.parse(newParameters),
            updatedAt: new Date(),
            updatedBy
        };

        await ctx.stub.putState('DEFAULT_PARAMS', Buffer.from(JSON.stringify(updatedParameters)));

        // Emit parameters updated event
        ctx.stub.setEvent('SafetyParametersUpdated', Buffer.from(JSON.stringify({
            updatedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Update Safety Parameters ===========');
        return JSON.stringify(updatedParameters);
    }

    async getSafetyScoreHistory(ctx, touristId, startDate, endDate) {
        const queryString = {
            selector: {
                touristId: touristId,
                calculatedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            sort: [{ calculatedAt: 'desc' }]
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

    async createRiskAlert(ctx, touristId, alertType, severity, message, location, contextData) {
        console.info('============= START : Create Risk Alert ===========');

        const alertId = `ALERT_${touristId}_${Date.now()}`;
        const riskAlert = {
            alertId,
            touristId,
            alertType, // 'low-score', 'zone-entry', 'time-based', 'weather', 'behavior'
            severity, // 'low', 'medium', 'high', 'critical'
            message,
            location: JSON.parse(location),
            contextData: JSON.parse(contextData),
            status: 'active',
            acknowledgedBy: null,
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(alertId, Buffer.from(JSON.stringify(riskAlert)));

        // Emit risk alert created event
        ctx.stub.setEvent('RiskAlertCreated', Buffer.from(JSON.stringify({
            alertId,
            touristId,
            alertType,
            severity,
            message,
            timestamp: new Date()
        })));

        console.info('============= END : Create Risk Alert ===========');
        return JSON.stringify(riskAlert);
    }

    async acknowledgeRiskAlert(ctx, alertId, acknowledgedBy, response) {
        console.info('============= START : Acknowledge Risk Alert ===========');

        const alertAsBytes = await ctx.stub.getState(alertId);
        if (!alertAsBytes || alertAsBytes.length === 0) {
            throw new Error(`Risk alert ${alertId} does not exist`);
        }

        const riskAlert = JSON.parse(alertAsBytes.toString());
        riskAlert.acknowledgedBy = acknowledgedBy;
        riskAlert.acknowledgedAt = new Date();
        riskAlert.response = response;
        riskAlert.status = 'acknowledged';
        riskAlert.updatedAt = new Date();

        await ctx.stub.putState(alertId, Buffer.from(JSON.stringify(riskAlert)));

        // Emit alert acknowledged event
        ctx.stub.setEvent('RiskAlertAcknowledged', Buffer.from(JSON.stringify({
            alertId,
            acknowledgedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Acknowledge Risk Alert ===========');
        return JSON.stringify(riskAlert);
    }

    async calculateAreaRiskScore(ctx, areaCoordinates, timeWindow) {
        console.info('============= START : Calculate Area Risk Score ===========');

        const area = JSON.parse(areaCoordinates);
        const windowHours = parseInt(timeWindow);
        const startTime = new Date(Date.now() - windowHours * 60 * 60 * 1000);

        // Query recent safety scores in the area
        const queryString = {
            selector: {
                calculatedAt: {
                    $gte: startTime.toISOString()
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const scoresInArea = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const scoreRecord = JSON.parse(res.value.value.toString('utf8'));
                
                // Check if the score location is within the specified area
                if (this.isPointInArea(scoreRecord.location, area)) {
                    scoresInArea.push(scoreRecord);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        // Calculate area risk metrics
        const areaRiskScore = {
            areaId: `AREA_${Date.now()}`,
            area,
            timeWindow: windowHours,
            totalTourists: scoresInArea.length,
            averageScore: 0,
            riskDistribution: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            },
            recommendations: [],
            calculatedAt: new Date()
        };

        if (scoresInArea.length > 0) {
            // Calculate average score
            const totalScore = scoresInArea.reduce((sum, record) => sum + record.score, 0);
            areaRiskScore.averageScore = Math.round(totalScore / scoresInArea.length);

            // Calculate risk distribution
            scoresInArea.forEach(record => {
                areaRiskScore.riskDistribution[record.riskLevel]++;
            });

            // Generate recommendations
            const highRiskRatio = (areaRiskScore.riskDistribution.high + areaRiskScore.riskDistribution.critical) / scoresInArea.length;
            
            if (highRiskRatio > 0.5) {
                areaRiskScore.recommendations.push('Increase patrol presence in this area');
                areaRiskScore.recommendations.push('Consider temporary access restrictions');
            }
            
            if (areaRiskScore.averageScore < 50) {
                areaRiskScore.recommendations.push('Issue safety advisory for this area');
                areaRiskScore.recommendations.push('Deploy emergency response team nearby');
            }
        }

        await ctx.stub.putState(areaRiskScore.areaId, Buffer.from(JSON.stringify(areaRiskScore)));

        console.info('============= END : Calculate Area Risk Score ===========');
        return JSON.stringify(areaRiskScore);
    }

    async getTouristsByRiskLevel(ctx, riskLevel) {
        // Get current safety scores for all tourists
        const currentTime = new Date();
        const queryString = {
            selector: {
                riskLevel: riskLevel,
                validUntil: {
                    $gte: currentTime.toISOString()
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

    async getActiveRiskAlerts(ctx, severity) {
        let queryString = {
            selector: {
                status: 'active'
            }
        };

        if (severity) {
            queryString.selector.severity = severity;
        }

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const alertRecord = JSON.parse(res.value.value.toString('utf8'));
                if (alertRecord.alertId) { // Only return alert records
                    allResults.push(alertRecord);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }

    async generateSafetyReport(ctx, startDate, endDate, reportType) {
        console.info('============= START : Generate Safety Report ===========');

        const queryString = {
            selector: {
                calculatedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const safetyRecords = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const record = JSON.parse(res.value.value.toString('utf8'));
                if (record.scoreId) { // Only return safety score records
                    safetyRecords.push(record);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        // Generate report based on type
        const report = {
            reportId: `RPT_${Date.now()}`,
            reportType,
            period: { startDate, endDate },
            totalRecords: safetyRecords.length,
            statistics: {},
            trends: {},
            recommendations: [],
            generatedAt: new Date()
        };

        if (reportType === 'summary') {
            report.statistics = this.calculateSummaryStatistics(safetyRecords);
        } else if (reportType === 'detailed') {
            report.statistics = this.calculateDetailedStatistics(safetyRecords);
            report.trends = this.calculateTrends(safetyRecords);
        }

        console.info('============= END : Generate Safety Report ===========');
        return JSON.stringify(report);
    }

    // Helper functions
    isPointInArea(point, area) {
        // Simple bounding box check
        return point.latitude >= area.minLat && 
               point.latitude <= area.maxLat &&
               point.longitude >= area.minLng && 
               point.longitude <= area.maxLng;
    }

    calculateSummaryStatistics(records) {
        const stats = {
            averageScore: 0,
            riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
            totalTourists: new Set(records.map(r => r.touristId)).size
        };

        if (records.length > 0) {
            const totalScore = records.reduce((sum, record) => sum + record.score, 0);
            stats.averageScore = Math.round(totalScore / records.length);

            records.forEach(record => {
                stats.riskDistribution[record.riskLevel]++;
            });
        }

        return stats;
    }

    calculateDetailedStatistics(records) {
        // More comprehensive statistics calculation
        const stats = this.calculateSummaryStatistics(records);
        
        // Add more detailed breakdowns
        stats.scoresByLocation = {};
        stats.scoresByTime = {};
        stats.scoresByWeather = {};

        records.forEach(record => {
            // Group by location type
            const locationType = record.location.riskLevel || 'unknown';
            if (!stats.scoresByLocation[locationType]) {
                stats.scoresByLocation[locationType] = { total: 0, count: 0 };
            }
            stats.scoresByLocation[locationType].total += record.score;
            stats.scoresByLocation[locationType].count++;

            // Group by time of day
            const timeOfDay = record.context.timeOfDay || 'unknown';
            if (!stats.scoresByTime[timeOfDay]) {
                stats.scoresByTime[timeOfDay] = { total: 0, count: 0 };
            }
            stats.scoresByTime[timeOfDay].total += record.score;
            stats.scoresByTime[timeOfDay].count++;
        });

        // Calculate averages
        Object.keys(stats.scoresByLocation).forEach(key => {
            const data = stats.scoresByLocation[key];
            data.average = Math.round(data.total / data.count);
        });

        Object.keys(stats.scoresByTime).forEach(key => {
            const data = stats.scoresByTime[key];
            data.average = Math.round(data.total / data.count);
        });

        return stats;
    }

    calculateTrends(records) {
        // Simple trend calculation - could be enhanced with more sophisticated analysis
        const sortedRecords = records.sort((a, b) => new Date(a.calculatedAt) - new Date(b.calculatedAt));
        
        const trends = {
            scoreDirection: 'stable',
            riskLevelChanges: [],
            periodicPatterns: {}
        };

        if (sortedRecords.length >= 10) {
            const firstHalf = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
            const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

            const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.score, 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.score, 0) / secondHalf.length;

            if (secondHalfAvg > firstHalfAvg + 5) {
                trends.scoreDirection = 'improving';
            } else if (secondHalfAvg < firstHalfAvg - 5) {
                trends.scoreDirection = 'declining';
            }
        }

        return trends;
    }

    async getSafetyParameters(ctx) {
        const parametersAsBytes = await ctx.stub.getState('DEFAULT_PARAMS');
        if (!parametersAsBytes || parametersAsBytes.length === 0) {
            throw new Error('Safety parameters not found');
        }
        return parametersAsBytes.toString();
    }
}

module.exports = SafetyScoringContract;