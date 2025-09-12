#!/bin/bash

# EES-RN-AI 项目设置脚本

echo "🚀 开始设置 EES-RN-AI 项目..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js版本: $node_version"
else
    echo "❌ 请先安装Node.js (版本 >= 16)"
    exit 1
fi

# 检查npm
echo "📋 检查npm..."
npm_version=$(npm -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm版本: $npm_version"
else
    echo "❌ 请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建环境配置文件
echo "⚙️ 创建环境配置文件..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑其中的API密钥"
else
    echo "ℹ️ .env 文件已存在"
fi

# 检查React Native CLI
echo "📋 检查React Native CLI..."
if command -v react-native &> /dev/null; then
    echo "✅ React Native CLI 已安装"
else
    echo "⚠️ 建议安装React Native CLI: npm install -g react-native-cli"
fi

# 检查Android环境
echo "📋 检查Android开发环境..."
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ Android SDK 路径: $ANDROID_HOME"
else
    echo "⚠️ 请设置ANDROID_HOME环境变量"
fi

# 检查iOS环境 (仅macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📋 检查iOS开发环境..."
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode 已安装"
    else
        echo "⚠️ 请安装Xcode"
    fi
fi

echo ""
echo "🎉 项目设置完成！"
echo ""
echo "📝 下一步："
echo "1. 编辑 .env 文件，填入你的API密钥"
echo "2. 运行 'npm run android' 启动Android应用"
echo "3. 运行 'npm run ios' 启动iOS应用"
echo ""
echo "📚 更多信息请查看 README.md"
