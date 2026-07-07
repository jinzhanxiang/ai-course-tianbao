@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================================
::  Hermes Agent — Windows 离线一键安装脚本 v3.1
::  ============================================================
::  完全离线：内置 Python 3.11.9 + 手动引导 pip + 29 wheels
::  不依赖 get-pip.py（它会联网），改为直接解压 wheel 安装 pip
::
::  用法：解压 hermes-installer/ 后双击 setup.bat
::  安装后磁盘占用：约 80MB
::  ============================================================

title Hermes Agent 离线安装 v3.1

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  🤖 Hermes Agent · 离线安装程序 v3.1                  ║
echo ║  商汤大模型 + 飞书连接 · 完全离线 · 3 分钟就绪      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

set "INSTALL_DIR=%~dp0"
set "PYTHON_DIR=%INSTALL_DIR%python"
set "WHEELS_DIR=%INSTALL_DIR%wheels"
set "SITE_PACKAGES=%PYTHON_DIR%\Lib\site-packages"

:: Block pip from ever touching the internet
set PIP_NO_INDEX=1
set PIP_NO_BUILD_ISOLATION=1
set PIP_DISABLE_PIP_VERSION_CHECK=1
set PIP_NO_WARN_SCRIPT_LOCATION=1

:: ============================================================
:: Step 1: Extract bundled Python
:: ============================================================
echo [1/6] 🐍 解压内置 Python 3.11.9 ...

if not exist "%PYTHON_DIR%\python.exe" (
    echo   正在解压 python-embed.zip （11MB）...
    powershell -Command "Expand-Archive -LiteralPath '%INSTALL_DIR%python-embed.zip' -DestinationPath '%PYTHON_DIR%' -Force"
    if errorlevel 1 (
        echo.
        echo   ❌ 自动解压失败
        echo.
        echo   请手动操作：
        echo     1. 找到 python-embed.zip，右键 → 全部解压
        echo     2. 解压到当前文件夹，重命名解压出的文件夹为 python
        echo     3. 确保 python\python.exe 存在
        echo     4. 重新双击 setup.bat
        echo.
        pause
        exit /b 1
    )
)

:: Verify python.exe exists
if not exist "%PYTHON_DIR%\python.exe" (
    echo   ❌ 未找到 python\python.exe，安装失败
    pause
    exit /b 1
)
echo   ✅ Python 已就绪

:: ============================================================
:: Step 2: Configure Python for package support
:: ============================================================
echo [2/6] 🔧 配置 Python 路径和 site-packages ...

set "PTH_FILE=%PYTHON_DIR%\python311._pth"

:: Create required directories
if not exist "%SITE_PACKAGES%" mkdir "%SITE_PACKAGES%"
if not exist "%PYTHON_DIR%\Scripts" mkdir "%PYTHON_DIR%\Scripts"
if not exist "%PYTHON_DIR%\DLLs" mkdir "%PYTHON_DIR%\DLLs"

:: Rewrite python311._pth with correct paths
(
echo python311.zip
echo .
echo Lib\site-packages
echo Scripts
echo DLLs
echo import site
) > "%PTH_FILE%"

echo   ✅ 路径配置完成

:: ============================================================
:: Step 3: Bootstrap pip manually (NO get-pip.py, NO internet)
:: ============================================================
echo [3/6] 📦 引导安装 pip（手动解压 wheel，无需联网）...

"%PYTHON_DIR%\python.exe" -c "import pip" >nul 2>&1
if not errorlevel 1 (
    echo   ✅ pip 已安装，跳过引导
    goto :install_packages
)

echo   正在从 pip wheel 手动解压...

:: Manually extract pip, setuptools, wheel from their .whl files
:: .whl files are just .zip files with a different extension
:: Extract them directly into site-packages

cd /d "%WHEELS_DIR%"

:: Install pip
for %%f in (pip-*.whl) do (
    echo   解压 %%f ...
    "%PYTHON_DIR%\python.exe" -c "import zipfile,os; z=zipfile.ZipFile(r'%WHEELS_DIR%\%%f'); z.extractall(r'%SITE_PACKAGES%'); print('pip: OK')"
    if errorlevel 1 (
        echo   ❌ pip wheel 解压失败
        pause
        exit /b 1
    )
)

:: Install setuptools
for %%f in (setuptools-*.whl) do (
    echo   解压 %%f ...
    "%PYTHON_DIR%\python.exe" -c "import zipfile,os; z=zipfile.ZipFile(r'%WHEELS_DIR%\%%f'); z.extractall(r'%SITE_PACKAGES%'); print('setuptools: OK')"
)

:: Install wheel
for %%f in (wheel-*.whl) do (
    echo   解压 %%f ...
    "%PYTHON_DIR%\python.exe" -c "import zipfile,os; z=zipfile.ZipFile(r'%WHEELS_DIR%\%%f'); z.extractall(r'%SITE_PACKAGES%'); print('wheel: OK')"
)

cd /d "%INSTALL_DIR%"

