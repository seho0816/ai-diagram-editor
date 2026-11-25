#!/usr/bin/env node
// Apply narrow edits to current project source without rewriting component files.
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const pkg = __dirname;

const normalize = (text) => text.replace(/\r\n/g, '\n');
function readProject(relative) {
  const filename = path.join(root, relative);
  if (!fs.existsSync(filename)) throw new Error(`프로젝트 파일을 찾을 수 없습니다: ${relative}`);
  const bytes = fs.readFileSync(filename, 'utf8');
  return { text: normalize(bytes), eol: bytes.includes('\r\n') ? '\r\n' : '\n' };
}
function once(text, needle, replacement, description) {
  const pos = text.indexOf(needle);
  if (pos === -1 || text.indexOf(needle, pos + needle.length) !== -1) {
    throw new Error(`${description} 위치를 한 번만 찾을 수 있어야 합니다. 기존 파일은 수정하지 않았습니다.`);
  }
  return text.slice(0, pos) + replacement + text.slice(pos + needle.length);
}
function replacePatternOnce(text, pattern, callback, description) {
  const found = [...text.matchAll(new RegExp(pattern.source, 'gm'))];
  if (found.length !== 1) throw new Error(`${description}: 수정 위치 ${found.length}개 발견 (1개 필요). 기존 파일은 수정하지 않았습니다.`);
  const match = found[0];
  return text.slice(0, match.index) + callback(match) + text.slice(match.index + match[0].length);
}
const appRel = 'src/App.tsx';
const sidebarRel = 'src/components/ShapeSidebar.tsx';
const toolRel = 'src/diagrams/class/ClassToolPanel.tsx';
const dataRels = [
  'src/diagrams/class/classExamples.ts',
  'src/diagrams/class/ClassExamples.css',
  'src/diagrams/class/classExamples.test.mjs',
];
try {
  if (!fs.existsSync(path.join(root, 'package.json'))) throw new Error('프로젝트 루트에서 실행해 주세요 (package.json 필요).');
  const originals = {
    [appRel]: readProject(appRel),
    [sidebarRel]: readProject(sidebarRel),
    [toolRel]: readProject(toolRel),
  };
  const installed = originals[appRel].text.includes('const loadClassExample = (exampleId: ClassExampleId) =>');
  if (installed) {
    if (dataRels.every((file) => fs.existsSync(path.join(root, file)))) {
      console.log('클래스 사례 기능이 이미 설치되어 있습니다. 변경하지 않았습니다.');
      process.exit(0);
    }
    throw new Error('일부만 설치된 상태입니다. 원본 파일을 확인해 주세요. 자동 덮어쓰기는 하지 않습니다.');
  }
  for (const file of dataRels) {
    if (fs.existsSync(path.join(root, file))) throw new Error(`이미 파일이 존재합니다: ${file} (덮어쓰기 방지)`);
    if (!fs.existsSync(path.join(pkg, 'files', file))) throw new Error(`설치 파일 누락: ${file}`);
  }

  // 1) ClassToolPanel: append the new section after relation tools.
  let tool = originals[toolRel].text;
  tool = replacePatternOnce(tool, /^import \{ classDiagramConfig \} from ['"]\.\/config['"];?$/, (m) =>
    `${m[0]}\nimport { CLASS_EXAMPLES, type ClassExampleId } from './classExamples';\nimport './ClassExamples.css';`, 'ClassToolPanel import');
  tool = replacePatternOnce(tool, /^([ \t]*)onAddNode: \(toolType: string\) => void;$/, (m) =>
    `${m[0]}\n${m[1]}onLoadExample: (exampleId: ClassExampleId) => void;`, 'ClassToolPanel Props');
  tool = replacePatternOnce(tool, /function ClassToolPanel\(\{\s*onAddNode,\s*relationType,\s*onSelectRelationType\s*\}: Props\)/, () =>
    'function ClassToolPanel({ onAddNode, onLoadExample, relationType, onSelectRelationType }: Props)', 'ClassToolPanel props');
  const panelSection = `
        <div className="tool-section">
          <h4>클래스 사례</h4>
          <div className="class-example-list">
            {CLASS_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className="class-example-button"
                onClick={() => onLoadExample(example.id)}
                title={\`\${example.title} 사례 불러오기\`}
              >
                <strong>{example.title}</strong>
                <span>{example.description}</span>
              </button>
            ))}
          </div>
        </div>
`;
  tool = replacePatternOnce(tool, /\n([ \t]*)<\/>\n([ \t]*)\);\n\}\n\s*export default ClassToolPanel;/, (m) =>
    `${panelSection}\n${m[1]}</>\n${m[2]});\n}\n\nexport default ClassToolPanel;`, 'ClassToolPanel return 끝');

  // 2) Sidebar: forward event to the class tool only.
  let sidebar = originals[sidebarRel].text;
  sidebar = replacePatternOnce(sidebar, /^import ClassToolPanel from ['"]\.\.\/diagrams\/class\/ClassToolPanel['"];?$/, (m) =>
    `${m[0]}\nimport type { ClassExampleId } from '../diagrams/class/classExamples';`, 'ShapeSidebar import');
  sidebar = replacePatternOnce(sidebar, /^(\s*)onAddNode: \(diagramType: DiagramType, toolType: string\) => void;$/, (m) =>
    `${m[0]}\n${m[1]}onLoadClassExample: (exampleId: ClassExampleId) => void;`, 'ShapeSidebar Props');
  sidebar = replacePatternOnce(sidebar, /^(\s*)onAddNode,\n(\s*)relationType,$/, (m) =>
    `${m[1]}onAddNode,\n${m[2]}onLoadClassExample,\n${m[2]}relationType,`, 'ShapeSidebar destructuring');
  sidebar = replacePatternOnce(sidebar, /^(\s*)onAddNode=\{\(toolType\) => onAddNode\('CLASS', toolType\)\}$/, (m) =>
    `${m[0]}\n${m[1]}onLoadExample={onLoadClassExample}`, 'ShapeSidebar ClassToolPanel 연결');

  // 3) App: add a narrow load handler that preserves AI cancellation and purpose.
  let app = originals[appRel].text;
  app = replacePatternOnce(app, /^import \{ classDiagramConfig \} from ['"]\.\/diagrams\/class\/config['"];?$/, (m) =>
    `${m[0]}\nimport { createClassExample, type ClassExampleId } from './diagrams/class/classExamples';`, 'App import');
  app = replacePatternOnce(app, /^(\s*)const \[relationType, setRelationType\] = useState<DiagramRelationType>\(/, (m) =>
    `${m[1]}const [classExampleRevision, setClassExampleRevision] = useState(0);\n${m[0]}`, 'App state');
  const handler = `
    const loadClassExample = (exampleId: ClassExampleId) => {
        if (diagramType !== 'CLASS') return;
        const edgeType = diagramRegistry.CLASS.initialEdges[0]?.type ?? 'umlEdge';
        const example = createClassExample(exampleId, edgeType);
        if (!window.confirm(
            \`현재 캔버스 내용이 사라집니다.\\n저장하지 않은 변경 사항도 사라집니다.\\n\\n'\${example.info.title}' 사례를 불러오시겠습니까?\`
        )) return;

        // 이미 실행 중이던 AI 결과가 새 사례를 덮지 않도록 무효화한다.
        analysisRequestId.current += 1;
        aiEdits.cancel();
        setAiLoading(false);
        setAiResult(null);
        setAiError(null);
        setAnalysisSnapshot(null);
        setShowEditPreview(false);
        setEditingNodeId(null);
        setEditingEdgeId(null);
        setRelationType(diagramRegistry.CLASS.defaultRelationType);
        setDiagramPurpose(example.info.purpose);
        setNodes(example.nodes);
        setEdges(example.edges);
        // React Flow의 fitView를 새 그래프에 대해 다시 수행한다.
        setClassExampleRevision((current) => current + 1);
    };

`;
  app = replacePatternOnce(app, /^(\s*)const runAiAnalysis = async \(\) => \{/, (m) =>
    `${handler}${m[0]}`, 'App AI 분석 함수 앞');
  app = replacePatternOnce(app, /^(\s*)onAddNode=\{addNode\}$/, (m) =>
    `${m[0]}\n${m[1]}onLoadClassExample={loadClassExample}`, 'App Sidebar props');
  // Only the editor DiagramCanvas with an onDropNode handler receives a revision key.
  const dropPosition = app.indexOf('onDropNode=');
  if (dropPosition < 0) throw new Error('App 편집 캔버스의 onDropNode를 찾지 못했습니다. 기존 파일은 수정하지 않았습니다.');
  const canvasPosition = app.lastIndexOf('<DiagramCanvas', dropPosition);
  if (canvasPosition < 0 || dropPosition - canvasPosition > 3000) throw new Error('App 편집 캔버스 범위를 판별하지 못했습니다. 기존 파일은 수정하지 않았습니다.');
  const canvasPrefix = app.slice(canvasPosition, dropPosition);
  // Preserve the existing editor key (for instance key={diagramType}).
  // This component may already use a key to remount React Flow after a mode change.
  const keyAttrs = [...canvasPrefix.matchAll(/(?:^|\n)[ \t]*key\s*=\s*/g)];
  if (keyAttrs.length > 1) {
    throw new Error('편집 DiagramCanvas에 key 속성이 여러 개 있습니다. 수정하지 않았습니다.');
  }
  if (keyAttrs.length === 1) {
    const keyAttributeStart = canvasPosition + keyAttrs[0].index + keyAttrs[0][0].length;
    const firstChar = app[keyAttributeStart];
    let valueEnd = keyAttributeStart;
    let previousKeyExpression;
    if (firstChar === '{') {
      // Read the entire {...} expression, safely handling nested braces and quoted strings.
      let depth = 0;
      let quote = '';
      let escaped = false;
      for (let i = keyAttributeStart; i < dropPosition; i += 1) {
        const char = app[i];
        if (quote) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === quote) quote = '';
        } else if (char === '\'' || char === '"' || char === '`') {
          quote = char;
        } else if (char === '{') {
          depth += 1;
        } else if (char === '}') {
          depth -= 1;
          if (depth === 0) {
            valueEnd = i + 1;
            previousKeyExpression = app.slice(keyAttributeStart + 1, i).trim();
            break;
          }
        }
      }
    } else if (firstChar === '\'' || firstChar === '"') {
      let escaped = false;
      for (let i = keyAttributeStart + 1; i < dropPosition; i += 1) {
        const char = app[i];
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === firstChar) {
          valueEnd = i + 1;
          previousKeyExpression = app.slice(keyAttributeStart, valueEnd);
          break;
        }
      }
    }
    if (!previousKeyExpression || valueEnd <= keyAttributeStart || valueEnd > dropPosition) {
      throw new Error('기존 DiagramCanvas key 표현식을 안전하게 읽을 수 없어 중단했습니다.');
    }
    // Keep its meaning and add the example revision, without inserting a second key prop.
    if (!previousKeyExpression.includes('classExampleRevision')) {
      app = app.slice(0, keyAttributeStart)
        + `{[(${previousKeyExpression}), classExampleRevision].join(':')}`
        + app.slice(valueEnd);
    }
  } else {
    const canvasLine = app.slice(app.lastIndexOf('\n', canvasPosition) + 1, canvasPosition);
    const propIndent = canvasLine + '    ';
    const insertAt = canvasPosition + '<DiagramCanvas'.length;
    app = app.slice(0, insertAt) + `\n${propIndent}key={classExampleRevision}` + app.slice(insertAt);
  }


  // Preflight all changes before touching the working tree.
  const updates = { [toolRel]: tool, [sidebarRel]: sidebar, [appRel]: app };
  for (const [relative, text] of Object.entries(updates)) {
    if (text === originals[relative].text) throw new Error(`수정 결과 없음: ${relative}`);
  }
  const backup = path.join(pkg, 'backup');
  if (fs.existsSync(backup)) throw new Error(`이미 백업 폴더가 존재합니다: ${backup}. 기존 설치 기록을 확인해 주세요.`);
  for (const relative of Object.keys(updates)) {
    const destination = path.join(backup, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, relative), destination);
  }
  for (const [relative, text] of Object.entries(updates)) {
    const eol = originals[relative].eol;
    fs.writeFileSync(path.join(root, relative), text.replace(/\n/g, eol), 'utf8');
  }
  for (const relative of dataRels) {
    const dest = path.join(root, relative);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(pkg, 'files', relative), dest);
  }
  console.log('클래스 사례 4개 설치 완료. App/Sidebar/ClassToolPanel 원본은 class-examples/backup 폴더에 보관되었습니다.');
  console.log('npm run build 실행 후 클래스 탭 > 관계선 아래 클래스 사례를 확인하세요.');
} catch (error) {
  console.error('[적용 중단]', error.message);
  process.exitCode = 1;
}
