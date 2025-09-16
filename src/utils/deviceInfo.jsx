// 기기 정보 수집 함수
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    userAgent,
    platform,
    language,
    screenResolution,
    timezone
  };
};

// 위치 정보 수집 함수
export const getLocationInfo = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.warn('위치 정보 수집 실패:', error);
        resolve(null);
      },
      {
        timeout: 5000,
        enableHighAccuracy: false
      }
    );
  });
};

// API 헤더 생성 함수
export const createApiHeaders = async (additionalHeaders = {}) => {
  const deviceInfo = getDeviceInfo();
  const locationInfo = await getLocationInfo();

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Device-Info': JSON.stringify(deviceInfo),
    'X-User-Agent': deviceInfo.userAgent,
    'X-Platform': deviceInfo.platform,
    'X-Language': deviceInfo.language,
    'X-Screen-Resolution': deviceInfo.screenResolution,
    'X-Timezone': deviceInfo.timezone,
    ...additionalHeaders
  };

  // 위치 정보가 있으면 헤더에 추가
  if (locationInfo) {
    headers['X-Location'] = JSON.stringify(locationInfo);
    headers['X-Latitude'] = locationInfo.latitude.toString();
    headers['X-Longitude'] = locationInfo.longitude.toString();
  }

  return headers;
};