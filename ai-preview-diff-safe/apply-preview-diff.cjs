// 기존 App.tsx의 나머지 구조와 들여쓰기를 보존하는 보수적인 적용 도구.
// 실행 위치: 프로젝트 루트  node .\ai-preview-diff-safe\apply-preview-diff.cjs
const fs = require('node:fs');
const path = require('node:path');

const projectDir = process.cwd();
const appPath = path.join(projectDir, 'src', 'App.tsx');
const assetDir = path.join(__dirname, 'assets', 'src', 'ai');
const files = ['buildPreviewDiff.ts', 'previewDiff.css', 'buildPreviewDiff.test.mjs'];

const fail = (message) => { throw new Error(message); };
function replaceExactlyOnce(content, pattern, replacement, name) {
  const matches = [...content.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  if (matches.length !== 1) fail(`${name}: 일치하는 위치가 ${matches.length}개입니다. 코드를 변경하지 않았습니다.`);
  return content.replace(pattern, replacement);
}

try {
  if (!fs.existsSync(appPath) || !fs.existsSync(path.join(projectDir, 'package.json')))
    fail('프로젝트 루트에서 실행해야 합니다 (src/App.tsx 및 package.json 확인).');
  const original = fs.readFileSync(appPath, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  if (original.includes('buildPreviewDiff') || original.includes('ai-diff-legend'))
    fail('App.tsx에 차이 강조 코드가 이미 일부 존재합니다. 중복 적용하지 않았습니다.');
  if (!original.includes('visiblePreview') || !original.includes('analysisSnapshot'))
    fail('현재 App.tsx에 예상한 AI 미리보기 상태가 없습니다. 적용 중단.');
  const targets = files.map((name) => {
    const target = path.join(projectDir, 'src', 'ai', name);
    const source = fs.readFileSync(path.join(assetDir, name));
    if (fs.existsSync(target) && !fs.readFileSync(target).equals(source))
      fail(`${target} 파일이 이미 존재하며 내용이 다릅니다. 기존 파일을 덮어쓰지 않았습니다.`);
    return { target, source, existing: fs.existsSync(target) };
  });

  let updated = original;
  updated = replaceExactlyOnce(updated,
    /^([ \t]*)import\s+\{\s*useAiEditPreview\s*\}\s+from\s+['"]\.\/ai\/useAiEditPreview['"];?[ \t]*$/m,
    (whole, indent) => whole + eol + indent + "import { buildPreviewDiff } from './ai/buildPreviewDiff';",
    'AI 훅 import');
  updated = replaceExactlyOnce(updated,
    /^([ \t]*)import\s+['"]\.\/App\.css['"];?[ \t]*$/m,
    (whole, indent) => whole + eol + indent + "import './ai/previewDiff.css';",
    'App.css import');
  updated = replaceExactlyOnce(updated,
    /^([ \t]*)const visibleGraph[ \t]*=[ \t]*visiblePreview[ \t]*\?\?[ \t]*analysisSnapshot[ \t]*\?\?[ \t]*\{[ \t]*nodes,[ \t]*edges[ \t]*\};[ \t]*$/m,
    (_whole, indent) => [
      `${indent}const previewDiff = visiblePreview`,
      `${indent}    ? buildPreviewDiff(`,
      `${indent}        (analysisSnapshot ?? { nodes, edges }).nodes,`,
      `${indent}        (analysisSnapshot ?? { nodes, edges }).edges,`,
      `${indent}        visiblePreview.nodes,`,
      `${indent}        visiblePreview.edges`,
      `${indent}      )`,
      `${indent}    : null;`,
      `${indent}const visibleGraph = previewDiff ?? analysisSnapshot ?? { nodes, edges };`,
    ].join(eol),
    'AI 미리보기 그래프 계산');

  updated = replaceExactlyOnce(updated,
    /^([ \t]*)<DiagramCanvas[ \t]*\r?\n[ \t]*key=\{visiblePreview[ \t]*\?[ \t]*['"]ai-draft['"][ \t]*:[ \t]*['"]ai-original['"]\}/m,
    (whole, indent) => {
      const p = indent;
      const q = indent + '    ';
      const legend = [
        `${p}{previewDiff && (`,
        `${q}<div className="ai-diff-legend" role="status" aria-label="AI 수정 변경 사항">`,
        `${q}    <span className="ai-diff-summary">`,
        `${q}        노드 추가 {previewDiff.nodeCount.added} · 변경 {previewDiff.nodeCount.changed} · 제거 {previewDiff.nodeCount.removed}`,
        `${q}        {' / '}관계선 추가 {previewDiff.edgeCount.added} · 변경 {previewDiff.edgeCount.changed} · 제거 {previewDiff.edgeCount.removed}`,
        `${q}    </span>`,
        `${q}    <span className="ai-diff-key ai-diff-key--added">추가</span>`,
        `${q}    <span className="ai-diff-key ai-diff-key--changed">변경</span>`,
        `${q}    <span className="ai-diff-key ai-diff-key--removed">제거 예정(빨간 점선)</span>`,
        `${q}</div>`,
        `${p})}`,
      ].join(eol);
      return legend + eol + whole;
    }, 'AI 미리보기 DiagramCanvas');

  // 모든 검사가 끝난 뒤에만 파일을 실제로 작성한다.
  // 문제가 생겨도 원본 App.tsx를 되돌릴 수 있도록 백업을 ZIP 해제 폴더에 보관한다.
  const backupPath = path.join(__dirname, 'App.before-preview-diff.tsx');
  if (fs.existsSync(backupPath)) fail('기존 백업 파일이 있습니다. 덮어쓰지 않았습니다: ' + backupPath);
  fs.writeFileSync(backupPath, original, 'utf8');
  const created = [];
  try {
    fs.mkdirSync(path.join(projectDir, 'src', 'ai'), { recursive: true });
    for (const item of targets) if (!item.existing) {
      fs.writeFileSync(item.target, item.source);
      created.push(item.target);
    }
    fs.writeFileSync(appPath, updated, 'utf8');
  } catch (err) {
    fs.writeFileSync(appPath, original, 'utf8');
    for (const file of created) try { fs.unlinkSync(file); } catch {}
    throw err;
  }
  console.log('적용 완료: src/App.tsx (필요한 4곳만 추가/교체, 전체 서식 유지)');
  console.log('신규: src/ai/buildPreviewDiff.ts, previewDiff.css, buildPreviewDiff.test.mjs');
  console.log('백업:', backupPath);
  console.log('확인: git diff -- src/App.tsx && npm run build');
} catch (error) {
  console.error('적용 중단:', error.message);
  process.exitCode = 1;
}
