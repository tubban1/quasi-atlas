// G4 narrow arithmetic kernel: exact rational comparisons, no floating-point rounding.
// Scope: f(x,y)=(x-a)^2+(y-b)^2, rectangle with rational endpoints.
const MAX=1000000000n;const abs=x=>x<0n?-x:x;
function gcd(a,b){while(b){[a,b]=[b,a%b]}return abs(a);}
export function rational(s){
 if(typeof s!=='string'||!/^-?(0|[1-9][0-9]{0,8})(?:\/[1-9][0-9]{0,8})?$/.test(s))throw new RangeError('INVALID_RATIONAL');
 const [ns,ds='1']=s.split('/');let n=BigInt(ns),d=BigInt(ds);
 if(abs(n)>MAX||d>MAX)throw new RangeError('RATIONAL_LIMIT');
 const g=gcd(abs(n),d);n/=g;d/=g;return [n,d];
}
export function cmp(a,b){let [n,d]=rational(a),[m,e]=rational(b);return n*e<m*d?-1:n*e>m*d?1:0;}
export function verifyRadialCertificate(cert){
 if(!cert||typeof cert!=='object'||Array.isArray(cert))throw new TypeError('INVALID_CERT');
 const required=['schema','model','bounds','claim','evidence','limitations'];
 if(Object.keys(cert).sort().join(',')!==required.sort().join(','))throw new TypeError('INVALID_CERT_FIELDS');
 if(cert.schema!=='quasi-atlas.radial-exact/0.1'||cert.model?.kind!=='radial-positive-quadratic'||cert.claim?.method!=='exact-rational-gradient-hessian')
  throw new TypeError('UNSUPPORTED_CERT');
 if(cert.evidence!=='E1' ||cert.claim.certified!==false ||cert.claim.proof!==false)throw new Error('EVIDENCE_FORGERY');
 if(!Array.isArray(cert.limitations)||cert.limitations.length!==2||cert.limitations.some(x=>typeof x!=='string'||x.length>180))throw new TypeError('INVALID_LIMITATIONS');
 const {a,b}=cert.model,{xmin,xmax,ymin,ymax}=cert.bounds;
 if(Object.keys(cert.model).sort().join(',')!=='a,b,kind'||Object.keys(cert.bounds).sort().join(',')!=='xmax,xmin,ymax,ymin')throw new TypeError('EXTRA_FIELDS');
 if(!(cmp(xmin,xmax)<0&&cmp(ymin,ymax)<0))throw new RangeError('INVALID_BOX');
 const insideX=cmp(xmin,a)<0&&cmp(a,xmax)<0;
 const insideY=cmp(ymin,b)<0&&cmp(b,ymax)<0;
 const outside=cmp(a,xmin)<0||cmp(a,xmax)>0||cmp(b,ymin)<0||cmp(b,ymax)>0;
 const status=insideX&&insideY?'CHECKED_INTERIOR':outside?'EXCLUDED_INTERIOR':'UNKNOWN_BOUNDARY';
 if(!['CHECKED_INTERIOR','EXCLUDED_INTERIOR','UNKNOWN_BOUNDARY'].includes(cert.claim.status)||cert.claim.status!==status)throw new Error('FALSE_CERTIFICATE');
 if(Object.keys(cert.claim).sort().join(',')!=='certified,method,proof,status')throw new TypeError('EXTRA_CLAIM');
 return {status,model:'f=(x-a)^2+(y-b)^2',gradient:'(2(x-a),2(y-b))',
  hessian:'diag(2,2)',uniqueGlobalCriticalPoint:[a,b],scope:'finite rational open rectangle',
  certified:false,proof:false,evidence:'E1',externalMathReview:false};
}