:: Verify pip works
"%PYTHON_DIR%\python.exe" -c "import pip" >nul 2>&1
if errorlevel 1 (
    echo   ❌ pip 引导失败
    echo.
    echo   请检查 wheels\ 目录中是否有 pip-*.whl 文件
    pause
    exit /b 1
)
echo   ✅ pip 引导完成

:: ============================================================
:: Step 4: Install all packages from local wheels
:: ============================================================
:install_packages
echo [4/6] 📚 安装全部依赖包（29 个 wheels，无需联网）...

:: Use pip to install from local wheels directory
"%PYTHON_DIR%\python.exe" -m pip install ^
    --no-index ^
    --find-links="%WHEELS_DIR%" ^
    --no-build-isolation ^
    --no-warn-script-location ^
    openai httpx pyyaml requests python-dotenv rich ^
    2>&1

if errorlevel 1 (
    echo.
    echo   ⚠️  批量安装遇到问题，改为逐个安装...
    echo   （这是正常的，某些包的依赖顺序需要逐个处理）

    :: Fallback: install every wheel one by one (idempotent)
    for %%f in ("%WHEELS_DIR%\*.whl") do (
        "%PYTHON_DIR%\python.exe" -m pip install --no-index --no-deps --no-warn-script-location "%%f" >nul 2>&1
    )

    :: Let pip resolve dependencies with all packages already available
    "%PYTHON_DIR%\python.exe" -m pip install ^
        --no-index ^
        --find-links="%WHEELS_DIR%" ^
        --no-deps ^
        openai httpx pyyaml requests python-dotenv rich ^
        >nul 2>&1
)

:: ============================================================
:: Step 5: Verify installation
:: ============================================================
echo [5/6] 🔍 验证安装 ...

set "ALL_OK=1"

"%PYTHON_DIR%\python.exe" -c "import openai; print('openai:', openai.__version__)" 2>nul
if errorlevel 1 (
    echo   ❌ openai 导入失败
    set "ALL_OK=0"
)

"%PYTHON_DIR%\python.exe" -c "import httpx; print('httpx:', httpx.__version__)" 2>nul
if errorlevel 1 (
    echo   ❌ httpx 导入失败
    set "ALL_OK=0"
)

"%PYTHON_DIR%\python.exe" -c "import yaml; print('yaml: OK')" 2>nul
if errorlevel 1 (
    echo   ❌ yaml 导入失败
    set "ALL_OK=0"
)

"%PYTHON_DIR%\python.exe" -c "import requests; print('requests:', requests.__version__)" 2>nul
if errorlevel 1 (
    echo   ❌ requests 导入失败
    set "ALL_OK=0"
)

"%PYTHON_DIR%\python.exe" -c "import rich; print('rich:', rich.__version__)" 2>nul
if errorlevel 1 (
    echo   ❌ rich 导入失败
    set "ALL_OK=0"
)

"%PYTHON_DIR%\python.exe" -c "import dotenv; print('dotenv: OK')" 2>nul
if errorlevel 1 (
    echo   ❌ dotenv 导入失败
    set "ALL_OK=0"
)

if "%ALL_OK%"=="0" (
    echo.
    echo   ⚠️ 部分依赖验证失败。尝试最后的修复...
    echo   将所有 wheel 解压到 site-packages...
    for %%f in ("%WHEELS_DIR%\*.whl") do (
        "%PYTHON_DIR%\python.exe" -c "import zipfile; z=zipfile.ZipFile(r'%%f'); z.extractall(r'%SITE_PACKAGES%')" >nul 2>&1
    )
    echo   请重新运行 "环境验证.bat" 确认
) else (
    echo   ✅ 全部 6 个核心依赖验证通过
)

:: ============================================================
:: Step 6: Create shortcuts and config
:: ============================================================
echo [6/6] ⚙️  创建配置和快捷方式 ...

:: Config template
if not exist "%INSTALL_DIR%config.yaml" (
    copy "%INSTALL_DIR%config.yaml.template" "%INSTALL_DIR%config.yaml" >nul
    echo   📝 已创建 config.yaml（待填入 API Key）
) else (
    echo   ✅ config.yaml 已存在
)

:: ---- 启动Hermes.bat ----
(
echo @echo off
echo chcp 65001 ^>nul
echo title Hermes Agent
echo cd /d "%INSTALL_DIR%"
echo echo.
echo echo ╔══════════════════════════════════════════════╗
echo echo ║     🤖 Hermes Agent v1.0                     ║
echo echo ║     商汤大模型 + 飞书连接                    ║
echo echo ╚══════════════════════════════════════════════╝
echo echo.
echo "%PYTHON_DIR%\python.exe" "%INSTALL_DIR%hermes_lite.py"
echo if errorlevel 1 ^(
echo   echo.
echo   echo ═══════════════════════════════════════════════
echo   echo ⚠️ 运行出错，常见原因：
echo   echo   1. config.yaml 中 api_key 未填写
echo   echo   2. 网络无法访问 token.sensenova.cn
echo   echo   3. API Key 无效或已过期
echo   echo.
echo   echo 📖 请阅读 README.html 获取帮助
echo   echo ═══════════════════════════════════════════════
echo   echo.
echo   pause
echo ^)
) > "%INSTALL_DIR%启动Hermes.bat"

