import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useThemeColor } from '@/shared/hooks/useThemeColor';

function flatHexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`);
  }
  return pts.join(' ') + ' Z';
}

const R = 38;
const GAP = 5;

const colStep = (R * 3) / 2 + GAP * (Math.sqrt(3) / 2);
const rowStep = R * Math.sqrt(3) + GAP;
const COLUMNS = [ 4, 3, 2, 1];

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

const HiveBg: React.FC = () => {
  const HEX_COLOR = useThemeColor({}, 'accent');
  return (
    <View style={styles.container} pointerEvents="none">
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
});

export default HiveBg;