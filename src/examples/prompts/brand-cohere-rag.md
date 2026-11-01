# Cohere 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照当前Cohere首页的大幅两行字阶、白色页面、深绿/金色知识场与North文档组织层次。顶部白面与大字，下方深绿知识域；左侧四种知识处理材料，中部问题与检索汇入右侧上下文、综合、回答。通过开放文档行、摘录条、向量点、索引行和不同尺度内容体现企业知识结构，不能模拟完整North窗口或仅给九张卡片换绿色。

细部规范：68px Georgia近似CohereText的大幅有分量字形，白/深绿区域形成主次；知识域使用受控的精确几何弧线，不仿画官网有机金绿纹理。浅纸/淡金/灰绿对应不同材料，圆润检索与叠层综合；功能线浅绿有充分对比。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

有效截图已等待字形动画稳定，显示白色巨幅标题、深色工作域、金绿材料和North知识组织。原纹理、照片和应用截图不复制，几何知识场为明确原创转译；CohereText不可用时以Georgia/系统字近似。图只说明RAG，不含真实企业文档、部署安全认证或性能。
- Cohere · 当前官网与North展示: https://cohere.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,312,288,128
chunks: Chunking / 解析与切分 | x/y/w/h=80,480,288,128
embed: Embeddings / 向量编码 | x/y/w/h=80,648,288,128
index: Vector index / 向量索引 | x/y/w/h=80,816,288,128
query: User query / 用户问题 | x/y/w/h=496,312,448,120
retrieve: Retriever / 相似度检索 | x/y/w/h=496,568,448,176
context: Context / 上下文构建 | x/y/w/h=1040,568,448,176
llm: LLM / 生成模型 | x/y/w/h=1040,824,448,160
answer: Answer / 回答与引用 | x/y/w/h=496,864,448,120

关系与专用路线：
docs → chunks | 224,444 → 224,476
chunks → embed | 224,612 → 224,644
embed → index | 224,780 → 224,812
query → retrieve | 720,436 → 720,564
retrieve → context | 948,656 → 1036,656
context → llm | 1264,748 → 1264,820
llm → answer | 1036,924 → 948,924
index → retrieve | 372,880 → 424,880 → 424,656 → 492,656

节点ID前缀brand-cohere-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
