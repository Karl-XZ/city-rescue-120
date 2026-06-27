# 城市急救 120 秒

公益主题浏览器端轻量 3D 急救模拟游戏。玩家在城市社区内扮演第一目击者，在 120 秒内完成确认现场安全、呼叫 120、指派旁观者取 AED、判断意识和呼吸、胸外按压、AED 操作、等待专业救援接手等关键步骤。

本项目仅用于公益急救科普和情景模拟，不能替代红十字会、急救中心或其他专业机构的线下培训。实际急救请优先拨打 120，并遵循急救调度员、AED 设备语音提示和专业人员指导。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- Three.js / React Three Fiber
- Zustand
- Web Audio API

## 本地开发

环境要求：

```bash
node -v  # 建议 Node.js 20+
npm -v
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 项目结构

```text
src/
  App.tsx
  GameApp.tsx
  audio/
    sound.ts
  components/
    ActionPanel.tsx
    BriefingScreen.tsx
    CreditsScreen.tsx
    GameScreen.tsx
    HUD.tsx
    MobileControls.tsx
    ResultScreen.tsx
    RhythmBar.tsx
    StartScreen.tsx
  game/
    constants.ts
    scenarios.ts
    state.ts
  scene/
    AEDStation.tsx
    Ambulance.tsx
    CommunityScene.tsx
    NPC.tsx
    Patient.tsx
```

## 素材资源

`public/assets/characters/` 中已准备一组第一人称贴片化可用的 2D 卡通素材，包括病人倒地、CPR 上衣打开、恢复 3 个阶段、路人 3 个、医护 2 个和救援道具 7 个。病人倒地与 CPR 阶段在场景中以贴地平面渲染，路人与医护以始终面向玩家的立绘渲染。

## 玩法摘要

1. 靠近倒地患者。
2. 确认现场安全。
3. 呼叫 120。
4. 指派旁观者取 AED。
5. 判断意识和呼吸。
6. 使用空格键进行胸外按压节奏操作。
7. AED 到达后打开设备并贴片。
8. 确认无人接触患者，完成模拟电击。
9. 继续按压直到救护车到达。
10. 结算页展示评分、小红花和急救流程复盘。

## 交付说明

项目为纯前端静态 Web 应用，构建后生成 `dist/` 目录，可部署到任意静态文件服务器。
