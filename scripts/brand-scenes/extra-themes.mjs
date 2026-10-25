export const extraBrandThemes = {
  stripe: {
    name: 'Stripe',
    summary: '基础设施叙事 · 斜切渐变与分层数据流',
    paper: '#f6f9fc',
    ink: '#0a2540',
    muted: '#425466',
    accent: '#635bff',
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#0a2540', '#635bff', '#a960ee', '#ffbfad', '#f6f9fc'],
    rules:
      '具体参考Stripe官网基础设施叙事：深海军蓝大字、斜切紫/蓝/珊瑚渐变、精密白色数据模块。左侧是垂直知识输入链，中间是不等尺度的查询/检索核心/上下文，右侧深色生成接口与白色输出；以数据流而非九张等大卡片组织内容。模型展示API路径和处理层，渐变仅用于品牌场域与基础设施焦点，不做渐变文字、无意义光晕或虚构金额。渐变、文件、核心和连接全部原生SVG，不嵌入图片和专有字体。',
    sources: [
      { title: 'Stripe · 基础设施视觉', url: 'https://stripe.com/' },
      { title: 'Stripe · 品牌资源', url: 'https://stripe.com/newsroom/brand-assets' },
    ],
    evidence:
      '以Stripe官网的斜切渐变、深蓝排版、产品与开发者基础设施层级为参考；转译为RAG数据流，不是支付生产架构或官方模板。字体采用本机近似。',
  },
  linear: {
    name: 'Linear',
    summary: '暖灰工程工作区 · 退后导航与任务层级',
    paper: '#101012',
    ink: '#f4f5f8',
    muted: '#aaa9a6',
    accent: '#929bf5',
    font: 'Arial, PingFang SC, sans-serif',
    palette: ['#101012', '#171719', '#f4f5f8', '#929bf5', '#8ad4b1'],
    rules:
      '具体采用Linear产品项目/Issue视图的2026年更新的暖灰工程语言：偏暖中性近黑画布、柔和表面分隔、清晰位置栏与视图栏、状态图标和窄列任务；右侧以检索任务详情和结果组织RAG流程。小面积低饱和蓝只用于选中状态，中性灰承担依赖线，绿色仅用于输出状态；侧栏在视觉上退后，位置栏与视图栏分开，减少侧栏无意义分隔线；不同任务尺寸和阅读层级，禁止用霓虹光晕或把所有卡片染紫。薄框与低噪声结构保留，功能箭头至少3:1、辅助文字至少4.5:1；Issue ID均为示意，不使用实际客户数据或官方图标商标。',
    sources: [
      { title: 'Linear · 产品视觉', url: 'https://linear.app/' },
      {
        title: 'Linear · 2026界面更新',
        url: 'https://linear.app/now/behind-the-latest-design-refresh',
      },
      { title: 'Linear · 品牌指南', url: 'https://linear.app/brand' },
    ],
    evidence:
      '依据官方2026界面更新对位置栏/视图栏、分隔与密度的调整，以及官方品牌页的Mercury White #F4F5F8/Nordic Gray #222326和低饱和蓝原则；暖灰表面颜色为图示适配值；本图是原创RAG任务视图，未使用Linear商标素材。',
  },
  figma: {
    name: 'Figma',
    summary: '协作画布 · 组件色块与多人创作线索',
    paper: '#fff8ed',
    ink: '#242021',
    muted: '#5a534b',
    accent: '#242021',
    font: 'Arial, PingFang SC, sans-serif',
    palette: ['#fff8ed', '#ffb7a8', '#d9c7ff', '#f9e492', '#b9e7dd', '#5b5bff'],
    rules:
      '具体参考Figma/FigJam的多人创作画布，而非只借用五色logo：暖白画布、大字、颜色鲜明的组件、文件/切片/向量组件/索引等不同图形，以及两个人工示意的彩色协作指针。知识链向右分叉进入检索和生成，标题、框架、组件与结果具有不同尺度。角色色固定，不按序号循环；组件菱形和光标是自主绘制几何，不使用Figma标志，不把实际编辑器选框和控制点写入SVG。所有内容与连接原生可编辑。',
    sources: [
      { title: 'Figma · 品牌使用指南', url: 'https://www.figma.com/using-the-figma-brand/' },
      { title: 'Figma · FigJam 协作画布', url: 'https://www.figma.com/figjam/' },
    ],
    evidence:
      '转译FigJam的协作、组件、连线和色块组织。画面中的指针/名字是说明素材，不是实时协作者；不用logo或假选框替代品牌构图，字体采用本机近似。',
  },
  vercel: {
    name: 'Vercel',
    summary: 'Geist 部署工作流 · 表面、代码与状态层级',
    paper: '#000000',
    ink: '#ededed',
    muted: '#a1a1a1',
    accent: '#a1a1a1',
    font: 'Geist, Arial, PingFang SC, sans-serif',
    palette: ['#000000', '#ededed', '#606060', '#0070f3'],
    rules:
      '具体参考Vercel Geist的高对比黑白、严格网格、开发者排版和部署依赖图：上方四个构建阶段，下方请求/检索/上下文连接右侧生成与输出。网格作为真正的图坐标场存在，节点沿网格对齐，文件路径使用等宽文字；模型采用线框计算对象和代码分区，输出用蓝色事件流状态强调；补充项目、分支、Preview上下文。对象采用6px基础表面与12px模型表面；灰阶区分背景/边界/次要文字/正文，文件图标、路径、搜索函数与端口都承担语义。不能用空矩形加网格冒充完整品牌设计。黑色界面不能只靠三角logo识别，禁止霓虹、厚重投影与泛蓝科技装饰；灰阶箭头至少3:1，正文4.5:1。Geist可用时使用，否则本机回退，不加载外部字体。',
    sources: [
      { title: 'Vercel · Geist 设计系统', url: 'https://vercel.com/geist/introduction' },
      { title: 'Vercel · 网格', url: 'https://vercel.com/geist/grid' },
      { title: 'Vercel · 色彩', url: 'https://vercel.com/geist/colors' },
      { title: 'Vercel · 表面材料', url: 'https://vercel.com/geist/materials' },
      { title: 'Vercel · 字体层级', url: 'https://vercel.com/geist/typography' },
    ],
    evidence:
      '官方Geist明确以高对比色彩、网格及开发者字体组织视觉；本图按Materials的6/12px表面角色、字体的标题/标签/代码层级和色彩分工细化部署DAG。项目、分支和Preview均为图示，不是真实Vercel部署或运行状态。',
  },
};
