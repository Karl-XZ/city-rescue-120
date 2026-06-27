// 关卡场景配置

export interface Scenario {
  id: string;
  title: string;
  description: string;
  shortDesc: string;
  location: [number, number, number];
  requiredSteps: string[];
  educationalNote: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'cardiac_arrest',
    title: '关卡1：广场突发心搏骤停',
    shortDesc: '成人突然倒地',
    description: '一名市民在篮球场边突然倒地，疑似心搏骤停。作为第一目击者，你必须在专业救援到达前，正确执行急救程序。',
    location: [3, 0, -3],
    requiredSteps: [
      'incident_found',
      'scene_safe',
      'emergency_called',
      'aed_requested',
      'response_checked',
      'breath_checked',
      'cpr_active',
      'aed_ready',
      'pads_attached',
      'clear_confirmed',
      'shock_done',
      'rescued',
    ],
    educationalNote: '心搏骤停的生存率每延误1分钟下降7-10%。尽早呼叫急救、及时开始CPR并使用AED是救命关键。',
    difficulty: 'normal',
  },
  {
    id: 'elderly_fall',
    title: '关卡2：老人跌倒',
    shortDesc: '老人跌倒教学',
    description: '一位老人不慎跌倒，你需要正确处理，切勿贸然搬动，了解正确的应急处置方式。',
    location: [-4, 0, 2],
    requiredSteps: ['incident_found', 'scene_safe', 'emergency_called'],
    educationalNote: '老人跌倒后不要随意搬动，应先判断意识和受伤情况，及时呼救，等待专业人员处理。',
    difficulty: 'easy',
  },
  {
    id: 'heatstroke',
    title: '关卡3：高温中暑',
    shortDesc: '中暑急救教学',
    description: '夏日高温下，一名路人出现中暑症状，你需要正确引导并提供帮助。',
    location: [5, 0, 4],
    requiredSteps: ['incident_found', 'scene_safe', 'emergency_called'],
    educationalNote: '发现中暑患者应立即将其移至阴凉处，补充水分，用冷水擦拭降温，严重时立即呼救。',
    difficulty: 'easy',
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}
