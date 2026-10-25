# 品牌视觉示例：独立构图

当前 OpenAI 以用户指定的 [OpenAI Developers Blog](https://developers.openai.com/blog) 为具体视觉锚点，采用首篇暖色封面的珊瑚橙/粉色渐变、半透明技术平面、细线图标与同心弧。Notion保留上一轮纸墨版本，本轮未修改；用户已指出上一轮两图仍有差距，历史评审不代表用户接受。

用户否定了第一版：六张图共用相同的四上五下卡片布局，颜色、圆角和字体变化不能体现各品牌。此前的「ship」判断没有满足用户要求，不能沿用为接受结论。原六张已从构图开始重建；本次继续增加Stripe、Linear、Figma、Vercel四张独立场景。

共同内容是 RAG 的9个节点和8条关系。**同图表示语义等价，不要求坐标、大小、轮廓或排版相同。** 十个品牌各有独立场景源文件；通用模块只负责内容定义、SVG序列化、节点命名和连接绑定。

## 十张构图

| 品牌 / 示例 ID                    | 构图、焦点与材料                                                                                                                                        | 具体参考                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apple / `brand-apple-rag`         | 两行大标题；窄列知识库、分级检索模块；440px芯片占据主焦点，原生引脚、金属面、深色核心和渐变边缘；不同尺度取代九张等大卡片                               | [Mac 产品叙事](https://www.apple.com/mac/)、[Apple Intelligence](https://www.apple.com/apple-intelligence/)、[PCC 技术图](https://security.apple.com/blog/pcc-security-research/)   |
| Microsoft / `brand-microsoft-rag` | Fluent桌面工作区；标题栏、知识侧栏、问答工作面；文件/切片/点阵/索引使用不同体块图标，模型为蓝紫叠层与半透明平面，回答横跨工作面底部                     | [Microsoft Design](https://microsoft.design/)、[Fluent 图标](https://fluent2.microsoft.design/iconography)、[Fluent 层级](https://fluent2.microsoft.design/elevation)               |
| Google / `brand-google-rag`       | Material表现性几何；文档、切片、花形、胶囊、搜索框和大型圆形检索器；固定语义四色，行间连接清楚，尺寸与轮廓变化形成阅读节奏                              | [品牌几何](https://design.google/library/evolving-google-identity)、[Material You](https://design.google/library/making-material-you)、[Google Design](https://design.google/about) |
| OpenAI / `brand-openai-rag` | Developer Blog暖色封面：居中标题、完整橙/珊瑚粉/奶油色域、透明圆角技术平面、细线图标和同心弧；深酒红文字与关联保证可读 | [用户指定博客](https://developers.openai.com/blog)、[暖色封面](https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp) |
| Claude / `brand-claude-rag`       | 温暖编辑式阅读；大幅衬线标题、知识手册、轻量问题气泡、开放的检索/上下文注释、陶土色生成核心和大型回答稿纸；不再使用两个燕麦色卡片托盘                   | [Claude](https://claude.com/)、[Anthropic](https://www.anthropic.com/)                                                                                                              |
| Notion / `brand-notion-rag`       | 官网纸墨插画；84px重字标题、分层文档、切片、向量网络、抽屉、纸质对话框、勾选清单与折页稿纸，展开的知识册及少量黄色格窗为焦点 | [Projects 数据库/看板](https://www.notion.com/product/projects)、[品牌指南](https://notion.notion.site/Notion-Brand-Guidelines-db8fda2d1f0048bba1f4e547dfc48830)                    |
| Stripe / `brand-stripe-rag`       | 深蓝大字、斜切紫蓝珊瑚渐变、精密白色数据模块和深色API核心；以基础设施数据流组织层级                                                                     | [Stripe 产品视觉](https://stripe.com/)、[品牌资源](https://stripe.com/newsroom/brand-assets)                                                                                        |
| Linear / `brand-linear-rag`       | 近黑工程工作区、位置/视图栏、Issue状态与示意ID、暖灰选中检索任务、中性依赖线和小面积状态色                                                                        | [产品](https://linear.app/)、[2026界面更新](https://linear.app/now/behind-the-latest-design-refresh)、[品牌指南](https://linear.app/brand)                                          |
| Figma / `brand-figma-rag`         | 明确采用FigJam协作画布：暖白点阵场、角色色组件与连接、两个人工示意协作指针；不绘制实际编辑器控制点                                                      | [FigJam](https://www.figma.com/figjam/)、[品牌指南](https://www.figma.com/using-the-figma-brand/)                                                                                   |
| Vercel / `brand-vercel-rag`       | Geist黑白网格、6/12px表面、部署上下文、等宽路径与代码、线框计算对象和事件流输出                                                                               | [Geist](https://vercel.com/geist/introduction)、[网格](https://vercel.com/geist/grid)、[色彩](https://vercel.com/geist/colors)                                                      |

这是对具体品牌/产品视觉语言的技术图转译，页面和SVG注明非官方，不表示授权或合作，也不把图示当成品牌的真实生产架构。OpenAI采用用户指定的Developer Blog封面语言，Notion仍保留上一轮官网纸墨研究；不声称完整品牌准则认证或官方插画原稿。Apple的芯片焦点来自产品叙事与技术对象语言，不是PCC架构的复制稿。

Google的颜色按功能固定：文档/问题蓝、切分红、向量/上下文黄、索引/回答绿、模型蓝；不再按数组序号循环色板。Microsoft的渐变体块是原创说明图形，不冒充官方产品图标。Claude仍采用官网暖纸、燕麦和陶土语法，但通过阅读层级与稿纸构图表达，而非将所有卡片换为米色。

## 细部精修

在既有十张独立构图上继续细化，节点、语义和关系不变：

| 示例 | 细节规则 |
| --- | --- |
| Apple | 银色引脚渐变、金属内缘高光和暗芯细倒角，让材质有层次 |
| Microsoft | 标题栏仅顶部圆角，底部齐接内容区；叠层文件图标增加细亮边 |
| Google | 圆润八瓣轮廓；向量数据点、检索放大镜和生成星形各有明确含义 |
| OpenAI | 低透明度白色平面、细轮廓与顶边高光、确定性细点pattern；柔和径向渐变与两角同心弧 |
| Claude | 知识手册使用陶土色书签；稿纸引线更轻，保留纸面和衬线层级 |
| Notion | 重字标题、墨线文档/知识对象、折页与展开知识册；少量黄色点缀 |
| Stripe | 原生径向渐变细化斜切色域；文件、向量和索引采用可辨认的图标 |
| Linear | 11px 来源 ID、视图设置小图标、完整文档行，保持近黑界面的精细节奏 |
| Figma | 输入块统一文字起点、组件描边粗细；示意协作指针增加白色轮廓 |
| Vercel | 主网格与源模块列对齐，次网格细分并降低视觉权重 |

所有箭头采用独立于线宽的 8–12px 尺寸，`markerUnits="userSpaceOnUse"` 和 `refX="10"` 使尖端准确落在绑定端点。十份 Prompt 同步记录各自的细部规则，可复制后继续生成同类视觉语言；没有新增外部资源或运行依赖。

## 历史：OpenAI / Notion / Linear / Vercel 再校准

此轮保留为问题追踪。用户随后再次否定 OpenAI/Notion，并明确二者都要官网品牌视觉；当前两图以本页开头与下方新版规则为准。Linear/Vercel 的规则继续适用。

用户指出前轮仍缺少品牌特征：OpenAI无色彩、Notion线条过细、Vercel过于简陋。前轮视觉结论不能作为这些问题已解决的依据。本轮重新读取公开规范并与实际视觉资料对照：

| 品牌 | 可核对依据 | 落实到 SVG 的校准 |
| --- | --- | --- |
| OpenAI | [公开设计指南](https://openai.com/brand/)说明几何精确与亲和字体；[品牌创作者案例](https://studiodumbar.com/work/openai-brand-film)的色彩视频实际展示蓝、青、淡紫、海军蓝与表达色 | 白底黑字，浅蓝回答画布、淡紫上下文、青色知识标记、浅粉问题与海军蓝模型；保留对话与文档两种阅读结构，来源序号、名称、元数据分层 |
| Notion | [Projects 页面](https://www.notion.com/product/projects)的官方插画使用有分量黑色轮廓，产品数据库的属性线则更轻 | 暖黑对象和关系线2.2px、图标2.4px；更明确的标题字重、列名标签；属性分隔线1–1.5px，主次不混为一谈 |
| Linear | [品牌页](https://linear.app/brand)给出Mercury White `#F4F5F8`、Nordic Gray `#222326`与低饱和蓝原则；[2026更新](https://linear.app/now/behind-the-latest-design-refresh)说明暖灰、退后导航、分开的位置/视图栏与弱化分隔 | 暖灰近黑表面、退后侧栏，去除多余横线；位置与视图两层，来源ID、任务编号和状态；依赖线回归中性灰，蓝仅作小面积状态色 |
| Vercel | [Materials](https://vercel.com/geist/materials)规定基础表面6px、较高层表面12px；[Colors](https://vercel.com/geist/colors)、[Typography](https://vercel.com/geist/typography)和[Grid](https://vercel.com/geist/grid)区分背景/边界/文字与标题/标签/代码 | 6px基础节点、12px模型；项目/分支/Preview上下文、文件图标与路径、函数/代码分区、连接端口和更完整的事件流输出；网格仍从属于内容 |

OpenAI完整品牌站需认证，直接浏览器访问公开页也遇到挑战页；色彩参考来自可访问的品牌创作者公开视频，RGB为观察近似，未声称取得完整官方token。Notion旧品牌指南链接不可访问，当前参考换为可访问的官方产品页和插画。Notion图示线宽是本画布尺度下的适配值，不冒称官方UI像素规范。Linear暖灰表面也是图示适配，不能与其官方色号混为一谈。所有边界和来源都已同步到对应Prompt与预览的品牌依据中。

四图仍保留9个节点和8条关联。Vercel的输出区增高，绑定端点同步调整；项目名、分支和Preview为静态图示，不是应用新增的部署功能。其他六个品牌、示例数量、应用界面和本地覆盖机制保持原状。


## 历史：OpenAI / Notion 官网品牌版（用户再次指出有差距）

先前方向混用了品牌传播色彩与产品界面。用户已分别确认“OpenAI 官网品牌视觉”和“Notion 官网品牌视觉”，因此本轮直接重画两张素材，并成对重写Prompt：

- **OpenAI**：白底96px两行标题、400字重与留白；无框知识链与不同名词图标；黑色查询、蓝色检索、青色上下文直角字段；400px海军蓝生成圆与淡紫回答。中列严格对齐。没有侧栏、输入框、问题气泡、Canvas或来源卡片。色彩依据可访问品牌创作者公开视频的观察值，Helvetica Neue仍为本机字体近似。
- **Notion**：白纸、84px重字标题，2.8–3.2px黑墨外轮廓及内部细节；分层文件、切片、向量网络、抽屉各自绘制；纸质对话框、勾选清单、折页稿纸和展开知识册形成不同对象；黄色只点亮切片、勾选与格窗。没有数据库列名、Aa、Source/Status或假编辑器按钮。

参照是[OpenAI官网](https://openai.com/)、[公开品牌指南](https://openai.com/brand/)、[品牌创作者案例](https://studiodumbar.com/work/openai-brand-film)，以及[Notion官网](https://www.notion.com/)和[Projects插画](https://www.notion.com/product/projects)。浏览器无法直接取得OpenAI当前完整官网截图，未将挑战页或超时页面作为设计依据；不作整站像素复刻承诺。Notion知识册与对象是原创原生SVG转译，不复制官方人物或标志。

两图继续保留相同9个语义节点/8条绑定关联，独立布局、字体、颜色与对象都可编辑；目录仍32种风格/73个示例，其余8张品牌稿不变。本地覆盖保留，恢复内置后可查看新稿。对照为`tests/brands-website-openai-notion.png`。

## 使用与保存

左侧选择「品牌风格 · 10」。十张稿通过「同图风格」切换，保留100%检查状态和滚动位置，草稿和本地版本各自独立。预览下方有参考依据和官方链接；Prompt包含每份稿的具体构图、节点位置、连线路径和原生约束。

点击「在编辑器中打开」新增图稿；也可下载标准SVG或复制Prompt。已经保存过第一版的本地覆盖不会被清除，需使用「恢复内置」查看新内置稿；已有编辑器图稿也不会自动改版。

目录现为32种风格、73份示例，知识工厂仍为默认入口，旧示例和本地数据保留。

## 当前：OpenAI Developer Blog

用户提供了明确链接，而不再只给出宽泛的官网品牌方向。本轮直接浏览并保存该博客的有效页面截图，采用首篇暖色封面作为具体参照：

- 白色编辑式页头、居中标题和灰色副标题；下方一整幅暖橙、珊瑚粉、奶油色渐变。
- 技术对象采用低透明度白色圆角平面、细白轮廓、文件/切片/向量/索引/层叠模型细线图标，以及左上/右下同心弧线。
- 9个节点、8条实际依赖和原生文字保留。为提高技术图可读性，文字与功能关系线改用深酒红；原封面的白色装饰线不承担唯一信息。
- 用原生linearGradient/radialGradient、pattern细点与clipPath近似封面氛围；没有嵌入官方封面位图，不声称复现其全部纹理。
- 本机存在OpenAI Sans时使用，否则回退Helvetica Neue/Arial；不分发专有字体。来源与这些适配边界写入可复制Prompt。

本轮只更新OpenAI SVG、Prompt与对应元数据，Notion和其他8个品牌素材保持不变。旧本地版本仍需显式「恢复内置」才会显示新稿。

## 原生编辑

十图均为1600×1100；原生文字、矩形、圆、路径、折线、渐变和内部marker，不嵌入图片、脚本、外部字体、foreignObject或需要额外兼容处理的滤镜。品牌视觉中的工作区、输入框、稿纸是图示内容，不是应用新增的真实产品功能。

所有节点有语义分组/ID，箭头与索引供给标签保留关联；移动、文字修改、撤销和导出再导入均可继续编辑。`data-layout`记录生成时的分配区域，供素材QA检查；运行时仍依赖真实SVG DOM、getBBox与CTM，不把这份元数据当成编辑文档模型。移动后现有引擎可能重排线路，不保证保持作者通道或自动避障。

字体采用本机回退：Apple为Helvetica Neue，Microsoft优先Segoe，Google优先已安装的Google Sans；OpenAI优先本机OpenAI Sans并回退Helvetica Neue/Arial，Claude用Georgia/宋体标题与无衬线正文，Notion为Arial近似；Stripe用Helvetica Neue近似，Linear/Figma用系统无衬线近似，Vercel优先本机Geist并以Arial/等宽系统字体回退。字体不是品牌识别的唯一依据，不承诺专有字形或像素一致。

## 源码与验证

- `scripts/brand-scenes/apple.mjs` 等十个文件分别定义完整构图。
- `scripts/brand-scenes/document.mjs`仅共享语义、几何输出和关联线序列化。
- `scripts/brand-style-themes.mjs`记录各自方向、参考、材料与字体边界。
- `scripts/generate-brand-examples.mjs`可一次生成一个品牌，也可生成全部；SVG和完整Prompt成对维护。
- `src/examples/brand-styles.ts`注册素材，`sourceId=brand-rag`用于语义等价对照。

```sh
node scripts/generate-brand-examples.mjs apple
node scripts/generate-brand-examples.mjs microsoft
node scripts/generate-brand-examples.mjs google
node scripts/generate-brand-examples.mjs openai
node scripts/generate-brand-examples.mjs claude
node scripts/generate-brand-examples.mjs notion
node scripts/generate-brand-examples.mjs stripe
node scripts/generate-brand-examples.mjs linear
node scripts/generate-brand-examples.mjs figma
node scripts/generate-brand-examples.mjs vercel
```

测试要求相同的节点内容与关系、十个不同的布局签名，以及清理/序列化后箭头单位和尖端坐标不变；逐张检查文字区域、整条线避开节点/文字、实际下载、独立显示、节点联动、撤销、改字、导出后实际重导入并继续编辑。十个示例均验证桌面、633px及390px窗口，并覆盖筛选、同图切换、来源和100%。视觉复核必须判断品牌构图和识别性，功能测试或无溢出不能代替此判断。

新增四张的推荐依据是覆盖不同工作场景：Stripe基础设施/数据流、Linear工程协作、Figma创意协作、Vercel构建/部署。图中仍是同一RAG说明语义，不表示这些公司的真实架构、实时协作者或生产状态。新增独立主题配置位于`brand-scenes/extra-themes.mjs`，经`brand-style-themes.mjs`汇总。
