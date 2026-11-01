"""Generate English homepage sleeves from the existing editable brand studies."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
translations=json.loads((ROOT/'src/home/home-translations.json').read_text())
CJK=re.compile('[\u4e00-\u9fff]')
ET.register_namespace('', 'http://www.w3.org/2000/svg')
output=ROOT/'public/home/brands-en';output.mkdir(parents=True,exist_ok=True)
for source in (ROOT/'src/examples/assets').glob('brand-*-rag.svg'):
    root=ET.fromstring(source.read_text())
    parents={child:parent for parent in root.iter() for child in parent}
    def font_size(node):
        while node is not None:
            if node.get('font-size'): return float(node.get('font-size'))
            node=parents.get(node)
        return 14
    for node in root.iter():
        tag=node.tag.rsplit('}',1)[-1]
        for attr,value in list(node.attrib.items()):
            if CJK.search(value):node.set(attr,translations.get(value,'RAG diagram'))
        if not node.text or not CJK.search(node.text):continue
        original=node.text.strip()
        if '视觉研究 · 示例架构 / 非官方 · 原生 SVG 可编辑' in original:
            name=original.split(' 视觉研究')[0]
            english=translations.get(name,name)+' study · Example architecture / Unofficial · Editable SVG'
        elif original in translations:english=translations[original]
        elif tag in ('title','desc','metadata'):english='RAG architecture · Native SVG brand study'
        else:raise ValueError(f'Missing translation in {source.name}: {original}')
        node.text=english
        if tag in ('text','tspan') and not list(node):
            size=font_size(node)
            old_width=sum(1 if CJK.match(c) else .53 for c in original)*size
            new_width=len(english)*size*.53
            if new_width>old_width*1.15:
                node.set('textLength',str(round(old_width,1)))
                node.set('lengthAdjust','spacingAndGlyphs')
    text=ET.tostring(root,encoding='unicode')
    if CJK.search(text):raise ValueError(f'Untranslated SVG: {source.name}')
    (output/source.name).write_text(text+'\n')
print('Generated 36 English SVG sleeves.')
