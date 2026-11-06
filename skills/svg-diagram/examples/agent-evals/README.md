# Agent Evals · 三种品牌风格验证

验证日期为 2026-11-06。以同一份 [语义图](graph.json) 为准，三版均包含 9 个组件和 9 条有向关系。用例和运行配置进入调度器，候选 Agent 在受控工具环境中试跑。执行证据交给评分器，评分汇总后与可比基线比较，供团队决定发布、暂缓或继续调查。虚线表示评分规则和基线分数这两条辅助输入。概念参考来自 Anthropic 对用例、试跑、记录、结果与评分器的说明。 [Agent Evals 参考](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)

| 风格                  | 构图与视觉取舍                                                                                                                                                   | 产物                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| OpenAI Developer Blog | 白色页头下是一幅珊瑚橙粉技术封面。试跑顺着横向主轴进入沙箱，评分与决策折返。透明平面、线图标与同心弧来自封面观察。原生渐变和细点近似原图颗粒，功能线和文字加深。 | [SVG](openai.svg) · [预览](openai.png) · [Prompt](openai.prompt.md) · [报告](openai.report.json) |
| Claude                | 暖纸、衬线标题和留白形成研究手稿。开放式规则线组织输入和试跑，陶土色沙箱强调运行环节，右侧稿纸自上而下承接评分、比较和决策。以矢量纸面转译官网摄影中的纸张质感。 | [SVG](claude.svg) · [预览](claude.png) · [Prompt](claude.prompt.md) · [报告](claude.report.json) |
| Vercel Geist          | 黑白工程网格让输入、试跑、证据和评估各有一列。等宽 ID、十字辅助标与 6／12 单位圆角区分层级。基线沿右侧独立走线，黑色发布判断作为终点。                           | [SVG](vercel.svg) · [预览](vercel.png) · [Prompt](vercel.prompt.md) · [报告](vercel.report.json) |

OpenAI 采用用户此前选定的暖色封面，以 2026-10-25 的有效截图为视觉依据。Claude 使用本次 Chrome 实拍的 1440px 官网首页。Vercel 使用本次读取的 Geist 网格与表面规范，并查看仓库已有的官方色阶截图。三稿使用本机字体回退，各自的材料与阅读顺序属于图解适配。 [OpenAI 封面](https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp) · [Claude 官网](https://claude.com/) · [Geist Grid](https://vercel.com/geist/grid) · [Geist Materials](https://vercel.com/geist/materials)

Chrome 156 的最终报告均无结构或几何错误，也无警告。检查覆盖共享语义图、文字边界、采样路径与原生文字修改后的序列化重开。逐张查看了原尺寸与缩放预览。首轮修正 OpenAI 沙箱标题的溢出与 Claude 评分规则线穿过分栏标题，随后拉开 Vercel 图例中两种线型的距离。390px 预览适合看总览，正文需放大。视觉校准以这些特定参照为范围，三个版本的审美选择留待用户判断。

在 Skill 目录复验：

```sh
for style in openai claude vercel; do
  node scripts/render_check.mjs "examples/agent-evals/$style.svg" \
    --graph examples/agent-evals/graph.json \
    --out "/tmp/agent-evals-qa/$style" --channel chrome
done
```
