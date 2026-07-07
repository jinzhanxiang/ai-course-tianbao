@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================================
::  Hermes Agent — Windows 在线安装脚本（国内镜像加速版）
::  ============================================================
::  适用于已有 Python 的用户，使用清华/阿里云镜像加速下载
::  如果无法联网，请使用 setup.bat（离线版）
::  ============================================================

title Hermes Agent 在线安装（国内镜像）

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  🤖 Hermes Agent · 在线安装（清华镜像加速）          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo   使用清华 TUNA 镜像，下载速度 10-50MB/s
echo   如果已有 Python 3.11+，此脚本是最快安装方式
echo.

set "INSTALL_DIR=%~dp0"
set "MIRROR=https://pypi.tuna.tsinghua.edu.cn/simple"

:: Find Python
set PYTHON_CMD=
for %%p in (python3 python python3.11 python3.12 py) do (
    where %%p >nul 2>&1
    if !errorlevel!==0 (
        set PYTHON_CMD=%%p
        goto :found
    )
)
echo ❌ 未找到 Python！请安装 Python 3.11+ 或使用 setup.bat（内置 Python 离线版）
pause
exit /b 1

:found
echo [1/3] ✅ 找到 Python: %PYTHON_CMD%
%PYTHON_CMD% --version

:: Create venv
echo.
echo [2/3] 🔧 创建虚拟环境...
set "VENV_DIR=%INSTALL_DIR%venv"
if exist "%VENV_DIR%" rmdir /s /q "%VENV_DIR%" >nul 2>&1
%PYTHON_CMD% -m venv "%VENV_DIR%"
if errorlevel 1 (
    echo ❌ 虚拟环境创建失败
    pause
    exit /b 1
)
echo ✅ 虚拟环境已创建

:: Install deps from mirror
echo.
echo [3/3] 📚 从清华镜像安装依赖...
"%VENV_DIR%\Scripts\python.exe" -m pip install -i %MIRROR% --trusted-host pypi.tuna.tsinghua.edu.cn --upgrade pip
"%VENV_DIR%\Scripts\python.exe" -m pip install -i %MIRROR% --trusted-host pypi.tuna.tsinghua.edu.cn -r "%INSTALL_DIR%requirements.txt"

if errorlevel 1 (
    echo ⚠️ 清华镜像失败，尝试阿里云镜像...
    set "MIRROR_ALI=https://mirrors.aliyun.com/pypi/simple/"
    "%VENV_DIR%\Scripts\python.exe" -m pip install -i !MIRROR_ALI! --trusted-host mirrors.aliyun.com -r "%INSTALL_DIR%requirements.txt"
)

:: Verify
"%VENV_DIR%\Scripts\python.exe" -c "import openai; import httpx; import yaml; print('OK')" >nul 2>&1
if errorlevel 1 (
    echo ❌ 依赖安装验证失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

:: Config
if not exist "%INSTALL_DIR%config.yaml" (
    copy "%INSTALL_DIR%config.yaml.template" "%INSTALL_DIR%config.yaml" >nul
    echo 📝 已创建 config.yaml
)

:: Launch scripts
echo @echo off > "%INSTALL_DIR%启动Hermes.bat"
echo chcp 65001 ^>nul >> "%INSTALL_DIR%启动Hermes.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%启动Hermes.bat"
echo "%VENV_DIR%\Scripts\python.exe" hermes_lite.py >> "%INSTALL_DIR%启动Hermes.bat"
echo if errorlevel 1 pause >> "%INSTALL_DIR%启动Hermes.bat"

echo ✅ 安装完成！
echo.
echo 🚀 双击 "启动Hermes.bat" 开始使用
echo ⚙️ 先编辑 config.yaml 填入商汤 API Key
echo.
echo 按任意键退出...
pause >nul
