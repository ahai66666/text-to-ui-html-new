#!/usr/bin/env node
import fs from 'node:fs';
import {validateComponentIdentityEvidence} from '../packages/components-html/src/component-identity.js';
const at=process.argv.indexOf('--evidence');
if(at<0||!process.argv[at+1])throw Error('Usage: validate-component-identity.mjs --evidence <browser-evidence.json>');
const evidence=JSON.parse(fs.readFileSync(process.argv[at+1],'utf8'));
const errors=validateComponentIdentityEvidence(evidence.components, evidence.identityViolations);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(JSON.stringify({ok:true,scope:'component-identity-only',url:evidence.url,componentCount:evidence.components.length}));
