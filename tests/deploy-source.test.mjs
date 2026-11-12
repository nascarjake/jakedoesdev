import test from "node:test";
import assert from "node:assert/strict";
import {verifyDeploySource} from "../scripts/verify-deploy-source.mjs";
const sha="a".repeat(40);
const run=(dirty=false,stale=false)=>(args)=>{if(args[0]==="status")return dirty?" M page.tsx":"";if(args[0]==="ls-remote")return `${sha} refs/heads/main`;if(stale)throw new Error("not ancestor");return "";};
test("deployment accepts a clean descendant of current remote main",()=>assert.equal(verifyDeploySource(".",run()),sha));
test("deployment rejects a stale divergent release checkout",()=>assert.throws(()=>verifyDeploySource(".",run(false,true)),/omits commits/));
test("deployment rejects uncommitted tracked changes",()=>assert.throws(()=>verifyDeploySource(".",run(true)),/Commit reviewed/));
