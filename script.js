let GRID_ROWS = 24;
let GRID_COLS = 24;
const gridElement = document.getElementById('grid');
const setStartBtn = document.getElementById('set-start');
const setGoalBtn = document.getElementById('set-goal');
const toggleWallBtn = document.getElementById('toggle-wall');
const runBfsBtn = document.getElementById('run-bfs');
const runAstarBtn = document.getElementById('run-astar');
const clearPathBtn = document.getElementById('clear-path');
const resetGridBtn = document.getElementById('reset-grid');
const gridSizeInput = document.getElementById('grid-size');
const applySizeBtn = document.getElementById('apply-size');

// Algo panel elements
const algoPanel = document.getElementById('algo-panel');
const algoBadge = document.getElementById('algo-badge');
const algoName = document.getElementById('algo-name');
const algoTagline = document.getElementById('algo-tagline');
const algoPhase = document.getElementById('algo-phase');
const algoSteps = document.getElementById('algo-steps');
const algoResult = document.getElementById('algo-result');
const statVisited = document.getElementById('stat-visited');
const statQueue = document.getElementById('stat-queue');
const statQueueLabel = document.getElementById('stat-queue-label');
const statPath = document.getElementById('stat-path');

const Mode = { START: 'start', GOAL: 'goal', WALL: 'wall' };
let currentMode = Mode.START;
let startNode = null;
let goalNode = null;
let cells = [];
let isAnimating = false;
const ANIMATION_DELAY = 15;

// ── Algorithm descriptions ────────────────────────────────────
const ALGO_INFO = {
  bfs: {
    badge: 'BFS',
    badgeColor: '#38bdf8',
    name: 'Breadth-First Search',
    tagline: 'Explores all neighbours equally — guarantees the shortest path.',
    queueLabel: 'Queue',
    steps: [
      { icon: '①', text: 'Push the <b>start node</b> into a queue.' },
      { icon: '②', text: 'Dequeue the front node. Mark it <b>visited</b> (purple).' },
      { icon: '③', text: 'Add all unvisited <b>neighbours</b> to the back of the queue (blue).' },
      { icon: '④', text: 'Repeat until the <b>goal</b> is dequeued — or the queue empties.' },
      { icon: '⑤', text: 'Trace back via parent pointers to reveal the <b>shortest path</b>.' },
    ],
    phases: {
      running: 'Exploring wave-by-wave…',
      tracing: 'Tracing shortest path…',
      found: '✓ Shortest path found',
      notfound: '✕ No path exists',
    },
  },
  astar: {
    badge: 'A*',
    badgeColor: '#a78bfa',
    name: 'A* Search',
    tagline: 'Uses a heuristic (Manhattan distance) to head straight for the goal — faster than BFS in open space.',
    queueLabel: 'Open set',
    steps: [
      { icon: '①', text: 'Score each node: <b>f = g + h</b> where g = cost from start, h = distance to goal.' },
      { icon: '②', text: 'Always expand the node with the <b>lowest f-score</b> first.' },
      { icon: '③', text: 'Update neighbours only when a <b>cheaper route</b> is found.' },
      { icon: '④', text: 'Heuristic <b>h = |Δrow| + |Δcol|</b> (Manhattan distance, no diagonals).' },
      { icon: '⑤', text: 'Stop when the goal is expanded — then trace back the <b>optimal path</b>.' },
    ],
    phases: {
      running: 'Chasing the goal with heuristics…',
      tracing: 'Tracing optimal path…',
      found: '✓ Optimal path found',
      notfound: '✕ No path exists',
    },
  },
};

function showAlgoPanel(key) {
  const info = ALGO_INFO[key];
  algoBadge.textContent = info.badge;
  algoBadge.style.background = info.badgeColor + '22';
  algoBadge.style.color = info.badgeColor;
  algoBadge.style.borderColor = info.badgeColor + '55';
  algoName.textContent = info.name;
  algoTagline.textContent = info.tagline;
  statQueueLabel.textContent = info.queueLabel;

  algoSteps.innerHTML = info.steps
    .map(s => `<div class="algo-step"><span class="step-icon">${s.icon}</span><span>${s.text}</span></div>`)
    .join('');

  algoResult.classList.add('hidden');
  algoResult.className = 'algo-result hidden';
  statVisited.textContent = '0';
  statQueue.textContent = '0';
  statPath.textContent = '—';
  algoPanel.classList.remove('hidden');
  setAlgoPhase(key, 'running');
}

