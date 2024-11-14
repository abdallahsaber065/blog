import React from 'react';
import { FiCode, FiFileText } from 'react-icons/fi';
import { 
    SiJavascript, 
    SiTypescript, 
    SiPython, 
    SiHtml5, 
    SiCss3,
    SiPhp,
    SiRuby,
    SiSwift,
    SiKotlin,
    SiCplusplus,
    SiC,
    SiCsharp,
    SiRust,
    SiGo,
    SiMarkdown,
    SiJson,
    SiYaml,
    SiDocker,
    SiGit,
    SiMysql,
    SiShell,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { TbSql } from 'react-icons/tb';

interface FileIconConfig {
    icon: React.ElementType;
    color: string;
}

export const FILE_ICONS: Record<string, FileIconConfig> = {
    // Web Development
    js: { icon: SiJavascript, color: "text-yellow-400" },
    jsx: { icon: SiJavascript, color: "text-yellow-400" },
    mjs: { icon: SiJavascript, color: "text-yellow-400" },
    ts: { icon: SiTypescript, color: "text-blue-400" },
    tsx: { icon: SiTypescript, color: "text-blue-400" },
    html: { icon: SiHtml5, color: "text-orange-500" },
    htm: { icon: SiHtml5, color: "text-orange-500" },
    css: { icon: SiCss3, color: "text-blue-600" },
    scss: { icon: SiCss3, color: "text-blue-600" },
    sass: { icon: SiCss3, color: "text-blue-600" },
    php: { icon: SiPhp, color: "text-purple-500" },

    // Systems Programming
    c: { icon: SiC, color: "text-blue-500" },
    cpp: { icon: SiCplusplus, color: "text-pink-500" },
    cc: { icon: SiCplusplus, color: "text-pink-500" },
    cxx: { icon: SiCplusplus, color: "text-pink-500" },
    cs: { icon: SiCsharp, color: "text-green-600" },
    rs: { icon: SiRust, color: "text-orange-600" },
    go: { icon: SiGo, color: "text-blue-400" },

    // Mobile Development
    swift: { icon: SiSwift, color: "text-orange-500" },
    kt: { icon: SiKotlin, color: "text-purple-400" },
    kts: { icon: SiKotlin, color: "text-purple-400" },
    java: { icon: FaJava, color: "text-red-500" },

    // Scripting Languages
    py: { icon: SiPython, color: "text-blue-500" },
    pyw: { icon: SiPython, color: "text-blue-500" },
    rb: { icon: SiRuby, color: "text-red-600" },
    sh: { icon: SiShell, color: "text-gray-600" },
    bash: { icon: SiShell, color: "text-gray-600" },
    zsh: { icon: SiShell, color: "text-gray-600" },

    // Data & Config Files
    json: { icon: SiJson, color: "text-yellow-600" },
    yml: { icon: SiYaml, color: "text-red-400" },
    yaml: { icon: SiYaml, color: "text-red-400" },
    md: { icon: SiMarkdown, color: "text-blue-300" },
    markdown: { icon: SiMarkdown, color: "text-blue-300" },
    sql: { icon: TbSql, color: "text-blue-400" },

    // DevOps & Tools
    dockerfile: { icon: SiDocker, color: "text-blue-400" },
    gitignore: { icon: SiGit, color: "text-orange-600" },
    git: { icon: SiGit, color: "text-orange-600" },

    // Documents
    pdf: { icon: FiFileText, color: "text-red-500" },
    txt: { icon: FiFileText, color: "text-gray-500" },
};

export const getFileIcon = (fileName: string): JSX.Element => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconConfig = FILE_ICONS[ext];
    
    if (!iconConfig) {
        return <FiCode className="text-xl text-gray-500" />;
    }

    const IconComponent = iconConfig.icon;
    return <IconComponent className={`text-xl ${iconConfig.color}`} />;
};
