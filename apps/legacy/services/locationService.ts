// /services/locationService.ts
import BackgroundGeolocation from "react-native-background-geolocation";

const LOG = (...args: any[]) => console.log("[LOC-SVC]", ...args);
const ERR = (...args: any[]) => console.error("[LOC-SVC]", ...args);

export const configureLocationService = async () => {
  try {
    LOG("Configuring service...");

    // Attach listeners BEFORE ready()
    BackgroundGeolocation.onLocation(
      (location) => {
        LOG("onLocation:", {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          acc: location.coords.accuracy,
          speed: location.coords.speed,
          time: location.timestamp,
        });
      },
      (error) => ERR("onLocation error:", error)
    );

    BackgroundGeolocation.onMotionChange((event) => {
      LOG("onMotionChange:", event.isMoving, event.location?.coords);
    });

    BackgroundGeolocation.onActivityChange((activity) => {
      LOG("onActivityChange:", activity);
    });

    BackgroundGeolocation.onProviderChange((provider) => {
      LOG("onProviderChange:", provider);
    });

    BackgroundGeolocation.onEnabledChange((enabled) => {
      LOG("onEnabledChange:", enabled);
    });

    BackgroundGeolocation.onHttp((response) => {
      LOG("onHttp:", response);
    });

    // STEP 1 — Ready FIRST
    const state = await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 5,
      stopOnTerminate: false,
      startOnBoot: true,
      foregroundService: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    });

    LOG("Ready callback:", state);

    // STEP 2 — Request permissions AFTER ready()
    LOG("Requesting permission...");
    const status = await BackgroundGeolocation.requestPermission();

    const granted =
      status === BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS ||
      status === BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE;

    if (!granted) {
      LOG("Permission NOT granted:", status);
      return;
    }

    LOG("Permission granted:", status);

    // DO NOT AUTOSTART (verify stability first)
    // if (!state.enabled) await BackgroundGeolocation.start();
  } catch (ex) {
    ERR("configureLocationService exception:", ex);
  }
};

// Start manually (for testing)
export const startLocationService = async () => {
  try {
    LOG("Starting BG service...");
    await BackgroundGeolocation.start();
    LOG("BackgroundGeolocation.start() returned");
  } catch (ex) {
    ERR("startLocationService exception:", ex);
  }
};

export const stopLocationService = async () => {
  try {
    await BackgroundGeolocation.stop();
    LOG("Stopped BG service");
  } catch (ex) {
    ERR("stopLocationService exception:", ex);
  }
};
