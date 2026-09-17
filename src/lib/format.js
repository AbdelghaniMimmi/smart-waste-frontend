const ROLE_LABELS = {
  admin: "مدير النظام",
  agent: "موظف",
  driver: "سائق",
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || "—";
}

export function roleBadgeClass(role) {
  if (role === "admin") return "badge badge--danger";
  if (role === "agent") return "badge badge--info";
  return "badge badge--ok";
}

export function initials(name) {
  if (!name) return "؟";
  return name.trim().slice(0, 2);
}

export function fillTone(level) {
  if (level === null || level === undefined) return "neutral";
  if (level >= 80) return "danger";
  if (level >= 50) return "warn";
  return "ok";
}

export function dashboardPath(role) {
  if (role === "driver") return "/driver-dashboard";
  if (role === "agent") return "/agent-dashboard";
  return "/admin-dashboard";
}

/**
 * يفضّل المسافة الحقيقية عبر الطرق، ويعود إلى المسافة المباشرة إن تعذّرت
 * خدمة التوجيه.
 */
export function routeDistance(route) {
  if (route?.roadDistanceKm != null) {
    return { km: route.roadDistanceKm, onRoads: true };
  }
  if (route?.totalDistanceKm != null) {
    return { km: route.totalDistanceKm, onRoads: false };
  }
  return { km: null, onRoads: false };
}

const RELATIVE_UNITS = [
  { limit: 60, unit: "second", ms: 1000 },
  { limit: 60, unit: "minute", ms: 60000 },
  { limit: 24, unit: "hour", ms: 3600000 },
  { limit: 30, unit: "day", ms: 86400000 },
];

export function relativeTime(value) {
  if (!value) return "";

  const elapsed = Date.now() - new Date(value).getTime();
  const formatter = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

  for (const { limit, unit, ms } of RELATIVE_UNITS) {
    const amount = Math.round(elapsed / ms);
    if (Math.abs(amount) < limit) {
      return formatter.format(-amount, unit);
    }
  }

  return formatDateTime(value);
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
