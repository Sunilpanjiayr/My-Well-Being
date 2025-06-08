// src/components/features/sleepTracker/SmartwatchIntegration.js
import { useState, useEffect, useCallback } from 'react';

// Smartwatch API Service
class SmartwatchService {
  constructor() {
    this.isConnected = false;
    this.device = null;
    this.connectionType = null;
    this.supportedDevices = [
      { id: 'apple-watch', name: 'Apple Watch', brand: 'Apple' },
      { id: 'galaxy-watch', name: 'Galaxy Watch', brand: 'Samsung' },
      { id: 'fitbit', name: 'Fitbit', brand: 'Fitbit' },
      { id: 'garmin', name: 'Garmin', brand: 'Garmin' },
      { id: 'wear-os', name: 'Wear OS', brand: 'Google' },
      { id: 'amazfit', name: 'Amazfit', brand: 'Amazfit' },
      { id: 'huawei-watch', name: 'Huawei Watch', brand: 'Huawei' },
      { id: 'polar', name: 'Polar', brand: 'Polar' },
      { id: 'suunto', name: 'Suunto', brand: 'Suunto' },
      { id: 'withings', name: 'Withings', brand: 'Withings' }
    ];
  }

  // Check if Web Bluetooth API is available
  async checkBluetoothAvailability() {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API is not available in this browser');
    }
    
    const isAvailable = await navigator.bluetooth.getAvailability();
    if (!isAvailable) {
      throw new Error('Bluetooth is not available on this device');
    }
    
