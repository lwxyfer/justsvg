from pathlib import Path
from PIL import Image
import numpy as np,json,math
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
root=Path(__file__).resolve().parents[1]
a=np.asarray(Image.open(root/'public/brand/kits/source/uploaded-two-logos.png').convert('RGB'))
coverage=np.clip((255-a[:,:,0].astype(float))/216,0,1)
table={1:[(3,0)],2:[(0,1)],3:[(3,1)],4:[(1,2)],5:[(3,0),(1,2)],6:[(0,2)],7:[(3,2)],8:[(2,3)],9:[(0,2)],10:[(0,1),(2,3)],11:[(1,2)],12:[(1,3)],13:[(0,1)],14:[(3,0)]}
def simplify(points,eps):
 if len(points)<=2:return points
 a,b=np.array(points[0]),np.array(points[-1]);v=b-a;d=np.linalg.norm(v)
 distances=[np.linalg.norm(np.array(p)-a) if d<1e-9 else abs(v[0]*(p[1]-a[1])-v[1]*(p[0]-a[0]))/d for p in points]
 i=int(np.argmax(distances))
 if distances[i]<=eps:return [points[0],points[-1]]
 return simplify(points[:i+1],eps)[:-1]+simplify(points[i:],eps)
results=[]
for name,lo,hi in [('layers',0,394),('modules',394,788)]:
 yy,xx=np.where(coverage[:,lo:hi]>.02);x0=int(xx.min()+lo)-2;y0=int(yy.min())-2;x1=int(xx.max()+lo)+3;y1=int(yy.max())+3
 img=coverage[y0:y1,x0:x1];h,w=img.shape;adj={};coords={}
 for y in range(h-1):
  for x in range(w-1):
   vals=[img[y,x],img[y,x+1],img[y+1,x+1],img[y+1,x]]
   case=sum((v>.5)*(1<<i) for i,v in enumerate(vals))
   if case not in table:continue
   edges=[(('h',x,y),(x+.5,y+.5),(x+1.5,y+.5),vals[0],vals[1]),(('v',x+1,y),(x+1.5,y+.5),(x+1.5,y+1.5),vals[1],vals[2]),(('h',x,y+1),(x+.5,y+1.5),(x+1.5,y+1.5),vals[3],vals[2]),(('v',x,y),(x+.5,y+.5),(x+.5,y+1.5),vals[0],vals[3])]
   for e1,e2 in table[case]:
    pair=[]
    for e in [e1,e2]:
     key,p,q,v1,v2=edges[e];t=(.5-v1)/(v2-v1);coords[key]=(p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1]));pair.append(key)
    u,v=pair;adj.setdefault(u,[]).append(v);adj.setdefault(v,[]).append(u)
 assert all(len(v)==2 for v in adj.values())
 seen=set();contours=[]
 for start in adj:
  if start in seen:continue
  chain=[];prev=None;cur=start
  while cur not in seen:
   seen.add(cur);chain.append(coords[cur]);ns=adj[cur];nxt=ns[0] if ns[0]!=prev else ns[1];prev,cur=cur,nxt
  k=max(range(len(chain)),key=lambda i:(chain[i][0]-chain[0][0])**2+(chain[i][1]-chain[0][1])**2)
  poly=simplify(chain[:k+1],.15)[:-1]+simplify(chain[k:]+[chain[0]],.15)[:-1]
  contours.append(poly)
 d=''.join('M'+'L'.join(f'{x:.3f} {y:.3f}' for x,y in ps)+'Z' for ps in contours)
 results.append(dict(id=name,width=w,height=h,sourceBox=[x0,y0,w,h],path=d,contours=len(contours),vertices=sum(map(len,contours))))
font=TTFont(root/'src/assets/fonts/justsvg-sans.woff');font=instantiateVariableFont(font,{'wght':650},inplace=False);glyphs=font.getGlyphSet();cmap=font.getBestCmap();upm=font['head'].unitsPerEm
pen=SVGPathPen(glyphs);x=0;bounds=[]
for char in 'JustSVG':
 g=cmap[ord(char)];tp=TransformPen(pen,(1,0,0,-1,x,0));glyphs[g].draw(tp)
 bp=BoundsPen(glyphs);glyphs[g].draw(bp)
 if bp.bounds:bounds.append((bp.bounds[0]+x,-bp.bounds[3],bp.bounds[2]+x,-bp.bounds[1]))
 x+=font['hmtx'][g][0]-upm*.015
xmin=min(b[0] for b in bounds);ymin=min(b[1] for b in bounds);xmax=max(b[2] for b in bounds);ymax=max(b[3] for b in bounds)
data={'sourceInk':'#334256','rawSourceInk':'#273244','sourceColorProfile':'Generic RGB Profile; canonical sRGB measured in Chrome canvas is 51,66,86','marks':results,'wordmark':{'path':pen.getCommands(),'bounds':[xmin,ymin,xmax-xmin,ymax-ymin],'advance':x,'font':'JustSVG Sans / Noto Sans SC 650','unitsPerEm':upm},'trace':{'method':'50% coverage isocontour, linear interpolation, RDP 0.15 source px','sourceImage':'source/uploaded-two-logos.png','noGeometricRedesign':True}}
(root/'public/brand/kits/source/faithful-vectors.json').write_text(json.dumps(data,separators=(',',':')))
print([(r['id'],r['width'],r['height'],r['contours'],r['vertices']) for r in results])
print('Source ink:',data['sourceInk'])
