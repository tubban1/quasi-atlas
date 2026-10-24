#!/usr/bin/env python3
"""Third-party G3.1 H0 oracle, using GUDHI CubicalComplex(vertex values).
Requires: gudhi==3.11.0, numpy==2.4.6 in an isolated venv.
--generate records exact dim0 persistence intervals for the 30 Python-BFS fixtures.
--verify recomputes intervals and threshold Betti0, failing on disagreement.
This does NOT test TTK, H1, continuous topology or numerical certification.
"""
import hashlib
import json
import math
from pathlib import Path
import sys
import gudhi
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
INPUT=ROOT/'fixtures/g3/h0-bfs-golden.json'
OUTPUT=ROOT/'fixtures/g3/h0-gudhi-golden.json'
def normfloat(x):
    v=float(x)
    return 0 if v==0 else v
def calc_case(case):
    z=np.asarray(case['values'],dtype=np.float64).reshape((case['ny']+1,case['nx']+1))
    out=[]
    for grp in case['samples']:
        direction=grp['direction']
        f=z if direction=='sublevel' else -z
        complex_=gudhi.CubicalComplex(vertices=f)
        complex_.compute_persistence(homology_coeff_field=2,min_persistence=0)
        intervals=complex_.persistence_intervals_in_dimension(0)
        bars=[]
        for birth,death in intervals:
            b=normfloat(birth if direction=='sublevel' else -birth)
            d=normfloat(death if direction=='sublevel' else -death) if math.isfinite(death) else None
            bars.append([b,d])
        bars.sort(key=lambda b:(b[0],b[1] if b[1] is not None else -1))
        if sum(b[1] is None for b in bars)!=1:
            raise ValueError('Expected exactly one essential H0 class: '+case['id'])
        observed=[]
        for entry in grp['thresholds']:
            cutoff=entry['level']
            if direction=='sublevel':
                count=sum(1 for birth,death in bars if birth<=cutoff and (death is None or cutoff<death))
            else:
                count=sum(1 for birth,death in bars if birth>=cutoff and (death is None or cutoff>death))
            if count!=entry['expectedComponents']:
                raise ValueError('GUDHI VS PYTHON BFS DIFFERENT at %s %s threshold %.17g: %d vs %d'%
                    (case['id'],direction,cutoff,count,entry['expectedComponents']))
            observed.append(count)
        out.append({'direction':direction,'intervals':bars,'thresholdCounts':observed})
    return {'id':case['id'],'directions':out}
def compute():
    raw=INPUT.read_bytes()
    doc=json.loads(raw)
    results=[calc_case(case) for case in doc['cases']]
    return {'schema':'quasi-atlas.g3.gudhi-h0-golden/1.0',
            'basedOnSha256':'sha256:'+hashlib.sha256(raw).hexdigest(),
            'library':'gudhi.CubicalComplex(vertices)',
            'gudhiVersion':gudhi.__version__,'numpyVersion':np.__version__,
            'filtration':'vertex lower-star; negate grid for superlevel',
            'boundary':'open non-periodic finite vertex grid',
            'cases':results,
            'warning':'Discrete H0 cubical reference, not H1/TTK, continuous-domain certification or proof.'}
if __name__=='__main__':
    if len(sys.argv)!=2 or sys.argv[1] not in ['--generate','--verify']:
        sys.exit('Usage: python3 scripts/g3_gudhi_reference.py --generate|--verify')
    computed=compute()
    if sys.argv[1]=='--generate':
        OUTPUT.write_text(json.dumps(computed,sort_keys=True,separators=(',',':'))+'\n')
    else:
        saved=json.loads(OUTPUT.read_text())
        if computed!=saved: raise AssertionError('Stored independent GUDHI golden has changed')
    print(json.dumps({'status':'GUDHI_H0_REFERENCE_PASS','cases':len(computed['cases']),
        'thresholdComparisons':sum(len(x['thresholdCounts']) for c in computed['cases'] for x in c['directions']),
        'intervals':sum(len(x['intervals']) for c in computed['cases'] for x in c['directions']),
        'gudhi':gudhi.__version__,'numpy':np.__version__}))
