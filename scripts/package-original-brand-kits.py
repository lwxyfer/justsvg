from pathlib import Path
import hashlib,json,zipfile,re
from html.parser import HTMLParser
from PIL import Image
root=Path(__file__).resolve().parents[1]
base=root/'public/brand/kits'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ['src','href'] and v:self.refs.append(v)
for name in ['layers','modules']:
 folder=base/name
 config=json.loads((folder/'brand.json').read_text())
 assert config['contrast']['whiteOnAccent']>=4.5
 assert config['contrast']['inkOnWhite']>=4.5
 h=(folder/'index.html').read_text()
 assert not any(bad in h for bad in ['NaN','undefined','TODO'])
 parser=Links();parser.feed(h)
 for ref in parser.refs:
  if ref!='asset-manifest.json' and not ref.startswith(('#','data:','http','file:')):assert (folder/ref).exists(),ref
 for png in folder.rglob('*.png'):
  im=Image.open(png);im.verify()
 ico=Image.open(folder/'icons/favicon.ico');assert ico.size==(32,32)
 files=[]
 for p in sorted(folder.rglob('*')):
  if p.is_file() and p.name!='asset-manifest.json':
   entry={'path':p.relative_to(folder).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
   if p.suffix=='.png':entry['dimensions']=list(Image.open(p).size)
   files.append(entry)
 manifest={'brand':name,'fileCountIncludingManifest':len(files)+1,'sourceLogoUnchanged':True,'canonicalColorSpace':'sRGB','files':files,'manifestSelfHashOmitted':True}
 (folder/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
 zip_path=base/f'justsvg-{name}-brand-kit.zip'
 label='JustSVG-A-Layers' if name=='layers' else 'JustSVG-B-Modules'
 with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(folder.rglob('*')):
   if p.is_file():z.write(p,Path(label)/p.relative_to(folder))
 with zipfile.ZipFile(zip_path) as z:
  assert z.testzip() is None
  assert len(z.namelist())==len(files)+1
 print(name,len(files)+1,'files; ZIP',round(zip_path.stat().st_size/1024/1024,2),'MiB; contrast',round(config['contrast']['whiteOnAccent'],2))
