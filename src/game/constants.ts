// 游戏核心常量

// 地图尺寸
export const MAP_SIZE = 28;
export const MAP_BOUNDARY = 13;

// 关键位置
export const POSITIONS = {
  player: [0, 1.6, 9] as [number, number, number],
  playerTopView: [0, 18, 14] as [number, number, number],
  aedStation: [-8, 0, -5] as [number, number, number],
  patient: [3, 0, -3] as [number, number, number],
  ambulanceSpawn: [0, 0, -20] as [number, number, number],
  ambulanceTarget: [0, 0, -11] as [number, number, number],
  npc1: [-3, 0, 2] as [number, number, number],
  npc2: [6, 0, 1] as [number, number, number],
  npc3: [-6, 0, 5] as [number, number, number],
  bench: [-5, 0, 3] as [number, number, number],
  store: [8, 0, 6] as [number, number, number],
  flowerWall: [-8, 0, 8] as [number, number, number],
  poster: [8, 0, -6] as [number, number, number],
};

// 游戏时间
export const GAME_DURATION = 120; // 秒
export const AED_ARRIVAL_TIME = 40; // 秒后AED到达
export const AMBULANCE_ARRIVAL_TIME = 90; // 秒后救护车到达

// 靠近交互距离
export const INTERACTION_DISTANCE = 4;

// 按压节奏判定
export const COMPRESSION_TIMING = {
  perfect: { min: 500, max: 600 },
  good: { min: 460, max: 680 },
  slow: 680,
  fast: 460,
};

// 评分权重
export const SCORE_WEIGHTS = {
  processAccuracy: 0.4,
  timeEfficiency: 0.2,
  compressionRhythm: 0.2,
  errorControl: 0.1,
  civicCooperation: 0.1,
};

// 等级换算
export const GRADE_THRESHOLDS = {
  S: 90,
  A: 75,
  B: 60,
  C: 40,
};

export const FLOWERS_BY_GRADE: Record<string, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  F: 1,
};

// 扣分规则
export const MISTAKE_PENALTIES: Record<string, number> = {
  compress_before_call: 15,
  skip_scene_check: 10,
  skip_aed_assign: 10,
  contact_during_shock: 20,
  long_pause: 5,
  wrong_order: 8,
};

// 时间效率奖励（秒内完成得满分）
export const TIME_BONUS_THRESHOLDS = {
  call_120: 20,
  assign_aed: 30,
  start_compression: 45,
};

// 阶段文字
export const STEP_LABELS: Record<string, string> = {
  incident_found: '发现事件',
  scene_safe: '确认现场安全',
  emergency_called: '呼叫120',
  aed_requested: '指派取AED',
  response_checked: '判断意识',
  breath_checked: '判断呼吸',
  cpr_active: '胸外按压中',
  aed_ready: 'AED已到达',
  pads_attached: '已贴片',
  clear_confirmed: '已清场',
  shock_done: '电击完成',
  rescued: '救援到达',
};

// 操作提示（对应"当前步骤"下需要执行的下一个动作）
export const STEP_HINTS: Record<string, string> = {
  incident_found: '按 [E] 进入环顾任务，确认现场安全',
  scene_safe: '按 [1] 打开手机并输入 120',
  emergency_called: '走到旁观者面前按 [E] 对话，请对方取 AED',
  aed_requested: '按 [3] 贴近患者头肩，拍肩并呼唤',
  response_checked: '按 [4] 贴近患者脸部和胸廓观察呼吸',
  breath_checked: '按 [空格] 开始胸外按压',
  cpr_active: '按 [空格] 持续胸外按压',
  aed_ready: '按 [E] 打开 AED，再拖拽两片电极片',
  pads_attached: '按 [E] 左右扫视，确认无人接触患者',
  clear_confirmed: '按 [E] 等待 AED 倒计时并确认电击',
  shock_done: '按 [空格] 继续胸外按压',
  rescued: '救援已到达，完成专业交接',
};
