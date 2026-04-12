import { LiquidGlass } from './liquidGlass';

const BTN = 36;

export function NavBtn({ onClick, style, label, children }: {
  onClick: () => void;
  style?: React.CSSProperties;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...style }}
    >
      <LiquidGlass width={BTN} height={BTN} surface="squircle" bezel={8} thickness={40} borderRadius={10} blurAmount={0}>
        {children}
      </LiquidGlass>
    </button>
  );
}
