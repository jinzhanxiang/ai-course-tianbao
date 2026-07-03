#!/usr/bin/env python3
"""
精确重构 burst.js switch case，添加 {} 块作用域。
"""
import re, subprocess

path = '/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/assets/js/burst.js'
content = open(path).read()

start = content.find('    switch (layout) {')
if start == -1:
    print("switch not found")
    exit(1)

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

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    case_match = re.match(r"^(\s*)case\s+'([^']+)':\s*(.*)$", stripped)
    
    if case_match:
        indent = case_match.group(1)
        case_name = case_match.group(2)
        rest = case_match.group(3).strip()
        orig_indent = len(line) - len(line.lstrip())
        spaces = ' ' * orig_indent
        
        new_lines.append(f"{spaces}case '{case_name}': {{")
        if rest and not rest.startswith('//'):
            new_lines.append(f"{spaces}  {rest}")
        i += 1
        
        case_body = []
        while i < len(lines):
            body_line = lines[i]
            body_stripped = body_line.strip()
            if body_stripped == 'break;':
                case_body.append(body_line)
                i += 1
                break
            if re.match(r"^(\s*)case\s+'", body_stripped) or re.match(r"^(\s*)default:", body_stripped):
                break
            case_body.append(body_line)
            i += 1
        
        new_lines.extend(case_body)
        new_lines.append(f"{spaces}}}")
        continue
    
    new_lines.append(line)
    i += 1

new_switch = '\n'.join(new_lines)
new_content = content[:start] + new_switch + content[end:]

# 验证：写临时文件让 node 检查
with open('/tmp/check-burst.js', 'w') as f:
    f.write(new_content)

result = subprocess.run(['node', '-c', '/tmp/check-burst.js'], capture_output=True, text=True)
if result.returncode == 0:
    print("✅ Node.js 语法检查通过")
else:
    print("❌ 语法错误:", result.stderr[:300])
    exit(1)

open(path, 'w').write(new_content)
print(f"✅ 已写入: {path}")
