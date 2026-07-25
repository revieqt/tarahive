import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

function flatHexPath(cx: number, cy: number, r: number, cornerRadius = 6): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    points.push([
      cx + r * Math.cos(angleRad),
      cy + r * Math.sin(angleRad),
    ]);
  }

  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const curr = points[i];
    const prev = points[(i + 5) % 6];
    const next = points[(i + 1) % 6];

    const toPrev = [prev[0] - curr[0], prev[1] - curr[1]];
    const toNext = [next[0] - curr[0], next[1] - curr[1]];
    const lenPrev = Math.hypot(toPrev[0], toPrev[1]);
    const lenNext = Math.hypot(toNext[0], toNext[1]);

    const cr = Math.min(cornerRadius, lenPrev / 2, lenNext / 2);

    const p1 = [
      curr[0] + (toPrev[0] / lenPrev) * cr,
      curr[1] + (toPrev[1] / lenPrev) * cr,
    ];
    const p2 = [
      curr[0] + (toNext[0] / lenNext) * cr,
      curr[1] + (toNext[1] / lenNext) * cr,
    ];

    if (i === 0) {
      parts.push(`M${p1[0].toFixed(3)},${p1[1].toFixed(3)}`);
    } else {
      parts.push(`L${p1[0].toFixed(3)},${p1[1].toFixed(3)}`);
    }
    parts.push(`Q${curr[0].toFixed(3)},${curr[1].toFixed(3)} ${p2[0].toFixed(3)},${p2[1].toFixed(3)}`);
  }

  return parts.join(' ') + ' Z';
}

const R = 38;
const GAP = 5;

const colStep = (R * 3) / 2 + GAP * (Math.sqrt(3) / 2);
const rowStep = R * Math.sqrt(3) + GAP;
const COLUMNS = [4, 3, 2, 1];

interface Cell {
  col: number;
  row: number;
}

const cells: Cell[] = [];
COLUMNS.forEach((count, col) => {
  for (let row = 0; row < count; row++) {
    cells.push({ col, row });
  }
});

const MAX_DEPTH = 8;

function hexOpacity(col: number, row: number): number {
  const depth = col + row;
  const t = Math.min(depth / MAX_DEPTH, 1);
  return parseFloat((0.55 - t * 0.5).toFixed(3));
}

const COLS = COLUMNS.length;
const MAX_ROWS = COLUMNS[0];
const BLEED = R;
const canvasW = (COLS - 1) * colStep + R * 2 + BLEED;
const tallestH = (MAX_ROWS - 1) * rowStep + R * 2 + rowStep / 2 + BLEED;
const canvasH = tallestH;

function cellCenter(col: number, row: number): { cx: number; cy: number } {
  const cx = canvasW - BLEED - R - col * colStep;
  const vertOffset = col % 2 === 0 ? 0 : rowStep / 2;
  const cy = canvasH - BLEED - R - row * rowStep - vertOffset;
  return { cx, cy };
}

interface HiveBgProps {
  flipHorizontal?: boolean;
  blur?: boolean;
  blurAmount?: number;
  fade?: boolean;
}

const HiveBg: React.FC<HiveBgProps> = ({
  flipHorizontal = false,
  blur = true,
  blurAmount = 2,
  fade = true,
}) => {
  const HEX_COLOR = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View
      style={[
        styles.container,
        flipHorizontal && { transform: [{ scaleX: -1 }] },
        blur && { filter: `blur(${blurAmount}px)` } as any,
      ]}
      pointerEvents="none"
    >
      <Svg
        width={canvasW}
        height={canvasH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        style={styles.svg}
      >
        <G>
          {cells.map(({ col, row }) => {
            const { cx, cy } = cellCenter(col, row);
            return (
              <Path
                key={`${col}-${row}`}
                d={flatHexPath(cx, cy, R)}
                fill={HEX_COLOR}
                fillOpacity={hexOpacity(col, row)}
              />
            );
          })}
        </G>
      </Svg>

      {fade && (
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.gradient}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    opacity: 0.8,
  },
  svg: {
    marginRight: '-15%',
    marginBottom: '-20%',
  },
  gradient: {
    position: 'absolute',
    height: 50,
    left: 0,
    right: 0,
    bottom: -3,
  },
});

export default HiveBg;