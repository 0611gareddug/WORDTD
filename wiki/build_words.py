import re, json
src=open('/home/user/WORDTD/docs/단어목록.md',encoding='utf-8').read()
K={'불':'fire','얼음':'ice','번개':'storm','독':'poison','대지':'earth','물':'water','바람':'wind','빛':'light','어둠':'dark','강철':'steel','비전':'arcane','자연':'nature','지원':'support'}
out=[];kind=None;legend=False
for line in src.split('\n'):
    m=re.match(r'## \S+ (\S+) \(',line)
    if m: kind=K.get(m.group(1)); legend=False; continue
    if line.startswith('## 🏆'): legend=True; kind=None; continue
    if line.startswith('## '): kind=None; legend=False; continue
    c=[x.strip() for x in line.strip().strip('|').split('|')] if line.startswith('| ') else None
    if not c or not re.match(r'^[A-Z]+$',c[0]): continue
    if legend:
        el=c[1].split('+')[0].strip(); k=K.get(el,'support')
        out.append({'w':c[0],'k':k,'m':None if c[2]=='—' else float(c[2]),'a':c[3],'v':'','L':1,'e':c[1]})
    elif kind:
        out.append({'w':c[0],'k':kind,'m':None if c[1]=='—' else float(c[1]),'a':c[2],'v':c[3]})
print(len(out))
json.dump(out,open('words.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
