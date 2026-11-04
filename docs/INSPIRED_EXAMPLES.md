# 趣味世界观与投行风格

新增五份独立构图的 RAG 示例。每份 1600×1100，包含 9 个可编辑节点、8 条绑定连线，以及可以复制、改写主题的生成 Prompt。

| 风格 | 示例 ID | 视觉方向 |
| --- | --- | --- |
| 星战 · 银河指挥部 | `starwars-rag` | 黑色星空、镂空黄字、切角档案面板、青色战术路线、圆形战斗空间站生成核心 |
| 比奇堡 · 海底知识工厂 | `bikini-bottom-rag` | 青绿海水、五瓣海底花、菠萝档案、孔洞海绵模块、舷窗检索与沙地 |
| Goldman Sachs · 高盛 | `brand-goldman-sachs-rag` | 蓝色刊头、白色编辑页面、大幅衬线标题、开放式分析节点与浅蓝知识基础 |
| Morgan Stanley · 摩根士丹利 | `brand-morgan-stanley-rag` | 白底无衬线分析框架、炭黑知识栏、浅青研究面和开放证据摘要 |
| J.P. Morgan · 摩根大通 | `brand-jpmorgan-rag` | 暖纸、深棕衬线、铜棕连接、三列运营模型和深色生成稿 |

打开 `/examples?example=示例ID`，或搜索名称。星战、比奇堡在「专题风格」系列；三家投行在「品牌风格」系列，搜索“投行”可以一起查看。它们与其他 RAG 研究共享语义主题，可以在详情标题选择器中比较。默认 OpenAI 入口保持不变。

先在示例页查看与复制 Prompt；需要保存文件时选择「打开编辑器」，修改文字、拖动节点或调整颜色，再从编辑器导出 SVG。图形始终为原生 SVG，不使用角色截图、官方封面位图或外部字体。

## 参考与取舍

- 星战参考 [官方 Databank](https://www.starwars.com/databank/) 的黑色、切角资料面板，以及[战斗空间站](https://www.starwars.com/databank/death-star)的几何特征。它是原创的战术架构图，不复刻片头字幕、官方徽记或实际系统。
- 比奇堡参考 [Nickelodeon 官方海绵宝宝页面](https://www.nick.com/fan-hub/spongebob-squarepants)及 [Paramount 的作品介绍](https://www.paramountpressexpress.com/nickelodeon/shows/spongebob-squarepants/about/)。以环境与物件语言组织技术节点，不嵌入角色图片。
- 高盛直接参考 [Goldman Sachs Insights](https://www.goldmansachs.com/insights) 的蓝色刊头、衬线主标题、留白与细分隔线。本轮获得并检查了官方页面截图。
- 摩根士丹利参考[机构官网](https://www.morganstanley.com/)及[研究页](https://www.morganstanley.com/insights)。页面正文可读取，实时浏览器因网络协议错误未获得有效官方截图；该图为研究方向的近似，不声称逐项品牌规范认证。
- 摩根大通参考 [J.P. Morgan](https://www.jpmorgan.com/) 的机构简报方向。实时访问遇到 403、区域跳转或空白截图，不能把这些截图视为有效视觉证据；当前暖色衬线版本属于明确标注的非官方风格近似。

本轮是五份非官方风格研究，不代表作品或公司的授权、真实生产架构或投资观点。字体使用本机回退，设备间可能出现细微差别。

## 维护

- 注册：`src/examples/inspired-styles.ts`，元数据：`src/examples/inspired-manifest.json`。
- SVG 与 Prompt：`src/examples/assets/`、`src/examples/prompts/` 下的同名资源。
- 构图与主题：`scripts/inspired-scenes/`。只共享 SVG 序列化、标签和连接机制，构图分别维护。
- 重新生成全部：`node scripts/generate-inspired-examples.mjs`。
- 单独生成：`node scripts/generate-inspired-examples.mjs starwars`，可选 `starwars`、`bikini`、`goldman`、`morgan`、`jpmorgan`。
- 验证：`npm test`；`npx playwright test tests/e2e/inspired-examples.spec.ts`。

当前图库共 64 种风格、145 份示例、39 份品牌研究。首页品牌精选仍使用原来的 36 份清单，新增三家投行已在完整示例库开放。
