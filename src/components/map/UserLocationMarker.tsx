interface UserLocationMarkerProps {
  accuracy?: number; // In meters
}

export function UserLocationMarker({ accuracy }: UserLocationMarkerProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing outer circle */}
      <div
        className="absolute rounded-full bg-blue-400 opacity-30 animate-ping"
        style={{
          width: '40px',
          height: '40px',
          animationDuration: '2s',
        }}
      />

      {/* Static outer ring */}
      <div
        className="absolute rounded-full bg-blue-400 opacity-20"
        style={{
          width: '32px',
          height: '32px',
        }}
      />

      {/* Main blue dot */}
      <div
        className="relative rounded-full bg-blue-500 shadow-lg"
        style={{
          width: '16px',
          height: '16px',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
}
