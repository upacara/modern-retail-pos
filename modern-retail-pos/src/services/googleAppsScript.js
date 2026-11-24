/**
 * Transport adapter for Google Apps Script Web App.
 * Uses text/plain POST payloads to avoid CORS preflight failures on GAS endpoints.
 */
export async function callAppsScript({ webAppUrl, action, payload = {}, token = '' }) {
  if (!webAppUrl) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured.',
      data: null
    };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action,
        token,
        payload
      })
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP error ${response.status} from Google Apps Script.`,
        data: null
      };
    }

    const result = await response.json();
    return {
      success: Boolean(result.success),
      message: result.message || (result.success ? 'Success' : 'Request failed'),
      data: result.data ?? null
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'Network error connecting to Google Apps Script.',
      data: null
    };
  }
}
