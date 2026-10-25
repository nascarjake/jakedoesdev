import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
const html=readFileSync(new URL('../out/clip-my-screen/index.html',import.meta.url),'utf8');
test('Clip My Screen page exports visual editor screenshots and current downloads for every supported platform',()=>{
  for(const name of ['editor.webp','editor-sequence.webp']){
    assert.ok(html.includes(`/projects/clip-my-screen/${name}`));
    assert.ok(existsSync(new URL(`../out/projects/clip-my-screen/${name}`,import.meta.url)));
  }
  for(const file of ['macOS-arm64.dmg','macOS-arm64.zip','macOS-x64.dmg','macOS-x64.zip','Windows-x64-Setup.exe','Windows-x64-Portable.exe']) assert.ok(html.includes(`https://github.com/nascarjake/clip-my-screen/releases/latest/download/Clip-My-Screen-${file}`),file);
  assert.ok(html.includes('Capture starts when the app opens'));
  assert.ok(html.includes('Update now'));
});
