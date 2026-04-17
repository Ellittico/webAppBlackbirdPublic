// LoadingSpinner.tsx
type LoadingSpinnerProps = {
  width?: number;
  height?: number;
};

export default function LoadingSpinner({ width, height }: LoadingSpinnerProps) {
  const size = {
    width: width ?? 40,
    height: height ?? 40,
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }} role="status" aria-live="polite">
      <style>
        {`
          @keyframes spin_keyframes {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <span
        aria-hidden="true"
        style={{
          width: size.width,
          height: size.height,
          border: "3px solid currentColor",
          borderTopColor: "transparent",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin_keyframes 0.8s linear infinite"
        }}
      />
    </div>
  );
}
