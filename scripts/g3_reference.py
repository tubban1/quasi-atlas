#!/usr/bin/env python3
"""G3 reference for *finite 4-neighbour vertex graph H0* using independent BFS.
No dependency on the JS union-find implementation or Marching Squares.
Run: python3 scripts/g3_reference.py --generate|--verify
Never claims GUDHI/TTK/continuous-topology equivalence.
"""
import json
import math
import struct
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
FIXTURE=ROOT / 'fixtures' / 'g3' / 'h0-bfs-golden.json'
def f32(x):
    return struct.unpack('<f',struct.pack('<f',float(x)))[0]
def bfs(values,nx,ny,level,direction):
    stride=nx+1
    active=[(v<=level if direction=='sublevel' else v>=level) for v in values]
    seen=bytearray(len(values))
    count=0
    for idx,is_active in enumerate(active):
        if not is_active or seen[idx]:continue
        count+=1
        seen[idx]=1
        pending=[idx]
        while pending:
            i=pending.pop()
            y,x=divmod(i,stride)
            for k in ((i-1 if x>0 else -1),(i+1 if x<nx else -1),
                      (i-stride if y>0 else -1),(i+stride if y<ny else -1)):
                if k>=0 and active[k] and not seen[k]:
                    seen[k]=1
                    pending.append(k)
    return count
def make():
    cases=[]
    for family in range(6):
        for variant in range(5):
            nx=7+variant*3+(family%2)
            ny=7+((variant+family)%4)*2
            values=[]
            for j in range(ny+1):
                for i in range(nx+1):
                    x=(i/nx*2-1)*3
                    y=(j/ny*2-1)*3
                    p=variant*.14
                    if family==0: # islands merging
                        z=math.exp(-((x+1.15+p)**2+(y-.18)**2)) + 1.12*math.exp(-((x-1.1)**2+(y+.25+p)**2))
                    elif family==1: # saddle near critical threshold
                        z=(x+p)*(x-p)-y*y+0.09*math.cos(x+y)
                    elif family==2: # checkerboard has intentionally ambiguous contour cells
                        z=(1 if (i+j+variant)%2==0 else -1)*(.8+.07*math.sin(i*1.3+j))
                    elif family==3: # ties / constant plateaus
                        z=float(((i+variant)//3+(j//3))%4-1)
                    elif family==4: # a ring, with a central hole (H1 not inferred from H0)
                        rr=math.hypot(x+.1*p,y)
                        z=math.exp(-((rr-1.5)**2)*2)+.13*math.sin(1.7*x+p)
                    else: # perturbations and boundary-touching regions
                        z=.55*math.sin(x*1.7+p)*math.cos(y*2.2)+.32*math.sin(x+y*.8+p)
                    values.append(f32(z))
            # Use actual sampled vertices as critical thresholds, and off-critical values.
            pick=[values[0],values[(nx+1)*(ny+1)//3],values[-1]]
            levels=[-0.5,-0.125,0,0.125,0.5]+pick
            samples=[]
            for direction in ['sublevel','superlevel']:
                samples.append({'direction':direction,'thresholds':[
                    {'level':v,'expectedComponents':bfs(values,nx,ny,v,direction)} for v in levels]})
            cases.append({'id':f'{["islands","saddle","checker","plateau","ring","wave"][family]}-{variant+1}',
                         'nx':nx,'ny':ny,'values':values,'samples':samples})
    return {'schema':'quasi-atlas.g3.h0-golden/1.0','source':'python-stdlib-bfs-graph-reference/1.0',
            'complex':'finite-open-4-neighbour-vertex-grid','cases':cases,
            'warning':'Independent finite graph BFS expected counts only. Not GUDHI, TTK, H1 or a proof.'}
def verify():
    data=json.loads(FIXTURE.read_text())
    assert data['schema']=='quasi-atlas.g3.h0-golden/1.0'
    assert len(data['cases'])==30
    checked=0
    for case in data['cases']:
        values=case['values'];nx=case['nx'];ny=case['ny']
        assert len(values)==(nx+1)*(ny+1)
        for row in case['samples']:
            for entry in row['thresholds']:
                actual=bfs(values,nx,ny,entry['level'],row['direction'])
                if actual!=entry['expectedComponents']:
                    raise ValueError(f"DIFFERENT {case['id']} {row['direction']} c={entry['level']}")
                checked+=1
    print(json.dumps({'status':'PYTHON_BFS_REFERENCE_PASS','cases':len(data['cases']),'checks':checked}))
if __name__=='__main__':
    if len(sys.argv)!=2 or sys.argv[1] not in ('--generate','--verify'):
        sys.exit('Usage: python3 scripts/g3_reference.py --generate|--verify')
    if sys.argv[1]=='--generate':
        FIXTURE.parent.mkdir(parents=True,exist_ok=True)
        FIXTURE.write_text(json.dumps(make(),ensure_ascii=False,separators=(',',':'))+'\n')
        print(str(FIXTURE))
    else:verify()
