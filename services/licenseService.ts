// License Service - Frontend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export interface LicenseInfo {
  valid: boolean;
  plan?: string;
  expiresAt?: string;
  message: string;
}

/**
 * Generate or retrieve a unique device ID
 * Uses browser fingerprinting for web, or stored ID
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    // Generate device fingerprint
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("Device fingerprint", 2, 2);
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|");

    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    deviceId = `device_${Math.abs(hash).toString(36)}`;
    localStorage.setItem("device_id", deviceId);
  }

  return deviceId;
}

export async function validateLicense(
  licenseKey: string
): Promise<LicenseInfo> {
  try {
    const deviceId = getDeviceId();
    const response = await fetch(`${API_URL}/api/license/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, deviceId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      valid: false,
      message: "Failed to validate license",
    };
  }
}

export function getStoredLicense(): string | null {
  return localStorage.getItem("license_key");
}

export function saveLicense(licenseKey: string): void {
  localStorage.setItem("license_key", licenseKey);
}

export function clearLicense(): void {
  localStorage.removeItem("license_key");
}

export async function checkLicenseStatus(): Promise<boolean> {
  const licenseKey = getStoredLicense();
  if (!licenseKey) return false;

  const result = await validateLicense(licenseKey);
  if (!result.valid) {
    clearLicense();
  }
  return result.valid;
}

export interface LicenseDetails {
  licenseKey: string;
  plan?: string;
  status?: string;
  expiresAt?: string;
  currentPeriodEnd?: string;
  isActive?: boolean;
  deviceId?: string;
  stripeCustomerId?: string;
}

export async function getLicenseDetails(): Promise<LicenseDetails | null> {
  const licenseKey = getStoredLicense();
  if (!licenseKey) return null;

  try {
    const response = await fetch(
      `${API_URL}/api/license/info?licenseKey=${encodeURIComponent(licenseKey)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, licenseKey };
  } catch (error) {
    return null;
  }
}

export async function openCustomerPortal(
  licenseKey: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/stripe/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey,
        returnUrl: window.location.origin + "/dashboard",
      }),
    });
    const data = await response.json();
    if (data.url) {
      return data.url;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function resendLicenseKey(
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/license/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: "Failed to resend license key" };
  }
}

export async function fetchLicenseForEmail(
  email: string
): Promise<{ success: boolean; license?: LicenseDetails; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/license/by-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      // Don't show error for 404 - just means no license found
      if (response.status === 404) {
        return { success: false };
      }
      return { success: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Network errors - silently fail, user just won't have license auto-loaded
    console.warn("Could not fetch license by email:", error);
    return { success: false };
  }
}
