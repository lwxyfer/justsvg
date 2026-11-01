const font = 'Helvetica Neue, Arial, PingFang SC, sans-serif';
const base = { font, arrowSize: 8 };
export const aiBrandThemes = {
  mistral: {
    ...base,
    name: 'Mistral',
    summary: '暖色像素构建 · 阶梯知识链与分层综合',
    paper: '#f7f5ef',
    ink: '#191919',
    muted: '#625d54',
    accent: '#8b4028',
    palette: ['#f7f5ef', '#ffaf00', '#ff8205', '#fa520f', '#e10500', '#191919'],
    rules:
      '参照Mistral官方Brand页的暖白、大幅紧排黑字、橙色强调和原生像素模型语言。知识摄入按四级阶梯下降，文档/切片/向量/索引用真正的像素几何表达；下方查询和索引汇入检索，再经上下文到分层橙色综合对象和回答。轮廓采用直角台阶，不能用通用圆角卡片替代。不是复制像素猫、M字标或官方模型插图，所有像素对象按RAG语义原创。',
    refinement:
      '76px两行紧排标题，橙色底面强调第二行；12px几何单元、低饱和暖纸、像素模型与直角依赖；节点标题24–30px，文字保持text，像素不用于长正文。所有台阶形完整边界与绑定一致。',
    sources: [
      { title: 'Mistral · 官方品牌与像素模型视觉', url: 'https://mistral.ai/brand/' },
      { title: 'Mistral · 当前官网', url: 'https://mistral.ai/' },
    ],
    evidence:
      '实际Brand页已打开，Models部分明确采用像素插图。图中对象是原创技术几何，不复用像素猫、商标、官方模型图、照片、选择控制点或协作者指针；暖色按实际品牌材料近似。专有字体不分发，本机无衬线回退；内容不是Mistral生产架构或实际模型能力。',
  },
  perplexity: {
    ...base,
    name: 'Perplexity',
    summary: '知识出版物 · 纸白、青绿与可追溯引用',
    paper: '#fbfaf4',
    ink: '#091717',
    muted: '#536361',
    accent: '#20808d',
    palette: ['#fbfaf4', '#091717', '#20808d', '#def7f9', '#b2582d'],
    font: 'Perplexity Sans, Helvetica Neue, Arial, PingFang SC, sans-serif',
    rules:
      '采用Perplexity官方Hub页底部链接的Brand Guidelines，严格以Off White #FBFAF4、Off Black #091717、Turquoise #20808D为主，配Sans/Serif/Mono的编辑式层次。四份来源研究页形成左侧知识材料，右侧问题进入检索、上下文、模型，最后输出横向回答与出处。文档页、切片摘录、向量结构、索引书目及引用正文各有明确内容，不画假搜索按钮或照搬未观察的产品界面。',
    refinement:
      '58px清楚的无衬线标题、细青绿规则与安静纸白，30px衬线用于研究页，等宽字只承担路径和字段；原生纸页/索引结构、宽幅有据回答，功能青绿深于装饰。橙色只作少量摘录标识，不能压过青绿。',
    sources: [
      {
        title: 'Perplexity · 官方品牌入口（页尾Brand Guidelines）',
        url: 'https://www.perplexity.ai/hub',
      },
      { title: 'Perplexity · 品牌色彩指南', url: 'https://live.standards.site/perplexity/color' },
      { title: 'Perplexity · 品牌字体指南', url: 'https://live.standards.site/perplexity/type' },
    ],
    evidence:
      '官方Hub页尾确认链接至该品牌指南；指南色号和字体层级由公开网页索引正文读取。Chrome主站为验证页、指南连接失败，未将这些页面当作有效截图；本图仅是经确认的色彩/字体原则下原创研究排版，不宣称复刻产品UI。专有字体本机优先、系统与Georgia回退，未分发；无真实引用文章或生成效果。',
  },
  cohere: {
    ...base,
    name: 'Cohere',
    summary: '企业知识场 · 大字、深绿与有组织的材料',
    paper: '#ffffff',
    ink: '#222222',
    muted: '#59645f',
    accent: '#c9d4bd',
    palette: ['#ffffff', '#222222', '#284d40', '#d6d6b0', '#f2efe6', '#c5c9aa'],
    font: 'CohereText, Helvetica Neue, Arial, PingFang SC, sans-serif',
    rules:
      '参照当前Cohere首页的大幅两行字阶、白色页面、深绿/金色知识场与North文档组织层次。顶部白面与大字，下方深绿知识域；左侧四种知识处理材料，中部问题与检索汇入右侧上下文、综合、回答。通过开放文档行、摘录条、向量点、索引行和不同尺度内容体现企业知识结构，不能模拟完整North窗口或仅给九张卡片换绿色。',
    refinement:
      '68px Georgia近似CohereText的大幅有分量字形，白/深绿区域形成主次；知识域使用受控的精确几何弧线，不仿画官网有机金绿纹理。浅纸/淡金/灰绿对应不同材料，圆润检索与叠层综合；功能线浅绿有充分对比。',
    sources: [{ title: 'Cohere · 当前官网与North展示', url: 'https://cohere.com/' }],
    evidence:
      '有效截图已等待字形动画稳定，显示白色巨幅标题、深色工作域、金绿材料和North知识组织。原纹理、照片和应用截图不复制，几何知识场为明确原创转译；CohereText不可用时以Georgia/系统字近似。图只说明RAG，不含真实企业文档、部署安全认证或性能。',
  },
  huggingface: {
    ...base,
    name: 'Hugging Face',
    summary: '开源知识仓库 · 深色模型面与黄色重点',
    paper: '#ffffff',
    ink: '#f3f4f6',
    muted: '#667085',
    accent: '#acb8c7',
    palette: ['#ffffff', '#0b101b', '#18212f', '#ffd21e', '#ff9d00', '#b8c3d2'],
    font: 'Source Sans Pro, Helvetica Neue, Arial, PingFang SC, sans-serif',
    rules:
      '参照当前Hugging Face首页的白色外场、深色模型工作面、开源仓库文字/任务标签，以及官方Brand页#FFD21E/#FF9D00色板。知识处理用仓库式材料行，查询汇入检索、上下文和黄色模型对象，输出独立回答。保留来源路径、语义类型和模型/数据关系，不把整图涂成黄色、不复制拥抱吉祥物、不造下载量/点赞/排名。',
    refinement:
      '54px重字主标题在深场中左对齐；深蓝灰层级、12px角、细冷灰边，仓库路径13–15px等宽，黄色集中于模型综合和小范围类型。正文浅灰有高对比；没有假筛选/收藏/参数滑杆。',
    sources: [
      { title: 'Hugging Face · 当前社区与模型视觉', url: 'https://huggingface.co/' },
      { title: 'Hugging Face · 官方品牌色板', url: 'https://huggingface.co/brand' },
    ],
    evidence:
      '当前首页实际是白色外场中的深色模型与任务图，不沿用“黄底吉祥物”印象。图中仓库名全部example示意，无真实第三方模型/指标/状态或品牌表情。Source Sans Pro本机优先、系统回退；不引入图片、字体文件或外部内容。',
  },
  elevenlabs: {
    ...base,
    name: 'ElevenLabs',
    summary: 'ElevenAgents 方向 · 蓝绿声球与清晰知识链',
    paper: '#fcfbfa',
    ink: '#101010',
    muted: '#67635e',
    accent: '#426b7c',
    palette: ['#fcfbfa', '#101010', '#143b62', '#408ca6', '#79a796', '#d5e8e3'],
    font: 'Waldenburg, Helvetica Neue, Arial, PingFang SC, sans-serif',
    rules:
      '明确采用ElevenLabs官方Brand页的ElevenAgents方向：浅色母品牌页面、蓝色主调/绿青层次、圆/球作为Agent图形。标题克制大字，知识片段列与问题汇入检索、上下文，再进入直径416px蓝绿球形综合对象，底部宽幅回答。不要混用ElevenCreative橙色Chladni和ElevenAPI黑白体系；球是原创原生几何材质，不复制官方声球位图，也不画播放按钮或11标志。',
    refinement:
      '60px两行常规标题，窄知识片段与开放注释，球使用受控原生径向层次和深色中心上的清晰白字承载核心，关系端点在真实圆周4px之外。辅助信号条是知识综合的静态图解，不表示真实音频、可播放状态或语音功能。',
    sources: [
      { title: 'ElevenLabs · 官方品牌规范（ElevenAgents）', url: 'https://elevenlabs.io/brand' },
      { title: 'ElevenLabs · 当前产品视觉', url: 'https://elevenlabs.io/' },
    ],
    evidence:
      '官方规范明确Agents为蓝色/圆球，Creative为橙色/Chladni，API为黑白；本图只采Agents分支，不声称整个品牌只有一种色板。原生几何适配不复制声球纹理或照片。仍为同9节点RAG内容，不是语音产品真实架构；Waldenburg本机优先，系统回退。',
  },
  replicate: {
    ...base,
    name: 'Replicate',
    summary: 'API 技术色场 · 网点渐变与白色代码对象',
    paper: '#ffffff',
    ink: '#202020',
    muted: '#626262',
    accent: '#ffffff',
    palette: ['#ffffff', '#202020', '#8b239d', '#d82793', '#e3214f', '#e64720'],
    font: 'Basier Square, Helvetica Neue, Arial, PingFang SC, sans-serif',
    rules:
      '采用当前Replicate官网实际洋红/橙红网点色场与白色代码/输出并列材料，不沿用推荐时的黑白极简印象。大幅白字与完整深洋红技术场、左列白色知识代码对象、中部问题/检索与右侧上下文/模型/回答形成不对称链路。摄入阶段用source/split/embed/index伪代码说明，生成块用带语法层次的综合代码，不画假的API调用成功/计数或嵌入官方生成照片。',
    refinement:
      '64px紧排双行白标题，原生pattern细点只近似实际网点，不用噪声滤镜；白面方角与细中性分隔、13–18px代码、24–28px信息标题。依赖线白色只走颜色场，代码注释保持语义而不充当装饰，所有白面随节点移动。',
    sources: [{ title: 'Replicate · 当前官网色场与API代码展示', url: 'https://replicate.com/' }],
    evidence:
      '有效官网截图显示大幅洋红/橙红渐变网点和白色代码面，和旧黑白印象不同。此图为RAG机制伪代码，不是Replicate SDK用法；不复制生成照片、官方标志、真实模型/调用数或性能。Basier Square及Freigeist仅本机优先，系统回退，无额外运行依赖。',
  },
};
