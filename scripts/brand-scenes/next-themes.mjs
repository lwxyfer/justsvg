// First-party visual references inspected on 2026-10-27. Adaptations, not official systems.
export const nextBrandThemes = {
  github: {
    name: 'GitHub',
    summary: 'Actions 依赖图 · 提交轨道与代码层级',
    paper: '#0d1117',
    ink: '#f0f6fc',
    muted: '#9da7b3',
    accent: '#9da7b3',
    font: 'Mona Sans, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#0d1117', '#161b22', '#30363d', '#3fb950', '#a5d6ff'],
    arrowSize: 8,
    rules:
      '具体采用GitHub Actions产品页的工作流依赖图和GitHub深色仓库材料。标题下方是一整幅工作流：左列知识构建任务有绿色空心提交轨道；上方查询/检索/上下文形成横向job链，右下大型模型job包含等宽伪代码，回答为绿色产物行。用灰色线、6px节点轮廓、文件路径和语法色体现代码工具的精度。节点标题/说明不换为真实CI任务，不绘制成功状态、不虚构运行时间。不是GitHub首页吉祥物海报，也不复用Linear或Vercel版式。',
    refinement:
      '提交轨道有明确起止，路径用等宽字，语义标题保持无衬线。工作流与代码区不同尺度，微弱边界退后、绿色集中在轨道和回答。代码为示意流程而非可运行SDK示例。',
    sources: [
      { title: 'GitHub · Actions 产品与工作流视觉', url: 'https://github.com/features/actions' },
      { title: 'GitHub · 官方网站', url: 'https://github.com/' },
    ],
    evidence:
      '官方Actions页面的工作流示例提供job依赖图依据，官网实际打开确认深色表面与无衬线层级。图中是RAG流程的原创适配，不是实际仓库或运行状态；Mona Sans仅优先本机字体，不分发字体和Octocat标志。',
  },
  slack: {
    name: 'Slack',
    summary: '协作消息流 · 紫色工作区与知识附件',
    paper: '#ffffff',
    ink: '#1d1c1d',
    muted: '#625563',
    accent: '#716076',
    font: 'Salesforce Sans, Lato, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#4a075d', '#f7f0fa', '#36c5f0', '#2eb67d', '#ecb22e'],
    arrowSize: 8,
    rules:
      '参考当前Slack官网白底重字标题、紫色产品框架和消息阅读结构。四个知识附件位于紫色来源侧栏；问题是带彩色原创几何头像的消息，检索是工作流消息，上下文是附件正文，大型生成消息位于中下，右侧为带引用段的回答线程。紫色用于整个工作面，青/绿/黄用于语义头像而非全图循环染色。保留真实8条RAG依赖，不伪造在线人数、未读数和聊天时间，不复制Slack井号商标。',
    refinement:
      '工作区保留顶栏、来源栏和白色消息区三层。头像为圆角原创几何，白色消息保留明确正文和附件区分；来源卡与线程的尺寸不同。辅助字色必须在浅紫与白底可读。',
    sources: [
      { title: 'Slack · 当前官网与产品工作区', url: 'https://slack.com/' },
      { title: 'Slack · Media Kit 产品截图', url: 'https://slack.com/media-kit' },
    ],
    evidence:
      '依据实际官网中的紫色产品框架、白色工作面和粗字标题，不把历史茄紫当作唯一当前规范。头像/消息/附件为原创图示，无真实团队数据。当前官网显示Salesforce字体，SVG用本机字体近似并回退，不分发专有字体。',
  },
  cloudflare: {
    name: 'Cloudflare',
    summary: '边缘网络图 · 橙色技术场与网络环',
    paper: '#ffffff',
    ink: '#262626',
    muted: '#606060',
    accent: '#a23f12',
    font: 'STK Bureau Sans, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#ff5b18', '#fff5ec', '#262626', '#f6821f'],
    arrowSize: 9,
    rules:
      '采用当前Cloudflare官网橙色技术场、黑色常规大字、白色工作面及网络图语言。原生渐变与低透明度细点阵构成橙色技术标题带；其下，上排是四个知识处理对象，下排从问题流经检索/上下文，到带环形网络线的边缘生成核心，回答在独立底部回路。橙色集中在标题与生成焦点，功能连接使用较深橙保证对比。网络环是原生几何，不假造地理坐标、全球节点数、延迟或性能指标，不复制云商标。',
    refinement:
      '细橙色同心网络环、不同层级的处理对象和灰白表面。标题带白色大字，浅橙节点上用深橙字；依赖连接绕行，不能用装饰网络线替代真实绑定。',
    sources: [
      { title: 'Cloudflare · 官方首页与Region: Earth网络视觉', url: 'https://www.cloudflare.com/' },
    ],
    evidence:
      '根据实际官网橙色大幅技术场、近白页面、细网络图与黑色无衬线观察；色号/环形几何为RAG图解适配，不是官方token清单或真实部署。STK Bureau Sans仅本机优先，使用系统回退。',
  },
  miro: {
    name: 'Miro',
    summary: '智能协作画布 · 衬线标题、便签与流程对象',
    paper: '#fbfaf7',
    ink: '#25251f',
    muted: '#62615a',
    accent: '#5846cc',
    font: 'Roobert PRO, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#fbfaf7', '#ffe44d', '#fff5ad', '#f6d5e6', '#d3e8fd', '#5846cc'],
    arrowSize: 8,
    rules:
      '具体依据当前Miro官网的新视觉：衬线大标题、暖纸色、淡点阵白色画布、黄色品牌点缀与蓝紫流程连接。顶部四个可编辑便签承载知识链，下方问题对话、菱形检索、上下文文档、深色模型工作块和黄色回答形成清晰路径。各对象有不同形状和尺度，不复制FigJam协作指针，不画虚构协作者和人数。标题使用本机Georgia近似官网Apris衬线气质，正文无衬线。',
    refinement:
      '画布点阵只在工作区出现；便签有轻微折角但无假投影，纸张/菱形/对话框的轮廓独立。深色模型用黄色图形作焦点；蓝紫箭头对齐真实几何端点。',
    sources: [{ title: 'Miro · 当前官网 Intelligent Canvas 视觉', url: 'https://miro.com/' }],
    evidence:
      '实际官网已采用Apris衬线标题、暖白点阵工作面和蓝紫连接，不能只沿用旧版蓝黄印象。本图为原生图解转译，Georgia/Roobert系统回退，不复制品牌标志或照片，不声称专有字形一致。',
  },
  airbnb: {
    name: 'Airbnb',
    summary: '知识探索旅程 · 搜索胶囊、目的地与地图',
    paper: '#ffffff',
    ink: '#222222',
    muted: '#646464',
    accent: '#a52a49',
    font: 'Airbnb Cereal VF, Circular, Helvetica Neue, Arial, PingFang SC, sans-serif',
    palette: ['#ffffff', '#f7f7f7', '#ff385c', '#d70466', '#222222', '#dfeee8'],
    arrowSize: 8,
    rules:
      '将Airbnb官网搜索与探索产品语言转译为知识旅程：上方大型分段胶囊问题搜索，四张知识目的地包含原创几何内容封面和开放式两行标题，下方浅色地图组织检索/上下文/生成，莓红回答如旅程终点。卡片图像区用可编辑的文档/切片/向量/索引几何替代照片，地图仅为抽象路径，不标真实地点或假房价、评分、库存。保持白底、精确留白、圆润字阶和紧凑图标，不复制Bélo商标。',
    refinement:
      '胶囊搜索以细分隔线组织问题与知识范围，圆形莓红搜索动作；目的地图像区带静态收藏心形和圆角、标题留在图像下方，生成对象包含原创定位符号。浅灰地图与莓红回答产生远近层次，真实绑定连接与背景道路分开。',
    sources: [{ title: 'Airbnb · 官方搜索与探索界面', url: 'https://www.airbnb.com/' }],
    evidence:
      '实际官网重定向至地区站，可见Cereal字体、白色页面、分段搜索胶囊与莓红动作；本图从这些产品材料构建原创知识旅程。地区页未加载完整房源列表，图中封面是几何知识图示而非官方房源照片；不声称完整页面复刻。字体本机回退，不嵌入外部资源。',
  },
};
