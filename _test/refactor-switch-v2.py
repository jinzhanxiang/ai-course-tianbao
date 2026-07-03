#!/usr/bin/env python3
"""
精确重构 burst.js switch case，添加 {} 块作用域。
保持原始缩进风格。
"""
import re

path = '/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/assets/js/burst.js'
content = open(path).read()

# 找到 switch (layout) { ... } 块
start = content.find('    switch (layout) {')
if start == -1:
    print("switch not found")
    exit(1)

# 找匹配的 }
depth = 0
end = start
for i in range(start, len(content)):
    c = content[i]
    if c == '{':
        depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

switch_block = content[start:end]
lines = switch_block.split('\n')

# 重构：为每个 case 添加 {}
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # 匹配 case 'xxx': 或 default:
    case_match = re.match(r"^(\s*)case\s+'([^']+)':\s*(.*)$", stripped)
    default_match = re.match(r"^(\s*)default:\s*(.*)$", stripped)
    
    if case_match:
        indent = case_match.group(1)
        case_name = case_match.group(2)
        rest = case_match.group(3).strip()
        
        # 计算原始行的缩进（4 spaces for case）
        orig_indent = len(line) - len(line.lstrip())
        spaces = ' ' * orig_indent
        
        new_lines.append(f"{spaces}case '{case_name}': {{")
        if rest and not rest.startswith('//'):
            new_lines.append(f"{spaces}  {rest}")
        i += 1
        
        # 收集 case 体直到 break;
        case_body = []
        while i < len(lines):
            body_line = lines[i]
            body_stripped = body_line.strip()
            if body_stripped == 'break;':
                case_body.append(body_line)
                i += 1
                break
            # 检查是否到了下一个 case
            if re.match(r"^(\s*)case\s+'", body_stripped) or re.match(r"^(\s*)default:", body_stripped):
                break
            case_body.append(body_line)
            i += 1
        
        new_lines.extend(case_body)
        new_lines.append(f"{spaces}}}")
        continue
    
    if default_match:
        new_lines.append(line)
        i += 1
        continue
    
    new_lines.append(line)
    i += 1

new_switch = '\n'.join(new_lines)
new_content = content[:start] + new_switch + content[end:]

# 验证语法
import subprocess
result = subprocess.run(['node', '-e', f'''
const code = `{new_content.replace('`', '\\`').replace('$', '\\$')}`;
const m = code.match(/function getLayoutCoords[\\s\\S]*?^  \\}}/m);
try {{ new Function(m[0]); console.log('OK'); }} catch(e) {{ console.log('ERR: ' + e.message); }}
'''], capture_output=True, text=True)
print(result.stdout.strip() or result.stderr.strip()[:200])

open(path, 'w').write(new_content)
print(f"✅ 已写入: {path}")