    return true;
  }

  // Connect to smartwatch via Bluetooth
  async connectBluetooth() {
    try {
      await this.checkBluetoothAvailability();
      
      // Request device with sleep tracking services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
          { namePrefix: 'Watch' },
          { namePrefix: 'Band' },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Garmin' }
        ],
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          'generic_access'
        ]
      });

      this.device = device;
      this.connectionType = 'bluetooth';
      this.isConnected = true;

      // Connect to GATT server
      const server = await device.gatt.connect();
      
      return {
        success: true,
        device: {
          name: device.name,
          id: device.id,
          connected: true
        }
      };
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  // Connect via OAuth (for cloud-based services)
  async connectOAuth(provider) {
    // Simulate OAuth flow
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.connectionType = 'oauth';
        this.device = {
          name: `${provider} Account`,
          provider: provider,
          id: `${provider}-${Date.now()}`
        };
        
        resolve({
          success: true,
          device: this.device
        });
      }, 1500);
    });
  }

  // Fetch sleep data from connected device
  async fetchSleepData(dateRange = { days: 7 }) {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    // Simulate fetching data
    return new Promise((resolve) => {
      setTimeout(() => {
        const sleepData = this.generateMockSleepData(dateRange.days);
        resolve(sleepData);
      }, 2000);
    });
  }

  // Generate realistic mock sleep data
  generateMockSleepData(days) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic sleep patterns
      const bedtimeHour = 22 + Math.random() * 2; // 10 PM - 12 AM
      const durationHours = 6.5 + Math.random() * 2.5; // 6.5 - 9 hours
      
      const bedtime = new Date(date);
      bedtime.setHours(Math.floor(bedtimeHour));
      bedtime.setMinutes(Math.floor((bedtimeHour % 1) * 60));
      
      const wakeup = new Date(bedtime);
      wakeup.setHours(wakeup.getHours() + Math.floor(durationHours));
      wakeup.setMinutes(wakeup.getMinutes() + Math.floor((durationHours % 1) * 60));
      
      // Generate sleep phases
      const totalMinutes = durationHours * 60;
      const deepSleep = Math.floor(totalMinutes * (0.15 + Math.random() * 0.1));
      const remSleep = Math.floor(totalMinutes * (0.20 + Math.random() * 0.05));
      const lightSleep = Math.floor(totalMinutes * (0.50 + Math.random() * 0.1));
      const awake = Math.floor(totalMinutes * (0.02 + Math.random() * 0.03));
      
      // Generate health metrics
      const avgHeartRate = 55 + Math.floor(Math.random() * 15);
      const minHeartRate = avgHeartRate - 10 - Math.floor(Math.random() * 5);
      const maxHeartRate = avgHeartRate + 5 + Math.floor(Math.random() * 10);
      
      const respiratoryRate = 12 + Math.floor(Math.random() * 6);
      const spo2 = 95 + Math.floor(Math.random() * 4);
      const bodyTemp = 36.2 + Math.random() * 0.6;
      
      // Calculate sleep score
      let sleepScore = 50;
      if (durationHours >= 7 && durationHours <= 9) sleepScore += 20;
      if (deepSleep / totalMinutes > 0.15) sleepScore += 15;
      if (remSleep / totalMinutes > 0.20) sleepScore += 10;
      if (awake / totalMinutes < 0.05) sleepScore += 5;
      
      const quality = 
        sleepScore >= 85 ? 'excellent' :
        sleepScore >= 75 ? 'good' :
        sleepScore >= 65 ? 'fair' : 'poor';
      
      data.push({
        date: date.toISOString().split('T')[0],
        bedtime: `${String(bedtime.getHours()).padStart(2, '0')}:${String(bedtime.getMinutes()).padStart(2, '0')}`,
        wakeup: `${String(wakeup.getHours()).padStart(2, '0')}:${String(wakeup.getMinutes()).padStart(2, '0')}`,
        duration: durationHours.toFixed(1),
        quality,
        sleepScore,
        phases: {
          deep: deepSleep,
          light: lightSleep,
          rem: remSleep,
          awake: awake
        },
        heartRate: {
          avg: avgHeartRate,
          min: minHeartRate,
          max: maxHeartRate,
          resting: minHeartRate + 2
        },
        respiratory: respiratoryRate,
        spo2,
        bodyTemp: bodyTemp.toFixed(1),
        movements: Math.floor(Math.random() * 30) + 10,
        snoring: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
        interruptions: Math.floor(awake / 10)
      });
    }
    
    return data.reverse();
  }

  // Fetch real-time data
  async fetchRealtimeData() {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    return {
      heartRate: 65 + Math.floor(Math.random() * 10),
      isAsleep: false,
      lastSync: new Date().toISOString(),
      battery: 75 + Math.floor(Math.random() * 25)
    };
  }

  // Disconnect device
  async disconnect() {
    if (this.device && this.connectionType === 'bluetooth' && this.device.gatt) {
      await this.device.gatt.disconnect();
    }
    
    this.isConnected = false;
    this.device = null;
    this.connectionType = null;
  }

  // Get device capabilities
  getDeviceCapabilities() {
    return {
      sleepTracking: true,
      heartRate: true,
      spo2: true,
      temperature: true,
      respiratory: true,
      sleepStages: true,
      smartAlarm: true,
      continuousSync: this.connectionType === 'bluetooth'
    };
  }
}

