import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import {
  EXPECTED_ACCOUNT_ID,
  ROOT,
  readProfileZones,
  activeProfileForProject,
  cloudflareAuthMode,
  describeWranglerFailure,
  supportedNodeRuntime,
  verifyCloudflareAccount,
} from "../scripts/verify-cloudflare-account.mjs";

const DATABASE_ID = "26609868-e1a1-42b7-a650-5f077b911d4a";

function profile(email = "jake@example.com", accountId = EXPECTED_ACCOUNT_ID, databaseId = DATABASE_ID) {
  return {
    identity: { email, accounts: [{ id: accountId }] },
    databases: [{ uuid: databaseId }],
  };
}

test("Cloudflare commands require the declared Node runtime", () => {
  assert.equal(supportedNodeRuntime("20.18.0"), false);
  assert.equal(supportedNodeRuntime("22.12.9"), false);
  assert.equal(supportedNodeRuntime("22.13.0"), true);
  assert.equal(supportedNodeRuntime("22.22.3"), true);
});

test("Wrangler failure diagnostics separate runtime, invocation, network, and auth", () => {
  assert.match(describeWranglerFailure({ stderr: Buffer.from("Wrangler requires at least Node.js v22.0.0") }), /Node\.js 22\.13\.0/);
  assert.match(describeWranglerFailure({ stderr: Buffer.from("Unknown arguments: profile") }), /rejected the requested command/);
  assert.match(describeWranglerFailure({ stderr: Buffer.from("getaddrinfo ENOTFOUND api.cloudflare.com") }), /DNS\/network/);
  assert.match(describeWranglerFailure({ stderr: Buffer.from("Not logged in") }), /not authenticated or bound/);
});

test("profile selection uses the nearest directory binding and does not fall back", () => {
  const table = [
    "┌──────────────────────┬──────────────────────────────────────────────────────────┐",
    "│ Profile              │ Bound Directories                                        │",
    "├──────────────────────┼──────────────────────────────────────────────────────────┤",
    `│ personal │ ${path.dirname(ROOT)} │`,
    `│ work │ ${ROOT} │`,
    "└──────────────────────┴──────────────────────────────────────────────────────────┘",
  ].join("\n");
  assert.equal(activeProfileForProject(table), "work");
  assert.equal(activeProfileForProject(table.replace(`│ work │ ${ROOT} │`, "│ work                 │ -                                                        │")), "personal");
});

test("profile mode rejects token credentials and API-token mode remains unimplemented", () => {
  assert.throws(() => cloudflareAuthMode({}), /Set CLOUDFLARE_AUTH_MODE=profile/);
  assert.equal(cloudflareAuthMode({ CLOUDFLARE_AUTH_MODE: "profile" }), "profile");
  assert.throws(() => cloudflareAuthMode({ CLOUDFLARE_AUTH_MODE: "api-token", CLOUDFLARE_API_TOKEN: "mock-only" }), /planned but not implemented/);
  assert.throws(() => cloudflareAuthMode({ CLOUDFLARE_AUTH_MODE: "profile", CLOUDFLARE_API_TOKEN: "mock-only" }), /refuses ambient Cloudflare API credentials/);
  assert.throws(() => cloudflareAuthMode({ CLOUDFLARE_AUTH_MODE: "profile", CLOUDFLARE_API_KEY: "mock-only", CLOUDFLARE_EMAIL: "jake@example.com" }), /refuses ambient Cloudflare API credentials/);
});

test("profile reads verify email, account membership, and D1 without returning credentials", async () => {
  const result = await verifyCloudflareAccount({
    checkZone: false,
    authMode: "profile",
    expectedEmailValue: "jake@example.com",
    identityProvider: () => profile(),
  });
  assert.deepEqual(result, {
    accountId: EXPECTED_ACCOUNT_ID,
    databaseId: DATABASE_ID,
    email: "jake@example.com",
    profile: "personal",
  });
  assert.equal(Object.hasOwn(result, "token"), false);
});

test("profile checks fail closed on wrong email, account, or D1 database", async () => {
  const verify = (identity) => verifyCloudflareAccount({
    checkZone: false,
    authMode: "profile",
    expectedEmailValue: "jake@example.com",
    identityProvider: () => identity,
  });
  await assert.rejects(verify(profile("other@example.com")), /different Cloudflare email/);
  await assert.rejects(verify(profile("jake@example.com", "wrong-account")), /cannot access the pinned personal Cloudflare account/);
  await assert.rejects(verify(profile("jake@example.com", EXPECTED_ACCOUNT_ID, "another-database")), /D1 database is not visible/);
});

const ZONE = { id: "a".repeat(32), name: "jakedoesdev.com", status: "active", account: { id: EXPECTED_ACCOUNT_ID } };
const verifyZone = zoneProvider => verifyCloudflareAccount({ authMode: "profile", expectedEmailValue: "jake@example.com", identityProvider: () => profile(), zoneProvider });
test("zone-dependent actions require exactly the active domain in the pinned account", async () => {
  assert.equal((await verifyZone(() => [ZONE])).profile,"personal");
  for(const rows of [[],[ZONE,ZONE],[{...ZONE,status:"pending"}],[{...ZONE,name:"another.example"}],[{...ZONE,account:{id:"other"}}],[{...ZONE,id:"bad"}]]) await assert.rejects(verifyZone(()=>rows),/not an active zone in the pinned personal account/);
});
test("zone reads use only the selected OAuth session and never return credentials",async()=>{
  const rows=await readProfileZones({loadCredentials:()=>({type:"oauth",token:"synthetic-test-only"}),fetchImpl:async(url,options)=>{
    assert.equal(url.origin,"https://api.cloudflare.com");assert.equal(url.pathname,"/client/v4/zones");assert.equal(url.searchParams.get("account.id"),EXPECTED_ACCOUNT_ID);assert.equal(url.searchParams.get("name"),"jakedoesdev.com");assert.equal(options.method,"GET");assert.equal(options.redirect,"error");assert.equal(options.headers.Authorization,"Bearer synthetic-test-only");
    return {ok:true,json:async()=>({success:true,result:[{...ZONE,extra:"omitted"}]})};
  }});
  assert.deepEqual(rows,[ZONE]);assert.equal(JSON.stringify(rows).includes("synthetic-test-only"),false);
});
test("zone reads refuse API keys/tokens, errors and malformed responses without exposing credentials",async()=>{
  for(const type of ["api_token","api_key",undefined])await assert.rejects(readProfileZones({loadCredentials:()=>({type,token:"synthetic-test-only"}),fetchImpl:assert.fail}),/OAuth profile/);
  for(const fetchImpl of [async()=>{throw new Error("synthetic-test-only");},async()=>({ok:false}),async()=>({ok:true,json:async()=>({success:false,result:[]})})]){
    await assert.rejects(readProfileZones({loadCredentials:()=>({type:"oauth",token:"synthetic-test-only"}),fetchImpl}),error=>error.message.includes("Could not verify zone ownership")&&!error.message.includes("synthetic-test-only"));
  }
});
