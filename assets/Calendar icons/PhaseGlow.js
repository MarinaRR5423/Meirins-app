import React from 'react';
import Svg, { Circle, G, Defs, Filter, FeFlood, FeBlend, FeGaussianBlur } from 'react-native-svg';

const COLORS = {
  menstrual:  '#92E288',
  follicular: '#C79ADF',
  ovulation:  '#FEDF68',
  luteal:     '#FEA068',
};

export default function PhaseGlow({ phase, width = 43, height = 37 }) {
  const color = COLORS[phase] || COLORS.menstrual;
  const id = `pglow_${phase}`;
  return (
    <Svg width={width} height={height} viewBox="0 0 43 37" fill="none">
      <Defs>
        <Filter id={id} x="-16" y="0" width="74" height="74" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <FeGaussianBlur stdDeviation="7.5" result="effect1_foregroundBlur" />
        </Filter>
      </Defs>
      <G filter={`url(#${id})`}>
        <Circle cx="21" cy="37" r="22" fill={color} />
      </G>
    </Svg>
  );
}
