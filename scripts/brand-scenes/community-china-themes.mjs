// Source-led, source-bounded diagram adaptations. Recalibrated after user rejection, 2026-10-28.
export const communityChinaThemes = {
  cursor: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'Cursor',
    collection: 'community',
    summary: '暖纸代码架构 · 开放文件列与上下文源码',
    paper: '#f7f7f4',
    ink: '#26251e',
    muted: '#68675f',
    accent: '#737266',
    palette: ['#f7f7f4', '#e8e5de', '#ffffff', '#26251e', '#d6d2c7'],
    rules:
      '具体参照当前Cursor官网的暖灰/暖白材料、克制句式标题和紧密的文件/上下文/代码排版，提取为开放式技术图，而非复制应用窗口。左侧为原生文件路径与知识处理列，中上问题汇入右侧文档检索与上下文源码，再流向左下代码生成和右下回答。文件、上下文与模型要有不同内容结构，保留sources/handbook.md与伪代码等示意材料。',
    refinement:
      '40px句式标题、浅石色文件域、13–16px真实文件路径和伪代码，节点标题22–25px。去掉伪窗口栏和外框，文档行开放、代码块带细分隔，正文清楚。所有语义对象拥有自己的背景并随节点移动，绑定边界与实际对象一致。',
    sources: [
      {
        title: 'Cursor · 当前官网与智能体工作台',
        url: 'https://cursor.com/',
      },
      {
        title: '社区选取依据 · Cursor Insights',
        url: 'https://cursor.com/insights',
      },
      {
        title: 'Cursor · 社区活动',
        url: 'https://cursor.com/community',
      },
    ],
    evidence:
      '当前官网暖白#f7f7f4及任务/文件/上下文结构是参考；官网画作与专有CursorGothic不复制。图为原创RAG技术结构，代码/文件均为示意，不代表真实Cursor配置或执行状态。此次重画取代被用户否定的稀疏伪界面。',
  },
  lovable: {
    font: 'Camera Plain, Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'Lovable',
    collection: 'community',
    summary: '全谱柔和色场 · 知识材料到白色综合对象',
    paper: '#f7f4ed',
    ink: '#1b1b1b',
    muted: '#62584e',
    accent: '#3b2437',
    palette: ['#f7f4ed', '#4e93ff', '#bbc1ff', '#ffa6f9', '#ff0178', '#ff6d1b'],
    rules:
      '视觉依据为Lovable官网公开链接的Brand Hub，参考Creme #F7F4ED、Black #1B1B1B、全谱色板、Typography及Gradient Backgrounds。以蓝紫左域、粉橙右下和向奶油白逐渐消退的层叠径向色场承托原创知识转换。知识材料分别为文档线稿、切片色条、向量点与索引表；问题和知识汇入白色检索焦点，再组合成上下文、渐变叠层模型与白色回答。不能把渐变做成生硬矩形彩虹旗，不画假的发送按钮。',
    refinement:
      '56px/600居中标题与-2px字距，参考Brand Hub的600字重紧排；14–28px柔和白面、受控渐变和深紫功能线。半径144px检索圆是原创语义焦点，不宣称来自官网界面。全谱色也进入切片/向量/综合对象，实际文字承载于清楚的白面。',
    sources: [
      {
        title: 'Lovable · 官网公开品牌入口',
        url: 'https://lovable.dev/brand',
      },
      {
        title: 'Lovable · 官方Brand Hub色彩',
        url: 'https://lovablebrand.lovable.app/brand/colors',
      },
      {
        title: 'Lovable · 官方Brand Hub字体与字阶',
        url: 'https://lovablebrand.lovable.app/brand/typography',
      },
      {
        title: '近期社区选取依据 · Lovable Blog',
        url: 'https://lovable.dev/blog',
      },
    ],
    evidence:
      '主站仍为安全验证页，未用它推断产品界面。有效依据是官网链接的Brand Hub色彩、渐变背景与Typography，非主站布局复制。Camera Plain仅本机优先，使用系统回退，不分发专有字体。所有节点造型和RAG构图为原创转译；没有真实产品会话、发送功能或生成性能。',
  },
  supabase: {
    font: 'Manrope, Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'Supabase',
    collection: 'community',
    summary: '白色数据架构 · 主导索引模式与精细向量几何',
    paper: '#fcfcfc',
    ink: '#171717',
    muted: '#626262',
    accent: '#087f5b',
    palette: ['#fcfcfc', '#ffffff', '#087f5b', '#3ecf8e', '#e9f9ef', '#e4e4e4'],
    rules:
      '参照当前Supabase浅色官网的黑/深绿两级标题、细线非对称Bento和大幅数据插图。知识来源使用文档页组、文本切片和线框向量结构，汇入更大的knowledge数据模式板；索引实际展示id/text/vector/source/chunk/index字段，下方检索以语义SQL说明，上下文接模型代码和淡绿回答。以模式表取代空心通用数据库圆柱，精细数据结构必须进入图本身。',
    refinement:
      '48px常规黑/深绿标题，12px角、1px中性边、原生文档页/线框向量/360×320模式板；SQL与模式字段13–15px等宽字只用于真实代码角色。模式行、标题和说明分离；非同样九张图标卡，绿色集中于依赖和数据语义。',
    sources: [
      {
        title: 'Supabase · 当前官网',
        url: 'https://supabase.com/',
      },
      {
        title: '近期社区选取依据 · Select 2026',
        url: 'https://select.supabase.com/',
      },
      {
        title: 'Supabase · 2026社区Hackathon',
        url: 'https://hackathon.supabase.com/',
      },
    ],
    evidence:
      '实际官网为浅色Manrope和深绿，Oct28补采的Vector/Storage/Data APIs几何作为对象语言参考。伪代码及模式是RAG机制示意，不是可直接部署的官方Supabase架构。Manrope本机优先系统回退；不分发闪电、大象或字体。2026社区活动选取依据沿用。',
  },
  n8n: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'n8n',
    collection: 'community',
    summary: '深色工作流画布 · 浅色大字、明确端口与粉色综合',
    paper: '#fafafa',
    ink: '#161616',
    muted: '#626062',
    accent: '#605b60',
    palette: ['#fafafa', '#ffffff', '#e9e9e9', '#ffb6c7', '#161616'],
    rules:
      '同时参照当前n8n官网浅色首屏及官网下方真实深色工作流示例：灰白大字界面外场、深灰点阵工作面、紧密的图标操作块、端口和粉色重点。上方知识步骤有中央语义图形和下置文字，下方问题与索引汇入较大的检索节点，再到上下文和粉色模型代码。明确区分主站浅色背景与深色工作流材质，不沿用旧暗紫品牌印象。',
    refinement:
      '55px两行紧排黑标题；深色点阵仅用于工作流，圆角28外域/16操作块，端口10px原生marker。知识节点中央图形、下方标签；模型展示prompt+context到response，粉色集中于综合对象，功能线浅中性以保持清楚。',
    sources: [
      {
        title: 'n8n · 当前官网',
        url: 'https://n8n.io/',
      },
      {
        title: '近期社区选取依据 · 官方2026社区研究',
        url: 'https://blog.n8n.io/lets-talk-about-n8n-community-research/',
      },
      {
        title: 'n8n · 2026社区讨论与活动',
        url: 'https://community.n8n.io/top',
      },
    ],
    evidence:
      'Oct28补采官网工作流区能看到深色点阵、图标居中节点和侧边端口；不是把先前浅色首屏当完整工作流编辑器。n8n Baumer字体不分发，系统回退。原生端口属于图示，不是选择辅助框；无真实执行状态、星数或第三方服务集成。',
  },
  raycast: {
    font: 'Inter, Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'Raycast',
    collection: 'community',
    summary: '红色斜向汇聚 · 精确键帽生成与紧凑知识命令',
    paper: '#09090b',
    ink: '#f4f4f5',
    muted: '#aaa7ad',
    accent: '#a39aa2',
    palette: ['#09090b', '#18181b', '#2b282d', '#ff354a', '#e7e5e8'],
    rules:
      '参照Raycast实际官网黑底、主导红色斜向光场、白色重字及公开产品细节中的精确键帽/命令表面。两条不等宽红色渐变结构穿过技术综合区，左侧紧凑知识对象通过索引和问题汇入中央检索，再到上下文/键帽式模型/回答。去掉旧版大伪命令窗口和角落三条小红装饰，让斜向材质组织构图。',
    refinement:
      '52px分行白标题、14px中性深面、模型24px外缘/18px内缘构成有材料的键帽；知识材料用受控柔色标识MD/TXT/VEC/SQL角色。功能依赖使用高对比浅粉白线，避免红背景上丢失。',
    sources: [
      {
        title: 'Raycast · 官方产品视觉',
        url: 'https://www.raycast.com/',
      },
      {
        title: '近期选取依据 · 2026年10月Changelog',
        url: 'https://www.raycast.com/changelog',
      },
      {
        title: 'Raycast · 官方社区扩展生态',
        url: 'https://www.raycast.com/store',
      },
    ],
    evidence:
      '官网首屏实际主导斜向红色，补采产品细节可见命令/键帽材质；不复制官方背景颗粒或斜条商标。几何渐变是原生材料近似，不是假快捷键执行或剪贴板。Inter本机优先；无真实集成、使用量或性能。',
  },
  bytedance: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: '字节跳动',
    collection: 'china',
    summary: '蔚蓝非对称知识域 · 大转角白面与青色综合',
    paper: '#ffffff',
    ink: '#173354',
    muted: '#526174',
    accent: '#123c70',
    palette: ['#ffffff', '#398afa', '#d7fcf5', '#173354', '#dbeaff'],
    rules:
      '参照字节跳动当前中文官网：蔚蓝大场、白色巨大单侧下转角使命版面和中文宋体。将白色转角延伸为占左侧650px的知识域，域内四种知识对象开放排列，右侧蓝域承接问题/检索/青色上下文和多层综合，再输出回答。用实际文档/切片/向量/模式结构替代九张蓝白卡，形成清楚的知识域到推理域非对称关系。',
    refinement:
      '58px宋体中文两行标题、188px单角曲线、白与浅青的不同语义层次，节点标题28px无衬线。知识域内路径开放，依赖深蓝；底部白色来源带保证说明可读。所有知识图形背景归属节点自身，拖动不会留下装饰。',
    sources: [
      {
        title: '字节跳动 · 官方中文视觉',
        url: 'https://www.bytedance.com/',
      },
      {
        title: '中国独角兽选取依据 · 胡润2026榜单（6月25日口径）',
        url: 'https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q',
      },
    ],
    evidence:
      '实际中文官网的蓝场/白色大转角/宋体为结构依据，不复制办公楼照片、四根柱状标志或抖音品牌。字体本机Songti SC/SimSun回退；原生对象为原创技术转译。独角兽口径沿用胡润2026公开快照，不宣称实时状态。',
  },
  xiaohongshu: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: '小红书',
    collection: 'china',
    summary: '内容笔记架构 · 语义封面、粗中文字与轻红依赖',
    paper: '#ffffff',
    ink: '#252525',
    muted: '#646060',
    accent: '#b42039',
    palette: ['#ffffff', '#ff2442', '#fff0f1', '#f5f4ef', '#252525'],
    rules:
      '以实际可公开访问的小红书官方故事页为依据：宽幅白色圆角故事对象、独立缩略封面、粗中文内容标题与少量红色动作。左侧四个编辑式知识条目有文档双页/切片/向量/索引原生语义封面，右侧问题经检索进入上下文和红色模型，再到宽幅有据回答。去掉旧版方形卡阵列与绕整张图的长周边连线，改用两列之间紧凑检索脊线。',
    refinement:
      '64px粗中文标题，600×140故事对象与116×108封面，封面色温分别纸白/浅黄/绿灰/浅紫，语义图形与标题并置。大圆角只从实际故事页结构转译；粉色用于检索片段，强红仅模型重点。没有头像、点赞、假用户内容。',
    sources: [
      {
        title: '小红书 · 官方招聘与品牌故事',
        url: 'https://job.xiaohongshu.com/',
      },
      {
        title: '中国独角兽选取依据 · 胡润2026榜单（6月25日口径）',
        url: 'https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q',
      },
    ],
    evidence:
      '主站访问限制仍保留，视觉来源为实际官方招聘/故事页而非登录后信息流；新封面全部原创原生几何，不复制照片/UGC/字标。字阶和内容关系是主要参考，不把红白配色等同于全品牌规范。胡润2026选择口径不变。',
  },
  dji: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'DJI 大疆',
    collection: 'china',
    summary: '精密光学综合 · 三孔镜组与受控深蓝地平线',
    paper: '#11141e',
    ink: '#f4f6fa',
    muted: '#b0b7c6',
    accent: '#a8b5c8',
    palette: ['#11141e', '#222936', '#f4f6fa', '#7892a4', '#294e60'],
    rules:
      '参照大疆当前Mavic官网的主导三孔光学组件、深蓝黑场、精确金属轮廓和地平线光。以520×450原创圆角光学综合组件为模型焦点，内部一大两小三层镜腔，非单一通用刻度圆环；上方细长知识模块和左侧问题/检索/上下文提供明确结构，底部宽幅回答。几何组件表达综合聚焦，不仿制具体Mavic硬件，不加虚构参数。',
    refinement:
      '54px居中轻字与中文副题，原生径向玻璃/线性金属材质，68/58px双层壳体和104/60px镜腔。输入输出对齐实际壳体边界4px之外，不再绑定旧圆形轮廓。小模块银灰细线和明确语义副标，所有镜组与壳体均随模型组移动。',
    sources: [
      {
        title: 'DJI · 当前官网Mavic产品视觉',
        url: 'https://www.dji.com/cn',
      },
      {
        title: '中国独角兽选取依据 · 胡润2026榜单（6月25日口径）',
        url: 'https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q',
      },
    ],
    evidence:
      '有效官网截图展示三摄光学对象与深色产品光域。新图的壳体和镜腔为原创技术类比，没有复制无人机、相机照片或具体产品形状；不含真实焦距/飞行参数/硬件性能。字体本机无衬线；独角兽选择沿用胡润2026发布口径。',
  },
  kimi: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: 'Kimi（月之暗面）',
    collection: 'china',
    summary: '极简有据问答 · 主导问题面、开放文档与引用正文',
    paper: '#fbfaf9',
    ink: '#181818',
    muted: '#62605f',
    accent: '#696b70',
    palette: ['#fbfaf9', '#ffffff', '#181818', '#e4e2e0', '#2685ff'],
    rules:
      '提取当前Kimi官网黑白/暖白材料、主导圆润问题面、附属浅色搁板和微小蓝点，重新组织为技术图；去掉伪应用窗口/导航栏/历史会话。左侧开放文档处理列，中上952×176问题面，下方紧凑检索/上下文/黑色综合对象，底部为真正有正文与出处结构的开放回答，而不是空卡加假引用按钮。',
    refinement:
      '59px中文黑标题，28px问题面和浅色附层，18–22px推理对象，蓝色只有三个信息点。回答以34px标题、25px结论和20px说明建立文档层次；文件名使用13px等宽字。所有文件/回答背景随组移动，结构边界与绑定一致。',
    sources: [
      {
        title: 'Kimi · 当前官网任务界面',
        url: 'https://www.kimi.com/',
      },
      {
        title: '中国独角兽选取依据 · 胡润2026榜单（6月25日口径）',
        url: 'https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q',
      },
    ],
    evidence:
      '参考当前实际Kimi任务界面的黑白与暖白附层，不沿用早期荧绿宇宙印象，不分发K标志。文档名、引用正文均为原创RAG机制说明，不是真实会话、检索结果或性能。月之暗面独角兽资格沿用胡润2026快照，字体本机回退。',
  },
  stepfun: {
    font: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
    arrowSize: 8,
    name: '阶跃星辰',
    collection: 'china',
    summary: '研究纸页构图 · 错落材料、衬线字阶与青蓝知识点',
    paper: '#fafaf8',
    ink: '#1a1a1a',
    muted: '#5c5f66',
    accent: '#256a8b',
    palette: ['#fafaf8', '#e8e5db', '#f6edbd', '#dbeaf0', '#00adf4', '#1a1a1a'],
    rules:
      '参照阶跃星辰当前官网的不等幅学术纸页拼版、衬线标题与青蓝知识点，技术图主材料采用空白边缘相互重叠的原生研究纸页：原始文档、切片带、较大向量网络与索引表。版面尺寸/起点错落，相邻纸页边缘重叠而标题/图形/端口露出，摄入关系从上/下侧绕行；所有纸面归属可移动语义节点，下游上下文继续双层纸页。下方延续论文摘录/研究问题/上下文/综合推理/有据回答语言，不能上方纸片下方回到空通用卡。',
    refinement:
      '61px两行Georgia近似Lora的衬线主标题，第二行青蓝；纸页形成紧密重叠拼版、奶油/淡黄/灰绿/暖灰材料，内容用细线文档/切片/网络/模式解释语义。检索放入摘录层次，下游使用明确的推理文字；青蓝只标知识点，不画选择框/假手稿。',
    sources: [
      {
        title: '阶跃星辰 · 当前官网学术拼版',
        url: 'https://www.stepfun.com/',
      },
      {
        title: '中国独角兽选取依据 · 胡润2026榜单（6月25日口径）',
        url: 'https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q',
      },
    ],
    evidence:
      '有效官网截图为历史材料/学术图拼版，本图不复制手稿、人物、蝴蝶照片或编辑器控制点。用可以精确描述的研究几何适配为可编辑Diagram，字体Lora本机优先、Georgia/宋体回退。独角兽选取沿用胡润2026发布口径；图不是官方模型架构。',
  },
};
