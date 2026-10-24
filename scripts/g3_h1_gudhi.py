#!/usr/bin/env python3
"""Offline third-party GUDHI reference for finite vertex-star cubical H1.
Version pinned by caller; no user data. Emits exact fixture threshold Betti1."""
import json, hashlib, sys, math
from pathlib import Path
import numpy as np
import gudhi
ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'fixtures/g3/h0-bfs-golden.json'
dst=ROOT/'fixtures/g3/h1-gudhi-thresholds.json'
def run():
    content=src.read_bytes(); data=json.loads(content)
    results=[]
    for c in data['cases']:
        vertices=np.asarray(c['values'],dtype=np.float64).reshape(c['ny']+1,c['nx']+1)
        parts=[]
        for sample in c['samples']:
            direction=sample['direction']
            x=vertices if direction=='sublevel' else -vertices
            cc=gudhi.CubicalComplex(vertices=x)
            cc.compute_persistence(homology_coeff_field=2,min_persistence=0)
            intervals=cc.persistence_intervals_in_dimension(1)
            counts=[]
            for entry in sample['thresholds']:
                c0=entry['level']*(1 if direction=='sublevel' else -1)
                count=sum(int(b<=c0 and c0<d) for b,d in intervals)
                counts.append(count)
            parts.append({'direction':direction,'levels':[x['level'] for x in sample['thresholds']], 'betti1':counts,
                'positiveIntervals':int(len(intervals))})
        results.append({'id':c['id'],'directions':parts})
    return {'schema':'quasi-atlas.g3.h1-reference/1.0','sourceSha256':'sha256:'+hashlib.sha256(content).hexdigest(),
       'library':'GUDHI CubicalComplex(vertices)', 'gudhiVersion':gudhi.__version__, 'numpyVersion':np.__version__,
       'boundary':'non-periodic finite open rectangle','results':results}
if __name__=='__main__':
    if len(sys.argv)!=2 or sys.argv[1] not in ('generate','verify'): raise SystemExit('generate|verify')
    current=run()
    if sys.argv[1]=='generate':dst.write_text(json.dumps(current,separators=(',',':'))+'\n')
    elif current!=json.loads(dst.read_text()):raise SystemExit('GUDHI H1 reference DIFFERENT')
    print(json.dumps({'status':'GUDHI_H1_PASS','cases':len(current['results']),
        'thresholds':sum(len(x['betti1']) for c in current['results'] for x in c['directions']),
        'nonzeroObservations':sum(v>0 for c in current['results'] for x in c['directions'] for v in x['betti1'])}))
