/**
 * Welcome slide 3 art: a phone showing the helper's WhatsApp check-in. Vector, so it stays sharp
 * at any size (the raster character crops blur when scaled up). Drawn in the Pawsure style:
 * thick charcoal outlines, yellow accents. Colours from tokens.
 */
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { chatSim as wa, color, iconFill } from './theme';

export function CheckInArt({ width = 300, label }: { width?: number; label?: string }) {
  const ink = color.border.strong;
  const h = Math.round(width * (280 / 300));
  return (
    <Svg width={width} height={h} viewBox="0 0 300 280" accessible={!!label} accessibilityLabel={label}>
      {/* soft yellow backdrop and sparkles */}
      <Circle cx={150} cy={150} r={118} fill={color.bg.selected} />
      <G stroke={iconFill.yellow} strokeWidth={6} strokeLinecap="round">
        <Path d="M38 70 L54 82" /><Path d="M30 112 L50 112" /><Path d="M262 64 L246 78" /><Path d="M272 108 L252 110" />
      </G>
      {/* phone */}
      <Rect x={82} y={18} width={136} height={250} rx={22} fill={color.bg.raised} stroke={ink} strokeWidth={5} />
      <Rect x={124} y={28} width={52} height={10} rx={5} fill={ink} />
      {/* chat header */}
      <Path d="M87 46 H213 V70 H87 Z" fill={wa.header} />
      <Circle cx={102} cy={58} r={8} fill={iconFill.yellow} />
      <SvgText x={102} y={62} fontSize={10} fontWeight="700" fill={ink} textAnchor="middle">P</SvgText>
      <SvgText x={116} y={62} fontSize={11} fontWeight="700" fill={wa.onHeader}>Pawsure</SvgText>
      <Circle cx={170} cy={58} r={5} fill={wa.badge} />
      {/* wallpaper */}
      <Rect x={87} y={70} width={126} height={186} fill={wa.wallpaper} />
      {/* prompt bubble */}
      <Rect x={94} y={80} width={92} height={30} rx={7} fill={wa.bubbleIn} />
      <SvgText x={100} y={93} fontSize={8.5} fill={wa.text}>1:00 pm · Bruno</SvgText>
      <SvgText x={100} y={104} fontSize={8.5} fontWeight="700" fill={wa.text}>Lunch + water</SvgText>
      {/* photo bubble: the bowl with today's code */}
      <Rect x={118} y={118} width={88} height={78} rx={8} fill={wa.bubbleOut} />
      <Rect x={124} y={124} width={76} height={56} rx={5} fill={wa.media} />
      <Path d="M138 154 H186 A24 14 0 0 1 138 154 Z" fill={iconFill.orange} stroke={ink} strokeWidth={2.5} strokeLinejoin="round" />
      <Path d="M146 150 Q162 140 178 150" stroke={ink} strokeWidth={2.5} fill={iconFill.amber} strokeLinecap="round" />
      <Rect x={146} y={128} width={32} height={12} rx={3} fill={wa.surface} />
      <SvgText x={162} y={137} fontSize={8} fontWeight="700" fill={ink} textAnchor="middle">0144</SvgText>
      <G stroke={wa.tick} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M184 189 L187 192 L192 186" /><Path d="M189 191 L190 192 L195 186" />
      </G>
      {/* thank-you bubble */}
      <Rect x={94} y={204} width={86} height={22} rx={7} fill={wa.bubbleIn} />
      <SvgText x={100} y={219} fontSize={9} fontWeight="700" fill={wa.text}>Recorded ✓</SvgText>
      {/* message bar */}
      <Rect x={93} y={234} width={92} height={16} rx={8} fill={wa.surface} />
      <Circle cx={199} cy={242} r={9} fill={wa.header} />
      <Rect x={196.5} y={236.5} width={5} height={8} rx={2.5} fill={wa.onHeader} />
      {/* big yellow tick badge */}
      <Circle cx={232} cy={204} r={26} fill={iconFill.yellow} stroke={ink} strokeWidth={5} />
      <Path d="M220 204 L229 213 L245 196" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* paw */}
      <G fill={ink} transform="translate(-16 0)">
        <Circle cx={60} cy={196} r={13} /><Circle cx={45} cy={176} r={6} /><Circle cx={58} cy={168} r={6} /><Circle cx={72} cy={170} r={6} /><Circle cx={80} cy={182} r={5.5} />
      </G>
    </Svg>
  );
}
