'use strict';

const { Contract } = require('fabric-contract-api');

class LocationTrackingContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Location Tracking Ledger ===========');
        
        // Initialize with default geo-fence zones
        const defaultZones = [
            {
                zoneId: 'ZONE001',
                name: 'High Risk Forest Area',
                type: 'high-risk',
                polygon: [
                    { lat: 26.1445, lng: 91.7362 },
                    { lat: 26.1445, lng: 91.8362 },
                    { lat: 26.2445, lng: 91.8362 },
                    { lat: 26.2445, lng: 91.7362 }
                ],
                alertMessage: 'You are entering a high-risk forest area. Please stay on marked trails.',
                restrictions: ['no-solo-travel', 'daylight-only'],
                createdAt: new Date()
            },
            {
                zoneId: 'ZONE002',
                name: 'Tourist Safe Zone',
                type: 'safe',
                polygon: [
                    { lat: 26.1200, lng: 91.7500 },
                    { lat: 26.1200, lng: 91.7800 },
                    { lat: 26.1500, lng: 91.7800 },
                    { lat: 26.1500, lng: 91.7500 }
                ],
                alertMessage: 'Welcome to the tourist safe zone!',
                restrictions: [],
                createdAt: new Date()
            }
        ];

        for (const zone of defaultZones) {
            await ctx.stub.putState(`ZONE_${zone.zoneId}`, Buffer.from(JSON.stringify(zone)));
        }

        console.info('============= END : Initialize Location Tracking Ledger ===========');
    }

    async recordLocation(ctx, touristId, latitude, longitude, timestamp, accuracy, speed) {
        console.info('============= START : Record Location ===========');

        const locationId = `LOC_${touristId}_${Date.now()}`;
        const locationRecord = {
            locationId,
            touristId,
            coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            timestamp: new Date(timestamp),
            accuracy: parseFloat(accuracy),
            speed: parseFloat(speed) || 0,
            recordedAt: new Date()
        };

        await ctx.stub.putState(locationId, Buffer.from(JSON.stringify(locationRecord)));

        // Check geo-fencing
        const geoFenceAlert = await this.checkGeofence(ctx, touristId, latitude, longitude);
        
        // Emit location update event
        ctx.stub.setEvent('LocationRecorded', Buffer.from(JSON.stringify({
            touristId,
            coordinates: locationRecord.coordinates,
            timestamp: locationRecord.timestamp,
            geoFenceAlert
        })));

        console.info('============= END : Record Location ===========');
        return JSON.stringify({ locationRecord, geoFenceAlert });
    }

    async getLocationHistory(ctx, touristId, startDate, endDate) {
        const queryString = {
            selector: {
                touristId: touristId,
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            sort: [{ timestamp: 'desc' }]
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

    async getCurrentLocation(ctx, touristId) {
        const queryString = {
            selector: {
                touristId: touristId
            },
            sort: [{ timestamp: 'desc' }],
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
        throw new Error(`No location found for tourist ${touristId}`);
    }

    async checkGeofence(ctx, touristId, latitude, longitude) {
        console.info('============= START : Check Geofence ===========');

        // Get all geo-fence zones
        const queryString = {
            selector: {
                zoneId: {
                    $regex: "ZONE"
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const zones = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const zone = JSON.parse(res.value.value.toString('utf8'));
                zones.push(zone);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const alerts = [];

        for (const zone of zones) {
            if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
                const alert = {
                    zoneId: zone.zoneId,
                    zoneName: zone.name,
                    zoneType: zone.type,
                    alertMessage: zone.alertMessage,
                    restrictions: zone.restrictions,
                    timestamp: new Date()
                };

                alerts.push(alert);

                // Record the geo-fence alert
                const alertId = `ALERT_${touristId}_${zone.zoneId}_${Date.now()}`;
                await ctx.stub.putState(alertId, Buffer.from(JSON.stringify({
                    alertId,
                    touristId,
                    alert,
                    coordinates: { lat, lng },
                    createdAt: new Date()
                })));

                // Emit geo-fence alert event
                ctx.stub.setEvent('GeofenceAlert', Buffer.from(JSON.stringify({
                    touristId,
                    alert,
                    coordinates: { lat, lng }
                })));
            }
        }

        console.info('============= END : Check Geofence ===========');
        return alerts;
    }

    async createGeoFenceZone(ctx, zoneId, name, type, polygon, alertMessage, restrictions) {
        console.info('============= START : Create Geo-fence Zone ===========');

        const exists = await this.geoFenceZoneExists(ctx, `ZONE_${zoneId}`);
        if (exists) {
            throw new Error(`Geo-fence zone ${zoneId} already exists`);
        }

        const geoFenceZone = {
            zoneId,
            name,
            type,
            polygon: JSON.parse(polygon),
            alertMessage,
            restrictions: JSON.parse(restrictions),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(`ZONE_${zoneId}`, Buffer.from(JSON.stringify(geoFenceZone)));

        // Emit event
        ctx.stub.setEvent('GeoFenceZoneCreated', Buffer.from(JSON.stringify({
            zoneId,
            name,
            type,
            timestamp: new Date()
        })));

        console.info('============= END : Create Geo-fence Zone ===========');
        return JSON.stringify(geoFenceZone);
    }

    async updateMovementPattern(ctx, touristId, pattern) {
        console.info('============= START : Update Movement Pattern ===========');

        const patternId = `PATTERN_${touristId}_${Date.now()}`;
        const movementPattern = {
            patternId,
            touristId,
            pattern: JSON.parse(pattern),
            analyzedAt: new Date()
        };

        await ctx.stub.putState(patternId, Buffer.from(JSON.stringify(movementPattern)));

        // Emit event
        ctx.stub.setEvent('MovementPatternUpdated', Buffer.from(JSON.stringify({
            touristId,
            patternId,
            timestamp: new Date()
        })));

        console.info('============= END : Update Movement Pattern ===========');
        return JSON.stringify(movementPattern);
    }

    async getTouristsInZone(ctx, zoneId) {
        // Get recent locations (last 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const queryString = {
            selector: {
                timestamp: {
                    $gte: oneHourAgo.toISOString()
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const touristsInZone = [];

        // Get the zone details
        const zoneAsBytes = await ctx.stub.getState(`ZONE_${zoneId}`);
        if (!zoneAsBytes || zoneAsBytes.length === 0) {
            throw new Error(`Geo-fence zone ${zoneId} does not exist`);
        }
        const zone = JSON.parse(zoneAsBytes.toString());

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const location = JSON.parse(res.value.value.toString('utf8'));
                const { latitude, longitude } = location.coordinates;
                
                if (this.isPointInPolygon({ lat: latitude, lng: longitude }, zone.polygon)) {
                    touristsInZone.push({
                        touristId: location.touristId,
                        coordinates: location.coordinates,
                        timestamp: location.timestamp
                    });
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(touristsInZone);
    }

    async getGeoFenceAlerts(ctx, touristId, startDate, endDate) {
        const queryString = {
            selector: {
                touristId: touristId,
                "createdAt": {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            sort: [{ createdAt: 'desc' }]
        };

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

    async getAllGeoFenceZones(ctx) {
        const queryString = {
            selector: {
                zoneId: {
                    $regex: "^ZONE"
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

    // Helper function to check if a point is inside a polygon
    isPointInPolygon(point, polygon) {
        const x = point.lat;
        const y = point.lng;
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat;
            const yi = polygon[i].lng;
            const xj = polygon[j].lat;
            const yj = polygon[j].lng;

            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }

        return inside;
    }

    async geoFenceZoneExists(ctx, zoneKey) {
        const zoneAsBytes = await ctx.stub.getState(zoneKey);
        return zoneAsBytes && zoneAsBytes.length > 0;
    }

    async deleteGeoFenceZone(ctx, zoneId) {
        const zoneKey = `ZONE_${zoneId}`;
        const exists = await this.geoFenceZoneExists(ctx, zoneKey);
        if (!exists) {
            throw new Error(`Geo-fence zone ${zoneId} does not exist`);
        }

        await ctx.stub.delState(zoneKey);
        
        // Emit event
        ctx.stub.setEvent('GeoFenceZoneDeleted', Buffer.from(JSON.stringify({
            zoneId,
            timestamp: new Date()
        })));

        return JSON.stringify({ message: `Geo-fence zone ${zoneId} deleted successfully` });
    }
}

module.exports = LocationTrackingContract;