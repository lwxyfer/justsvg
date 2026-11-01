// Brand-specific art direction. Only serialization and semantic content are shared.
import { extraBrandThemes } from './brand-scenes/extra-themes.mjs';
import { moreBrandThemes } from './brand-scenes/more-themes.mjs';
import { nextBrandThemes } from './brand-scenes/next-themes.mjs';
import { communityChinaThemes } from './brand-scenes/community-china-themes.mjs';
import { aiBrandThemes } from './brand-scenes/ai-themes.mjs';
export const brandThemes = {
  apple: {
    name: 'Apple',
    summary: '产品发布叙事 · 芯片焦点与分级模块',
    paper: '#ffffff',
    ink: '#1d1d1f',
    muted: '#6e6e73',
    accent: '#0071e3',
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#f5f5f7', '#0071e3', '#7868f3', '#e77a9a'],
    rules:
      '以Apple产品发布页和Apple Intelligence/芯片视觉为具体参考。1600×1100白色画布，84px两行产品式标题；左侧四级知识库窄列，中间查询/检索/上下文分级模块，右侧440px大型芯片作为焦点，底部独立回答。芯片通过精确引脚、金属渐变、深色内核和蓝紫粉橙边缘表达材料；不能使用九张等大卡片或一排通用蓝色图标。左侧文件堆叠、切分薄片、向量点阵、索引抽屉各自绘制；文字保持原生text。无品牌logo、位图和滤镜。',
    sources: [
      { title: 'Apple · Mac 产品叙事', url: 'https://www.apple.com/mac/' },
      { title: 'Apple · Intelligence 视觉', url: 'https://www.apple.com/apple-intelligence/' },
      {
        title: 'Apple · PCC 技术图',
        url: 'https://security.apple.com/blog/pcc-security-research/',
      },
    ],
    evidence:
      '依据产品页的不等尺度焦点与留白，以及Apple Intelligence/Apple silicon的技术对象语言。此图为RAG内容转译，不复刻Apple的真实系统；Helvetica Neue近似本机字体，不分发SF字体。',
  },
  microsoft: {
    name: 'Microsoft',
    summary: 'Fluent 空间工作区 · 叠层材质与双色图标',
    paper: '#eef3fb',
    ink: '#242424',
    muted: '#616161',
    accent: '#0f6cbd',
    font: 'Segoe UI, Arial, PingFang SC, sans-serif',
    palette: ['#eef3fb', '#ffffff', '#0f6cbd', '#61d6ff', '#7550d9'],
    rules:
      '以Microsoft Fluent的工作面、层级、双色图标和空间材料为参考，绘制一个完整桌面工作区：白色主工作面、系统标题栏和左侧知识库区域；问题进入右侧检索/上下文，再进入蓝紫叠层模型对象，下方是宽幅回答区域。窗口用细轮廓和工作面明度区分层级；文件、切分、编码、索引图标用不同的渐变体块与明暗面绘制，模型使用重叠半透明平面。Segoe风格紧凑层级，蓝色连接；禁止把Fluent简化成浅蓝底的九张相同卡片。静态SVG不声称模拟Mica或真实系统窗口。',
    sources: [
      { title: 'Microsoft · 设计视觉', url: 'https://microsoft.design/' },
      { title: 'Fluent 2 · 图标', url: 'https://fluent2.microsoft.design/iconography' },
      { title: 'Fluent 2 · 层级', url: 'https://fluent2.microsoft.design/elevation' },
      { title: 'Fluent 2 · 字体', url: 'https://fluent2.microsoft.design/typography/' },
    ],
    evidence:
      '以Fluent工作面、空间层次和双色图标而非色板为依据；体块与工作区是本图原创适配，Segoe不可用时系统回退。',
  },
  google: {
    name: 'Google',
    summary: 'Material 表现性几何 · 语义四色与变化轮廓',
    paper: '#ffffff',
    ink: '#202124',
    muted: '#5f6368',
    accent: '#1a73e8',
    font: 'Google Sans, Arial, PingFang SC, sans-serif',
    palette: ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#ffffff'],
    rules:
      '具体参考Google品牌几何与Material You表现性形状。上方知识链使用不同轮廓：蓝色文档、红色切片、黄色向量花形、绿色索引胶囊；下方大圆形Retriever连接搜索框、上下文、模型与输出，形成不等尺度的阅读节奏。语义色固定：文档/问题蓝，切分红，向量/上下文黄，索引/回答绿；模型蓝。禁止按数组位置循环配色，禁止把所有节点做成相同圆角矩形。深色同色相字保证对比；Google Sans存在时使用，否则本机回退。',
    sources: [
      { title: 'Google · 品牌几何', url: 'https://design.google/library/evolving-google-identity' },
      { title: 'Google · Material You', url: 'https://design.google/library/making-material-you' },
      { title: 'Google · 表现性设计', url: 'https://design.google/about' },
    ],
    evidence:
      '把Google的简单几何、四色与Material的表达性形状落实为节点轮廓、语义映射和不同尺度；不是Google官方架构图标准。',
  },
  openai: {
    name: 'OpenAI',
    summary: 'Developer Blog · 暖色氛围与半透明技术图',
    paper: '#ffffff',
    ink: '#421d2b',
    muted: '#58323e',
    accent: '#713346',
    font: 'OpenAI Sans, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#ffe6be', '#fba477', '#ed755e', '#f9adb8', '#421d2b'],
    rules:
      '以用户指定的https://developers.openai.com/blog为唯一当前视觉锚点，具体采用首篇Designing failover across OpenAI model providers封面的暖色方向。白色编辑式页面、居中克制的标题与灰色副标题，下方是一整幅珊瑚橙/粉红/奶油色渐变封面。技术对象使用半透明白色圆角平面、细白轮廓、精确细线图标，左上和右下添加淡白同心弧线；奶油亮区收在左下第三部分，中部不均匀橙红、右下珊瑚红、右上暖粉；用不等尺度径向色域与多尺度半透明云团、原生pattern细点近似参考封面的颗粒，不能嵌入封面位图。RAG内容保持9节点8关系：左列四个知识阶段，中间查询/检索/上下文，右侧层叠模型和回答；标题正文用深酒红保证信息可读，功能连线也加深，而背景轮廓作为非信息装饰保持很淡。不要复用上一版的巨型圆、直角色块或ChatGPT界面。图案、渐变、clipPath内部引用必须有效；节点、文字和关联保持原生可编辑。',
    sources: [
      { title: 'OpenAI Developers · Blog（用户指定）', url: 'https://developers.openai.com/blog' },
      {
        title: 'Developer Blog · 暖色封面参考',
        url: 'https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp',
      },
    ],
    evidence:
      '直接观察用户指定博客的页面与首篇封面：暖橙珊瑚粉氛围、透明圆角技术图形、白色细线和同心弧线，而非笼统套用OpenAI企业色板。原封面的细腻纹理以原生SVG渐变和细点pattern近似；为架构图的可读性，将文字与实际依赖线加深。OpenAI Sans只在本机可用时使用，不分发专有字体，缺失时回退Helvetica Neue/Arial；不声称逐像素复刻。',
  },
  claude: {
    name: 'Claude',
    summary: '编辑式叙事 · 知识手册与有据的回答',
    paper: '#faf9f5',
    ink: '#3c3830',
    muted: '#646058',
    accent: '#b95637',
    font: 'Arial, PingFang SC, sans-serif',
    palette: ['#faf9f5', '#f0ece3', '#d97757', '#3c3830'],
    rules:
      '参考Claude/Anthropic的温暖编辑气质，构建一张有阅读节奏的图：大幅衬线双行标题、左侧知识手册、中间轻量问题气泡与开放式检索/上下文注释、陶土色圆形生成核心、右侧占主要阅读面积的回答稿纸。使用奶油纸、细暖灰线、陶土连接；知识、问题、推理、回答不使用相同容器和字体层级。76px Georgia标题、开放流程31px衬线、辅助文字无衬线；取消上一版两条大燕麦色托盘。所有纸张和线条为清晰几何，禁止噪声滤镜和伪手绘。',
    sources: [
      { title: 'Claude · 官方产品视觉', url: 'https://claude.com/' },
      { title: 'Anthropic · 编辑与研究视觉', url: 'https://www.anthropic.com/' },
    ],
    evidence:
      '官网的暖纸色、燕麦色、陶土色及衬线/无衬线对照作为材料与阅读层级依据；本图采用知识手册和回答稿纸重新组织RAG，不声称复刻专有字体。',
  },
  notion: {
    name: 'Notion',
    summary: '官网纸墨插画 · 文档、知识对象与黄色点缀',
    paper: '#ffffff',
    ink: '#252522',
    muted: '#57564f',
    accent: '#57564f',
    font: 'Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#252522', '#fff2c6', '#ffcf38', '#fff9e9'],
    rules:
      '用户明确指定Notion官网品牌视觉，参考官方Projects页白纸黑墨和少量黄色的几何插画，而不是Notion编辑器。白底84px两行重字标题，文档、纸片、向量网络、抽屉分别绘制为有细节的墨线对象；左侧四级知识链无卡片背景。查询用带尾巴的纸质对话框，检索用勾选清单，上下文用折页文档，生成用展开的纸质知识册和黄色格窗对象，回答用大幅白纸。2.8–3px黑墨对象轮廓、2–2.5px内部线、2.3px黑色关系线；黑字正文、灰色辅文、黄色只点亮切片/勾选/格窗，保留白纸面积。禁止数据库列名、Aa属性、Source/Status、Share/New、假编辑器侧栏或控件；不要靠画N标志、粗框卡片或给每个节点加同样图标冒充Notion。全部图形文字保持可编辑的原生SVG，不做噪声滤镜或位图。',
    sources: [
      { title: 'Notion · Projects 数据库与看板', url: 'https://www.notion.com/product/projects' },
      {
        title: 'Notion · 官方产品视觉与插画',
        url: 'https://www.notion.com/',
      },
    ],
    evidence:
      '用户已明确选择Notion官网品牌视觉。参考官方Projects页纸墨插画的有分量黑线、纸张与格窗对象和少量黄色；据此创作知识链、勾选清单、稿纸与展开的知识册对象。图中不再模拟数据库和编辑器控件，不使用官方标志或真实产品数据；这是原生SVG品牌风格转译，不是官方插画原稿。',
  },
  ...extraBrandThemes,
  ...moreBrandThemes,
  ...nextBrandThemes,
  ...communityChinaThemes,
  ...aiBrandThemes,
};

