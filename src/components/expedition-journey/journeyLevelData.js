import { GROUND_Y, JOURNEY_VERTICAL_OFFSET, WORLD_WIDTH, scaleJourneyX } from './journeyConstants.js';

const JY = (y) => y + JOURNEY_VERTICAL_OFFSET;
const X = scaleJourneyX;

export const JOURNEY_TOOLS = [
  { id: 'brush', name: 'Reed Brush', emoji: '🖌️', icon: 'B' },
  { id: 'trowel', name: 'Bronze Trowel', emoji: '⛏️', icon: 'T' },
  { id: 'notebook', name: 'Field Journal', emoji: '📓', icon: 'J' },
  { id: 'camera', name: 'Survey Lens', emoji: '📷', icon: 'L' },
  { id: 'measuring-tape', name: 'Measuring Cord', emoji: '📏', icon: 'M' },
  { id: 'field-guide-page', name: 'Papyrus Guide', emoji: '📜', icon: 'P' },
];

export const SECTIONS = [
  { id: 'desert-entry', name: 'Desert Entry', start: X(0), end: X(1500), color: '#f3e5ab', accent: '#b45309' },
  { id: 'ruined-temple', name: 'Ruined Temple', start: X(1500), end: X(3150), color: '#d1bfa7', accent: '#5c4033' },
  { id: 'catacombs', name: 'Catacombs', start: X(3150), end: X(5050), color: '#3d3d3d', accent: '#7c3aed' },
  { id: 'escape-sequence', name: 'Escape Sequence', start: X(5050), end: X(6500), color: '#a16207', accent: '#991b1b' },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', start: X(6500), end: WORLD_WIDTH, color: '#dcfce7', accent: '#166534' },
];

const SCRIBE_CHAMBER_OFFSET = 5200;

export const TOOL_LAYOUT = [
  { id: 'brush', x: X(255), y: JY(314) },
  { id: 'trowel', x: X(705), y: JY(320) },
  { id: 'notebook', x: X(1840), y: JY(286) },
  { id: 'camera', x: X(2898), y: JY(250) },
  { id: 'measuring-tape', x: X(4388), y: JY(234) },
  { id: 'field-guide-page', x: X(5526), y: JY(230) },
];

