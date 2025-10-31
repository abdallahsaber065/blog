import React from 'react';
import { FiCode, FiFileText, FiFile, FiImage } from 'react-icons/fi';
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
    SiRust,
    SiGo,
    SiMarkdown,
    SiJson,
    SiYaml,
    SiDocker,
    SiGit,
    SiShell,
    SiVuedotjs,
    SiReact,
    SiAngular,
    SiSvelte,
    SiNodedotjs,
    SiXml,
    SiGraphql,
} from 'react-icons/si';
import { FaJava, FaFileArchive, FaFileExcel, FaFileWord, FaFilePowerpoint } from 'react-icons/fa';
import { TbSql } from 'react-icons/tb';
import { TbBrandCSharp } from 'react-icons/tb';

interface FileIconConfig {
    icon: React.ElementType;
    color: string;
}

export const FILE_ICONS: Record<string, FileIconConfig> = {
    // Web Development
    js: { icon: SiJavascript, color: "text-yellow-400" },
    jsx: { icon: SiReact, color: "text-cyan-400" },
    mjs: { icon: SiJavascript, color: "text-yellow-400" },
    ts: { icon: SiTypescript, color: "text-blue-400" },
    tsx: { icon: SiReact, color: "text-cyan-500" },
    html: { icon: SiHtml5, color: "text-orange-500" },
    htm: { icon: SiHtml5, color: "text-orange-500" },
    css: { icon: SiCss3, color: "text-blue-600" },
    scss: { icon: SiCss3, color: "text-blue-600" },
    sass: { icon: SiCss3, color: "text-blue-600" },
    php: { icon: SiPhp, color: "text-purple-500" },
    vue: { icon: SiVuedotjs, color: "text-green-500" },
    svelte: { icon: SiSvelte, color: "text-orange-600" },

    // Systems Programming
    c: { icon: SiC, color: "text-blue-500" },
    cpp: { icon: SiCplusplus, color: "text-pink-500" },
    cc: { icon: SiCplusplus, color: "text-pink-500" },
    cxx: { icon: SiCplusplus, color: "text-pink-500" },
    h: { icon: SiC, color: "text-purple-500" },
    hpp: { icon: SiCplusplus, color: "text-purple-500" },
    cs: { icon: TbBrandCSharp, color: "text-green-600" },
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
    sh: { icon: SiShell, color: "text-slate-600" },
    bash: { icon: SiShell, color: "text-slate-600" },
    zsh: { icon: SiShell, color: "text-slate-600" },

    // Data & Config Files
    json: { icon: SiJson, color: "text-yellow-600" },
    yml: { icon: SiYaml, color: "text-red-400" },
    yaml: { icon: SiYaml, color: "text-red-400" },
    xml: { icon: SiXml, color: "text-orange-500" },
    graphql: { icon: SiGraphql, color: "text-pink-500" },
    gql: { icon: SiGraphql, color: "text-pink-500" },
    md: { icon: SiMarkdown, color: "text-blue-300" },
    markdown: { icon: SiMarkdown, color: "text-blue-300" },
    sql: { icon: TbSql, color: "text-blue-400" },

    // Node.js specific
    node: { icon: SiNodedotjs, color: "text-green-600" },

    // DevOps & Tools
    dockerfile: { icon: SiDocker, color: "text-blue-400" },
    gitignore: { icon: SiGit, color: "text-orange-600" },
    git: { icon: SiGit, color: "text-orange-600" },

    // Documents
    pdf: { icon: FiFileText, color: "text-red-500" },
    txt: { icon: FiFileText, color: "text-slate-500" },
    doc: { icon: FaFileWord, color: "text-blue-600" },
    docx: { icon: FaFileWord, color: "text-blue-600" },
    xls: { icon: FaFileExcel, color: "text-green-600" },
    xlsx: { icon: FaFileExcel, color: "text-green-600" },
    ppt: { icon: FaFilePowerpoint, color: "text-orange-600" },
    pptx: { icon: FaFilePowerpoint, color: "text-orange-600" },

    // Archives
    zip: { icon: FaFileArchive, color: "text-yellow-600" },
    rar: { icon: FaFileArchive, color: "text-purple-600" },
    tar: { icon: FaFileArchive, color: "text-slate-600" },
    gz: { icon: FaFileArchive, color: "text-slate-600" },
    '7z': { icon: FaFileArchive, color: "text-orange-600" },

    // Images
    jpg: { icon: FiImage, color: "text-green-500" },
    jpeg: { icon: FiImage, color: "text-green-500" },
    png: { icon: FiImage, color: "text-blue-500" },
    gif: { icon: FiImage, color: "text-pink-500" },
    svg: { icon: FiImage, color: "text-yellow-500" },
    webp: { icon: FiImage, color: "text-purple-500" },
    ico: { icon: FiImage, color: "text-blue-400" },
};
// list of file extensions text alone {with dot}
export const FILE_EXTENSIONS = [
    // Web Development
    '.js',
    '.jsx',
    '.mjs',
    '.ts',
    '.tsx',
    '.html',
    '.htm',
    '.css',
    '.scss',
    '.sass',
    '.php',
    '.vue',
    '.svelte',
    // Systems Programming
    '.c',
    '.cpp',
    '.cc',
    '.cxx',
    '.h',
    '.hpp',
    '.cs',
    '.rs',
    '.go',
    // Mobile Development
    '.swift',
    '.kt',
    '.kts',
    '.java',
    // Scripting Languages
    '.py',
    '.pyw',
    '.rb',
    '.sh',
    '.bash',
    '.zsh',
    // Data & Config Files
    '.json',
    '.yml',
    '.yaml',
    '.xml',
    '.graphql',
    '.gql',
    '.md',
    '.markdown',
    '.sql',
    '.node',
    // DevOps & Tools
    '.dockerfile',
    '.gitignore',
    '.git',
    // Documents
    '.pdf',
    '.txt',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    // Archives
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    '.7z',
    // Images
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
];


export const getFileIcon = (fileName: string): React.JSX.Element => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconConfig = FILE_ICONS[ext];

    if (!iconConfig) {
        return <FiCode className="text-xl text-slate-500" />;
    }

    const IconComponent = iconConfig.icon;
    return <IconComponent className={`text-xl ${iconConfig.color}`} />;
};
