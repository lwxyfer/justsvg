"""Author editable SVG examples and the exact reusable design prompts, without raster assets."""
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

ROOT = Path(__file__).resolve().parents[1] / 'src' / 'examples'
STYLES = {
    'blueprint': dict(name='工程蓝图', background='#102f54', ink='#eef7ff', muted='#afcde5', accent='#74d8ff', line='#83bce0', fill='#173e67', radius=0, width=1.6, font='ui-monospace, SFMono-Regular, Consolas, monospace', spec='工程制图式蓝图。深蓝 #102f54 底，32px 低对比度方格，冰蓝色细线、方角节点、四角定位记号和尺寸标注。使用等宽英文大写标题和编号，中文辅助说明。节点内有一层内框，保持克制、清晰，不能使用光晕或阴影。'),
    'editorial': dict(name='纸本编辑', background='#faf7ef', ink='#332d27', muted='#71675d', accent='#a83e2b', line='#958577', fill='#fffdf8', radius=0, width=1.2, font='Georgia, Songti SC, serif', spec='纸本技术出版物。暖白 #faf7ef 底，深棕 #332d27 正文、砖红 #a83e2b 重点，Georgia / 宋体衬线字体，大标题与细横线、左侧细标签形成编辑层级。矩形节点像排版小节：无圆角、顶部带小型类别注记、细框，行间距宽松。避免颗粒纹理、纸张滤镜和拟物插画。'),
    'terminal': dict(name='终端控制台', background='#101b1c', ink='#ddf5ec', muted='#a7c5ba', accent='#7ee4ba', line='#578877', fill='#172827', radius=3, width=1.5, font='ui-monospace, SFMono-Regular, Consolas, monospace', spec='终端控制台。近黑墨绿 #101b1c 底，薄荷绿 #7ee4ba 重点，等宽字，顶栏像终端标题栏、三颗小圆点和 rag-system.svg 文件名；下方显示命令行 $ inspect rag --topology。节点像配置块，有小型编号标签、底部状态圆点与 ready 字样。箭头为清晰的绿色实线，不能加入实际代码执行、霓虹光晕或荧光模糊。'),
    'swiss': dict(name='瑞士信息设计', background='#f5f3ec', ink='#181916', muted='#53564c', accent='#d72f26', line='#181916', fill='#ffffff', radius=0, width=2.5, font='Arial, PingFang SC, sans-serif', spec='瑞士平面信息设计。米白 #f5f3ec 底，近黑 #181916 字，朱红 #d72f26 和淡黄 #f5d95d 仅用于语义重点。标题 60px 黑体、左对齐，强网格、黑色方角矩形、3px 直角箭头，大号阶段文字与图形粗细形成对比。向量索引与生成模型用实色重点，其余白底黑框。下半行五个节点，所有节点底边严格对齐。无渐变、阴影、圆角或装饰性插画。'),
    'soft': dict(name='柔和产品图', background='#f8fafc', ink='#24364b', muted='#53667b', accent='#366c9d', line='#7591ad', fill='#eff5fc', radius=18, width=1.5, font='Arial, PingFang SC, sans-serif', spec='柔和产品说明图。近白 #f8fafc 底、深蓝灰文字，蓝/薰衣草紫/薄荷绿/浅桃色区分节点职责。18px 圆角卡片、顶部小尺寸线性几何图标、细描边，连接线采用圆滑接角的正交折线。使用无衬线字体，标题 42px，节点标题 22px，留白宽裕。两个阶段以低饱和色面板衬底。不要阴影、玻璃、模糊、外部图片或装饰性渐变。'),
}
NODES = [
    ('docs','Documents','文档与知识库'), ('chunks','Chunking','解析与切分'),
    ('embed','Embeddings','向量编码'), ('index','Vector index','向量索引'),
    ('query','User query','用户问题'), ('retrieve','Retriever','相似度检索'),
    ('context','Context','上下文构建'), ('llm','LLM','生成模型'), ('answer','Answer','回答与引用'),
]
CONTENT = '''生成一张 RAG 检索增强生成架构图。内容为演示结构，不是生产部署或性能数据。
信息与方向必须准确：
离线索引：Documents（文档与知识库）→ Chunking（解析与切分）→ Embeddings（向量编码）→ Vector index（向量索引）。
在线回答：User query（用户问题）→ Retriever（相似度检索）→ Context（上下文构建）→ LLM（生成模型）→ Answer（回答与引用）。
Vector index 额外向 Retriever 提供检索内容，以绕行的正交折线连接；这条线不得穿过节点或标题。
阶段标题分别为「离线索引 / INDEXING」与「在线回答 / ANSWERING」。'''
LAYOUT = '''画布为 1200×800，viewBox="0 0 1200 800"。页边距至少 56px。
上排四个节点：x=60、340、620、900，y=250，宽240、高112。
下排五个节点：x=60、290、520、750、980，y=550，宽160、高112。
相邻节点水平连接。向量索引至 Retriever 的折线从 (1020,362) 经 (1020,440)、(370,440) 到 (370,550)。
阶段标题在 y=215 和 y=505；y=700 之后仅放图例和演示说明。标题及副标题位于 y=60–155，不得与图内容重叠。
节点标题字号 20–22px，中文说明 14–15px，必须在卡片范围内留有至少 12px 边距。下排长英文标题需要用较小字号或换行，不得越界。'''
CONSTRAINTS = '''只输出完整 SVG XML，不要 Markdown 代码块。
使用原生 rect、g、text、line/polyline/path、defs/marker；文字保留为 text，不转路径。
每个节点使用带唯一 id、data-label、data-node="true" 的独立 g。连线在节点后方，箭头 marker 用本地 url(#id) 引用。
每条线可附带 data-sf-start-node="#节点id"、data-sf-end-node="#节点id"，以及 data-sf-start-anchor / data-sf-end-anchor="u v 0 0"，u/v 为 0–1 归一化边界锚点，方便在 JustSVG 中继续联动编辑。
使用系统字体及回退字体。不使用 script、事件属性、foreignObject、外部 URL/图片/字体、CSS @规则、动画或位图。
确保所有 ID 唯一，所有内部引用存在。导出文件需能在浏览器直接打开，节点可单独拖动、文字可单独修改。'''

