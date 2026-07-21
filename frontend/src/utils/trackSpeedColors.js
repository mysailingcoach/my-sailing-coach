const SPEED_COLORS = [
  '#1d4ed8',
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#dc2626'
];

export const DEFAULT_TRACK_COLOR = '#6b7280';

export function getSpeedColorDomain(trackpoints = []) {
  const speeds = trackpoints
    .map(point => point?.sog)
    .filter(
      speed => speed !== null && speed !== ''
    )
    .map(speed => Number(speed))
    .filter(Number.isFinite);

  if (speeds.length === 0) {
    return null;
  }

  return {
    min: Math.min(...speeds),
    max: Math.max(...speeds)
  };
}

export function getSpeedTrackColor(speed, domain) {
  const numericSpeed = Number(speed);

  if (
    !Number.isFinite(numericSpeed) ||
    !domain ||
    !Number.isFinite(domain.min) ||
    !Number.isFinite(domain.max)
  ) {
    return DEFAULT_TRACK_COLOR;
  }

  if (domain.max <= domain.min) {
    return SPEED_COLORS[2];
  }

  const normalized = Math.min(
    1,
    Math.max(
      0,
      (numericSpeed - domain.min) /
        (domain.max - domain.min)
    )
  );

  const index = Math.min(
    SPEED_COLORS.length - 1,
    Math.floor(normalized * SPEED_COLORS.length)
  );

  return SPEED_COLORS[index];
}
