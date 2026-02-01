import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js"; // Correct import

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<{
    browser: { name: string; version: string };
    os: { name: string; version: string };
    device: { type: string; vendor: string | null; model: string | null };
  } | null>(null);

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo({
      browser: {
        name: result.browser.name || "Unknown",
        version: result.browser.version || "Unknown",
      },
      os: {
        name: result.os.name || "Unknown",
        version: result.os.version || "Unknown",
      },
      device: {
        type: result.device.type || "desktop",
        vendor: result.device.vendor || null,
        model: result.device.model || null,
      },
    });
  }, []);

  return deviceInfo;
};