def tag(name, attrs=None, content=None):
    attrs = attrs or {}
    a = ''.join(f' {k}={quoteattr(str(v))}' for k,v in attrs.items())
    return f'<{name}{a}>{content}</{name}>' if content is not None else f'<{name}{a}/>'

def generate(slug, s):
    def rect(x,y,w,h,fill,stroke='none',r=0,width=1):
        return tag('rect',dict(x=x,y=y,width=w,height=h,fill=fill,stroke=stroke,rx=r,**{'stroke-width':width}))
    def text(value,x,y,size=20,color=None,weight=400,family=None):
        attrs=dict(x=x,y=y,fill=color or s['ink'],**{'font-size':size,'font-weight':weight})
        if family: attrs['font-family']=family
        return tag('text',attrs,escape(value))
    def line(x1,y1,x2,y2,color=None,width=1,dash=None):
        a=dict(x1=x1,y1=y1,x2=x2,y2=y2,stroke=color or s['line'],**{'stroke-width':width})
        if dash: a['stroke-dasharray']=dash
        return tag('line',a)
    prompt = f'# {s["name"]} · RAG 架构图\n\n{CONTENT}\n\n风格要求：\n{s["spec"]}\n\n{LAYOUT}\n\n{CONSTRAINTS}\n'
    # Save the actual design brief before authoring its vector output.
    (ROOT/'prompts'/f'{slug}.md').write_text(prompt)
    marker=tag('marker',dict(id=f'{slug}-arrow',viewBox='0 0 10 10',refX=9,refY=5,markerWidth=6,markerHeight=6,orient='auto-start-reverse'),tag('path',dict(d='M0 0L10 5L0 10Z',fill=s['line'])))
    defs = marker
    if slug == 'blueprint':
        defs += tag('pattern',dict(id='blueprint-grid',width=32,height=32,patternUnits='userSpaceOnUse'),rect(0,0,32,32,s['background'])+tag('path',dict(d='M32 0H0V32',fill='none',stroke='#284b70',**{'stroke-width':.6})))
    parts=[tag('title',{},f'{s["name"]} · RAG 架构图'),tag('desc',{},escape(f'设计 Prompt 见 src/examples/prompts/{slug}.md。原生可编辑 SVG，演示结构。')),tag('defs',{},defs),rect(0,0,1200,800,'url(#blueprint-grid)' if slug=='blueprint' else s['background'])]
    if slug == 'blueprint':
        parts += [text('RAG / RETRIEVAL SYSTEM',60,100,38,weight=600),text('ARCHITECTURE DRAWING  ·  INDEX → RETRIEVE → GENERATE',60,138,15,s['muted']),line(60,167,1140,167,width=1)]
        parts += [line(60,190,1140,190,width=.8),line(60,184,60,196),line(1140,184,1140,196),text('1200 × 800 / LOGICAL VIEW',820,184,12,s['muted'])]
    elif slug == 'editorial':
        parts += [text('让知识进入回答。',60,102,48,weight=600),text('RAG  /  A field guide to retrieval-augmented generation',62,143,18,s['muted']),line(60,169,1140,169,s['ink'],1.2)]
    elif slug == 'terminal':
        parts += [rect(28,28,1144,756,s['background'],s['line'],8),line(28,68,1172,68)]
        for i,c in enumerate(['#d28677','#d8bd76','#77b99c']): parts += [tag('circle',dict(cx=52+i*19,cy=48,r=4,fill=c))]
        parts += [text('rag-system.svg  —  topology / local',134,53,13,s['muted']),text('$ inspect rag --topology',60,122,32,s['accent']),text('native SVG · 9 nodes · offline indexing + online answering',60,157,14,s['muted'])]
    elif slug == 'swiss':
        parts += [rect(60,55,12,102,s['accent']),text('RAG. From knowledge',96,100,52,weight=700),text('to grounded answers.',96,154,52,weight=700),line(60,182,1140,182,s['ink'],2.5)]
    else:
        parts += [text('让每一次回答，都有依据',60,100,42,weight=600),text('RAG · 从知识整理到可信回答的完整路径',62,141,18,s['muted']),rect(40,184,1120,210,'#edf3fa',r=22),rect(40,472,1120,214,'#eef5f2',r=22)]
    # Phase labels have dedicated horizontal bands, never behind a connector.
    for phase,y in [('离线索引 / INDEXING',215),('在线回答 / ANSWERING',505)]:
        label = phase.split(' / ')[1] if slug in ['blueprint','terminal'] else phase
        parts += [text(label,60,y,16,s['accent'] if slug!='swiss' else s['ink'],600)]
    positions={}
    for i,(node_id,_,_) in enumerate(NODES): positions[node_id] = (60+i*280,250,240,112) if i<4 else (60+(i-4)*230,550,160,112)
    def edge(a,b,points,start='1 .5 0 0',end='0 .5 0 0',dashed=False):
        attrs={'id':f'{slug}-edge-{a}-{b}','points':' '.join(f'{x},{y}' for x,y in points),'fill':'none','stroke':s['line'],'stroke-width':3 if slug=='swiss' else 1.8,'stroke-linejoin':'round','marker-end':f'url(#{slug}-arrow)','data-sf-start-node':f'#{slug}-node-{a}','data-sf-end-node':f'#{slug}-node-{b}','data-sf-start-anchor':start,'data-sf-end-anchor':end}
        if dashed: attrs['stroke-dasharray']='7 5'
        return tag('polyline',attrs)
    edges=[]
    for seq in [['docs','chunks','embed','index'],['query','retrieve','context','llm','answer']]:
        for a,b in zip(seq,seq[1:]):
            x,y,w,h=positions[a]; u,v,_,_=positions[b]
            edges += [edge(a,b,[(x+w,y+h/2),(u,v+h/2)])]
    edges += [edge('index','retrieve',[(1020,362),(1020,440),(370,440),(370,550)],'.5 1 0 0','.5 0 0 0',True)]
    parts += [tag('g',{'id':f'{slug}-connections','data-label':'连接线'},'\n'.join(edges))]
    for i,(node_id,title,sub) in enumerate(NODES):
        x,y,w,h=positions[node_id]
        fill=s['fill']; ink=s['ink']; accent=s['accent']; body=[]
        if slug=='swiss':
            fill = s['accent'] if node_id=='llm' else '#f5d95d' if node_id=='index' else '#ffffff'
            ink = '#ffffff' if node_id=='llm' else s['ink']
        if slug=='soft': fill=['#e9f1fc','#eeebfa','#e5f3f1','#f9eddf'][i%4]
        body += [rect(x,y,w,h,fill,s['line'],s['radius'],s['width'])]
        if slug=='blueprint':
            body += [rect(x+5,y+5,w-10,h-10,'none',s['line'],width=.6)]
            for dx,dy in [(0,0),(w,0),(0,h),(w,h)]:
                body += [line(x+dx-5,y+dy,x+dx+5,y+dy,s['accent'],1),line(x+dx,y+dy-5,x+dx,y+dy+5,s['accent'],1)]
            body += [text(f'N{i+1:02d}',x+16,y+22,11,s['muted']),text(title.upper(),x+16,y+55,16 if w==160 else 20,ink,600),text(sub,x+16,y+84,14,s['muted'],'400','Arial, PingFang SC, sans-serif')]
        elif slug=='terminal':
            body += [text(f'[{node_id}]',x+12,y+23,12,s['accent']),text(title,x+12,y+54,16 if w==160 else 20,ink,500),text(sub,x+12,y+78,14,s['muted'],'400','Arial, PingFang SC, sans-serif'),tag('circle',dict(cx=x+16,cy=y+97,r=2.5,fill=accent)),text('ready',x+26,y+101,10,s['accent'])]
        elif slug=='editorial':
            body += [text('KNOWLEDGE' if i<4 else 'RESPONSE',x+14,y+23,10,accent,400,'Arial, sans-serif'),text(title,x+14,y+58,19 if w==160 else 24,ink,600),text(sub,x+14,y+87,14,s['muted'],'400','Arial, PingFang SC, sans-serif')]
        elif slug=='swiss':
            body += [text(f'{i+1:02d}',x+14,y+25,13,ink,700),text(title,x+14,y+60,19 if w==160 else 24,ink,700),text(sub,x+14,y+89,14,ink)]
        else:
            body += [rect(x+14,y+14,22,22,'none',s['accent'],5),line(x+20,y+22,x+30,y+22,s['accent']),line(x+20,y+28,x+27,y+28,s['accent']),text(title,x+14,y+65,19 if w==160 else 23,ink,600),text(sub,x+14,y+91,14,s['muted'])]
        parts += [tag('g',{'id':f'{slug}-node-{node_id}','data-label':f'{title} / {sub}','data-node':'true'},'\n'.join(body))]
    parts += [line(60,714,1140,714),text('RAG  /  Retrieval-augmented generation',60,747,14,s['muted']),text('演示架构 · 可编辑节点与文字 · 非生产配置',60,767 if slug=='terminal' else 775,12,s['muted'],'400','Arial, PingFang SC, sans-serif')]
    svg=tag('svg',{'xmlns':'http://www.w3.org/2000/svg','width':1200,'height':800,'viewBox':'0 0 1200 800','font-family':s['font']},'\n'+'\n'.join(parts)+'\n')
    (ROOT/'assets'/f'{slug}.svg').write_text(svg+'\n')

if __name__ == '__main__':
    (ROOT/'prompts').mkdir(parents=True,exist_ok=True)
    (ROOT/'assets').mkdir(parents=True,exist_ok=True)
    for slug,spec in STYLES.items(): generate(slug,spec)
    print(f'Authored {len(STYLES)} native SVGs and their prompts in {ROOT}')