export const PLATFORMS = [
  { x: X(0), y: GROUND_Y, width: X(1500), height: 60, label: 'desert track' },
  { x: X(1500), y: GROUND_Y, width: X(1650), height: 60, label: 'temple floor' },
  { x: X(3150), y: GROUND_Y, width: X(1900), height: 60, label: 'catacomb path' },
  { x: X(5050), y: GROUND_Y, width: X(1450), height: 60, label: 'escape road' },
  { x: X(6500), y: GROUND_Y, width: WORLD_WIDTH - X(6500), height: 60, label: 'dig-site rise' },
  { id: 'opening-lower-ruin-ledge', x: 0, y: JY(318), width: 430, height: 18, label: 'invisible marked lower pyramid ledge', invisible: true },
  { id: 'opening-first-terrace', x: 320, y: JY(166), width: 365, height: 18, label: 'invisible marked first pyramid terrace', invisible: true },
  { id: 'opening-second-terrace', x: 420, y: JY(36), width: 395, height: 18, label: 'invisible marked second pyramid terrace', invisible: true },
  { id: 'opening-scarab-seal-summit', x: 620, y: JY(-101), width: 360, height: 18, label: 'invisible marked scarab artefact platform', invisible: true },
  { id: 'mummification-chamber-sand-buried-block', x: X(535), y: JY(296), width: 235, height: 18, label: 'invisible buried block at the Mummification Chamber exterior', secret: true, invisible: true },
  { id: 'mummification-chamber-carved-lower-ledge', x: X(590), y: JY(234), width: 218, height: 18, label: 'invisible carved lower ledge on the Mummification Chamber exterior', secret: true, invisible: true },
  { id: 'mummification-chamber-damaged-stair', x: X(646), y: JY(176), width: 215, height: 18, label: 'invisible damaged stair at the Mummification Chamber exterior', secret: true, invisible: true },
  { id: 'mummification-chamber-upper-rite-ledge', x: X(700), y: JY(112), width: 225, height: 18, label: 'invisible upper rite ledge at the Mummification Chamber exterior', secret: true, invisible: true },
  { id: 'mummification-chamber-doorway-floor', x: X(740), y: JY(48), width: 250, height: 18, label: 'invisible doorway floor at the Mummification Chamber entrance', secret: true, invisible: true },
  { id: 'mummification-chamber-floor', sceneId: 'mummification-chamber', x: X(520), y: JY(318), width: X(240), height: 18, label: 'invisible full Mummification Chamber floor', secret: true, invisible: true },
  { id: 'forgotten-mural-lower-masonry', x: 4480, y: JY(276), width: 230, height: 18, label: 'invisible collapsed ceremonial masonry step over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-carved-wall-ledge', x: 4660, y: JY(218), width: 230, height: 18, label: 'invisible carved wall ledge in hidden priest passage art', secret: true, invisible: true },
  { id: 'forgotten-mural-broken-warning-step', x: 4845, y: JY(160), width: 240, height: 18, label: 'invisible broken warning-stone ledge over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-priest-passage-shelf', x: 5030, y: JY(104), width: 260, height: 18, label: 'invisible hidden priest passage shelf over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-column-shelf', x: 5225, y: JY(44), width: 230, height: 18, label: 'invisible right-side column shelf over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-upper-doorway-floor', x: 5425, y: JY(-20), width: 280, height: 18, label: 'invisible upper doorway floor over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-alcove-floor', sceneId: 'forgotten-mural-chamber', x: 5010, y: JY(318), width: 2600, height: 18, label: 'invisible full Forgotten Mural Chamber floor over generated chamber art', secret: true, invisible: true },
  { id: 'forgotten-mural-forward-passage-step', x: 5588, y: JY(-54), width: 230, height: 18, label: 'invisible forward stonework return from the hidden alcove over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-return-masonry', x: 5795, y: JY(52), width: 240, height: 18, label: 'invisible return masonry over generated mural structure', secret: true, invisible: true },
  { id: 'forgotten-mural-lower-return', x: 5995, y: JY(170), width: 260, height: 18, label: 'invisible lower return ledge from priest passage over generated art', secret: true, invisible: true },
  { id: 'scribe-chamber-buried-lower-block', x: X(1088) + SCRIBE_CHAMBER_OFFSET, y: JY(302), width: 300, height: 18, label: 'invisible buried lower block at the Scribe Chamber platform', secret: true, invisible: true },
  { id: 'scribe-chamber-collapsed-stair-slab', x: X(1102) + SCRIBE_CHAMBER_OFFSET, y: JY(250), width: 305, height: 18, label: 'invisible collapsed stair slab at the Scribe Chamber platform', secret: true, invisible: true },
  { id: 'scribe-chamber-middle-rubble-landing', x: X(1088) + SCRIBE_CHAMBER_OFFSET, y: JY(198), width: 285, height: 18, label: 'invisible middle rubble landing at the Scribe Chamber platform', secret: true, invisible: true },
  { id: 'scribe-chamber-upper-carved-landing', x: X(1114) + SCRIBE_CHAMBER_OFFSET, y: JY(138), width: 265, height: 18, label: 'invisible upper carved landing at the Scribe Chamber platform', secret: true, invisible: true },
  { id: 'scribe-chamber-doorway-threshold', x: X(1128) + SCRIBE_CHAMBER_OFFSET, y: JY(72), width: 215, height: 18, label: 'invisible raised doorway threshold at the Scribe Chamber entrance', secret: true, invisible: true },
  { id: 'scribe-locked-chamber-floor', sceneId: 'scribe-locked-chamber', x: X(1180) + SCRIBE_CHAMBER_OFFSET, y: JY(318), width: X(210), height: 18, label: 'invisible Scribe Locked Chamber floor', secret: true, invisible: true },
