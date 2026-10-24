// Producer and verifier intentionally separate. Generated claims can never self-attest E3.
import {verifyRadialCertificate} from './radial-verifier.js';
export function makeRadialCertificate({a,b,xmin,xmax,ymin,ymax}){
 const cert={schema:'quasi-atlas.radial-exact/0.1',model:{kind:'radial-positive-quadratic',a,b},
  bounds:{xmin,xmax,ymin,ymax},claim:{method:'exact-rational-gradient-hessian',status:'UNKNOWN_BOUNDARY',certified:false,proof:false},
  evidence:'E1',limitations:['Only specified positive-definite radial quadratic; not general analytic fields.','Third-party mathematical expert review and interval proof machinery not complete.']};
 // Internal verifier provides status; verifier still rechecks all contents independently at import.
 for(const status of ['CHECKED_INTERIOR','EXCLUDED_INTERIOR','UNKNOWN_BOUNDARY']){
  cert.claim.status=status;try{verifyRadialCertificate(cert);return cert;}catch(e){if(e.message!=='FALSE_CERTIFICATE')throw e;}
 }
 throw new Error('INVALID_RADIAL_INPUT');
}
