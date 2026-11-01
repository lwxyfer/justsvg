# SVG Diagram：从项目实践到可分享 Skill

交付目录：[skills/svg-diagram](../skills/svg-diagram/README.md)。入口为 [SKILL.md](../skills/svg-diagram/SKILL.md)，含完整 Prompt 模板、校准规则、两个校验工具、故障测试与两次真实试用。它生成标准 SVG，可脱离 JustSVG 使用；本任务没有改编辑器功能或重画品牌库。

## 可复用的方法

1. **固定视觉对象。** 用户的具体链接/截图优先。品牌官网、产品界面、品牌影片与文章封面分别记录；保存有效页面观察和日期，标明不可访问范围。
2. **先确定语义。** 节点、文本、分组、关系与分支意义独立成图。同图风格比较保持语义，而不是强制保持布局；同风格新内容复用视觉规则，重新排图。
3. **把参照转译成构图。** 同时考虑构图、尺度、字体层级、线条、形状、材质、图标与阅读节奏。先安排文本区域、节点轮廓与连线通道，再添加材料细节。
4. **成对维护 SVG 与 Prompt。** 使用原生 text/g/ID/defs/渐变/pattern/marker/内部引用，保留编辑能力。Prompt 写入实际内容、布局、路线、字体回退、来源和适配边界。
5. **分开验证技术与视觉。** XML、语义覆盖、边界、引用、联动与往返测试证明一定范围的技术行为；浏览器截图与具体参照对照评判视觉。功能通过不构成品牌认可。
6. **有上限地修正。** 先收集实际缺陷，集中修复并复验；默认最多两批。留下实质差距和缺失证据，避免无止境偏好微调。

## 项目证据如何支持这些决策

| 实际文件                                                                                                                                       | 可复用结论                                                       | 不能直接泛化的部分                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [document.mjs](../scripts/brand-scenes/document.mjs)                                                                                           | 共享语义、序列化与节点/关联输出                                  | 当前 RAG 内容、9/8 数量、1600×1100 与 JustSVG 元数据不是通用约束                            |
| [品牌独立场景](../scripts/brand-scenes/)；[主题](../scripts/brand-style-themes.mjs)；[追加主题](../scripts/brand-scenes/extra-themes.mjs)      | 构图与材料可独立于语义，来源与适配要明写                         | 不是官方品牌认证；不能把已有稿自动视为被用户接受                                            |
| [品牌生成器](../scripts/generate-brand-examples.mjs)；[完整 Prompt](../src/examples/prompts/)；[manifest](../src/examples/brand-manifest.json) | 图、Prompt、依据同步维护                                         | 该生成器会写应用素材/manifest，通用 Skill 不调用它                                          |
| [基础主题](../scripts/base-style-themes.mjs)；[基础变体生成](../scripts/generate-base-variations.mjs)；[说明](BASE_VARIATIONS.md)              | 固定几何的视觉对照与独立构图的品牌研究是两种实验                 | 架构/流程/信息图是内容类型，不是风格分类                                                    |
| [单元](../tests/unit/brand-examples.test.ts)；[浏览器](../tests/e2e/brand-examples.spec.ts)                                                    | 语义等价、独立布局、引用与往返、真实渲染、节点文字和整条路线检查 | 无溢出、布局签名唯一与测试通过均不能证明品牌风格对齐                                        |
| [品牌记录](BRAND_EXAMPLES.md)；[参考风格](REFERENCE_STYLE.md)；[示例机制](EXAMPLES.md)；[验证历史](VALIDATION.md)                              | 保存具体来源、被否定方向、实际检查范围和修正过程                 | 历史阶段文字需按日期解读；EXAMPLES 的部分品牌表项仍是早期描述，当前方向以品牌记录和素材为准 |
| [PRODUCT](../PRODUCT.md) / [DESIGN](../DESIGN.md)                                                                                              | 当前名称 JustSVG；面向 Diagram；原生、可编辑、可移植             | 不扩展成通用矢量插画编辑器                                                                  |

本机还实际检查了 `.impeccable/references/brands/openai-devblog-desktop.png`、对应 DOM 观察，以及 `.impeccable/review/devblog/` 的 direction、最终原生图、页面截图和列明项评审。这些未提交的资料不作为技能包的运行依赖，包内只记录来源和观察范围，不分发原封面。

## 失败经验与未知

相同模板换色/改圆角被反复否定；早期蓝青色海报、巨型圆形与 ChatGPT 假界面不是 OpenAI 博客请求的成功范例。当前具体锚点是 [OpenAI Developers Blog](https://developers.openai.com/blog) 中被观察到的暖色封面：珊瑚橙/粉、局部奶油光域、透明平面、细线图标、同心弧。原生渐变与 pattern 只是材料近似，文字与功能线加深是可读性适配。

Notion 纸墨稿仍被用户指出有差距，没有后来获得认可的证据。其他稿与历史 “ship” 只表示指定评审项被关闭；不等于用户接受、品牌授权或官方标准。挑战页/访问失败不能充当视觉证据；页面可能变化，日期与具体封面比“第一篇”更可复用。

尚未证明：该 Skill 在大量新图、所有品牌、不同模型或不同浏览器中的审美稳定性；本次没有做独立代理盲测、Safari/Firefox 验证或 JustSVG 绑定行为新增测试。完整 Prompt 记录了意图和几何，但不保证模型输出逐像素确定。

## 本次验证与使用

技能入口通过 skill-creator 的 `quick_validate.py`。9 项 Python 结构/语义测试、9 项浏览器与 CLI 测试及脚本 ESLint 通过；两张试用图的语义图、XML/引用、边界与采样连线检查通过，并实际修改原生文字、序列化后重新在浏览器打开。两图都检查了原生、960px 和390px预览。

浏览器实测发现连续缩放渐变画布产生截图残影，工具已改为每个尺寸独立页面再渲染，复验后消除。解压包试跑另发现符号链接路径会使 CLI 静默跳过，已用真实路径判定入口并加入回归测试。新工具使用受限静态 SVG profile；不是通用 sanitizer。保守边界、采样精度、字体与对比度检查限制详见[工具说明](../skills/svg-diagram/references/validation.md)。

具体使用/安装/分享与两图最终检查记录见[技能包说明](../skills/svg-diagram/README.md)。所有产物保留在仓库目录；未推送 GitHub，也未覆盖用户个人技能目录。