// Custom Hook for Smartwatch Integration
export const useSmartwatch = () => {
  const [service] = useState(new SmartwatchService());
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [error, setError] = useState(null);

  // Connect to smartwatch
  const connectDevice = useCallback(async (method = 'bluetooth', provider = null) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      let result;
      if (method === 'bluetooth') {
        result = await service.connectBluetooth();
      } else if (method === 'oauth' && provider) {
        result = await service.connectOAuth(provider);
      } else {
        throw new Error('Invalid connection method');
      }
      
      setIsConnected(true);
      setConnectedDevice(result.device);
      setCapabilities(service.getDeviceCapabilities());
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [service]);

  // Disconnect device
  const disconnectDevice = useCallback(async () => {
    try {
      await service.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
      setCapabilities(null);
      setRealtimeData(null);
      setLastSync(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Sync sleep data
  const syncSleepData = useCallback(async (dateRange = { days: 7 }) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const data = await service.fetchSleepData(dateRange);
      setLastSync(new Date());
      setSyncStatus('success');
      
      return data;
    } catch (err) {
      setSyncStatus('error');
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Start real-time monitoring
  const startRealtimeMonitoring = useCallback(async () => {
    if (!isConnected) return;
    
    const updateRealtimeData = async () => {
      try {
        const data = await service.fetchRealtimeData();
        setRealtimeData(data);
      } catch (err) {
        console.error('Realtime data fetch error:', err);
      }
    };
    
    // Update immediately
    await updateRealtimeData();
    
    // Set up interval for continuous updates
    const interval = setInterval(updateRealtimeData, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, service]);

  // Auto-sync when connected
  useEffect(() => {
    if (isConnected && capabilities?.continuousSync) {
      const syncInterval = setInterval(() => {
        syncSleepData({ days: 1 });
      }, 30 * 60 * 1000); // Sync every 30 minutes
      
      return () => clearInterval(syncInterval);
    }
  }, [isConnected, capabilities, syncSleepData]);

  return {
    isConnected,
    connectedDevice,
    isConnecting,
    syncStatus,
    lastSync,
    capabilities,
    realtimeData,
    error,
    supportedDevices: service.supportedDevices,
    connectDevice,
    disconnectDevice,
    syncSleepData,
    startRealtimeMonitoring
  };
};

// Smartwatch Setup Component
export const SmartwatchSetup = ({ onDeviceConnected, onDataSync }) => {
  const {
    isConnected,
    connectedDevice,
    isConnecting,
    syncStatus,
    lastSync,
    capabilities,
    realtimeData,
    error,
    supportedDevices,
    connectDevice,
    disconnectDevice,
    syncSleepData,
    startRealtimeMonitoring
  } = useSmartwatch();

  const [selectedMethod, setSelectedMethod] = useState('bluetooth');
  const [selectedProvider, setSelectedProvider] = useState('fitbit');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle connection
  const handleConnect = async () => {
    try {
      const result = await connectDevice(selectedMethod, selectedProvider);
      if (onDeviceConnected) {
        onDeviceConnected(result.device);
      }
      
      // Start real-time monitoring if Bluetooth
      if (selectedMethod === 'bluetooth') {
        startRealtimeMonitoring();
      }
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  // Handle sync
  const handleSync = async () => {
    try {
      const data = await syncSleepData({ days: 7 });
      if (onDataSync) {
        onDataSync(data);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  // Auto-start real-time monitoring when connected
  useEffect(() => {
    if (isConnected && capabilities?.continuousSync) {
      startRealtimeMonitoring();
    }
  }, [isConnected, capabilities, startRealtimeMonitoring]);

  return (
    <div className="smartwatch-setup">
      <h3>Smartwatch Connection</h3>
      
      {!isConnected ? (
        <div className="connection-setup">
          <div className="connection-methods">
            <label className="method-option">
              <input
                type="radio"
                value="bluetooth"
                checked={selectedMethod === 'bluetooth'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <span>Bluetooth (Direct Connection)</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                value="oauth"
                checked={selectedMethod === 'oauth'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <span>Cloud Sync (OAuth)</span>
            </label>
          </div>

          {selectedMethod === 'oauth' && (
            <div className="provider-selection">
              <label>Select Provider:</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="fitbit">Fitbit</option>
                <option value="garmin">Garmin Connect</option>
                <option value="samsung">Samsung Health</option>
                <option value="apple">Apple Health</option>
                <option value="google">Google Fit</option>
                <option value="polar">Polar Flow</option>
                <option value="withings">Withings Health</option>
              </select>
            </div>
          )}

          <button
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Device'}
          </button>

          {error && <div className="error-message">{error}</div>}

          <div className="supported-devices">
            <button
              className="toggle-supported"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Supported Devices
            </button>
            
            {showAdvanced && (
              <div className="devices-list">
                <h4>Compatible Devices:</h4>
                <div className="device-grid">
                  {supportedDevices.map(device => (
                    <div key={device.id} className="device-item">
                      <span className="device-name">{device.name}</span>
                      <span className="device-brand">{device.brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="connected-device">
          <div className="device-info">
            <div className="device-status">
              <span className="status-indicator connected"></span>
              <span className="device-name">{connectedDevice.name || 'Unknown Device'}</span>
            </div>
            
            {realtimeData && (
              <div className="realtime-stats">
                <div className="stat">
                  <span className="stat-label">Heart Rate</span>
                  <span className="stat-value">{realtimeData.heartRate} bpm</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Battery</span>
                  <span className="stat-value">{realtimeData.battery}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="stat-value">
                    {realtimeData.isAsleep ? 'Sleeping' : 'Awake'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {capabilities && (
            <div className="device-capabilities">
              <h4>Device Capabilities:</h4>
              <div className="capabilities-grid">
                {Object.entries(capabilities).map(([key, value]) => (
                  <div key={key} className="capability">
                    <span className="capability-name">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`capability-status ${value ? 'supported' : 'unsupported'}`}>
                      {value ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sync-controls">
            <button
              className="sync-button"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>
            
            {lastSync && (
              <p className="last-sync">
                Last synced: {lastSync.toLocaleTimeString()}
              </p>
            )}
            
            <button
              className="disconnect-button"
              onClick={disconnectDevice}
            >
              Disconnect Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sleep Analysis Component with Smartwatch Data
export const SmartSleepAnalysis = ({ sleepData, realtimeData }) => {
  const [analysisView, setAnalysisView] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(null);

  // Calculate sleep insights
  const calculateInsights = useCallback(() => {
    if (!sleepData || sleepData.length === 0) return null;

    const totalNights = sleepData.length;
    const avgDuration = sleepData.reduce((sum, night) => sum + parseFloat(night.duration), 0) / totalNights;
    const avgScore = sleepData.reduce((sum, night) => sum + night.sleepScore, 0) / totalNights;
    
    // Sleep phase analysis
    const avgPhases = {
      deep: sleepData.reduce((sum, night) => sum + night.phases.deep, 0) / totalNights,
      light: sleepData.reduce((sum, night) => sum + night.phases.light, 0) / totalNights,
      rem: sleepData.reduce((sum, night) => sum + night.phases.rem, 0) / totalNights,
      awake: sleepData.reduce((sum, night) => sum + night.phases.awake, 0) / totalNights
    };

    // Heart rate analysis
    const avgHeartRate = sleepData.reduce((sum, night) => sum + night.heartRate.avg, 0) / totalNights;
    const avgRestingHR = sleepData.reduce((sum, night) => sum + night.heartRate.resting, 0) / totalNights;

    // Sleep quality trends
    const qualityTrend = sleepData.map((night, index) => {
      if (index === 0) return 0;
      return night.sleepScore - sleepData[index - 1].sleepScore;
    });

    const trendDirection = qualityTrend.slice(-3).reduce((sum, change) => sum + change, 0) / 3;

    return {
      avgDuration: avgDuration.toFixed(1),
      avgScore: Math.round(avgScore),
      avgPhases,
      avgHeartRate: Math.round(avgHeartRate),
      avgRestingHR: Math.round(avgRestingHR),
      trendDirection: trendDirection > 0 ? 'improving' : trendDirection < 0 ? 'declining' : 'stable',
      insights: generatePersonalizedInsights(sleepData)
    };
  }, [sleepData]);

  // Generate personalized insights
  const generatePersonalizedInsights = (data) => {
    const insights = [];
    const latestNight = data[data.length - 1];
    
    // Duration insight
    if (parseFloat(latestNight.duration) < 7) {
      insights.push({
        type: 'warning',
        title: 'Insufficient Sleep Duration',
        message: `You slept ${latestNight.duration} hours last night. Aim for 7-9 hours for optimal recovery.`,
        recommendation: 'Try going to bed 30 minutes earlier tonight.'
      });
    }

    // Deep sleep insight
    const deepSleepPercentage = (latestNight.phases.deep / (latestNight.duration * 60)) * 100;
    if (deepSleepPercentage < 15) {
      insights.push({
        type: 'info',
        title: 'Low Deep Sleep',
        message: `Your deep sleep was only ${deepSleepPercentage.toFixed(1)}% last night (target: 15-20%).`,
        recommendation: 'Avoid alcohol and heavy meals before bed to increase deep sleep.'
      });
    }

    // Heart rate variability
    if (latestNight.heartRate.avg > 70) {
      insights.push({
        type: 'warning',
        title: 'Elevated Heart Rate',
        message: `Your average heart rate was ${latestNight.heartRate.avg} bpm during sleep.`,
        recommendation: 'Consider stress reduction techniques or light exercise during the day.'
      });
    }

    // Sleep consistency
    const bedtimes = data.map(night => {
      const [hours, minutes] = night.bedtime.split(':').map(Number);
      return hours * 60 + minutes;
    });
    const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, time) => sum + Math.abs(time - avgBedtime), 0) / bedtimes.length;
    
    if (variance > 60) {
      insights.push({
        type: 'info',
        title: 'Inconsistent Sleep Schedule',
        message: 'Your bedtime varies by more than an hour on average.',
        recommendation: 'Try to maintain a consistent sleep schedule, even on weekends.'
      });
    }

    return insights;
  };

  const insights = calculateInsights();

  return (
    <div className="smart-sleep-analysis">
      <div className="analysis-header">
        <h3>Sleep Analysis</h3>
        <div className="view-tabs">
          <button
            className={analysisView === 'overview' ? 'active' : ''}
            onClick={() => setAnalysisView('overview')}
          >
            Overview
          </button>
          <button
            className={analysisView === 'detailed' ? 'active' : ''}
            onClick={() => setAnalysisView('detailed')}
          >
            Detailed
          </button>
          <button
            className={analysisView === 'trends' ? 'active' : ''}
            onClick={() => setAnalysisView('trends')}
          >
            Trends
          </button>
        </div>
      </div>

      {analysisView === 'overview' && insights && (
        <div className="analysis-overview">
          <div className="overview-cards">
            <div className="overview-card">
              <h4>Average Sleep Score</h4>
              <div className="score-display">
                <span className="score-value">{insights.avgScore}</span>
                <span className="score-trend">{insights.trendDirection}</span>
              </div>
            </div>
            
            <div className="overview-card">
              <h4>Average Duration</h4>
              <div className="duration-display">
                <span className="duration-value">{insights.avgDuration}h</span>
                <div className="duration-bar">
                  <div 
                    className="duration-fill"
                    style={{ width: `${(parseFloat(insights.avgDuration) / 9) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h4>Heart Health</h4>
              <div className="heart-stats">
                <div className="heart-stat">
                  <span className="stat-label">Avg HR</span>
                  <span className="stat-value">{insights.avgHeartRate} bpm</span>
                </div>
                <div className="heart-stat">
                  <span className="stat-label">Resting</span>
                  <span className="stat-value">{insights.avgRestingHR} bpm</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h4>Sleep Architecture</h4>
              <div className="phase-bars">
                <div className="phase-bar">
                  <span className="phase-label">Deep</span>
                  <div className="phase-progress">
                    <div 
                      className="phase-fill deep"
                      style={{ width: `${(insights.avgPhases.deep / 120) * 100}%` }}
                    ></div>
                  </div>
                  <span className="phase-time">{Math.round(insights.avgPhases.deep)}m</span>
                </div>
                <div className="phase-bar">
                  <span className="phase-label">REM</span>
                  <div className="phase-progress">
                    <div 
                      className="phase-fill rem"
                      style={{ width: `${(insights.avgPhases.rem / 120) * 100}%` }}
                    ></div>
                  </div>
                  <span className="phase-time">{Math.round(insights.avgPhases.rem)}m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="personalized-insights">
            <h4>Personalized Insights</h4>
            {insights.insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <h5>{insight.title}</h5>
                <p>{insight.message}</p>
                <div className="recommendation">
                  <span className="rec-icon">💡</span>
                  <span>{insight.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {realtimeData && (
        <div className="realtime-monitoring">
          <h4>Current Status</h4>
          <div className="monitoring-stats">
            <div className="monitoring-stat">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{realtimeData.heartRate} bpm</span>
              <span className="stat-label">Heart Rate</span>
            </div>
            <div className="monitoring-stat">
              <span className="stat-icon">{realtimeData.isAsleep ? '😴' : '👁️'}</span>
              <span className="stat-value">{realtimeData.isAsleep ? 'Sleeping' : 'Awake'}</span>
              <span className="stat-label">Sleep Status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default { useSmartwatch, SmartwatchSetup, SmartSleepAnalysis };