// Five independently authored diagram adaptations. Sources are first-party pages inspected 2026-10-26.
export const moreBrandThemes = {
  dropbox: {
    name: 'Dropbox',
    summary: '编辑式拼版 · 强字阶与大胆色块',
    paper: '#1e1919',
    ink: '#ffffff',
    muted: '#d3cec9',
    accent: '#d3cec9',
    font: 'DB Sharp Grotesk, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#1e1919', '#0061fe', '#b4dc19', '#ffafa5', '#fad24b', '#f7f5f2'],
    arrowSize: 9,
    rules:
      '具体参照Dropbox官方Typography页的深石墨底、巨大字阶、直角拼版与鲜明配色组合。知识源为四块不同语义的彩色版面，中列以浅色查询、粉色检索、青柠上下文组织层级，右侧大型蓝色生成版面与浅色回答形成焦点。节点留出清晰连接通道；不是给通用圆角卡片染色，不复制Dropbox标志。大标题与模块尺度差异明确，直角轮廓保持平面编辑气质。',
    refinement:
      '强调有分量的无衬线排版、零圆角色块和不同字阶。彩色底的辅助文字使用深色以确保对比；深色背景上的连接使用浅石色。',
    sources: [
      { title: 'Dropbox · Typography', url: 'https://brand.dropbox.com/typography' },
      { title: 'Dropbox · Color', url: 'https://brand.dropbox.com/color' },
    ],
    evidence:
      '依据实际打开的官方字体页面与官方色板：石墨、蓝、青柠、粉色、浅纸色构成编辑式拼版。专有DB Sharp Grotesk只优先本机可用字体，Helvetica Neue/Arial回退；本图不分发字体、不使用标志，不声称逐像素或字形一致。',
  },
  spotify: {
    name: 'Spotify',
    summary: '音乐播放语言 · 知识队列与唱片焦点',
    paper: '#121212',
    ink: '#ffffff',
    muted: '#b3b3b3',
    accent: '#b3b3b3',
    font: 'Spotify Mix, Arial, PingFang SC, sans-serif',
    palette: ['#121212', '#242424', '#ffffff', '#1ed760', '#b3b3b3'],
    arrowSize: 8,
    rules:
      '具体采用Spotify实际Web Player的深色层级、绿色强调、封面队列和圆形播放对象语言，将知识输入画成四条带原创几何封面的队列，中列是查询/检索/上下文，右侧大型绿色唱片式生成核心与深绿回答。保留原RAG文字与八条真实依赖，不放真实歌名、专辑照片、Spotify标志或虚构播放状态。不是把全部节点做成绿色卡片；绿色集中于生成焦点、检索动作和输出。',
    refinement:
      '深色表面用#121212/#242424分层，文字白/浅灰；原创封面图形、检索三角和唱片同心线体现音乐隐喻。绿色焦点上的文字加深以保证可读。',
    sources: [
      { title: 'Spotify · Web Player', url: 'https://open.spotify.com/' },
      {
        title: 'Spotify · Design guidelines',
        url: 'https://developer.spotify.com/documentation/design',
      },
    ],
    evidence:
      '参考实际Web Player的音乐浏览层级及官方设计指南中的色彩/字体说明。唱片和队列是RAG语义的原创静态转译，不是Spotify服务、真实曲库或可播放控件。Spotify Mix不分发，使用本机字体回退。',
  },
  duolingo: {
    name: 'Duolingo',
    summary: '学习路径 · 圆润轮廓与有弹性的按钮层次',
    paper: '#ffffff',
    ink: '#3c3c3c',
    muted: '#626262',
    accent: '#3f7e16',
    font: 'Arial Rounded MT Bold, Trebuchet MS, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#58cc02', '#d7ffb8', '#1cb0f6', '#ce82ff', '#ffc800'],
    arrowSize: 10,
    rules:
      '具体参考Duolingo当前官网的白底、绿色主要按钮、圆润重字与明确的按钮底边。知识链采用错落的学习站点，查询为蓝色对话块、检索为紫色切角宝石、上下文为白色内容页，右侧绿色圆润生成徽章连接绿色回答。原生几何图标表达文件/切分/向量/索引，不临摹Duo猫头鹰或人物。所有功能字保持可读；饱和绿上的文字使用深绿，这是可读性适配。',
    refinement:
      '模块使用圆角20–28px和2.5–3px轮廓；底边是官网按钮实体厚度的转译而非模糊投影。图标采用圆端厚线，学习站点错落连接，拒绝泛化的九张绿色卡片。',
    sources: [
      { title: 'Duolingo · Official homepage', url: 'https://www.duolingo.com/' },
      { title: 'Duolingo · Design articles', url: 'https://blog.duolingo.com/hub/design/' },
    ],
    evidence:
      '实际官网可见白底、绿色按钮、圆润标题与清晰底边；旧design.duolingo.com指南已跳转设计博客，因此不冒称读取了仍有效的旧token页。图中无官方吉祥物/人物，字形本机近似，学习站点仅为知识流的原创图示隐喻。',
  },
  ibm: {
    name: 'IBM',
    summary: '技术图规范 · 2x节奏、分区层级与正交连接',
    paper: '#f4f4f4',
    ink: '#161616',
    muted: '#525252',
    accent: '#525252',
    font: 'IBM Plex Sans, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#f4f4f4', '#ffffff', '#161616', '#0f62fe', '#e5f6ff', '#8d8d8d'],
    arrowSize: 8,
    rules:
      '采用IBM Design Language的Technical diagrams作为具体参照：清楚的知识/运行/生成三域、直角嵌套框、蓝色语义节点与正交连接。按8px基础节奏构建，以2x画布比例放大节点、图标和左对齐文字；使用1.5–2px轮廓并明确其为图示缩放适配。标题克制，辅助信息层级清晰。不是企业宣传海报，不依靠IBM的8-Bar标志；不复制商标。',
    refinement:
      '白色与Color10浅蓝节点、深色/白色图标、16–32px内距、横纵路径和明确的分区标题；节点说明左对齐，真实连线避开文字和无关节点。',
    sources: [
      {
        title: 'IBM · Technical diagrams',
        url: 'https://www.ibm.com/design/language/infographics/technical-diagrams/design/',
      },
      { title: 'IBM · 2x Grid', url: 'https://www.ibm.com/design/language/2x-grid/' },
      { title: 'IBM · Color', url: 'https://www.ibm.com/design/language/color/' },
    ],
    evidence:
      '官方技术图规范直接提供节点类型、嵌套、正交连接、字体与8px基础网格依据。本图为1600px画布的放大适配，非官方生产架构；IBM Plex Sans仅本机可用时使用，未打包字体或官方产品标志。',
  },
  ramp: {
    name: 'Ramp',
    summary: '财经产品排版 · 酸柠黄、浅石面与黑色核心',
    paper: '#ffffff',
    ink: '#171717',
    muted: '#64635d',
    accent: '#62635b',
    font: 'Lausanne, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#f7f6f2', '#171717', '#e4f222', '#dddcd5'],
    arrowSize: 8,
    rules:
      '参照Ramp当前官网的黑色常规字重大标题、酸柠黄动作、浅石色产品展示面与细点技术场域。顶部知识处理链横向展开，下方查询/检索/上下文汇入黑色生成核心，再到酸柠黄回答。生成核心用精确层叠线与克制圆弧表达官网卡片材料，不写虚构金额、客户增长或处理量，不临摹Ramp商标。信息结构与官网的产品/工作流叙事一致，不能只用荧光色点缀空白方框。',
    refinement:
      '标题采用较轻无衬线，石白表面配细中性边界，酸柠黄集中在动作和回答；黑色生成对象内部有精密层叠/曲线细节。点阵属于真实图解工作面，不铺到阅读区。',
    sources: [{ title: 'Ramp · Official product site', url: 'https://ramp.com/' }],
    evidence:
      '依据2026-10-26实际官网截图的黑白/浅石色、酸柠黄、点阵技术场和黑色产品材料观察。色号是页面观察近似，Lausanne以本机无衬线回退；不声称金融事实、真实产品状态或完整品牌token一致。',
  },
};
