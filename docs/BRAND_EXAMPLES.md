# 品牌视觉示例：独立构图

当前 OpenAI 以用户指定的 [OpenAI Developers Blog](https://developers.openai.com/blog) 为具体视觉锚点，采用首篇暖色封面的珊瑚橙/粉色渐变、半透明技术平面、细线图标与同心弧。Notion保留上一轮纸墨版本，本轮未修改；用户已指出上一轮两图仍有差距，历史评审不代表用户接受。

用户否定了第一版：六张图共用相同的四上五下卡片布局，颜色、圆角和字体变化不能体现各品牌。此前的「ship」判断没有满足用户要求，不能沿用为接受结论。原六张已从构图开始重建；随后增加Stripe、Linear、Figma、Vercel四张，以及下文两批独立场景。

共同内容是 RAG 的9个节点和8条关系。**同图表示语义等价，不要求坐标、大小、轮廓或排版相同。** 三十个品牌各有独立场景源文件；通用模块只负责内容定义、SVG序列化、节点命名和连接绑定。

## 品牌构图（现36种，历次新增见下文）

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

所有箭头采用独立于线宽的 8–12px 尺寸，`markerUnits="userSpaceOnUse"` 和 `refX="10"` 使尖端准确落在绑定端点。各份 Prompt 同步记录各自的细部规则，可复制后继续生成同类视觉语言；没有新增外部资源或运行依赖。

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

顶部「风格系列」选择「品牌风格」即可直接看到三十六张独立缩略图，或搜索品牌名；点图展开右侧预览，详情内仍可切换同内容视觉版本，保留全页预览状态，草稿在当前页面内保留，历史本地版本仍可读取。预览下方有参考依据和官方链接；Prompt包含每份稿的具体构图、节点位置、连线路径和原生约束。

点击「在编辑器中打开」新增图稿；也可下载标准SVG或复制Prompt。已经保存过第一版的本地覆盖不会被清除，需使用「恢复内置」查看新内置稿；已有编辑器图稿也不会自动改版。

目录现为58种风格、139份示例，知识工厂仍为默认入口，旧示例和本地数据保留。

## 当前：OpenAI Developer Blog

用户提供了明确链接，而不再只给出宽泛的官网品牌方向。本轮直接浏览并保存该博客的有效页面截图，采用首篇暖色封面作为具体参照：

- 白色编辑式页头、居中标题和灰色副标题；下方一整幅暖橙、珊瑚粉、奶油色渐变。
- 技术对象采用低透明度白色圆角平面、细白轮廓、文件/切片/向量/索引/层叠模型细线图标，以及左上/右下同心弧线。
- 9个节点、8条实际依赖和原生文字保留。为提高技术图可读性，文字与功能关系线改用深酒红；原封面的白色装饰线不承担唯一信息。
- 用原生linearGradient/radialGradient、pattern细点与clipPath近似封面氛围；没有嵌入官方封面位图，不声称复现其全部纹理。
- 本机存在OpenAI Sans时使用，否则回退Helvetica Neue/Arial；不分发专有字体。来源与这些适配边界写入可复制Prompt。

本轮只更新OpenAI SVG、Prompt与对应元数据，Notion和其他8个品牌素材保持不变。旧本地版本仍需显式「恢复内置」才会显示新稿。

## 原生编辑

三十图均为1600×1100；原生文字、矩形、圆、路径、折线、渐变和内部marker，不嵌入图片、脚本、外部字体、foreignObject或需要额外兼容处理的滤镜。品牌视觉中的工作区、输入框、稿纸是图示内容，不是应用新增的真实产品功能。

所有节点有语义分组/ID，箭头与索引供给标签保留关联；移动、文字修改、撤销和导出再导入均可继续编辑。`data-layout`记录生成时的分配区域，供素材QA检查；运行时仍依赖真实SVG DOM、getBBox与CTM，不把这份元数据当成编辑文档模型。移动后现有引擎可能重排线路，不保证保持作者通道或自动避障。

字体采用本机回退：Apple为Helvetica Neue，Microsoft优先Segoe，Google优先已安装的Google Sans；OpenAI优先本机OpenAI Sans并回退Helvetica Neue/Arial，Claude用Georgia/宋体标题与无衬线正文，Notion为Arial近似；Stripe用Helvetica Neue近似，Linear/Figma用系统无衬线近似，Vercel优先本机Geist并以Arial/等宽系统字体回退。字体不是品牌识别的唯一依据，不承诺专有字形或像素一致。

## 源码与验证

- `scripts/brand-scenes/apple.mjs` 等三十个文件分别定义完整构图。
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

测试要求相同的节点内容与关系、三十个不同的布局签名，以及清理/序列化后箭头单位和尖端坐标不变；逐张检查文字区域、整条线避开节点/文字、实际下载、独立显示、节点联动、撤销、改字、导出后实际重导入并继续编辑。三十个示例均验证桌面、633px及390px窗口，并覆盖筛选、同图切换、来源和100%。视觉复核必须判断品牌构图和识别性，功能测试或无溢出不能代替此判断。

新增四张的推荐依据是覆盖不同工作场景：Stripe基础设施/数据流、Linear工程协作、Figma创意协作、Vercel构建/部署。图中仍是同一RAG说明语义，不表示这些公司的真实架构、实时协作者或生产状态。新增独立主题配置位于`brand-scenes/extra-themes.mjs`，经`brand-style-themes.mjs`汇总。


## 2026-10-26：新增五种独立品牌语言

该轮完成时共 **15个品牌、37种风格、78份示例**。本轮仅添加五份SVG/Prompt；原十份SVG与Prompt保持原样，既有本地版本独立保存。

| 品牌 | 具体参照与独立构图 | 来源 |
| --- | --- | --- |
| Dropbox | 石墨底、强字阶、直角拼版、蓝/青柠/粉/纸色；知识色块、中列检索与右侧大型蓝色生成版面 | [Typography](https://brand.dropbox.com/typography)、[Color](https://brand.dropbox.com/color) |
| Spotify | 深色播放语言、带原创几何封面的知识队列、绿色检索动作、唱片焦点与回答 | [Web Player](https://open.spotify.com/)、[Design guidelines](https://developer.spotify.com/documentation/design) |
| Duolingo | 圆润字阶、错落学习站点、明确按钮底边、蓝色问题与紫色检索、绿色输出 | [当前官网](https://www.duolingo.com/)、[设计博客](https://blog.duolingo.com/hub/design/) |
| IBM | 官方技术图的知识/运行/生成分区、嵌套框、8px基础节奏、左对齐说明与正交连接 | [Technical diagrams](https://www.ibm.com/design/language/infographics/technical-diagrams/design/)、[2x Grid](https://www.ibm.com/design/language/2x-grid/) |
| Ramp | 黑色常规大字、浅石色点阵工作面、横向知识链、黑色生成对象与酸柠黄回答 | [当前产品官网](https://ramp.com/) |

各稿1600×1100，仍保留9节点/8依赖，连接与文字都可编辑。图形适配公开品牌语言，未复用商标、真实歌曲封面、吉祥物或实际金融数据；不宣称品牌自有架构或完整规范认证。Spotify唱片、Duolingo学习站点和Ramp黑色材料对象都是图解隐喻。

参考页已实际打开并保存本地截图。Duolingo旧设计指南跳转设计博客，未当作仍有效token来源；Ramp色号是当前页面观察近似。各品牌字体只优先本机可用字体，不打包专有字体，Prompt明确回退与适配边界。新源文件位于scripts/brand-scenes/，新增主题在more-themes.mjs，diagram-glyphs.mjs仅共享语义几何，不共享布局。


## 2026-10-27：再增加五种品牌语言

该轮目录为 **20个品牌、42种风格、83份示例**。原15份SVG/Prompt保留，仅追加新素材；本地覆盖仍独立保存。

| 品牌 | 原生 SVG 构图与材料 | 官方参考 |
| --- | --- | --- |
| GitHub | 深色Actions依赖图、知识构建提交轨道、文件路径、模型伪代码与绿色产物行 | [Actions](https://github.com/features/actions)、[官网](https://github.com/) |
| Slack | 白底重字页头、紫色协作框架、来源附件、不同尺度的消息与回答线程 | [官网](https://slack.com/)、[Media Kit](https://slack.com/media-kit) |
| Cloudflare | 橙色渐变细点技术场、上方知识链、网络环生成核心、下方回答回路 | [官网与网络视觉](https://www.cloudflare.com/) |
| Miro | 当前官网的衬线标题、暖白点阵画布、彩色便签、菱形检索、蓝紫路径与黄色回答 | [Intelligent Canvas](https://miro.com/) |
| Airbnb | 分段搜索胶囊、知识目的地封面、静态收藏心形、浅色地图与莓红回答 | [搜索与探索](https://www.airbnb.com/) |

每张1600×1100、9个语义节点和8条绑定关系；不同尺寸/几何/路线保持独立，文字可编辑。源文件位于 `scripts/brand-scenes/{github,slack,cloudflare,miro,airbnb}.mjs`，主题为 `next-themes.mjs`。用 `node scripts/generate-brand-examples.mjs github`（替换品牌key）单独生成一对SVG/Prompt。

页面依据已实际打开并保存截图；Airbnb地区页未加载完整房源列表，只用已验证的搜索、字阶和莓红产品材料转译，封面是原创知识几何而非房源照片。Miro当前衬线头条与Slack紫色工作区来自本次实看。GitHub为依赖图适配，非真实CI；没有运行时间、在线用户、价格、评分或性能指标。所有专有字体仅本机优先，不分发字体、商标或外部图片；不声称官方认证或逐像素复刻。


## 2026-10-27：社区热议与中国独角兽各五份（首版记录）

首版已被用户否定，以下保留当时记录；当前内置资源已于2026-10-28结构重画，见下节。目录为 **30个品牌、52种风格、93份示例**。此前20份SVG/Prompt的SHA-256保持不变；新10份使用独立场景、完整Prompt、官方视觉参考及选取依据。两组标签体现在示例内容说明中，不宣称对所有品牌做地域/热度分类。

| 组别 | 品牌 / key | 实际参照与原生构图 |
| --- | --- | --- |
| 社区热议 | Cursor / cursor | 当前暖白轻智能体工作台、小标题、文件列、代码/上下文层次 |
| 社区热议 | Lovable / lovable | 官网链接Brand Hub的Creme/全谱渐变；白色提示面、圆形检索、生成平面 |
| 社区热议 | Supabase / supabase | 当前浅色黑绿字阶；大型模式圆柱、数据处理与宽幅回答 |
| 社区热议 | n8n / n8n | 当前灰白点阵、粉色模型、端口与可读工作流 |
| 社区热议 | Raycast / raycast | 黑红斜向几何场、启动器命令列、结果/键帽层次 |
| 中国独角兽 | 字节跳动 / bytedance | 中文官网的蓝场、白色大转角使命面与宋体字阶 |
| 中国独角兽 | 小红书 / xiaohongshu | 官方招聘/故事页的红白、粗中文标题、笔记叙事；原创知识封面与蛇形路径 |
| 中国独角兽 | DJI 大疆 / dji | 当前产品场的深蓝黑、精密光学层与金属环式模型 |
| 中国独角兽 | Kimi（月之暗面） / kimi | 当前黑白任务工作区、圆润输入、微蓝信息点与引用稿纸 |
| 中国独角兽 | 阶跃星辰 / stepfun | 当前学术纸页拼版、衬线标题、纸片/模式/向量对象与青蓝知识点 |

详细证据和访问限制见[选取记录](BRAND_SELECTION_2026_10.md)。本次没有引入位图、外部字体或品牌Logo；没有把验证/错误页面当成视觉参考。10份仍共享9个语义节点/8条关系，但坐标、尺度、轮廓、文字层级和路线各自独立。移动连接可能按编辑器重排，不承诺自动避障。

源码：`scripts/brand-scenes/community-china-themes.mjs`及各品牌同名场景；如 `node scripts/generate-brand-examples.mjs raycast` 单独生成该份SVG/Prompt。注册在`brand-styles.ts`，保存到本地的旧版仍独立保留。


## 2026-10-28：十品牌重新校准

此次替换上述十份内置SVG和Prompt，保留ID/9节点/8关联，不增目录条目。重点从配色与空卡转向具体技术对象，完整依据见[选取与校准记录](BRAND_SELECTION_2026_10.md)。

| 品牌 | 当前图解构图 |
| --- | --- |
| Cursor | 暖纸文件域、开放处理行、实际路径和源码上下文、代码生成与引用回答；没有伪应用框 |
| Lovable | 奶油白向全谱色域柔和过渡，文档/切片/向量/模式分化，原创白色汇聚与渐变综合对象；没有假发送按钮 |
| Supabase | 更大的knowledge模式表、文档页组、细线向量结构、语义SQL检索和代码生成；没有旧圆柱 |
| n8n | 浅色大字与实际官网深色工作流材料，图标中心节点、明确端口和粉色综合 |
| Raycast | 红色渐变斜面贯穿综合区、紧凑知识命令、高对比依赖和有内外缘的键帽模型 |
| 字节跳动 | 大白色单角知识域对照蔚蓝综合域，开放知识材料和青色生成组件 |
| 小红书 | 宽幅内容故事对象、原创语义封面、粗中文字与紧凑检索脊线；没有周边绕线 |
| DJI 大疆 | 原创三孔镜腔与精密壳体/地平线光，真实壳体绑定，外围为细长知识模块 |
| Kimi | 主导圆润问题与浅色附层、开放文件和引用正文、极少量蓝点；没有伪应用框 |
| 阶跃星辰 | 空白边缘重叠的不等幅研究纸页、向量网络、切片/模式/摘录及大衬线字阶；不仿历史手稿 |

这些是基于具体验证来源的原创品牌语言适配，不宣称逐像素复刻或官方认证；字体本机回退。用户保存版本不自动覆盖，显式“恢复内置”读取新的SVG/Prompt。浏览器检查新增全部90节点的绑定端点精确移动与撤销；功能验证不代替用户审美判断。


## 2026-10-28：六个AI品牌研究

新增后为 **36品牌、58风格、99示例**。此前30对品牌SVG/Prompt共60文件保持不变；知识工厂默认入口、三个推荐和本地覆盖逻辑保留。六份以同一RAG内容作比较，各有独立构图，不表示对应公司的真实产品架构。

| 品牌 / key | 转译到原生图解的视觉语言 | 第一方参照 |
| --- | --- | --- |
| Mistral / mistral | 暖白大字、橙色强调、真正像素对象和直角台阶知识链；橙色综合对象收束下方运行链 | [Brand](https://mistral.ai/brand/)、[官网](https://mistral.ai/) |
| Perplexity / perplexity | 纸白/青绿、Sans/Serif/Mono层次，来源研究页、摘录、索引书目和宽幅回答出处 | [官方指南入口](https://www.perplexity.ai/hub)、[色彩](https://live.standards.site/perplexity/color)、[字体](https://live.standards.site/perplexity/type) |
| Cohere / cohere | 白面双行大字、深绿知识域、灰绿/淡金材料、开放文档与层叠综合；精确几何弧线代替官网有机纹理 | [当前官网与North展示](https://cohere.com/) |
| Hugging Face / huggingface | 白色外场、深色模型材料、仓库路径/类型标签，黄色模型焦点；不复制吉祥物或填入假下载量 | [社区官网](https://huggingface.co/)、[官方色板](https://huggingface.co/brand) |
| ElevenLabs / elevenlabs | 明确采用ElevenAgents分支，浅色大字、蓝绿圆球、窄知识片段和宽幅回答；端点对齐实际圆周 | [品牌分支规范](https://elevenlabs.io/brand)、[当前产品视觉](https://elevenlabs.io/) |
| Replicate / replicate | 当前洋红/橙红网点技术场、白色知识代码材料、不对称综合链；原生pattern和RAG伪代码 | [当前官网](https://replicate.com/) |

Perplexity官方Hub页尾确认品牌指南链接；指南的公开索引正文可验证`#FBFAF4 / #091717 / #20808D`及三种字体角色。Chrome主站遇到验证页、指南连接失败，旧standards.site路由为404，均未当作有效截图。本图是这些已确认原则下的原创研究排版，不宣称复刻未观察的产品UI。其余五份依据实际稳定加载的官方页面/品牌材料；Cohere的Models请求跳回首页，不另算证据。Mistral品牌页的禁止用法示例不作为允许应用。ElevenLabs不混用Creative橙色Chladni和API黑白体系；Replicate按当前色场纠正旧黑白印象。

原生SVG保留text、g、defs、marker及9节点/8绑定关系；没有外部图片、Logo、吉祥物、滤镜或网络字体。各专有字体仅本机优先、系统回退，不分发字体文件；Cohere标题使用明确标注的Georgia近似。静态仓库路径与代码只说明RAG机制，不是SDK用法、真实运行状态、产品能力或性能。移动后连线可重新路由，不承诺自动避障。

生成源：`scripts/brand-scenes/ai-themes.mjs`和六个同名场景；`node scripts/generate-brand-examples.mjs mistral`（替换key）只重建一对SVG/Prompt。新增ID为`brand-{key}-rag`；已有本地版本和编辑器图稿不会被覆盖。
