import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Defs, Path, Text, TextPath } from "react-native-svg";

function makePath(
  width: number,
  height: number,
  curvature = 0.5,
  padding = 0,
  verticalOffset = 0
) {
  // start at left (with optional horizontal padding) — quadratic bezier control point controls curve height
  const x0 = padding;
  const x1 = Math.max(width - padding, padding + 1);
  const y0 = height / 2 + verticalOffset;
  const y1 = height / 2 + verticalOffset;
  const cx = width / 2;
  const cy = y0 - curvature * height; // negative = upwards curve, positive = downwards
  return `M ${x0},${y0} Q ${cx},${cy} ${x1},${y1}`;
}

type Props = {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  curvature?: number;
  startOffset?: string | number;
  fill?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  padding?: number;
  verticalOffset?: number;
}
export default function CurvedText({
  text,
  width = 200,
  height = 40,
  fontSize = 14,
  curvature = 0.6,
  startOffset = "50%",
  fill = "#111",
  fontFamily, // new
  fontWeight,
  padding = 6,
  verticalOffset = 0,
}: Props) {
  const fontSizeNum = typeof fontSize === 'number' ? fontSize : parseInt(fontSize, 10);
  const runtimeFontSize = 1.5 * fontSizeNum;

  // add a small top/bottom padding in the viewport to avoid clipping
  const extraVPad = Math.max(8, Math.round(fontSize * 0.6));
  const viewBoxHeight = height + extraVPad * 2;

  const pathD = makePath(width, height + extraVPad * 2, curvature, padding, verticalOffset + extraVPad);
  const pathId = useMemo(() => `curve-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <View style={{ width, height, overflow: "visible" }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${viewBoxHeight}`}>
        <Defs>
          <Path id={pathId} d={pathD} />
        </Defs>

        <Text fill={fill} fontSize={runtimeFontSize} fontFamily={fontFamily} fontWeight={fontWeight}>
          <TextPath href={`#${pathId}`} startOffset={startOffset}>
            {text}
          </TextPath>
        </Text>
      </Svg>
    </View>
  );
}