function setAlgoPhase(key, phase) {
  const text = ALGO_INFO[key].phases[phase];
  algoPhase.textContent = text;
  algoPhase.className = 'algo-phase phase-' + phase;
}

function updateStats(visited, queue) {
  statVisited.textContent = visited;
  statQueue.textContent = queue;
}

function showResult(key, found, pathLen) {
  const phase = found ? 'found' : 'notfound';
  setAlgoPhase(key, phase);
  statPath.textContent = found ? pathLen : '—';
  algoResult.textContent = found
    ? `Path length: ${pathLen} steps`
    : 'The goal is unreachable — try removing some walls.';
  algoResult.className = 'algo-result ' + (found ? 'result-found' : 'result-notfound');
}

// ── Core helpers ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setBusy(value) {
  isAnimating = value;
  [setStartBtn, setGoalBtn, toggleWallBtn, runBfsBtn, runAstarBtn,
   clearPathBtn, resetGridBtn, applySizeBtn].forEach(b => b.disabled = value);
  gridElement.style.pointerEvents = value ? 'none' : '';
}

function buildGrid() {
  gridElement.innerHTML = '';
  cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowCells = [];
    for (let col = 0; col < GRID_COLS; col++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', onCellClick);
      gridElement.appendChild(cell);
      rowCells.push(cell);
    }
    cells.push(rowCells);
  }
}

function onCellClick(e) {
  const cell = e.currentTarget;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  if (currentMode === Mode.START) setStart(row, col);
  else if (currentMode === Mode.GOAL) setGoal(row, col);
  else if (currentMode === Mode.WALL) toggleWall(cell);
}

function setStart(row, col) {
  if (startNode) startNode.classList.remove('start');
  const cell = cells[row][col];
  if (cell.classList.contains('goal')) return;
  cell.classList.remove('wall', 'path', 'open', 'closed');
  cell.classList.add('start');
  startNode = cell;
}

function setGoal(row, col) {
  if (goalNode) goalNode.classList.remove('goal');
  const cell = cells[row][col];
  if (cell.classList.contains('start')) return;
  cell.classList.remove('wall', 'path', 'open', 'closed');
  cell.classList.add('goal');
  goalNode = cell;
}

function toggleWall(cell) {
  if (cell.classList.contains('start') || cell.classList.contains('goal')) return;
  cell.classList.toggle('wall');
  cell.classList.remove('path', 'open', 'closed');
}

function clearPath() {
  for (const row of cells)
    for (const cell of row)
      cell.classList.remove('path', 'open', 'closed');
}

function resetGrid() {
  startNode = null;
  goalNode = null;
  buildGrid();
}

function setMode(mode, button) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}

function applyGridSize() {
  const size = Number(gridSizeInput.value);
  if (isNaN(size) || size < 8 || size > 40) return;
  GRID_ROWS = size;
  GRID_COLS = size;
  document.documentElement.style.setProperty('--grid-cols', size);
  resetGrid();
  scaleGrid();
}

function scaleGrid() {
  const container = document.querySelector('.grid-section');
  const cellSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
  const gridSize = GRID_COLS * cellSize + (GRID_COLS - 1) * 3;
  const maxWidth = container.clientWidth - 32;
  const maxHeight = container.clientHeight - 32;
  const scale = Math.min(1, maxWidth / gridSize, maxHeight / gridSize);
  document.querySelector('.grid').style.transform = `scale(${scale})`;
}

function getNeighbors(node) {
  const row = Number(node.dataset.row);
  const col = Number(node.dataset.col);
  const neighbors = [];
  for (const [dr, dc] of [[0,-1],[1,0],[0,1],[-1,0]]) {
    const nr = row + dr, nc = col + dc;
    if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
      const n = cells[nr][nc];
      if (!n.classList.contains('wall')) neighbors.push(n);
    }
  }
  return neighbors;
}

