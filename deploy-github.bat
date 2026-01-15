@echo off
chcp 65001 >nul
color 0A
title Finance Pro - Deploy GitHub Pages

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   💰 FINANCE PRO - DEPLOY GITHUB PAGES 🚀     ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar se Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git não encontrado!
    echo.
    echo 📥 Baixe e instale Git:
    echo    https://git-scm.com/download/win
    echo.
    echo ⚠️  Depois de instalar, execute este script novamente.
    pause
    exit /b 1
)

echo ✅ Git encontrado!
echo.

REM Verificar se estamos na pasta correta
if not exist "index.html" (
    echo ❌ Arquivo index.html não encontrado!
    echo.
    echo ⚠️  Execute este script na pasta do Finance Pro
    echo    (onde está o arquivo index.html)
    pause
    exit /b 1
)

echo ✅ Pasta correta (index.html encontrado)
echo.

REM Verificar se pasta icons existe
if not exist "icons" (
    echo ⚠️  Pasta icons/ não encontrada!
    echo.
    echo 📝 Você precisa gerar os ícones primeiro:
    echo    1. Abra gerador-icones.html no navegador
    echo    2. Clique em "Gerar Todos os Ícones"
    echo    3. Clique em "Baixar Todos (ZIP)"
    echo    4. Extraia o ZIP aqui
    echo.
    echo ⏸️  Pressione qualquer tecla depois de gerar os ícones...
    pause
    
    if not exist "icons" (
        echo ❌ Pasta icons/ ainda não existe!
        pause
        exit /b 1
    )
)

echo ✅ Pasta icons/ encontrada!
echo.

REM Verificar se já é um repositório Git
if exist ".git" (
    echo ⚠️  Repositório Git já existe!
    echo.
    choice /C SN /M "Deseja continuar mesmo assim? (S/N)"
    if errorlevel 2 exit /b 0
    echo.
) else (
    echo 🔧 Inicializando repositório Git...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao inicializar Git!
        pause
        exit /b 1
    )
    echo ✅ Git inicializado!
    echo.
)

REM Configurar usuário Git se necessário
for /f "tokens=*" %%i in ('git config --global user.name 2^>nul') do set GIT_USER=%%i
for /f "tokens=*" %%i in ('git config --global user.email 2^>nul') do set GIT_EMAIL=%%i

if "%GIT_USER%"=="" (
    echo 📝 Configure seu nome no Git:
    set /p GIT_USER="Digite seu nome: "
    git config --global user.name "%GIT_USER%"
)

if "%GIT_EMAIL%"=="" (
    echo 📝 Configure seu email no Git:
    set /p GIT_EMAIL="Digite seu email: "
    git config --global user.email "%GIT_EMAIL%"
)

echo.
echo ✅ Usuário Git: %GIT_USER%
echo ✅ Email Git: %GIT_EMAIL%
echo.

REM Pedir URL do repositório
echo ════════════════════════════════════════════════
echo 📋 INFORMAÇÕES DO REPOSITÓRIO GITHUB
echo ════════════════════════════════════════════════
echo.
echo 💡 Primeiro crie o repositório no GitHub:
echo    1. Acesse: https://github.com
echo    2. Clique no botão verde "New" (➕)
echo    3. Nome: finance-pro
echo    4. Público ✓
echo    5. Create repository
echo    6. Copie a URL (ex: https://github.com/usuario/finance-pro.git)
echo.
echo ⏸️  Pressione qualquer tecla depois de criar...
pause
echo.

set /p REPO_URL="Cole a URL do repositório: "

if "%REPO_URL%"=="" (
    echo ❌ URL não pode estar vazia!
    pause
    exit /b 1
)

echo.
echo ✅ URL: %REPO_URL%
echo.

REM Adicionar arquivos
echo 📦 Adicionando arquivos...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao adicionar arquivos!
    pause
    exit /b 1
)
echo ✅ Arquivos adicionados!
echo.

REM Commit
echo 💾 Criando commit...
git commit -m "🎉 Finance Pro - Versão inicial PWA"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Nada para commitar (arquivos já estão no Git)
    echo.
) else (
    echo ✅ Commit criado!
    echo.
)

REM Branch main
echo 🌿 Configurando branch principal...
git branch -M main
echo ✅ Branch configurada!
echo.

REM Adicionar remote
echo 🔗 Conectando ao GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao adicionar remote!
    pause
    exit /b 1
)
echo ✅ Conectado ao GitHub!
echo.

REM Push
echo 🚀 Enviando arquivos para GitHub...
echo.
echo 💡 Se pedir senha, use Personal Access Token:
echo    GitHub → Settings → Developer settings → Personal access tokens
echo    Generate new token → Marcar "repo" → Copiar token
echo    Use o TOKEN como senha (não sua senha normal!)
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao enviar arquivos!
    echo.
    echo 💡 Verifique:
    echo    - Personal Access Token está correto
    echo    - Repositório existe no GitHub
    echo    - URL está correta
    pause
    exit /b 1
)
echo.
echo ✅ Arquivos enviados com sucesso!
echo.

REM Instruções finais
echo ════════════════════════════════════════════════
echo 🎉 DEPLOY INICIADO COM SUCESSO!
echo ════════════════════════════════════════════════
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1️⃣  Ativar GitHub Pages:
echo    • Abra: %REPO_URL:~0,-4%
echo    • Settings → Pages
echo    • Source: Branch "main", Folder "/ (root)"
echo    • Save
echo    • Aguardar ~2 minutos
echo.
echo 2️⃣  Ajustar manifest.json:
echo    • Editar com Notepad++ ou VS Code
echo    • Mudar "/finance-pro/" para seu nome de repositório
echo    • Salvar
echo.
echo 3️⃣  Enviar correção:
echo    • git add manifest.json
echo    • git commit -m "🔧 Ajustar caminhos"
echo    • git push
echo.
echo 4️⃣  Testar:
echo    • Aguardar ~2 minutos
echo    • Abrir no navegador
echo    • Instalar no celular
echo.
echo ═══════════════════════════════════════════════════
echo 📱 Seu site estará em:
echo    %REPO_URL:~0,-4:/github.com/=.github.io/%
echo ═══════════════════════════════════════════════════
echo.
echo 💡 Consulte GUIA-WINDOWS.md para mais detalhes!
echo.
pause