:: ---- 环境验证.bat ----
(
echo @echo off
echo chcp 65001 ^>nul
echo title 环境验证
echo cd /d "%INSTALL_DIR%"
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║     🔍 Hermes Agent 环境验证                    ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo [1/4] Python 版本:
"%PYTHON_DIR%\python.exe" --version
echo.
echo [2/4] 核心依赖:
"%PYTHON_DIR%\python.exe" -c "import openai,httpx,yaml,requests,rich; from dotenv import load_dotenv; print('  ✅ openai + httpx + yaml + requests + rich + dotenv')" 2^>nul
if errorlevel 1 echo   ❌ 依赖缺失 — 请重新运行 setup.bat
echo.
echo [3/4] 配置文件:
if exist config.yaml ^(echo   ✅ config.yaml 存在^) else ^(echo   ❌ config.yaml 缺失^)
echo.
echo [4/4] 工作流模板:
if exist "workflows\" ^(dir /b workflows\ 2^>nul^) else ^(echo   ❌ workflows\ 缺失^)
echo.
echo ═══════════════════════════════════════════════════
echo   环境验证完成。如果全部 ✅，即可使用。
echo ═══════════════════════════════════════════════════
echo.
pause
) > "%INSTALL_DIR%环境验证.bat"

:: ---- 日报生成器.bat ----
(
echo @echo off
echo chcp 65001 ^>nul
echo title 日报生成器
echo cd /d "%INSTALL_DIR%"
echo.
echo 📋 启动日报生成器...
echo.
"%PYTHON_DIR%\python.exe" "%INSTALL_DIR%hermes_lite.py" --workflow "日报生成器"
echo.
echo if errorlevel 1 pause
) > "%INSTALL_DIR%日报生成器.bat"

:: ---- 飞书模式.bat ----
(
echo @echo off
echo chcp 65001 ^>nul
echo title Hermes ^(飞书模式^)
echo cd /d "%INSTALL_DIR%"
echo.
echo 📡 启动 Hermes · 飞书监听模式...
echo ^(按 Ctrl+C 停止^)
echo.
"%PYTHON_DIR%\python.exe" "%INSTALL_DIR%hermes_lite.py" --feishu
echo if errorlevel 1 pause
) > "%INSTALL_DIR%飞书模式.bat"

echo   ✅ 启动脚本已创建（启动Hermes.bat / 日报生成器.bat / 飞书模式.bat / 环境验证.bat）

:: ============================================================
:: Final: config and summary
:: ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║  ✅ 安装完成！                                      ║
echo ║                                                      ║
echo ║  📁 安装位置: %INSTALL_DIR%                        ║
echo ║  🐍 Python:   python\ （内置 3.11.9，无需安装）    ║
echo ║  📦 依赖:     python\Lib\site-packages\ （29 包）  ║
echo ║                                                      ║
echo ║  📋 关键文件:                                        ║
echo ║     config.yaml     — 配置文件（API Key）          ║
echo ║     启动Hermes.bat  — 交互式 AI 对话               ║
echo ║     日报生成器.bat  — 快速生成日报                 ║
echo ║     飞书模式.bat    — 连接飞书群机器人             ║
echo ║     环境验证.bat    — 检查安装是否正常             ║
echo ║     README.html     — 详细图文教程                 ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: Help user set up API key
if not exist "%INSTALL_DIR%.config-seeded" (
    echo.
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║  🔑 下一步：配置商汤 API Key                         ║
    echo ╠══════════════════════════════════════════════════════════╣
    echo ║                                                      ║
    echo ║  1. 访问 https://sensenova.cn 注册（免费）           ║
    echo ║  2. 进入控制台 → API Key 管理 → 创建 Key            ║
    echo ║  3. 复制 Key（格式: sk-xxxxxxxx）                   ║
    echo ║  4. 将其填入 config.yaml 的 api_key 字段            ║
    echo ║                                                      ║
    echo ║  模型: deepseek-v4-flash（免费）                    ║
    echo ║  API:  https://token.sensenova.cn/v1（国内可用）    ║
    echo ║                                                      ║
    echo ╚══════════════════════════════════════════════════════════╝
    echo.
    echo   是否现在打开 config.yaml 进行编辑？
    echo   [Y] 是  [N] 稍后手动编辑
    choice /c YN /n /m "  选择: "
    if errorlevel 2 goto :skip_edit
    if errorlevel 1 (
        start notepad "%INSTALL_DIR%config.yaml"
        echo   请填入 API Key 后保存文件，然后按任意键...
        pause >nul
    )
    :skip_edit
    echo. > "%INSTALL_DIR%.config-seeded"
)

echo.
echo 🎉 一切就绪！双击 "启动Hermes.bat" 即可开始使用。
echo 🔧 如有问题，先双击 "环境验证.bat" 排查。
echo.
echo 按任意键退出...
pause >nul