function reconstructPath(cameFrom, current) {
  const path = [];
  while (current && cameFrom.has(current)) {
    current = cameFrom.get(current);
    if (current && !current.classList.contains('start')) path.push(current);
  }
  return path.reverse();
}

async function animatePath(path, key) {
  setAlgoPhase(key, 'tracing');
  for (const cell of path) {
    if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
      cell.classList.add('path');
      await sleep(ANIMATION_DELAY);
    }
  }
}

// ── BFS ──────────────────────────────────────────────────────
async function bfs() {
  if (!startNode || !goalNode || isAnimating) return;
  clearPath();
  showAlgoPanel('bfs');
  setBusy(true);

  const queue = [startNode];
  const visited = new Set([startNode]);
  const cameFrom = new Map();
  let stepCount = 0;

  while (queue.length) {
    const current = queue.shift();
    stepCount++;
    updateStats(visited.size, queue.length);

    if (current === goalNode) {
      const path = reconstructPath(cameFrom, goalNode);
      await animatePath(path, 'bfs');
      showResult('bfs', true, path.length + 1);
      setBusy(false);
      return;
    }

    for (const neighbor of getNeighbors(current)) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      cameFrom.set(neighbor, current);
      if (!neighbor.classList.contains('goal')) neighbor.classList.add('open');
      queue.push(neighbor);
    }
    if (!current.classList.contains('start')) {
      current.classList.add('closed');
      await sleep(ANIMATION_DELAY);
    }
    updateStats(visited.size, queue.length);
  }

  showResult('bfs', false, 0);
  setBusy(false);
}

// ── A* ───────────────────────────────────────────────────────
function heuristic(a, b) {
  return Math.abs(Number(a.dataset.row) - Number(b.dataset.row))
       + Math.abs(Number(a.dataset.col) - Number(b.dataset.col));
}

async function aStar() {
  if (!startNode || !goalNode || isAnimating) return;
  clearPath();
  showAlgoPanel('astar');
  setBusy(true);

  const openSet = new Set([startNode]);
  const cameFrom = new Map();
  const gScore = new Map([[startNode, 0]]);
  const fScore = new Map([[startNode, heuristic(startNode, goalNode)]]);
  let visited = 0;

  while (openSet.size) {
    let current = null, bestScore = Infinity;
    for (const node of openSet) {
      const score = fScore.get(node) ?? Infinity;
      if (score < bestScore) { bestScore = score; current = node; }
    }

    if (!current) break;
    visited++;
    updateStats(visited, openSet.size);

    if (current === goalNode) {
      const path = reconstructPath(cameFrom, goalNode);
      await animatePath(path, 'astar');
      showResult('astar', true, path.length + 1);
      setBusy(false);
      return;
    }

    openSet.delete(current);
    if (!current.classList.contains('start')) current.classList.add('closed');

    for (const neighbor of getNeighbors(current)) {
      const tentativeG = (gScore.get(current) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goalNode));
        if (!openSet.has(neighbor)) openSet.add(neighbor);
        if (!neighbor.classList.contains('goal')) neighbor.classList.add('open');
      }
    }
    await sleep(ANIMATION_DELAY);
    updateStats(visited, openSet.size);
  }

  showResult('astar', false, 0);
  setBusy(false);
}

// ── Event listeners ──────────────────────────────────────────
setStartBtn.addEventListener('click', () => setMode(Mode.START, setStartBtn));
setGoalBtn.addEventListener('click', () => setMode(Mode.GOAL, setGoalBtn));
toggleWallBtn.addEventListener('click', () => setMode(Mode.WALL, toggleWallBtn));
runBfsBtn.addEventListener('click', () => bfs());
runAstarBtn.addEventListener('click', () => aStar());
clearPathBtn.addEventListener('click', clearPath);
resetGridBtn.addEventListener('click', resetGrid);
applySizeBtn.addEventListener('click', applyGridSize);
window.addEventListener('resize', scaleGrid);

buildGrid();
scaleGrid();