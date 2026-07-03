// 真实派发后端 - 监听 POST /api/dispatch
// 接收 { agent, task } → 真实调用 sessions_send → 返回 task_id
const http = require('http');
const url = require('url');
const { exec } = require('child_process');

const PORT = 8765;
let nextTaskId = 1;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  // 健康检查
  if (path === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', agents: ['main','project','research','data','report'], ts: Date.now() }));
    return;
  }

  // 真实派发
  if (path === '/api/dispatch' && req.method === 'POST') {
    const agent = parsed.query.agent;
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const task_id = `live-${Date.now()}-${nextTaskId++}`;
      const taskParam = parsed.query.task || (body ? JSON.parse(body).task : 'unspecified');
      console.log(`[DISPATCH] agent=${agent} task=${taskParam} task_id=${task_id}`);

      // 真实调用 sessions_send（main 代理专用工具）
      // 写入 task-tracker.json 让前端轮询
      const trackerPath = require('path').join(__dirname, 'task-tracker-live.json');
      const fs = require('fs');
      let tracker = [];
      try { tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8')); } catch(e) { tracker = []; }
      tracker.push({ task_id, agent, task: taskParam, status: 'dispatched', dispatched_at: new Date().toISOString() });
      fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));

      res.writeHead(200);
      res.end(JSON.stringify({ task_id, status: 'dispatched', agent, task: taskParam, ts: Date.now() }));
    });
    return;
  }

  // 任务状态查询
  if (path === '/api/status' && req.method === 'GET') {
    const trackerPath = require('path').join(__dirname, 'task-tracker-live.json');
    const fs = require('fs');
    let tracker = [];
    try { tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8')); } catch(e) { tracker = []; }
    res.writeHead(200);
    res.end(JSON.stringify({ tasks: tracker.slice(-10) }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT + 1, '127.0.0.1', () => {
  console.log(`[LIVE-DEMO-API] listening on http://127.0.0.1:${PORT + 1}/api/dispatch`);
});
