import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";

type Props = {
  value: string;
};

export default function Captcha({ value }: Props) {
  const width = 260;
  const height = 80;

  const randomLines = useMemo(
    () =>
      Array.from({ length: 15 }).map(() => ({
        x1: Math.random() * width,
        y1: Math.random() * height,
        x2: Math.random() * width,
          
        y2: Math.random() * height,
      })),
    []
  );

  return (
    <View>
      <Svg width={width} height={height}>
        {randomLines.map((line, index) => (
          <Line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#5cb364"
            strokeWidth={1}
          /> 
        ))}

        <SvgText
          x={width / 2}
          y={height / 2 + 12}
          fontSize={30}
          fontWeight="bold"
          fill="#000"
          textAnchor="middle"
          letterSpacing={8}
        >
          {value}
        </SvgText>
      </Svg>
    </View>
  );
}