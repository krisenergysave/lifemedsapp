export function getXSRFToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

export function xsrfHeader() {
  const token = getXSRFToken();
  if (!token) return {};
  return { 'X-XSRF-TOKEN': token };
}
