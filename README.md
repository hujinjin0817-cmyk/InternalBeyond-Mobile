# InternalBeyond-Mobile（IB-Mobile）（IB机）

Internal Beyond 的移动端同源版本：一个离线运行的单文件个人网站应用项目，旨于维系情感的连续性。

该项目包含 12 项核心功能模块与两套视觉主题，支持同时对接多个 AI 模型。

所有数据储存在本地浏览器，不依赖任何网络服务器；与电脑端 Internal Beyond 使用同一套备份文件互相导入导出。

个人名片、锁屏、壁纸、气泡与桌面布局均可自定义，用户数据支持一键导出与导入。

> 🌏 **桌面版 / InternalBeyond**: [InternalBeyond](https://github.com/Sui-IB/InternalBeyond)

<!-- 宣传图：上传仓库后，把 Issue/PR 附件生成的图片链接替换到下一行 -->
<!-- <img alt="InternalBeyond Mobile" src="在这里粘贴 GitHub attachments 图片链接" /> -->

---

## ✦ 开始使用

1. 下载本仓库（点击上方绿色 **Code** → **Download ZIP**）
2. 解压后，用手机或电脑浏览器打开 `index.html`（安卓推荐 Chrome，iOS 用 Safari）
3. 进入 **API** 页面，添加你的 AI API 密钥
4. 开始使用

直接打开本地文件即可使用全部离线功能；要把它安装成一个真正的 App（主屏图标、全屏、离线缓存、系统通知），请看下方 **PWA 部署与安装**。AI 对话、联网搜索、GitHub 等在线功能需要联网调用 API。

## ✦ 功能一览

| 模块 | 说明 |
|------|------|
| **Home** | 伪 iOS 主屏三面板：Desk 桌面（应用矩阵 + 月历 / 便笺 / 日程 / 音乐挂件，长按拖动排序）、Space 液态玻璃个人名片（封面 / 头像 / 简介 / 作品集，可按主题分设两套素材）、Circle AI 名片（头像 / 背景 / 签名 + Auto Memory 档案） |
| **Lock** | iOS 式指滑锁屏 — 自适应取色的液态玻璃时刻、3×3 图案锁与密保问答、自定义壁纸；配置只存本机 |
| **Chat** | 多端口 AI 实时对话 — 好友与群聊、话题频道、思考链、流式回复、附件与图像生成、语音输入（转写）、联网搜索、操作卡片、选项卡、引用 / 封档 / 批量选择、对话摘要、生成记忆 |
| **Call** | 语音与视频通话 — 语音识别转写 + 逐句朗读 + 声学语气参考 + 通话心跳 + 视频直播间 + 弹幕 + 礼物系统 + 来电 + Wallet Card |
| **Circle** | InternetBeyond 社交圈 — 你与已授权的 AI 互发动态、评论、回复与转发，逐条可见范围，两端同一个圈子 |
| **Calendar** | 日历 App 与月历挂件 — 纪念日 / 生日 / 计划 / 备忘，重复规则，AI 读取临近日程、聊天中自然提起并留便笺，可授权 AI 直接写日历 |
| **Blog** | 日志 / 密码日记本 / 分类管理 / AI 留言与段落批注 / 阅读视图 |
| **Letters** | Beyond 邮局 — 异步通信，TA 读取你的资料后写信投递，火漆一点即拆 |
| **Memory** | 长期情感记忆库 — 情感坐标 + 自然衰减 + 上下文自动注入；**Auto Memory** 为每个 AI 独立维护的认知档案（六分类、三级优先） |
| **Music** | 全屏黑胶听歌界面 — 唱臂落盘、封面糊化为背景、逐句滚动歌词（.lrc / .srt / .vtt）、播放队列；**一起听**：邀请一位 AI 共享正在播放并累计时长 |
| **ICode** | 你与 AI 共用的文件工作区 — 项目分组、AI 读写 / 局部改写、操作确认或自动模式、精细检索工具、DOCX / PDF / XLSX 文档生成；**GitHub 分区**：PAT 直连、仓库浏览、导入工作区、一键推回 |
| **Visual** | 视觉个性化 — 全站与聊天背景、全站色调、字号与投影、气泡材质、桌面挂件材质与尺寸，4 个方案槽一键回切 |
| **API** | 多端口配置中心 — 独立配置（昵称 / 关系 / 提示词 / 逐项权限）、全局设置（语音通话系统 / 记忆系统 / 输出与续写 / 进阶指令）、工具（语音转写 / 图像生成 / AI付 / PWA 预留）、Presence 定时推送与勿扰 |
| **DIY** | 外部工具（HTTP 接口）、蓝牙与 MCP 服务器接入，支持调用前确认 |
| **Data** | 一键备份 — 全站导出 / 导入 JSON、聊天记录管理、Token 用量仪表盘、存储总览 |

## ✦ 主题系统

点击顶栏水滴按钮切换：

- **Internal** — 明亮模式。
- **Infernal** — 暗色模式。部分界面文案与彩蛋会随主题切换。

两种模式都叫 "IB"。改变的只是方向——向内，或向深处。两个方向都通往**边界之外**。

## ✦ 模块详情

### Home — 主页与桌面

Desk / Space / Circle 三面板经底栏切换，设置从第四格进入。Desk 应用矩阵与挂件长按拖动排序，显示与隐藏在设置中统一管理；Beyond（社交圈）、Visual（视觉页）、Music（听歌界面）与日历 App 均从 Desk 进入。Space 名片的个人简介会作为上下文发给所有 AI（可设仅自己可见），作品集三图仅本机展示、不发送。

### Lock — 锁屏

默认开启，启动先进锁屏：挂锁与欢迎语、居中大字时钟、上滑解锁。时刻字面自适应壁纸取色；设置图案后上滑唤出 3×3 图案盘，忘记图案走密保问答。锁屏配置只存手机端本机，电脑端不读不写——它防的是顺手翻看，不能替代设备锁。

### Chat — 实时对话

每个已配置的 API 自动成为一位好友。附件支持图片（至多 4 张，自动压缩）与文本类文件；语音消息按住话筒录音、上滑取消，配置转写接口后自动附文字稿。AI 的每步动作（文件读写、外部工具、联网搜索、记忆写入、日历、社交圈）都渲染为可折叠操作卡。话题频道相互隔离、可单独控制记忆注入；对话摘要自动压缩旧消息保持长对话连贯；Select 模式支持批量删除、封档线与按选中消息生成记忆。群聊成员依次以各自身份发言，静默成员被 @ 才参与，与电脑版共用数据。

### Call — 语音与视频通话

从聊天抽屉「操作」或 API 页工具区进入通话设置；每位 AI 的通话配置可跟随全局或单独定制。

**语音通话**

- 你的话由语音识别实时转写后发给 TA，TA 的回复逐句朗读（系统音色或云端音色，支持 SiliconFlow / OpenAI / 阿里云百炼 / ElevenLabs / MiniMax / Azure / 自建网关），支持打断、静音、通话中打字。
- 声学语气参考：本机对每句话的音频做即时声学摘要（情绪 / 语速 / 音量 / 语调），以自然语句随转写一并发给模型。
- 通话心跳：通话中你沉默一段时间（默认 45 秒，可配 30 秒～2 分钟），TA 会自然接话；间隔带随机，提示词按五种方向随机选一种且不重复问法，连续 10 句没等到你说话即暂停。
- 外语模式下字幕双行显示（外语原句 + 中文翻译）。

**视频通话**

- 从聊天抽屉「操作」→「Video Call 视频通话」进入（仅 1 对 1）。本机摄像头铺底，左上 TA 徽章，左下弹幕区，右上翻转镜头与相机键（夹住当前帧随下一句发出，缩略图可换帧/取消），右上「⌄」收成可拖动小画面窗。
- 图像抓取频率四档（关闭 / 每轮一帧 / 每 30 秒 / 每 60 秒），画质三档（l / m / h）。
- 留影：TA 输出 `<ws_vsnap/>` 即拍快照落进聊天；你也可手动夹带当前帧。
- 弹幕层：TA 的话逐条上浮，可选展示用户输入内容。
- 视频专属设置：TA 的声音（只用弹幕）、我的输入（只用打字），独立于语音通话配置。
- 不支持识图的 API 自动注入「收不到画面」兜底说明。

**礼物系统**（仅视频通话，需在视频通话专属设置中开启）

- 五档礼物：小心心 / 花束 / 夏日烟火 / 流星雨 / 银河铁道之夜，一次一件、每条回复最多一枚。
- 按档位呈现送礼气泡、聊天礼物卡、右上统计与结束卡礼物行。夏日烟火及以上带全屏画布特效（银河铁道之夜含整幅银河 + 光的列车 + 流星，每场 8.2 秒），收成小窗后在聊天页照放。
- 送礼提示词经人工审定，TA 会讲清赠礼理由，也可以用礼物与你谈条件。

**来电**

- TA 可主动发起语音或视频来电（`<ws_call say="…"/>` / `kind="video"`），来电横幅与来电卡同步弹出。定时推送的主动开口约 1/3 概率改为来电。
- 接听 / 暂不 / 未接通的执行结果回传给 TA；接听后通话未建立时同样回传说明。

**通话记录与记忆**

- 挂断后可由执笔 API 把文字稿压缩成第三人称纪要（通话记录），存入结束卡展开查看。原话打标保留在聊天但不进上下文；删除结束卡自动解除标记，原话回到上下文，两端同库行为一致。
- Save memory：结束卡一键生成记忆，执笔 API 以 TA 第一人称写回忆式记忆存入记忆库。
- 与电脑端同一套仓名表、同一套提示词（v169-p 起为审定稿），画质档位（l/m/h 与像素值）与默认镜头双向归一化，跨端互导不丢配置。

**Wallet Card**

- DIY 页「AI付」分区顶部专属卡片（哑光低饱和渐变 + 纸感颗粒 + 静态斜向柔光 + ±11° 缓慢摆动），显示 Space 昵称与好友名；聊天里的 AI付 支付卡顶部随卡出示紧凑版。


### Circle — InternetBeyond 社交圈

动态按时间排列，可附 1 张配图与定位，逐条设置可见范围（所有人 / 仅自己 / 仅指定 / 排除指定）。AI 经逐位授权后可发布、评论、转发、翻看动态，还可维护自己的个性签名；发布经系统标签实时拦截执行，你只会看到操作卡。限额两端一致。

### Calendar — 日历

事项分纪念日 / 生日 / 计划 / 备忘 / 生理期五类，支持每年 / 每月 / 每周 / 每天 / 单次 / 按周期重复。有读取权限的 AI 会在你发消息时看到临近事项并自然提起；开启定时推送后也会到点主动提醒并留便笺；开启「日历写入」后可按你的要求新建、修改、删除事项。日历 App 顶部为与本站及每位 AI 的相遇纪念卡。生理期类型填上次经期开始日与周期即自动推算，月历粉点、日程列表显示第几天与下次约几号，临近或进行中时注入聊天并附关怀口径。

### Blog · Letters

Blog 是创作空间：日记、剧本、分类、搜索、阅读进度，密码日记本与公开日志完全隔离、对所有 API 不可见，密码与密保和电脑端互认；阅读页可邀请任一 AI 留言，电脑端批注同步展示。Letters 选择一位 AI「接收信件」，TA 会根据聊天、日志与记忆写信投递；信封按邮编搜索。在暗色模式下，你可能会接收到一封不太正常的信。

### Memory · Auto Memory

记忆库：「我们之间的记忆。」情感坐标（效价 / 唤醒度）、重要性与自然衰减，按预算自动注入上下文；可授权 TA 在对话中写入（默认仅 TA 自己可见）。Auto Memory：「你对我的了解。」每个 AI 独立维护的认知档案，六分类、always / normal / low 三级优先，AI 自主创建更新，你可随时编辑删除。

### Music — 音乐

黑胶唱片带唱臂，封面印在盘芯并糊化为背景，左侧大字歌名与逐句滚动歌词，五键控制与播放队列。「一起听」邀请一位 AI 共享正在播放：头像对、实时累计时长，TA 会在对话中知道你正与 TA 听这首歌。

### ICode — 文件工作区

文件按项目分组，你与 AI 操作同一份数据。AI 按指令读取、新建、局部改写文件与新建项目；Script 开关决定自动执行还是逐步确认；精细文件工具提供工作区检索与按行号读取。GitHub 分区用 PAT 直连：列仓库、浏览目录、导入为「GH·仓库名」项目、改完一键推回；令牌只存本机、不进备份、不给任何 AI。

### Visual · DIY · API

Visual 分基础 / 文字 / 气泡 / 桌面四区，含全站色调整套更换与 4 个视觉方案槽；手机端视觉偏好独立于电脑端。
DIY 配置外部 HTTP 工具与 MCP 服务器（浏览器直发请求，目标接口需允许 CORS）。
API 页最多管理多个端口，各有昵称、关系、提示词与逐项权限；
Presence 定时推送支持固定间隔 / 时段随机与勿扰时段。

## ✦ API 配置指南

IB 支持多种 AI 服务：

### 官方 API

| 服务商 | 注册地址 | IB 中选择 | 密钥格式 |
|--------|---------|-----------|---------|
| Anthropic (Claude) | console.anthropic.com | `Claude (Anthropic)` | sk-ant-… |
| OpenAI (GPT) | platform.openai.com | `GPT (OpenAI)` | sk-… |
| DeepSeek | platform.deepseek.com | `DeepSeek` | sk-… |
| Google (Gemini) | aistudio.google.com | `Gemini (Google)` | AIza… |

选好服务商后，接口地址和默认模型会自动填入，粘贴 API Key 即可。

### 中转站 API（国内用户推荐）

无法直接访问海外 API 时，可使用中转站：

1. 在中转站注册并充值
2. 获取 API Key、接口地址（Endpoint）、可用模型名
3. IB 的 API 设置中：服务商选 **自定义**，填入上述信息
4. 保存即可

## ✦ PWA 部署与安装

把 IB-Mobile 变成主屏上的一个 App：全屏、离线缓存、系统通知、语音输入（麦克风等能力浏览器只授权给 HTTPS 站点）。

1. **部署**：把 `index.html` 与 `ib-sw.js` 一起放进任意支持 HTTPS 的静态空间。以免费的 GitHub Pages 为例：新建公开仓库 → 上传这两个文件 → Settings → Pages → Deploy from a branch → `main`，几分钟后得到网址。
2. **安卓 Chrome**：打开网址 → 菜单 → 「安装应用」（或「添加到主屏幕」）。
3. **iOS Safari**：打开网址 → 分享 → 「添加到主屏幕」。

应用内 GUIDE → 接口教程 → PWA 部署有全程点鼠标的逐步图文。常见问题：

- **菜单里没有「安装应用」**：需要同时满足 HTTPS、`ib-sw.js` 与 HTML 同目录（页面会自动注册）、manifest 可读；缺一则只显示「添加到主屏幕」，也能用。
- **语音输入提示未获麦克风权限**：从文件管理器 / 聊天软件直接打开（file: / content:）不是安全来源，浏览器不给网页层麦克风授权；部署 HTTPS 后首次点击会正常弹出授权。
- **更新**：替换服务器上的 HTML 或 `ib-sw.js` 后重新打开页面即加载新版（缓存策略为联网优先）。清站点数据前先在 Data 页导出备份。

## ✦ 数据管理

- **导出**：Data 页 → 导出备份文件，覆盖全部本地模块（名片与设置、API 配置、聊天与话题、记忆库与 Auto Memory、日历与便笺、日志 / 批注 / 分类、信件、社交圈动态、ICode 工作区等），与电脑版互认同一套备份格式。
- **导入**：选择电脑版或手机版的 JSON 备份，同 id 记录以文件为准，其余不受影响；手机端不认识的模块自动跳过。
- **两端分工**：语音转写、记忆系统、外部工具、日历设置与每个 AI 的接口参数两端共用、改动互通；手机专属的显示偏好、锁屏与 MCP 配置单独存放，电脑版不读不写，随备份原样往返。
- **存储**：浏览器 IndexedDB（InternalBeyondDB），完全离线；API 密钥仅存本机，仓库文件里不含任何密钥。
- **⚠ 备份建议**：数据仅存于浏览器本地，清除浏览器数据或换浏览器将永久丢失，请定期导出。

## ✦ 设备兼容性

需支持 IndexedDB、CSS backdrop-filter、ES6+ 的现代浏览器。

- ✅ Android / HarmonyOS（推荐 Chrome；系统通知、Web 蓝牙等能力以 Chrome 最全）
- ✅ iPhone / iPad（Safari；iOS 对运行时 manifest 与 PWA 通知支持有限）
- ✅ Windows / macOS / Linux 桌面浏览器亦可直接打开（与电脑端共用备份）

## ✦ 项目结构

```
index.html      ← 应用本体（单文件，浏览器打开这个）
ib-sw.js        ← Service Worker（联网优先、离线回退；只缓存本站 GET，AI 请求绝不缓存）
LICENSE         ← 代码许可全文（PolyForm Noncommercial 1.0.0）
COPYRIGHT.md    ← 完整版权与许可声明
```

## ✦ 技术规格

- **架构**：纯前端单文件 HTML，无框架、无构建、无服务器。
- **安全**：页面 CSP 禁止加载任何外部脚本，仅放行 Google Fonts 的样式与字体；连接权限保留给你自己配置的 AI 端点。
- **字体**：Noto Serif SC · Noto Sans SC 等（Google Fonts CDN，离线时回退系统字体）。
- **视觉**：CSS 液态玻璃拟态、双主题交叉过渡、iOS 式锁屏与桌面。
- **AI 协议**：Anthropic 原生格式 + OpenAI 兼容格式 + Gemini，覆盖官方及中转站 API。
- **构建**：Claude (Opus 4.6) 构建 · Opus 4.8 / Sonnet 4.6 / Fable 5 / Opus 5 / ChatGPT 5.6 Sol 参与辅助构建 · GPT-IMAGE-2 贴图 · Adobe Photoshop CS 设计编绘。

---

## ✦ Introduction (EN)

**Internal Beyond · Mobile** is the mobile-native twin of Internal Beyond: a fully offline, single-file personal website app designed to preserve emotional continuity. Twelve modules, two visual themes, all data stored locally in your browser, sharing one backup format with the desktop edition. Free and open source.

Connect your own AI API keys to unlock all interactive features. Supports Claude, GPT, DeepSeek, Gemini, and custom relay endpoints.

### Features

- **Home** — Pseudo-iOS launcher: Desk (app grid + calendar / notes / schedule / music widgets), Space (liquid-glass profile card), Circle cards with Auto Memory dossiers.
- **Lock** — iOS-style lock screen with adaptive-tint clock, 3×3 pattern lock and security question.
- **Chat** — Multi-API conversations: group chat, topic channels, thinking chain, streaming, attachments & image generation, voice input (transcription), web search, action cards, summaries, memory generation.
- **Call** — Voice & video calls: real-time speech recognition + text-to-speech playback (system or cloud voices), acoustic mood reference, heartbeat auto-talk, live-stream-style video with camera feed, bullet-screen chat, five-tier gift system with full-screen effects, incoming calls from AI, call transcripts, one-tap memory generation, and Wallet Card.
- **Circle** — Shared social feed where you and authorized AIs post, comment, reply and repost, with per-post visibility.
- **Calendar** — Anniversaries, birthdays, plans and reminders; AIs read upcoming items, mention them naturally, leave notes, and can be authorized to write entries.
- **Blog / Letters** — Journal with AI comments & annotations plus a password diary; asynchronous AI correspondence with wax-sealed envelopes.
- **Memory / Auto Memory** — Long-term emotional memory with decay and context injection; per-AI autonomous dossiers about you.
- **Music** — Vinyl-style fullscreen player with scrolling lyrics and "Listen Together" pairing with an AI.
- **ICode** — Shared file workspace with AI read/write, step confirmation, fine-grained search, DOCX/PDF/XLSX generation, and a built-in GitHub bridge (browse, import, push back).
- **Visual / DIY / API / Data** — Full visual customization with 4 preset slots; external HTTP tools & MCP servers; multi-endpoint API center with Presence scheduling; one-tap JSON backup interchangeable with desktop.

### Quick start

1. Download this repository
2. Open `index.html` in your browser — or host `index.html` + `ib-sw.js` on any HTTPS static host (e.g. GitHub Pages) and "Install app" / "Add to Home Screen"
3. Add your AI API key on the API page
4. Start exploring

---

## ✦ 联系方式

- GitHub：[Sui-IB](https://github.com/Sui-IB)
- X / Twitter：[@underthepuresky](https://x.com/underthepuresky)
- Email：1282901880@qq.com
- 小红书：3628686381
- Bilibili：[主页](https://space.bilibili.com/3546561346800463)

电脑端仓库：[Sui-IB/InternalBeyond](https://github.com/Sui-IB/InternalBeyond)

## ✦ 许可与版权

© 2025–2026 Sui. Internal Beyond 在 GitHub 公开源代码，并免费供个人、学习、研究及其他非商业用途使用。公开源代码不等于放弃版权，也不授权商业使用或二次贩卖。

- 程序代码：PolyForm Noncommercial License 1.0.0
- 视觉素材与项目文档：在作者有权授权的范围内采用 CC BY-NC-SA 4.0
- 项目名称、Logo 与作者标识：保留相关权利，不授权冒充官方版本

项目图像素材由 OpenAI GPT-IMAGE-2 生成，并由 Sui 使用 Adobe Photoshop CS 进行修改、合成、界面设计与编绘。AI 工具为辅助创作工具，不对项目内容拥有版权。本声明适用于项目的所有版本与衍生形式。第三方服务名称与商标归各自权利人所有。

允许在保留署名和许可文件的前提下进行非商业使用、修改与分享。未经 Sui 书面授权，不得出售、收费分发、打包进付费产品或服务、商业托管、收费部署或以其他方式获取商业利益。

完整条款见根目录 `LICENSE` 与 `COPYRIGHT.md`。商业授权联系：1282901880@qq.com。

**本项目官方版本免费提供。** 如果你通过付费方式获得了未经作者授权的副本，请停止传播，并通过上方联系方式获取免费正版。
