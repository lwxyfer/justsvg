"""Additional vector-native diagram languages; preserve the original five assets."""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('base_examples', Path(__file__).with_name('generate-style-examples.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
tag, ROOT = base.tag, base.ROOT
STYLES = {
    'paper': dict(name='黑白论文', bg='#ffffff', ink='#171717', muted='#525252', accent='#171717', line='#484848', fill='#ffffff', font='Georgia, Songti SC, serif', spec='黑白学术论文插图。白底，黑灰两级，Georgia/宋体衬线标题，细线方框和居中标签。顶部有 Figure 1. 与简短题名，下方正文型说明。仅使用 1.2px 方框、实心小端口和开放箭头，不使用彩色、阴影或圆角。节点标题居中排列，保留充足留白。'),
    'swimlane': dict(name='流程泳道', bg='#ffffff', ink='#253b55', muted='#516781', accent='#245a94', line='#607e9f', fill='#ffffff', font='Arial, PingFang SC, sans-serif', spec='流程泳道式技术图。两条横向阶段泳道，浅蓝/浅绿底，左侧窄色带标示 INDEX 和 ANSWER，各泳道有独立标题与分界。节点为白色紧凑矩形，蓝色顶部细标题线，右上角标节点类型。跨泳道箭头沿两条泳道之间的空白通道绕行，不穿过泳道标题。'),
    'circuit': dict(name='电路布线', bg='#102330', ink='#e4f5f9', muted='#aec7d2', accent='#72d4d2', line='#72d4d2', fill='#173340', font='ui-monospace, SFMono-Regular, Consolas, monospace', spec='二维电路布线风格。深蓝绿底，青色走线，切角模块外框，左右两侧有可见圆形焊盘端口和短引脚。使用等宽英文模块标题、芯片编号和中文说明。图形为平面技术示意，不做写实电路板、阴影、发光、纹理或动画。连线为清晰的正交细线。'),
    'bauhaus': dict(name='包豪斯几何', bg='#f7f2e5', ink='#202020', muted='#515047', accent='#c83d2b', line='#242424', fill='#fffdf5', font='Arial, PingFang SC, sans-serif', spec='包豪斯几何信息图。奶油白底，红、黄、蓝原色，黑色 2px 轮廓。大号粗体标题与圆、方块、三角形的阶段符号构成版式。每个节点用方角白卡片，顶部有一个原色几何标识和阶段编号。使用平面色块，不要渐变、阴影、斜体或拟物插画。'),
    'notes': dict(name='便签工作坊', bg='#f5f4ef', ink='#38372f', muted='#635f50', accent='#886127', line='#776d58', fill='#fff0b7', font='Arial, PingFang SC, sans-serif', spec='精确矢量便签工作坊。浅灰白工作面，黄色、薄荷绿、桃色和淡紫便笺作为节点；每张便笺右上角有 16px 折角，正文为整齐的系统无衬线字体。使用细虚线连接和阶段编号。保持所有便笺正向、不旋转；不要手绘抖动线、手写字体、纸纹、投影、胶带或图片。'),
    'metro': dict(name='地铁线路', bg='#fcfcfa', ink='#263441', muted='#576674', accent='#245ea8', line='#245ea8', fill='#fcfcfa', font='Arial, PingFang SC, sans-serif', spec='地铁线路式知识路径。白底，离线索引用蓝色线路、在线回答用绿色线路，节点为圆形站点和居中标签，不使用卡片边框。轨道贯穿站点，两条线路通过索引到检索器的灰色虚线换乘连接。跨行连接的节点内部支线需绕开文字：索引站的支线从站点下方向右绕过说明，再到下边中心；检索站的支线从上边中心向左绕过标题，再进入站点。不能让支线穿过任何站名或说明。阶段名左侧有 A/B 线路标志。箭头标明信息方向。'),
    'rack': dict(name='服务器机架', bg='#edf1f4', ink='#243342', muted='#516476', accent='#315b7c', line='#658197', fill='#f8fafb', font='Arial, PingFang SC, sans-serif', spec='服务器机架正面示意。冷灰底，灰白模块、深蓝面板分隔线。每个节点为方角机箱模块，四角螺钉圆点，左侧小组通风槽，右下角小型接口标记。节点标题和说明位于中间，避开槽和螺钉；这是平面几何信息图，不使用金属纹理、立体透视、渐变或性能数字。'),
    'deco': dict(name='装饰艺术', bg='#22272a', ink='#f5ecd4', muted='#cebea0', accent='#e2bd72', line='#c5a565', fill='#292e31', font='Georgia, Songti SC, serif', spec='Art Deco 装饰艺术技术图。炭黑底、香槟金细线、居中的衬线标题和对称几何线饰。节点为黑底双层细框，四角小菱形，标题居中，中文说明使用清晰的系统字体。阶段条两端有短平行线。图案只用可编辑几何线条；不要奢侈品牌标志、真实材质、阴影、发光或纹理。'),
    'pixel': dict(name='复古像素', bg='#20213c', ink='#fff7dc', muted='#c8c6e0', accent='#90e3ad', line='#90e3ad', fill='#2b2d4d', font='ui-monospace, SFMono-Regular, Consolas, monospace', spec='复古像素界面风格。深靛蓝底，薄荷绿走线、米白文字、橙色重点。节点外框采用 6px 台阶式切角，少量方形像素标志，几何使用 crispEdges，文字仍保留为可编辑的等宽 text 而非位图或像素路径。水平与正交箭头整齐，禁止扫描线纹理、模糊、动画和发光。'),
    'minimal': dict(name='极简线性', bg='#ffffff', ink='#202c37', muted='#576574', accent='#354b60', line='#80909e', fill='#ffffff', font='Arial, PingFang SC, sans-serif', spec='极简线性架构图。纯白底，没有可见卡片边框、背景色块或图标；节点使用居中标题、中文小字和一条细下划线，依靠留白和清晰连线表达结构。主标题为轻量无衬线，两条阶段标题采用小号深灰字与细分隔线。背景透明矩形仅用于编辑器的节点边界，输出不应看见它。'),
    'handdrawn': dict(name='手绘草图', bg='#fffdf7', ink='#34352e', muted='#606151', accent='#466950', line='#555c50', fill='#f4f1de', font='Comic Sans MS, Chalkboard SE, Kaiti SC, KaiTi, cursive', spec='手绘草图风格的技术架构图。暖白背景，深灰绿墨线，淡黄/浅绿/淡蓝/淡桃色填充。节点边框用两次略微错开的原生 SVG 二次曲线闭合描边，偏差约1–2px，保留手画的不规则感而不影响文字可读性；不旋转节点。连接线用端点精确、中间稍有起伏的 polyline，箭头为开口双线笔画；保留端点关联，节点拖动后允许连线按编辑器的正交路由重排。标题和节点文字优先使用本机 Comic Sans MS / Chalkboard SE / Kaiti SC / KaiTi / cursive 手写字体回退，文字必须保留为 text，不下载外部字体、不转路径。节点内中文说明使用清晰的系统无衬线字体，底部可有少量短铅笔线。不要纸张图片、纹理滤镜、feTurbulence、阴影、脚本、位图或不可编辑的描字轮廓。'),
}

def generate(slug, s):
    def rect(x,y,w,h,fill='none',stroke='none',radius=0,width=1):
        return tag('rect', dict(x=x,y=y,width=w,height=h,fill=fill,stroke=stroke,rx=radius,**{'stroke-width':width}))
    def text(value,x,y,size=20,color=None,weight=400,anchor='start',font=None):
        attrs={'x':x,'y':y,'font-size':size,'fill':color or s['ink'],'font-weight':weight,'text-anchor':anchor}
        if font: attrs['font-family']=font
        return tag('text',attrs,base.escape(value))
    def line(x1,y1,x2,y2,color=None,width=1,dash=None):
        attrs=dict(x1=x1,y1=y1,x2=x2,y2=y2,stroke=color or s['line'],**{'stroke-width':width})
        if dash: attrs['stroke-dasharray']=dash
        if slug=='handdrawn':
            return tag('path',{'d':f'M{x1} {y1} Q{(x1+x2)/2} {(y1+y2)/2+1.6} {x2} {y2}','fill':'none','stroke':attrs['stroke'],'stroke-width':width,'stroke-linecap':'round'})
        return tag('line',attrs)
    def circle(cx,cy,r,fill='none',stroke=None,width=1):
        return tag('circle',dict(cx=cx,cy=cy,r=r,fill=fill,stroke=stroke or s['line'],**{'stroke-width':width}))
    layout=base.LAYOUT
    positions={n[0]: (60+i*280,250,240,112) if i<4 else (60+(i-4)*230,550,160,112) for i,n in enumerate(base.NODES)}
    if slug=='swimlane':
        positions={n[0]: (170+i*250,250,210,112) if i<4 else (150+(i-4)*205,550,170,112) for i,n in enumerate(base.NODES)}
        layout='''画布为 1200×800，viewBox="0 0 1200 800"。上泳道范围 (50,200,1100,190)，下泳道范围 (50,485,1100,200)。阶段标签在泳道左边 70–130px 范围内。
上排四节点 x=170、420、670、920，y=250，宽210、高112；下排五节点 x=150、355、560、765、970，y=550，宽170、高112。
跨行连线从向量索引底部 (1025,362) 经 (1025,440)、(440,440) 到检索器顶部 (440,550)。所有文字必须位于画布和所属节点内，留出至少12px边距。'''
    prompt=f'# {s["name"]} · RAG 架构图\n\n{base.CONTENT}\n\n风格要求：\n{s["spec"]}\n\n{layout}\n\n{base.CONSTRAINTS}\n'
    (ROOT/'prompts'/f'{slug}.md').write_text(prompt)
    defs=''
    for role,color in [('main',s['line']),('online','#287b65'),('cross',s['muted'])]:
        shape = tag('path',{'d':'M1 1L9 5L1 9','fill':'none','stroke':color,'stroke-width':1.5}) if slug=='paper' else tag('path',dict(d='M0 0L10 5L0 10Z',fill=color))
        if slug=='handdrawn': shape = tag('path',{'d':'M1 1L9 5L.6 9 M1.6 .8L8.6 5.2L1.1 9.2','fill':'none','stroke':color,'stroke-width':.85,'stroke-linecap':'round','stroke-linejoin':'round'})
        defs+=tag('marker',dict(id=f'{slug}-arrow-{role}',viewBox='0 0 10 10',refX=9,refY=5,markerWidth=6,markerHeight=6,orient='auto-start-reverse'),shape)
    parts=[tag('title',{},s['name']+' · RAG 架构图'),tag('desc',{},f'原生可编辑示例。设计 Prompt 见 src/examples/prompts/{slug}.md。演示架构，非生产配置。'),tag('defs',{},defs),rect(0,0,1200,800,s['bg'])]
    headings={
        'paper': ('Figure 1. Retrieval-augmented generation', 'A schematic of indexing, retrieval and grounded answering.'),
        'swimlane': ('知识管线 / RAG', '分阶段理解知识如何进入回答'),
        'circuit': ('RAG / SIGNAL ROUTING', 'LOGICAL CIRCUIT · INDEX → RETRIEVE → GENERATE'),
        'bauhaus': ('知识，经过设计。', 'RAG · STRUCTURE / RETRIEVAL / RESPONSE'),
        'notes': ('把知识，排成一条路', 'RAG 工作坊 · 从文档整理到回答与引用'),
        'metro': ('知识有自己的线路', 'RAG 路线图 · 两条路径，一个回答'),
        'rack': ('RAG / 系统模块', '从知识接入到回答输出的模块连接示意'),
        'deco': ('KNOWLEDGE, CONNECTED', 'RAG · RETRIEVAL-AUGMENTED GENERATION'),
        'pixel': ('RAG: KNOWLEDGE PIPELINE', 'INDEX / RETRIEVE / GENERATE · EDITABLE VECTOR VIEW'),
        'minimal': ('从知识到回答', 'RAG · 清晰的结构，足够的留白'),
        'handdrawn': ('把知识，画明白', 'RAG 草图 · 一笔一笔，连接知识与回答'),
    }
    title,subtitle=headings[slug]
    if slug in ['paper','deco']:
        parts += [text(title,600,100,32 if slug=='paper' else 40,weight=600,anchor='middle'),text(subtitle,600,142,16,s['muted'],anchor='middle')]
        if slug=='deco':
            parts += [line(60,165,520,165),line(680,165,1140,165),tag('polygon',{'points':'600,154 612,166 600,178 588,166','fill':s['accent']})]
        else: parts += [line(60,170,1140,170,width=.8)]
    else:
        parts += [text(title,60,100,36 if slug in ['circuit','pixel'] else 44,weight=700 if slug in ['bauhaus','pixel'] else 500),text(subtitle,60,143,16,s['muted'])]
        if slug=='bauhaus': parts += [circle(1090,97,29,'#d2432e','#202020',2),rect(1020,125,30,30,'#275a9b'),tag('polygon',{'points':'1080,157 1110,157 1095,131','fill':'#e2b72b'})]
        elif slug=='pixel':
            for i in range(3): parts += [rect(1080+i*20,82,12,12,'#edb468')]
        elif slug=='circuit':
            parts += [line(60,172,1120,172,width=1.2),circle(1130,172,5,s['accent'])]
        else: parts += [line(60,174,1140,174,width=1)]
    if slug=='swimlane':
        parts += [rect(50,200,1100,190,'#edf3fa',s['line']),rect(50,485,1100,200,'#edf6f2',s['line']),line(130,200,130,390),line(130,485,130,685),text('INDEX',70,231,13,s['accent'],600),text('离线',70,256,14,s['muted']),text('ANSWER',65,516,12,s['accent'],600),text('在线',70,541,14,s['muted'])]
    else:
        for idx,(label,y) in enumerate([('离线索引 / INDEXING',215),('在线回答 / ANSWERING',505)]):
            if slug=='metro':
                color=s['accent'] if idx==0 else '#287b65'
                parts += [rect(60,y-23,30,30,color,radius=15),text('A' if idx==0 else 'B',75,y-2,17,'#ffffff',600,'middle'),text(label,104,y,16,color,600)]
            elif slug=='deco': parts += [line(60,y-5,230,y-5),line(970,y-5,1140,y-5),text(label,600,y,16,s['accent'],500,'middle')]
            else: parts += [text(label,60,y,16,s['accent'],600)]
    edges=[]
    def edge(a,b,points,cross=False):
        online=a in ['query','retrieve','context','llm']
        role='cross' if cross and slug=='metro' else 'online' if online and slug=='metro' else 'main'
        color=s['muted'] if role=='cross' else '#287b65' if role=='online' else s['line']
        attrs={'id':f'{slug}-edge-{a}-{b}','points':' '.join(f'{x},{y}' for x,y in points),'fill':'none','stroke':color,'stroke-width':4 if slug=='metro' else 2 if slug in ['bauhaus','pixel'] else 1.5,'stroke-linejoin':'round' if slug=='metro' else 'miter','marker-end':f'url(#{slug}-arrow-{role})','data-sf-start-node':f'#{slug}-node-{a}','data-sf-end-node':f'#{slug}-node-{b}','data-sf-start-anchor':'.5 1 0 0' if cross else '1 .5 0 0','data-sf-end-anchor':'.5 0 0 0' if cross else '0 .5 0 0'}
        if cross or slug=='notes': attrs['stroke-dasharray']='6 4'
        if slug=='handdrawn':
            ink_points=[]
            for j,(p,q) in enumerate(zip(points,points[1:])):
                if j==0: ink_points.append(p)
                horizontal=abs(q[0]-p[0])>abs(q[1]-p[1])
                ink_points.append(((p[0]+q[0])/2+(0 if horizontal else 1.1),(p[1]+q[1])/2+(1.1 if horizontal else 0)))
                ink_points.append(q)
            attrs.update({'points':' '.join(f'{px},{py}' for px,py in ink_points),'stroke-width':1.7,'stroke-linecap':'round','stroke-linejoin':'round'})
        return tag('polyline',attrs)
    for seq in [['docs','chunks','embed','index'],['query','retrieve','context','llm','answer']]:
        for a,b in zip(seq,seq[1:]):
            x,y,w,h=positions[a]; u,v,_,_=positions[b]
            edges += [edge(a,b,[(x+w,y+h/2),(u,v+h/2)])]
    x,y,w,h=positions['index']; u,v,uw,uh=positions['retrieve']
    edges += [edge('index','retrieve',[(x+w/2,y+h),(x+w/2,440),(u+uw/2,440),(u+uw/2,v)],True)]
    parts += [tag('g',{'id':slug+'-connections','data-label':'连接线'},'\n'.join(edges))]
    for i,(node_id,title,sub) in enumerate(base.NODES):
        x,y,w,h=positions[node_id]; color=s['accent']; body=[]
        fill=['#fff0b7','#e3f1de','#fbe0d3','#ece4f7'][i%4] if slug=='notes' else s['fill']
        # The first rectangle is always the logical card boundary, even for unboxed styles.
        body += [rect(x,y,w,h,'none' if slug in ['metro','minimal','handdrawn'] else fill,'none' if slug in ['metro','minimal','circuit','pixel','handdrawn'] else s['line'],width=1.2 if slug=='paper' else 2 if slug=='bauhaus' else 1)]
        if slug=='paper':
            body += [text(title,x+w/2,y+46,20 if w<200 else 24,weight=600,anchor='middle'),text(sub,x+w/2,y+77,14,s['muted'],anchor='middle',font='Arial, PingFang SC, sans-serif'),circle(x,y+56,2.5,s['ink']),circle(x+w,y+56,2.5,s['ink'])]
        elif slug=='swimlane':
            body += [line(x+12,y+10,x+w-12,y+10,s['accent'],3),text('INDEX' if i<4 else 'ANSWER',x+w-12,y+26,9,s['muted'],anchor='end'),text(title,x+12,y+49,19 if w<200 else 22,weight=600),text(sub,x+12,y+81,14,s['muted'])]
        elif slug=='circuit':
            p=f'{x+10},{y} {x+w-10},{y} {x+w},{y+10} {x+w},{y+h-10} {x+w-10},{y+h} {x+10},{y+h} {x},{y+h-10} {x},{y+10} {x+10},{y}'
            body += [tag('polyline',{'points':p,'fill':'none','stroke':color,'stroke-width':1.5}),text(f'IC {i+1:02d}',x+16,y+22,11,s['muted']),text(title,x+16,y+55,16 if w<200 else 20,weight=600),text(sub,x+16,y+84,14,s['muted'],font='Arial, PingFang SC, sans-serif')]
            for px in [x,x+w]: body += [circle(px,y+56,4,s['bg'],color,1.5)]
            for j in range(3): body += [line(x+40+j*12,y-6,x+40+j*12,y,color),line(x+40+j*12,y+h,x+40+j*12,y+h+6,color)]
        elif slug=='bauhaus':
            c=['#c83d2b','#e4bc38','#275a9b'][i%3]
            body += [circle(x+26,y+26,10,c,c),text(f'{i+1:02d}',x+w-28,y+30,13,s['muted'],600),text(title,x+14,y+64,19 if w<200 else 24,weight=700),text(sub,x+14,y+92,14,s['muted'])]
        elif slug=='notes':
            body += [tag('polygon',{'points':f'{x+w-16},{y} {x+w},{y+16} {x+w},{y}','fill':s['bg']}),tag('polyline',{'points':f'{x+w-16},{y} {x+w-16},{y+16} {x+w},{y+16}','fill':'none','stroke':s['line']}),text(f'{i+1:02d} / RAG',x+14,y+24,11,s['muted']),text(title,x+14,y+59,19 if w<200 else 23,weight=600),text(sub,x+14,y+88,14,s['muted'])]
        elif slug=='metro':
            c=s['accent'] if i<4 else '#287b65'
            body += [line(x,y+56,x+w,y+56,c,4)]
            if node_id=='index': body += [tag('polyline',{'points':f'{x+w/2},{y+56} {x+w/2},{y+68} {x+w-8},{y+68} {x+w-8},{y+h} {x+w/2},{y+h}','fill':'none','stroke':s['muted'],'stroke-width':2})]
            if node_id=='retrieve': body += [tag('polyline',{'points':f'{x+w/2},{y} {x+8},{y} {x+8},{y+44} {x+w/2},{y+44} {x+w/2},{y+56}','fill':'none','stroke':s['muted'],'stroke-width':2})]
            body += [circle(x+w/2,y+56,11,s['bg'],c,3),circle(x+w/2,y+56,4,c,c),text(title,x+w/2,y+26,18 if w<200 else 23,weight=600,anchor='middle'),text(sub,x+w/2,y+99,14,s['muted'],anchor='middle')]
        elif slug=='rack':
            for dx,dy in [(7,7),(w-7,7),(7,h-7),(w-7,h-7)]: body += [circle(x+dx,y+dy,1.8,s['muted'],s['muted'])]
            for j in range(3): body += [line(x+12,y+31+j*9,x+22,y+31+j*9,s['line'],2)]
            body += [text(title,x+30,y+47,17 if w<200 else 22,weight=600),text(sub,x+30,y+78,14,s['muted']),rect(x+w-33,y+h-21,20,8,'none',s['line']),line(x+30,y+91,x+w-44,y+91,s['line'])]
        elif slug=='deco':
            body += [rect(x+5,y+5,w-10,h-10,'none',color,width=.5),text(title,x+w/2,y+48,20 if w<200 else 25,weight=600,anchor='middle'),text(sub,x+w/2,y+80,14,s['muted'],anchor='middle',font='Arial, PingFang SC, sans-serif')]
            for dx,dy in [(9,9),(w-9,9),(9,h-9),(w-9,h-9)]: body += [tag('polygon',{'points':f'{x+dx},{y+dy-3} {x+dx+3},{y+dy} {x+dx},{y+dy+3} {x+dx-3},{y+dy}','fill':color})]
        elif slug=='pixel':
            p=f'{x+6},{y} {x+w-6},{y} {x+w-6},{y+6} {x+w},{y+6} {x+w},{y+h-6} {x+w-6},{y+h-6} {x+w-6},{y+h} {x+6},{y+h} {x+6},{y+h-6} {x},{y+h-6} {x},{y+6} {x+6},{y+6} {x+6},{y}'
            body += [tag('polyline',{'points':p,'fill':'none','stroke':color,'stroke-width':2}),rect(x+14,y+15,8,8,'#edb468'),text(f'{i+1:02d}',x+30,y+24,12,s['muted']),text(title,x+14,y+56,16 if w<200 else 20,weight=600),text(sub,x+14,y+87,14,s['muted'],font='Arial, PingFang SC, sans-serif')]
        elif slug=='handdrawn':
            node_fill=['#fbf0c9','#e8f1de','#e6eef7','#f6e7dc'][i%4]
            d=f'M{x+1} {y+1} Q{x+w*.48} {y-1} {x+w-1} {y+1} Q{x+w+1} {y+h*.46} {x+w-1} {y+h-1} Q{x+w*.48} {y+h+1} {x+1} {y+h-1} Q{x-1} {y+h*.52} {x+1} {y+1}Z'
            echo=f'M{x+3} {y+2} Q{x+w*.54} {y+.2} {x+w-2} {y+3} Q{x+w-.2} {y+h*.5} {x+w-2} {y+h-2} Q{x+w*.5} {y+h-.3} {x+2} {y+h-2} Q{x+.2} {y+h*.48} {x+3} {y+2}'
            body += [tag('path',{'d':d,'fill':node_fill,'stroke':s['line'],'stroke-width':1.6}),tag('path',{'d':echo,'fill':'none','stroke':s['line'],'stroke-width':.8,'opacity':.55}),text(title,x+14,y+57,19 if w<200 else 24,weight=500),text(sub,x+14,y+86,14,s['muted'],font='Arial, PingFang SC, sans-serif')]
            for j in range(3): body += [line(x+w-37+j*8,y+h-10,x+w-32+j*8,y+h-16,s['muted'],.8)]
        else:
            body += [text(title,x+w/2,y+43,20 if w<200 else 24,weight=500,anchor='middle'),text(sub,x+w/2,y+77,14,s['muted'],anchor='middle'),line(x+22,y+96,x+w-22,y+96,s['line'],.8)]
        parts += [tag('g',{'id':f'{slug}-node-{node_id}','data-label':f'{title} / {sub}','data-node':'true'},'\n'.join(body))]
    parts += [line(60,715,1140,715,width=.7),text('RAG / Retrieval-augmented generation',60,748,14,s['muted']),text('演示架构 · 可编辑节点与文字 · 非生产配置',60,776,12,s['muted'],font='Arial, PingFang SC, sans-serif')]
    attrs={'xmlns':'http://www.w3.org/2000/svg','viewBox':'0 0 1200 800','width':1200,'height':800,'font-family':s['font']}
    if slug=='pixel': attrs['shape-rendering']='crispEdges'
    if slug=='handdrawn': attrs.update({'stroke-linecap':'round','stroke-linejoin':'round'})
    (ROOT/'assets'/f'{slug}.svg').write_text(tag('svg',attrs,'\n'+'\n'.join(parts)+'\n')+'\n')

if __name__=='__main__':
    for slug,style in STYLES.items(): generate(slug,style)
    print(f'Authored {len(STYLES)} additional native SVG styles and prompts.')