// Optical details belong to each visual language, independently of connector weight.
const refinements = {
  apple: [
    10,
    '芯片引脚使用冷银色渐变，金属封装有0.8px内缘高光，暗芯有细边倒角。保持克制的材质层次，不加光晕。',
  ],
  microsoft: [
    10,
    '窗口标题栏仅顶部圆角，底部与内容区齐接；Fluent文件图标有0.8px亮边，薄轮廓和叠层共同表达材质。',
  ],
  google: [
    12,
    'Material八瓣花形采用连续圆润轮廓；向量用三个相连数据点、检索用放大镜、生成用四瓣星，避免占位加号。',
  ],
  openai: [
    8,
    '白底居中标题、完整暖色封面、细白透明平面和低透明度同心弧；细线文件/切片/向量/索引/层叠模型图标。功能文字和关联使用深酒红，装饰白线不承载唯一信息；细颗粒通过确定性的原生pattern实现。',
  ],
  claude: [
    8,
    '知识手册使用陶土色书签小图标，稿纸顶端使用细引线；保持温暖纸面、衬线正文和安静的留白。',
  ],
  notion: [
    8,
    '官网纸墨对象：2.8–3px外轮廓、2–2.5px内部细节、2.3px关系线；重字标题、展开的知识册、分层文档与少量黄色格窗。移除数据库列名、属性和假产品控件；索引供给标签紧邻真实路径。',
  ],
  stripe: [
    9,
    '斜切色域叠加受控原生径向渐变，形成流体色彩；文件、切片、向量和索引用独立细线图标，拒绝X和空方框占位。',
  ],
  linear: [
    8,
    '暖灰近黑工作区、退后的侧栏、分离的位置/视图栏、11px来源ID；只以小面积低饱和蓝标示选中任务状态，依赖线中性灰，避免全图紫色。',
  ],
  figma: [
    9,
    '三个输入块统一88px文字内距、组件图标统一1.5px描边；协作指针加2px白边以区分画布，指针只是静态示意。',
  ],
  vercel: [
    8,
    'Geist表面层级：基础对象6px圆角，模型12px圆角；项目/分支/Preview上下文、文件图标与路径、分区代码和事件流输出丰富信息层级。网格与源列对齐，连线有静态端口，非实际编辑控制点。',
  ],
};
for (const [key, [arrowSize, refinement]] of Object.entries(refinements))
  Object.assign(brandThemes[key], { arrowSize, refinement });
