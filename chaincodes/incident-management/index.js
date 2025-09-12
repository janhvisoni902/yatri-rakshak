'use strict';

const { Contract } = require('fabric-contract-api');

class IncidentManagementContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Incident Management Ledger ===========');
        // Initialize with any default data if needed
        console.info('============= END : Initialize Incident Management Ledger ===========');
    }

    async createIncident(ctx, touristId, incidentType, description, location, severity, reportedBy) {
        console.info('============= START : Create Incident ===========');

        const incidentId = `INC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const incident = {
            incidentId,
            touristId,
            incidentType, // 'emergency', 'missing', 'accident', 'health', 'theft', 'harassment'
            description,
            location: JSON.parse(location),
            severity, // 'low', 'medium', 'high', 'critical'
            reportedBy, // 'tourist', 'authority', 'ai-system', 'iot-device'
            status: 'reported',
            priority: this.calculatePriority(severity, incidentType),
            assignedTeam: null,
            responseTime: null,
            resolutionTime: null,
            evidence: [],
            updates: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));

        // Auto-generate E-FIR if severity is high or critical
        if (severity === 'high' || severity === 'critical') {
            await this.generateEFIR(ctx, incidentId, 'auto-generated');
        }

        // Emit incident created event
        ctx.stub.setEvent('IncidentCreated', Buffer.from(JSON.stringify({
            incidentId,
            touristId,
            incidentType,
            severity,
            location: incident.location,
            timestamp: new Date()
        })));

        console.info('============= END : Create Incident ===========');
        return JSON.stringify(incident);
    }

    async getIncident(ctx, incidentId) {
        const incidentAsBytes = await ctx.stub.getState(incidentId);
        if (!incidentAsBytes || incidentAsBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }
        return incidentAsBytes.toString();
    }

    async updateIncidentStatus(ctx, incidentId, newStatus, updateNote, updatedBy) {
        console.info('============= START : Update Incident Status ===========');

        const incidentAsBytes = await ctx.stub.getState(incidentId);
        if (!incidentAsBytes || incidentAsBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }

        const incident = JSON.parse(incidentAsBytes.toString());
        const oldStatus = incident.status;
        
        incident.status = newStatus;
        incident.updatedAt = new Date();

        // Add status update to updates array
        const statusUpdate = {
            updateId: `UPD_${Date.now()}`,
            oldStatus,
            newStatus,
            updateNote,
            updatedBy,
            timestamp: new Date()
        };
        incident.updates.push(statusUpdate);

        // Set response time if incident is being acknowledged for the first time
        if (oldStatus === 'reported' && (newStatus === 'acknowledged' || newStatus === 'in-progress')) {
            incident.responseTime = new Date();
        }

        // Set resolution time if incident is being resolved
        if (newStatus === 'resolved' || newStatus === 'closed') {
            incident.resolutionTime = new Date();
        }

        await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));

        // Emit status update event
        ctx.stub.setEvent('IncidentStatusUpdated', Buffer.from(JSON.stringify({
            incidentId,
            oldStatus,
            newStatus,
            updatedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Update Incident Status ===========');
        return JSON.stringify(incident);
    }

    async assignResponseTeam(ctx, incidentId, teamId, teamDetails, assignedBy) {
        console.info('============= START : Assign Response Team ===========');

        const incidentAsBytes = await ctx.stub.getState(incidentId);
        if (!incidentAsBytes || incidentAsBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }

        const incident = JSON.parse(incidentAsBytes.toString());
        
        incident.assignedTeam = {
            teamId,
            teamDetails: JSON.parse(teamDetails),
            assignedBy,
            assignedAt: new Date()
        };
        incident.status = 'assigned';
        incident.updatedAt = new Date();

        // Add assignment update
        const assignmentUpdate = {
            updateId: `UPD_${Date.now()}`,
            action: 'team-assigned',
            teamId,
            assignedBy,
            timestamp: new Date()
        };
        incident.updates.push(assignmentUpdate);

        await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));

        // Emit team assignment event
        ctx.stub.setEvent('ResponseTeamAssigned', Buffer.from(JSON.stringify({
            incidentId,
            teamId,
            assignedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Assign Response Team ===========');
        return JSON.stringify(incident);
    }

    async generateEFIR(ctx, incidentId, generatedBy) {
        console.info('============= START : Generate E-FIR ===========');

        const incidentAsBytes = await ctx.stub.getState(incidentId);
        if (!incidentAsBytes || incidentAsBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }

        const incident = JSON.parse(incidentAsBytes.toString());
        
        const efirId = `EFIR_${Date.now()}_${incidentId}`;
        const efir = {
            efirId,
            incidentId,
            firNumber: this.generateFIRNumber(),
            touristId: incident.touristId,
            incidentDetails: {
                type: incident.incidentType,
                description: incident.description,
                location: incident.location,
                severity: incident.severity,
                reportedAt: incident.createdAt
            },
            generatedBy,
            status: 'registered',
            policeStationCode: this.getPoliceStationCode(incident.location),
            documents: [],
            witnesses: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(efirId, Buffer.from(JSON.stringify(efir)));

        // Update incident with E-FIR reference
        incident.efirId = efirId;
        incident.updatedAt = new Date();
        
        const efirUpdate = {
            updateId: `UPD_${Date.now()}`,
            action: 'efir-generated',
            efirId,
            generatedBy,
            timestamp: new Date()
        };
        incident.updates.push(efirUpdate);

        await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));

        // Emit E-FIR generated event
        ctx.stub.setEvent('EFIRGenerated', Buffer.from(JSON.stringify({
            incidentId,
            efirId,
            firNumber: efir.firNumber,
            generatedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Generate E-FIR ===========');
        return JSON.stringify(efir);
    }

    async addEvidence(ctx, incidentId, evidenceType, evidenceData, addedBy) {
        console.info('============= START : Add Evidence ===========');

        const incidentAsBytes = await ctx.stub.getState(incidentId);
        if (!incidentAsBytes || incidentAsBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }

        const incident = JSON.parse(incidentAsBytes.toString());
        
        const evidenceId = `EVD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const evidence = {
            evidenceId,
            evidenceType, // 'photo', 'video', 'audio', 'document', 'witness-statement'
            evidenceData: JSON.parse(evidenceData),
            addedBy,
            verificationStatus: 'pending',
            addedAt: new Date()
        };

        incident.evidence.push(evidence);
        incident.updatedAt = new Date();

        // Add evidence update
        const evidenceUpdate = {
            updateId: `UPD_${Date.now()}`,
            action: 'evidence-added',
            evidenceId,
            evidenceType,
            addedBy,
            timestamp: new Date()
        };
        incident.updates.push(evidenceUpdate);

        await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));

        // Emit evidence added event
        ctx.stub.setEvent('EvidenceAdded', Buffer.from(JSON.stringify({
            incidentId,
            evidenceId,
            evidenceType,
            addedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Add Evidence ===========');
        return JSON.stringify(incident);
    }

    async getIncidentsByTourist(ctx, touristId) {
        const queryString = {
            selector: {
                touristId: touristId
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
                if (Record.incidentId) { // Only return incident records
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

    async getIncidentsByStatus(ctx, status) {
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
                if (Record.incidentId) { // Only return incident records
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

    async getIncidentsBySeverity(ctx, severity) {
        const queryString = {
            selector: {
                severity: severity,
                status: {
                    $ne: 'closed'
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
                if (Record.incidentId) { // Only return incident records
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

    async getEFIR(ctx, efirId) {
        const efirAsBytes = await ctx.stub.getState(efirId);
        if (!efirAsBytes || efirAsBytes.length === 0) {
            throw new Error(`E-FIR ${efirId} does not exist`);
        }
        return efirAsBytes.toString();
    }

    async updateEFIRStatus(ctx, efirId, newStatus, updateNote, updatedBy) {
        console.info('============= START : Update E-FIR Status ===========');

        const efirAsBytes = await ctx.stub.getState(efirId);
        if (!efirAsBytes || efirAsBytes.length === 0) {
            throw new Error(`E-FIR ${efirId} does not exist`);
        }

        const efir = JSON.parse(efirAsBytes.toString());
        const oldStatus = efir.status;
        
        efir.status = newStatus;
        efir.updatedAt = new Date();
        efir.lastUpdateNote = updateNote;
        efir.lastUpdatedBy = updatedBy;

        await ctx.stub.putState(efirId, Buffer.from(JSON.stringify(efir)));

        // Emit E-FIR status update event
        ctx.stub.setEvent('EFIRStatusUpdated', Buffer.from(JSON.stringify({
            efirId,
            oldStatus,
            newStatus,
            updatedBy,
            timestamp: new Date()
        })));

        console.info('============= END : Update E-FIR Status ===========');
        return JSON.stringify(efir);
    }

    async getIncidentAnalytics(ctx, startDate, endDate) {
        const queryString = {
            selector: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const incidents = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const incident = JSON.parse(res.value.value.toString('utf8'));
                if (incident.incidentId) { // Only return incident records
                    incidents.push(incident);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        // Calculate analytics
        const analytics = {
            totalIncidents: incidents.length,
            incidentsByType: {},
            incidentsBySeverity: {},
            incidentsByStatus: {},
            averageResponseTime: 0,
            averageResolutionTime: 0,
            resolvedIncidents: 0,
            pendingIncidents: 0
        };

        let totalResponseTime = 0;
        let totalResolutionTime = 0;
        let respondedIncidents = 0;
        let resolvedIncidents = 0;

        incidents.forEach(incident => {
            // Count by type
            analytics.incidentsByType[incident.incidentType] = 
                (analytics.incidentsByType[incident.incidentType] || 0) + 1;

            // Count by severity
            analytics.incidentsBySeverity[incident.severity] = 
                (analytics.incidentsBySeverity[incident.severity] || 0) + 1;

            // Count by status
            analytics.incidentsByStatus[incident.status] = 
                (analytics.incidentsByStatus[incident.status] || 0) + 1;

            // Calculate response times
            if (incident.responseTime) {
                const responseTime = new Date(incident.responseTime) - new Date(incident.createdAt);
                totalResponseTime += responseTime;
                respondedIncidents++;
            }

            // Calculate resolution times
            if (incident.resolutionTime) {
                const resolutionTime = new Date(incident.resolutionTime) - new Date(incident.createdAt);
                totalResolutionTime += resolutionTime;
                resolvedIncidents++;
            }

            // Count resolved vs pending
            if (incident.status === 'resolved' || incident.status === 'closed') {
                analytics.resolvedIncidents++;
            } else {
                analytics.pendingIncidents++;
            }
        });

        // Calculate averages (in minutes)
        analytics.averageResponseTime = respondedIncidents > 0 ? 
            (totalResponseTime / respondedIncidents) / (1000 * 60) : 0;
        analytics.averageResolutionTime = resolvedIncidents > 0 ? 
            (totalResolutionTime / resolvedIncidents) / (1000 * 60) : 0;

        return JSON.stringify(analytics);
    }

    // Helper functions
    calculatePriority(severity, incidentType) {
        const severityWeight = {
            'low': 1,
            'medium': 2,
            'high': 3,
            'critical': 4
        };

        const typeWeight = {
            'emergency': 4,
            'missing': 3,
            'accident': 3,
            'health': 2,
            'theft': 2,
            'harassment': 2
        };

        const score = (severityWeight[severity] || 1) + (typeWeight[incidentType] || 1);
        
        if (score >= 6) return 'high';
        if (score >= 4) return 'medium';
        return 'low';
    }

    generateFIRNumber() {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        return `FIR/${year}/${random}`;
    }

    getPoliceStationCode(location) {
        // This would typically be determined based on the location coordinates
        // For now, returning a default code
        return 'PS001';
    }

    async getAllIncidents(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.incidentId) { // Only return incident records
                    allResults.push({ Key: key, Record: record });
                }
            } catch (err) {
                console.log(err);
            }
        }
        
        return JSON.stringify(allResults);
    }
}

module.exports = IncidentManagementContract;