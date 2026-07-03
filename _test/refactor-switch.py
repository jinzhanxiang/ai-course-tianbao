#!/usr/bin/env python3
"""
重构 burst.js 的 getLayoutCoords switch case，
为每个 case 添加 {} 块作用域，避免 const 跨 case TDZ 冲突。
"""
import re

path = '/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/assets/js/burst.js'
content = open(path).read()

# 找到 getLayoutCoords 函数的 switch 块
# 从 "switch (layout) {" 到匹配的 "}"
switch_start = content.find('switch (layout) {')
if switch_start == -1:
    print("switch not found")
    exit(1)

# 找匹配的闭合括号
brace_depth = 0
switch_end = switch_start
for i in range(switch_start, len(content)):
    if content[i] == '{':
        brace_depth += 1
    elif content[i] == '}':
        brace_depth -= 1
        if brace_depth == 0:
            switch_end = i
            break

switch_body = content[switch_start:switch_end+1]
print(f"Switch body: {len(switch_body)} chars, lines: {switch_body.count(chr(10))}")

# 解析 case 并包裹 {}
lines = switch_body.split('\n')
new_lines = []
in_case = False
case_indent = ""

i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # case 开始
    case_match = re.match(r"^(\s*)case\s+'([^']+)':(.*)$", stripped)
    if case_match:
        indent = case_match.group(1)
        case_name = case_match.group(2)
        rest = case_match.group(3).strip()
        
        # 输出 case 行 + 开始块
        if rest:
            new_lines.append(f"{indent}case '{case_name}': {{")
            if rest and not rest.startswith('//'):
                new_lines.append(f"{indent}  {rest}")
        else:
            new_lines.append(f"{indent}case '{case_name}': {{")
        in_case = True
        case_indent = indent
        i += 1
        continue
    
    # break / return / default 结束 case
    if in_case and (stripped == 'break;' or stripped.startswith('return ') or stripped == 'return;'):
        new_lines.append(line)
        new_lines.append(f"{case_indent}}}")
        in_case = False
        i += 1
        continue
    
    # default case
    if stripped == 'default:':
        new_lines.append(line)
        i += 1
        continue
    
    new_lines.append(line)
    i += 1

# 如果最后一个 case 没有 break（不应该）
if in_case:
    new_lines.append(f"{case_indent}}}")

new_switch = '\n'.join(new_lines)

# 替换回原内容
new_content = content[:switch_start] + new_switch + content[switch_end+1:]

# 验证：检查是否还有裸露的 case 后 const 冲突
print("\n=== 验证重构后 ===")
# 找所有 case 块内的 const 声明
remaining = re.findall(r"case '([^']+)': \{([^}]*)\}", new_content, re.DOTALL)
for case_name, block in remaining[:5]:
    consts = re.findall(r'\bconst\s+([a-zA-Z_][a-zA-Z0-9_]*)', block)
    print(f"  case '{case_name}': {len(consts)} consts: {consts[:8]}")

# 写回
open(path, 'w').write(new_content)
print(f"\n✅ 已重构: {path}")
print(f"   原大小: {len(content)} → 新大小: {len(new_content)}")
