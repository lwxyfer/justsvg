# Ramp 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照Ramp当前官网的黑色常规字重大标题、酸柠黄动作、浅石色产品展示面与细点技术场域。顶部知识处理链横向展开，下方查询/检索/上下文汇入黑色生成核心，再到酸柠黄回答。生成核心用精确层叠线与克制圆弧表达官网卡片材料，不写虚构金额、客户增长或处理量，不临摹Ramp商标。信息结构与官网的产品/工作流叙事一致，不能只用荧光色点缀空白方框。

细部规范：标题采用较轻无衬线，石白表面配细中性边界，酸柠黄集中在动作和回答；黑色生成对象内部有精密层叠/曲线细节。点阵属于真实图解工作面，不铺到阅读区。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

依据2026-10-26实际官网截图的黑白/浅石色、酸柠黄、点阵技术场和黑色产品材料观察。色号是页面观察近似，Lausanne以本机无衬线回退；不声称金融事实、真实产品状态或完整品牌token一致。
- Ramp · Official product site: https://ramp.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,350,310,128
chunks: Chunking / 解析与切分 | x/y/w/h=450,350,310,128
embed: Embeddings / 向量编码 | x/y/w/h=820,350,310,128
index: Vector index / 向量索引 | x/y/w/h=1190,350,310,128
query: User query / 用户问题 | x/y/w/h=80,700,310,112
retrieve: Retriever / 相似度检索 | x/y/w/h=580,664,350,164
context: Context / 上下文构建 | x/y/w/h=580,920,350,100
llm: LLM / 生成模型 | x/y/w/h=1130,640,360,200
answer: Answer / 回答与引用 | x/y/w/h=1130,920,360,100

关系与专用路线：
docs → chunks | 394,414 → 446,414
chunks → embed | 764,414 → 816,414
embed → index | 1134,414 → 1186,414
query → retrieve | 394,756 → 478,756 → 478,746 → 576,746
retrieve → context | 755,832 → 755,916
context → llm | 934,970 → 1030,970 → 1030,740 → 1126,740
llm → answer | 1310,844 → 1310,916
index → retrieve | 1345,482 → 1345,560 → 1000,560 → 1000,610 → 755,610 → 755,660

节点ID前缀brand-ramp-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
