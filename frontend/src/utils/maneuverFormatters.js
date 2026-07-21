export function formatNumber(value, decimals = 1) {
  return value != null && !isNaN(value)
    ? Number(value).toFixed(decimals)
    : 'N/A';
}

export function formatMetersMadeGood(value) {
  const formattedValue = formatNumber(value, 0);

  return formattedValue === 'N/A'
    ? formattedValue
    : `${formattedValue} m`;
}

export function buildManeuverSummary(maneuver = {}) {
  return (
    `Δ heading ${formatNumber(maneuver.headingChange, 1)}°` +
    ` • speed ${formatNumber(maneuver.speedBefore, 2)}` +
    ` → ${formatNumber(maneuver.speedAfter, 2)} km/h`
  );
}

export function buildManeuverListLabel(
  maneuver = {}
) {
  return (
    `${maneuver.type || 'Maneuver'} • point ` +
    `${maneuver.index ?? 'N/A'} • made good ` +
    `${formatMetersMadeGood(maneuver.metersMadeGood)}`
  );
}
