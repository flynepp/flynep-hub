const info = {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  cpuCores: navigator.hardwareConcurrency,
  deviceMemory:
    (navigator as any).deviceMemory !== undefined
      ? (navigator as any).deviceMemory
      : 'Not supported',
  screen: {
    width: screen.width,
    height: screen.height,
    pixelDepth: screen.pixelDepth,
  },
  connection: (navigator as any).connection
    ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
      }
    : 'Not supported',
};

const send = (content: string) => {
  fetch(`https://neptunes.top/${encodeURIComponent(content)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

fetch('https://ipinfo.io/json', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => {
    (info as any).ipData = data;
  })
  .catch((error) => {
    (info as any).ipData = { error: 'Failed to fetch IP data' };
  })
  .finally(() => {
    const requestContent = JSON.stringify(info);
    send(requestContent);
  });
