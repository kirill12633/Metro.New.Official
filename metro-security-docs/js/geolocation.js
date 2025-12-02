class GeolocationSystem {
    constructor() {
        this.currentLocation = null;
        this.allowedLocations = [];
        this.init();
    }

    async init() {
        await this.loadAllowedLocations();
        this.setupGeofencing();
    }

    async loadAllowedLocations() {
        try {
            const snapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.SETTINGS)
                .doc('allowed_locations')
                .get();

            if (snapshot.exists) {
                this.allowedLocations = snapshot.data().locations || [];
            }
        } catch (error) {
            console.error('Error loading allowed locations:', error);
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Геолокация не поддерживается'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp)
                    };

                    // Get location info from coordinates
                    const locationInfo = await this.reverseGeocode(
                        this.currentLocation.latitude,
                        this.currentLocation.longitude
                    );

                    this.currentLocation = {
                        ...this.currentLocation,
                        ...locationInfo
                    };

                    resolve(this.currentLocation);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    async reverseGeocode(lat, lng) {
        try {
            // Using OpenStreetMap Nominatim API (free, no key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            return {
                address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village,
                country: data.address?.country,
                countryCode: data.address?.country_code
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {};
        }
    }

    setupGeofencing() {
        // Check location periodically
        setInterval(async () => {
            try {
                await this.checkLocationAccess();
            } catch (error) {
                console.error('Geofencing error:', error);
            }
        }, 300000); // Check every 5 minutes

        // Check on document visibility change
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                await this.checkLocationAccess();
            }
        });
    }

    async checkLocationAccess() {
        try {
            const location = await this.getCurrentLocation();
            
            if (this.allowedLocations.length === 0) {
                // No restrictions configured
                return true;
            }

            const isAllowed = this.allowedLocations.some(allowedLoc => 
                this.calculateDistance(
                    location.latitude,
                    location.longitude,
                    allowedLoc.latitude,
                    allowedLoc.longitude
                ) <= allowedLoc.radius
            );

            if (!isAllowed) {
                await this.handleUnauthorizedLocation(location);
                return false;
            }

            return true;

        } catch (error) {
            console.error('Location check error:', error);
            
            // If location access is denied but required
            if (this.allowedLocations.length > 0) {
                await this.handleLocationError(error);
                return false;
            }

            return true;
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    async handleUnauthorizedLocation(location) {
        const user = await firebaseConfig.getCurrentUserWithVerification();
        
        await authSystem.logSecurityEvent(
            'unauthorized_location',
            user?.uid || 'anonymous',
            `Попытка доступа из неразрешенной локации: ${location.address || `${location.latitude}, ${location.longitude}`}`
        );

        // Show warning
        this.showLocationWarning(location);

        // Force logout if strict mode
        const settings = await this.getSecuritySettings();
        if (settings.strictGeolocation) {
            setTimeout(() => authSystem.logout(), 5000);
        }
    }

    async handleLocationError(error) {
        const user = await firebaseConfig.getCurrentUserWithVerification();
        
        await authSystem.logSecurityEvent(
            'location_error',
            user?.uid || 'anonymous',
            `Ошибка получения геолокации: ${error.message}`
        );

        this.showLocationError(error);
    }

    async getSecuritySettings() {
        try {
            const snapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.SETTINGS)
                .doc('security')
                .get();

            return snapshot.exists ? snapshot.data() : {};
        } catch (error) {
            return {};
        }
    }

    showLocationWarning(location) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f39c12;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        warning.innerHTML = `
            <strong>⚠️ Предупреждение безопасности</strong>
            <p>Доступ из неразрешенной локации:</p>
            <small>${location.address || 'Неизвестное местоположение'}</small>
            <p><small>Сессия будет завершена через 5 секунд</small></p>
        `;

        document.body.appendChild(warning);

        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 5000);
    }

    showLocationError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;

        errorDiv.innerHTML = `
            <strong>📍 Ошибка геолокации</strong>
            <p>${error.message}</p>
            <p><small>Некоторые функции могут быть ограничены</small></p>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    async logLocationAccess() {
        try {
            const location = await this.getCurrentLocation();
            const user = await firebaseConfig.getCurrentUserWithVerification();

            if (!user) return;

            const logData = {
                userId: user.uid,
                userEmail: user.email,
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                timestamp: firebaseConfig.getCurrentTimestamp(),
                accuracy: location.accuracy
            };

            await firebaseConfig.db
                .collection('location_logs')
                .add(logData);

        } catch (error) {
            console.error('Error logging location:', error);
        }
    }

    // IP-based location fallback
    async getLocationByIP() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            return {
                latitude: data.latitude,
                longitude: data.longitude,
                city: data.city,
                country: data.country_name,
                countryCode: data.country_code,
                ip: data.ip,
                source: 'ip_api'
            };
        } catch (error) {
            console.error('IP location error:', error);
            return null;
        }
    }

    // Create geofence
    addGeofence(name, lat, lng, radius, type = 'allow') {
        this.allowedLocations.push({
            name,
            latitude: lat,
            longitude: lng,
            radius, // in kilometers
            type
        });

        this.saveAllowedLocations();
    }

    async saveAllowedLocations() {
        try {
            await firebaseConfig.db
                .collection(firebaseConfig.collections.SETTINGS)
                .doc('allowed_locations')
                .set({
                    locations: this.allowedLocations,
                    updatedAt: firebaseConfig.getCurrentTimestamp()
                });
        } catch (error) {
            console.error('Error saving locations:', error);
        }
    }
}

// Initialize geolocation system
const geolocationSystem = new GeolocationSystem();

// Log location on page load
if (window.location.pathname.includes('viewer.html') || 
    window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        await geolocationSystem.logLocationAccess();
    });
}

// Export
window.geolocationSystem = geolocationSystem;
