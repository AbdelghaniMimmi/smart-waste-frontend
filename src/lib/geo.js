function toCoords(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";

// مرتّبة من الأدق إلى الأعم: موضع الدبوس في الرابط أدق من مركز الخريطة "@"
const GOOGLE_PATTERNS = [
  new RegExp(`!3d${NUM}!4d${NUM}`),
  new RegExp(`[?&](?:q|query|ll|destination|center)=${NUM},\\s*${NUM}`),
  new RegExp(`@${NUM},${NUM}`),
  new RegExp(`^\\s*${NUM}\\s*[,،\\s]\\s*${NUM}\\s*$`),
];

/**
 * يستخرج الإحداثيات من رابط خرائط Google أو من نص مثل "35.6971, -0.6308"
 * (وهو ما يُنسخ بالنقر بالزر الأيمن على الخريطة في Google Maps).
 */
export function parseGoogleMapsInput(text) {
  if (!text) return null;
  let value = text.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // نص غير مُرمّز، نستعمله كما هو
  }

  for (const pattern of GOOGLE_PATTERNS) {
    const match = value.match(pattern);
    if (match) {
      const coords = toCoords(match[1], match[2]);
      if (coords) return coords;
    }
  }
  return null;
}

/** الروابط المختصرة لا يمكن فكّها من المتصفح، فننبّه المستخدم بدل الفشل بصمت */
export function isShortGoogleLink(text) {
  return /(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(text || "");
}

export function googleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function roundCoord(value) {
  return Number(value).toFixed(6).replace(/\.?0+$/, "");
}
