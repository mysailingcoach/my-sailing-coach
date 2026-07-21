export function formatNumber(value, decimals = 1) {
  return value != null && !isNaN(value)
    ? Number(value).toFixed(decimals)
    : 'N/A';
}

export function formatMetersMadeGood(value) {
  return value != null && !isNaN(value)
    ? `${formatNumber(value, 0)} m`
    : 'N/A';
}

export function buildManeuverSummary(maneuver = {}) {
  return `Δ heading ${formatNumber(maneuver.headingChange, 1)}° • speed ${formatNumber(maneuver.speedBefore, 2)} → ${formatNumber(maneuver.speedAfter, 2)} km/h • MMG ${formatMetersMadeGood(maneuver.metersMadeGood)}`;
}

export function buildManeuverListLabel(
  maneuver = {}
) {
  return `${maneuver.type || 'Maneuver'} • point ${maneuver.index ?? 'N/A'} • MMG ${formatMetersMadeGood(maneuver.metersMadeGood)}`;
}
