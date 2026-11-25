import json
base=json.load(open('words_270.json',encoding='utf-8'))
have={w['w'] for w in base}
new=[];icons_txt=[]
for f in ['new1.txt','new2.txt','new3.txt']:
    cur=None
    for line in open(f,encoding='utf-8').read().split('\n'):
        if line.startswith('@'):
            head,kind,mult,ab,lv5=line[1:].split('|')
            p=head.split(); w=p[0]; sym=len(p)>1
            m=float(mult); m=None if (kind=='support' and m==0) else m
            new.append({'w':w,'k':kind,'m':m,'a':ab,'v':lv5,'n':1})
            icons_txt.append('@'+w+(' S' if sym else ''))
        elif line.strip(): icons_txt.append(line.rstrip())
dup=[x['w'] for x in new if x['w'] in have]
seen=set(); d2=[x['w'] for x in new if x['w'] in seen or seen.add(x['w'])]
print('new',len(new),'dup-old',dup,'dup-new',d2)
from collections import Counter
print(Counter(x['k'] for x in new))
allw=base+[x for x in new if x['w'] not in have]
json.dump(allw,open('words.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
open('icons4.txt','w',encoding='utf-8').write('\n'.join(icons_txt)+'\n')
print('total',len(allw))
