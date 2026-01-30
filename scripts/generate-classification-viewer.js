/**
 * Classification System Viewer Generator
 * Transforms JSON classification files into standalone HTML viewers
 *
 * Usage: node generate-classification-viewer.js <input-json> <output-folder> <system-name>
 * Example: node generate-classification-viewer.js "O:\Classification Systems\Uniclass2015_jan2020.json" "C:\Dev\uniclass" "Uniclass 2015"
 */

const fs = require('fs');
const path = require('path');

// Configuration for different classification systems
const systemConfigs = {
    'uniclass': {
        title: 'Uniclass 2015',
        version: 'Jan 2020',
        description: 'Free interactive reference tool for Uniclass 2015. Search and browse the unified classification system for UK construction.',
        keywords: 'Uniclass, UK construction, BIM classification, building classification, NBS, Takeoff and Estimating',
        icon: '🏗️',
        accentColor: '#2980b9', // Blue
    },
    'omniclass': {
        title: 'OmniClass',
        version: 'OCCS',
        description: 'Free interactive reference tool for OmniClass Construction Classification System. Browse all tables and classifications.',
        keywords: 'OmniClass, OCCS, construction classification, building codes, Takeoff and Estimating',
        icon: '📊',
        accentColor: '#8e44ad', // Purple
    },
    'uniformat': {
        title: 'UniFormat II',
        version: 'E1557-97',
        description: 'Free interactive reference tool for UniFormat II elemental classification. Browse building systems and assemblies.',
        keywords: 'UniFormat, elemental classification, building systems, cost estimating, ASTM, Takeoff and Estimating',
        icon: '🏢',
        accentColor: '#27ae60', // Green
    },
    'nbs': {
        title: 'NBS Create',
        version: '2017',
        description: 'Free interactive reference tool for NBS Create specification system.',
        keywords: 'NBS Create, UK specifications, construction specifications, Takeoff and Estimating',
        icon: '📋',
        accentColor: '#e74c3c', // Red
    }
};

/**
 * Transform the source JSON format to the viewer format
 */
function transformData(sourceData) {
    const system = sourceData.BuildingInformation?.Classification?.[0]?.System?.[0];
    if (!system) {
        throw new Error('Invalid JSON structure - cannot find System');
    }

    const systemInfo = {
        name: system.Name?.[0] || 'Unknown',
        version: system.EditionVersion?.[0] || '',
        description: system.Description?.[0] || '',
        source: system.Source?.[0] || ''
    };

    const items = system.Items?.[0]?.Item || [];
    const treeData = transformItems(items);

    return { systemInfo, treeData };
}

/**
 * Recursively transform items to the required format
 */
function transformItems(items) {
    if (!items || !Array.isArray(items)) return [];

    return items.map(item => {
        const id = item.ID?.[0] || '';
        const name = item.Name?.[0] || '';
        const description = item.Description?.[0] || '';
        const children = item.Children?.[0]?.Item || [];

        return {
            id: id.replace(/[\s-]/g, '_'), // Normalize ID for internal use
            id_display: id, // Keep original for display
            name: name.trim(),
            description: description || `${name} classification item.`,
            children: transformItems(children)
        };
    });
}

/**
 * Count total items in the tree
 */
function countItems(items) {
    let count = items.length;
    for (const item of items) {
        if (item.children) {
            count += countItems(item.children);
        }
    }
    return count;
}

/**
 * Generate the complete HTML viewer
 */
function generateHTML(treeData, systemInfo, config) {
    const totalItems = countItems(treeData);
    const topLevelCount = treeData.length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title} | Takeoff and Estimating</title>
    <meta name="description" content="${config.description}">
    <meta name="keywords" content="${config.keywords}">
    <meta name="author" content="Takeoff and Estimating Pty Ltd">

    <meta property="og:type" content="website">
    <meta property="og:title" content="${config.title} | Takeoff and Estimating">
    <meta property="og:description" content="${config.description}">
    <meta property="og:url" content="https://takeoffandestimating.com.au">

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23ffc629' width='100' height='100' rx='12'/><text x='50' y='68' font-size='42' text-anchor='middle' fill='%23002d74' font-family='Arial' font-weight='bold'>T%26E</text></svg>">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand-navy: #002d74;
            --brand-navy-light: #003d8f;
            --brand-navy-dark: #001d4a;
            --brand-yellow: #ffc629;
            --brand-yellow-light: #fff3cc;
            --brand-yellow-dark: #e6b000;

            --bg-primary: #F8F9FA;
            --bg-secondary: #FFFFFF;
            --bg-card: #FFFFFF;
            --bg-hover: #F0F4F8;
            --bg-selected: #FFF8E0;
            --border-color: #E2E8F0;
            --text-primary: #002d74;
            --text-secondary: #4A5568;
            --text-muted: #718096;
            --accent-primary: #ffc629;
            --accent-secondary: #002d74;
            --accent-blue: #3B82F6;
            --accent-orange: #ea580c;
            --accent-green: #059669;
            --accent-purple: #7c3aed;
            --accent-cyan: #0891b2;
            --accent-pink: #db2777;
            --tree-line: #CBD5E0;
            --shadow: 0 2px 4px rgba(0, 45, 116, 0.08);
            --shadow-lg: 0 8px 24px rgba(0, 45, 116, 0.12);
        }

        [data-theme="dark"] {
            --bg-primary: #001d4a;
            --bg-secondary: #002d74;
            --bg-card: #002d74;
            --bg-hover: #003d8f;
            --bg-selected: #3D3500;
            --border-color: #003d8f;
            --text-primary: #F8F9FA;
            --text-secondary: #CBD5E0;
            --text-muted: #718096;
            --accent-primary: #ffc629;
            --accent-secondary: #ffc629;
            --tree-line: #003d8f;
            --shadow: 0 2px 4px rgba(0,0,0,0.3);
            --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
            transition: background 0.3s, color 0.3s;
        }

        .app-container { display: flex; height: 100vh; flex-direction: column; }
        .main-content { display: flex; flex: 1; overflow: hidden; }

        .yellow-stripe {
            height: 8px;
            background: repeating-linear-gradient(-55deg, var(--brand-yellow), var(--brand-yellow) 10px, transparent 10px, transparent 20px);
        }

        .app-header { background: var(--brand-navy); padding: 0; }

        .header-main {
            padding: 0.75rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-brand { display: flex; align-items: center; gap: 1.25rem; }

        .brand-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
        .brand-logo svg { height: 44px; width: auto; }

        .brand-divider { width: 2px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 1px; }

        .brand-title { display: flex; align-items: center; gap: 0.75rem; }
        .brand-title .app-name { color: white; font-size: 1.1rem; font-weight: 600; }
        .brand-title .highlight { color: var(--brand-yellow); font-style: italic; }

        .header-actions { display: flex; align-items: center; gap: 0.75rem; }

        .header-btn {
            background: transparent; border: 2px solid rgba(255,255,255,0.3);
            color: white; padding: 0.5rem 1rem; border-radius: 25px;
            font-family: inherit; font-size: 0.8rem; font-weight: 600;
            cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; gap: 0.4rem;
        }
        .header-btn:hover { background: var(--brand-yellow); color: var(--brand-navy); border-color: var(--brand-yellow); }

        .theme-toggle {
            display: flex; align-items: center;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 25px; padding: 0.15rem;
        }
        .theme-btn {
            width: 32px; height: 32px; border-radius: 50%; border: none;
            background: transparent; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.9rem; transition: all 0.2s;
        }
        .theme-btn.active { background: var(--brand-yellow); }

        .version-badge { background: var(--brand-yellow); color: var(--brand-navy); padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.65rem; font-weight: 700; }

        /* Sidebar */
        .sidebar {
            width: 520px;
            min-width: 380px;
            max-width: 65vw;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            resize: horizontal;
            overflow: auto;
            transition: background 0.3s, border-color 0.3s;
        }

        /* Search */
        .search-container { padding: 1rem; border-bottom: 1px solid var(--border-color); background: var(--bg-card); }
        .search-box { position: relative; }
        .search-box input {
            width: 100%; padding: 0.85rem 1rem 0.85rem 3rem;
            font-size: 0.9rem; font-family: inherit;
            background: var(--bg-primary); border: 2px solid var(--border-color);
            border-radius: 25px; color: var(--text-primary); transition: all 0.2s;
        }
        .search-box input:focus { outline: none; border-color: var(--brand-yellow); box-shadow: 0 0 0 4px rgba(255, 198, 41, 0.2); }
        .search-box input::placeholder { color: var(--text-muted); }
        .search-icon { position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px; }

        /* Tree controls */
        .tree-controls { padding: 0.6rem 1rem; display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); background: var(--bg-card); flex-wrap: wrap; }
        .tree-btn {
            padding: 0.45rem 0.85rem; font-family: inherit; font-size: 0.75rem; font-weight: 600;
            background: var(--bg-primary); border: 2px solid var(--border-color);
            border-radius: 20px; color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .tree-btn:hover { background: var(--brand-yellow); color: var(--brand-navy); border-color: var(--brand-yellow); }

        /* Tree container */
        .tree-container { flex: 1; overflow: auto; padding: 0.5rem 0; background: var(--bg-secondary); }

        /* Tree node styles */
        .tree-node { user-select: none; }
        .tree-node-content {
            display: flex; align-items: center; padding: 0.5rem 0.75rem 0.5rem 0;
            cursor: pointer; transition: background 0.1s;
            border-radius: 0 25px 25px 0; margin-right: 0.5rem;
        }
        .tree-node-content:hover { background: var(--bg-hover); }
        .tree-node-content.selected { background: var(--bg-selected); border-left: 4px solid var(--brand-yellow); margin-left: -4px; padding-left: 4px; }

        .tree-toggle { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.7rem; transition: transform 0.15s; flex-shrink: 0; }
        .tree-toggle.expanded { transform: rotate(90deg); }
        .tree-toggle.hidden { visibility: hidden; }

        .tree-label { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
        .tree-code { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 15px; white-space: nowrap; }
        .tree-name { font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .tree-children { display: none; margin-left: 0.75rem; border-left: 2px dashed var(--tree-line); }
        .tree-node.expanded > .tree-children { display: block; }

        /* Level-based coloring */
        .level-0 > .tree-node-content .tree-code { background: var(--brand-yellow); color: var(--brand-navy); }
        .level-1 > .tree-node-content .tree-code { background: rgba(0, 45, 116, 0.12); color: var(--brand-navy); }
        .level-2 > .tree-node-content .tree-code { background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); }
        .level-3 > .tree-node-content .tree-code { background: rgba(5, 150, 105, 0.12); color: var(--accent-green); }
        .level-4 > .tree-node-content .tree-code { background: rgba(124, 58, 237, 0.12); color: var(--accent-purple); }

        [data-theme="dark"] .level-0 > .tree-node-content .tree-code { background: var(--brand-yellow); color: var(--brand-navy); }
        [data-theme="dark"] .level-1 > .tree-node-content .tree-code { background: rgba(255, 198, 41, 0.2); color: var(--brand-yellow); }
        [data-theme="dark"] .level-2 > .tree-node-content .tree-code { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
        [data-theme="dark"] .level-3 > .tree-node-content .tree-code { background: rgba(16, 185, 129, 0.2); color: #34D399; }
        [data-theme="dark"] .level-4 > .tree-node-content .tree-code { background: rgba(167, 139, 250, 0.2); color: #A78BFA; }

        /* Detail panel */
        .detail-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg-primary); overflow: hidden; }
        .detail-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary); }

        .detail-breadcrumb { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; }
        .detail-breadcrumb span { cursor: pointer; padding: 0.2rem 0.45rem; border-radius: 12px; transition: all 0.15s; }
        .detail-breadcrumb span:hover { color: var(--brand-navy); background: var(--brand-yellow-light); }
        [data-theme="dark"] .detail-breadcrumb span:hover { color: var(--brand-navy); background: var(--brand-yellow); }
        .detail-breadcrumb .separator { color: var(--text-muted); cursor: default; padding: 0; }
        .detail-breadcrumb .separator:hover { color: var(--text-muted); background: transparent; }

        .detail-title { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .detail-code { font-family: 'JetBrains Mono', monospace; font-size: 1.75rem; font-weight: 700; color: var(--brand-navy); background: var(--brand-yellow); padding: 0.3rem 0.85rem; border-radius: 8px; }
        [data-theme="dark"] .detail-code { color: var(--brand-navy); background: var(--brand-yellow); }
        .detail-name { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); flex: 1; }

        .detail-content { flex: 1; overflow: auto; padding: 1.5rem 2rem; }

        /* Cards */
        .info-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow); }
        .info-card h3 {
            font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
            margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
            color: var(--brand-navy); position: relative; padding-bottom: 0.75rem;
        }
        [data-theme="dark"] .info-card h3 { color: var(--brand-yellow); }
        .info-card h3::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 4px; background: repeating-linear-gradient(-55deg, var(--brand-yellow), var(--brand-yellow) 4px, transparent 4px, transparent 8px); }
        .info-card h3 svg { width: 18px; height: 18px; }

        .description-text { font-size: 0.95rem; color: var(--text-primary); line-height: 1.75; }

        /* Stats */
        .stats-grid { display: flex; gap: 2.5rem; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--brand-navy); font-family: 'JetBrains Mono', monospace; }
        [data-theme="dark"] .stat-value { color: var(--brand-yellow); }

        /* Hierarchy */
        .hierarchy-path { display: flex; flex-direction: column; gap: 0.5rem; }
        .hierarchy-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.95rem; background: var(--bg-primary); border-radius: 12px; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
        .hierarchy-item:hover { background: var(--bg-hover); border-color: var(--brand-yellow); }
        .hierarchy-item.current { background: var(--bg-selected); border: 2px solid var(--brand-yellow); }
        .hierarchy-level { font-size: 0.65rem; color: var(--text-muted); background: var(--bg-hover); padding: 0.2rem 0.55rem; border-radius: 10px; min-width: 24px; text-align: center; font-weight: 700; }
        .hierarchy-code { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600; color: var(--brand-navy); }
        [data-theme="dark"] .hierarchy-code { color: var(--brand-yellow); }
        .hierarchy-name { font-size: 0.85rem; color: var(--text-primary); flex: 1; }

        /* Children grid */
        .children-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
        .child-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.85rem 1rem; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.15s; }
        .child-item:hover { background: var(--bg-hover); border-color: var(--brand-yellow); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .child-item .code { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; color: var(--brand-navy); background: var(--brand-yellow-light); padding: 0.3rem 0.65rem; border-radius: 12px; white-space: nowrap; }
        [data-theme="dark"] .child-item .code { background: rgba(255, 198, 41, 0.2); color: var(--brand-yellow); }
        .child-item .name { font-size: 0.85rem; color: var(--text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .child-item .count { font-size: 0.7rem; color: var(--text-muted); background: var(--bg-secondary); padding: 0.2rem 0.55rem; border-radius: 10px; font-weight: 600; }
        .child-item .arrow { color: var(--brand-yellow); font-size: 1rem; font-weight: bold; }

        /* Empty state */
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; padding: 2rem; }
        .empty-state-icon { font-size: 4rem; margin-bottom: 1rem; }
        .empty-state h3 { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .empty-state p { max-width: 320px; }

        /* Highlight */
        .highlight-text { background: rgba(255, 198, 41, 0.4); color: var(--text-primary); border-radius: 3px; padding: 0 3px; }
        .tree-node.search-hidden { display: none; }
        .tree-node.search-match > .tree-node-content { background: rgba(255, 198, 41, 0.15); }

        .no-children { color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 1rem; text-align: center; background: var(--bg-primary); border-radius: 12px; border: 2px dashed var(--border-color); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        /* Footer */
        .app-footer { background: var(--brand-navy); }
        .footer-content { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-brand { display: flex; align-items: center; gap: 1rem; }
        .footer-logo svg { height: 32px; width: auto; }
        .footer-text { color: rgba(255,255,255,0.7); font-size: 0.75rem; }
        .footer-text a { color: var(--brand-yellow); text-decoration: none; font-weight: 600; }
        .footer-text a:hover { text-decoration: underline; }
        .footer-contact { display: flex; align-items: center; gap: 1.5rem; }
        .footer-contact a { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s; font-weight: 500; }
        .footer-contact a:hover { color: var(--brand-yellow); }

        /* Responsive */
        @media (max-width: 900px) {
            .main-content { flex-direction: column; }
            .sidebar { width: 100%; min-width: 100%; max-width: 100%; height: 50vh; min-height: 280px; resize: vertical; }
            .detail-panel { height: 50vh; }
            .detail-header { padding: 1rem 1.25rem; }
            .detail-content { padding: 1rem 1.25rem; }
            .detail-code { font-size: 1.35rem; }
            .detail-name { font-size: 1.1rem; }
            .header-main { padding: 0.5rem 1rem; }
            .brand-title .app-name { font-size: 0.9rem; }
            .header-btn span.btn-text { display: none; }
            .footer-contact { display: none; }
            .brand-logo svg { height: 36px; }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="yellow-stripe"></div>
            <div class="header-main">
                <div class="header-brand">
                    <a href="https://takeoffandestimating.com.au" target="_blank" class="brand-logo">
                        <svg viewBox="0 0 1064 360" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <path d="M439.5479,112.5513H419.1466V101.3242h54.0795v11.2271H452.8248v57.1059H439.5479Z" style="fill: #ffc629"/>
                                <path d="M489.8217,101.3242h12.1042l24.9892,68.333H513.4439l-5.5631-15.1307h-24.014l-5.5645,15.1307H464.831Zm15.1307,42.2692-9.0793-25.9674h-.1945l-8.7869,25.9674Z" style="fill: #ffc629"/>
                                <path d="M532.1873,101.3242h13.2753v28.602h10.3483l16.4977-28.602h14.9347l-20.0109,34.0685,21.67,34.2645H573.6741L555.713,141.25h-10.25v28.4075H532.1873Z" style="fill: #ffc629"/>
                                <path d="M594.1734,101.3242h49.3951v11.2271h-36.12V129.83h33.2878v11.03H607.4487v17.5723h36.12v11.2256H594.1734Z" style="fill: #ffc629"/>
                                <path d="M650.7909,158.4316v-45.88l11.2271-11.2271H697.16l11.227,11.2271v45.88L697.16,169.6572H662.018Zm39.3406-.0979,4.9783-4.9783V117.626l-4.9783-4.9782H669.046l-4.9783,4.9782v35.7294l4.9783,4.9783Z" style="fill: #ffc629"/>
                                <path d="M718.5375,101.3242h48.4184v11.2271H731.8128v18.9378H762.27v11.2256H731.8128v26.9425H718.5375Z" style="fill: #ffc629"/>
                                <path d="M773.2032,101.3242h48.4185v11.2271H786.4785v18.9378h30.4573v11.2256H786.4785v26.9425H773.2032Z" style="fill: #ffc629"/>
                                <path d="M851.3916,159.2124V140.6649l6.0529-6.1509-3.2209-3.3188V111.867l10.4448-10.5428H890.83l10.2489,10.3484v7.2224h-12.885v-3.1228l-3.0264-3.1244H870.135l-3.0264,3.1244v11.3235l3.2208,3.3188h20.8912v-6.4432h12.4946v6.4432h6.4432v11.1291h-6.2473v17.5708l-10.4448,10.5428H861.8379Zm36.4122-.8787,3.2208-3.3189V141.5436H867.4989l-3.2208,3.2208v10.3484l3.2208,3.2209Z" style="fill: #ffc629"/>
                                <path d="M435.5019,187.9761h49.3947v11.2261H448.7779v17.2786h33.288v11.0309h-33.288v17.571h36.1187v11.2261H435.5019Z" style="fill: #ffffff"/>
                                <path d="M491.63,245.7662v-9.7618h13.0814v5.7593l3.2211,3.2217h20.2066l3.319-3.319v-11.324l-3.2211-3.2211H502.3679l-10.542-10.5433V198.5187l10.542-10.5426h30.8477l10.5432,10.5426v9.86H530.6774v-5.8572L527.4563,199.3H508.1284l-3.2223,3.2211v10.0549l3.2223,3.2211h25.868L544.54,226.34V245.571l-10.7378,10.7378H502.1733Z" style="fill: #ffffff"/>
                                <path d="M566.7961,199.2022H546.3937V187.9761h54.0807v11.2261H580.0721v57.1066h-13.276Z" style="fill: #ffffff"/>
                                <path d="M607.21,187.9761h13.276v68.3327H607.21Z" style="fill: #ffffff"/>
                                <path d="M632.1017,187.9761h12.2994L664.7056,232.1h.1958l20.4023-44.1237h12.2994v68.3327H684.8154V214.7233H684.62l-15.7163,32.0189h-8.2l-15.62-32.0189h-.1946v41.5855H632.1017Z" style="fill: #ffffff"/>
                                <path d="M727.8646,187.9761h12.1036l24.99,68.3327H751.4881l-5.5648-15.1307H721.91l-5.5647,15.1307H702.8741Zm15.13,42.269-9.0783-25.9665h-.1946l-8.7858,25.9665Z" style="fill: #ffffff"/>
                                <path d="M776.9656,199.2022H756.5633V187.9761H810.644v11.2261H790.2416v57.1066h-13.276Z" style="fill: #ffffff"/>
                                <path d="M817.3811,187.9761h13.2761v68.3327H817.3811Z" style="fill: #ffffff"/>
                                <path d="M842.2712,187.9761H854.18l30.4572,46.3688h.1946V187.9761H897.62v68.3327H885.7108l-30.4572-46.2709h-.1946v46.2709H842.2712Z" style="fill: #ffffff"/>
                                <path d="M907.7715,245.0827v-45.88l11.2261-11.2261h33.9709L964,199.007v10.4453H950.724v-5.5641L946.1359,199.3h-20.11l-4.9785,4.9785v35.7283l4.9785,4.9785h20.3045l4.7839-4.7833V229.5616H936.4713V218.2375H964v26.8452l-11.2261,11.2261H918.9976Z" style="fill: #ffffff"/>
                                <path d="M315.485,193.0132l-23.704.1032-5.2359.0229c-.3541.79-.6517,1.6205-1.045,2.3843q-.6682,1.2989-1.4266,2.5709c-.48.8081-.9914,1.6066-1.5239,2.3992-.0213.0313-.0392.0633-.0608.095a55.74,55.74,0,0,1-3.9215,5.1335l-.1594-.2727h0L262.4371,178.1c1.0158-.4766,1.9752-.9641,2.9444-1.45v0c1.2447-.6241,2.4461-1.257,3.6149-1.8961.0936-.0515.1888-.1022.2817-.1537,1.09-.6,2.1406-1.2079,3.163-1.8219q.2607-.1562.5181-.3133,1.4081-.858,2.7283-1.7333c.2491-.1652.4917-.3315.7359-.4979.7932-.5379,1.5661-1.08,2.31-1.6281.3145-.232.6158-.467.9217-.7012.651-.4964,1.2937-.995,1.9053-1.4994.381-.3157.7394-.6358,1.1054-.9544.5062-.44,1.0178-.8788,1.4944-1.3245.4694-.44.9036-.8866,1.3445-1.3321.3391-.3418.696-.68,1.0183-1.0257.7492-.8052,1.46-1.6181,2.1183-2.442.5738-.7181,1.099-1.4554,1.613-2.1976q.7149-1.0545,1.36-2.1371h0a37.4735,37.4735,0,0,0,5.2512-19.77q-.0735-16.8748-12.2336-27.0984a40.6949,40.6949,0,0,0-14.0233-7.6193L386.1141,100l.1424,32.668-71.0331.3095.1225,28.1248,54.8794-.2391.139,31.9108-51.2676.2234Zm.1484,34.0742-.1042-23.93a78.5587,78.5587,0,0,1-3.5153,7.3411,90.267,90.267,0,0,1-17.8583,22.6322l15.3683,26.5439,77.2845-.3368-.1418-32.56Z" style="fill: #ffffff"/>
                                <path d="M209.2593,133.1148l-22.6887.0988.2458,56.41a47.0561,47.0561,0,0,0-9.8769,28.9819q.0789,18.1,10.1325,29.6723l.052,11.93-40.781.1777L145.79,133.3913l-45.6487.1989L100,101.2467l135.6217-.5909a41.7323,41.7323,0,0,0-14.2679,8.2293A34.0777,34.0777,0,0,0,209.2593,133.1148Z" style="fill: #ffffff"/>
                                <path d="M232.8568,191.7506l20.7149,37.1217a42.8552,42.8552,0,0,1-11.0069,6.16,31.382,31.382,0,0,1-10.8081,2.1565,18.12,18.12,0,0,1-13.9258-5.8348,21.8571,21.8571,0,0,1-.61-28.339Q222.17,196.9894,232.8568,191.7506Zm15.7439-36.1988q9.9339-4.1539,14.3487-8.8247a15.0669,15.0669,0,0,0,4.3884-10.7284q-.0273-6.2739-3.6128-9.8822t-9.9676-3.58a13.9144,13.9144,0,0,0-9.9363,3.6131,12.2007,12.2007,0,0,0-3.7455,9.3193,24.1547,24.1547,0,0,0,2.15,9.4018A53.9972,53.9972,0,0,0,248.6007,155.5518Z" style="fill: #ffc629"/>
                                <path d="M266.9031,252.37q-3.4772,2.0363-6.8132,3.7947a53.2345,53.2345,0,0,1-8.7431,3.652c-.6616.21-1.3665.3763-2.0461.5686h22.104Z" style="fill: #ffffff"/>
                            </g>
                        </svg>
                    </a>
                    <div class="brand-divider"></div>
                    <div class="brand-title">
                        <span class="app-name"><span class="highlight">${config.title}</span></span>
                        <span class="version-badge">${config.version}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <div class="theme-toggle">
                        <button class="theme-btn active" id="lightBtn" title="Light Mode">☀️</button>
                        <button class="theme-btn" id="darkBtn" title="Dark Mode">🌙</button>
                    </div>
                </div>
            </div>
        </header>

        <div class="main-content">
            <aside class="sidebar">
                <div class="search-container">
                    <div class="search-box">
                        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                        <input type="text" id="searchInput" placeholder="Search codes or names... (Press /)">
                    </div>
                </div>
                <div class="tree-controls">
                    <button class="tree-btn" id="expandAll">Expand All</button>
                    <button class="tree-btn" id="collapseAll">Collapse All</button>
                    <button class="tree-btn" id="expandLevel1">Level 1</button>
                    <button class="tree-btn" id="expandLevel2">Level 2</button>
                </div>
                <div class="tree-container" id="treeContainer"></div>
            </aside>

            <main class="detail-panel">
                <div class="empty-state" id="emptyState">
                    <div class="empty-state-icon">${config.icon}</div>
                    <h3>Select an item</h3>
                    <p>Click on any item in the tree to view its description and details</p>
                    <p style="margin-top: 1rem; font-size: 0.85rem;">Press <kbd style="background: var(--brand-yellow); color: var(--brand-navy); padding: 0.25rem 0.6rem; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: bold; box-shadow: 0 2px 0 var(--brand-yellow-dark);">/</kbd> to search</p>
                </div>
                <div id="detailView" style="display: none;">
                    <div class="detail-header">
                        <div class="detail-breadcrumb" id="breadcrumb"></div>
                        <div class="detail-title">
                            <span class="detail-code" id="detailCode"></span>
                            <span class="detail-name" id="detailName"></span>
                        </div>
                    </div>
                    <div class="detail-content">
                        <div class="info-card description">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                                Description
                            </h3>
                            <p class="description-text" id="descriptionText"></p>
                        </div>

                        <div class="info-card stats">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M18 17V9"></path>
                                    <path d="M13 17V5"></path>
                                    <path d="M8 17v-3"></path>
                                </svg>
                                Statistics
                            </h3>
                            <div class="stats-grid">
                                <div class="stat">
                                    <span class="stat-label">Direct Children</span>
                                    <span class="stat-value" id="statChildren">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Total Descendants</span>
                                    <span class="stat-value" id="statDescendants">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Hierarchy Level</span>
                                    <span class="stat-value" id="statLevel">0</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-card hierarchy">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M7 16h6v-3H7zm0-5h10v-3H7z"></path>
                                </svg>
                                Hierarchy Path
                            </h3>
                            <div class="hierarchy-path" id="hierarchyPath"></div>
                        </div>

                        <div class="info-card children">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                                Child Items
                            </h3>
                            <div id="childrenContainer"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <footer class="app-footer">
            <div class="yellow-stripe"></div>
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="https://takeoffandestimating.com.au" target="_blank" class="footer-logo">
                        <svg viewBox="0 0 1064 360" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <path d="M439.5479,112.5513H419.1466V101.3242h54.0795v11.2271H452.8248v57.1059H439.5479Z" style="fill: #ffc629"/>
                                <path d="M489.8217,101.3242h12.1042l24.9892,68.333H513.4439l-5.5631-15.1307h-24.014l-5.5645,15.1307H464.831Zm15.1307,42.2692-9.0793-25.9674h-.1945l-8.7869,25.9674Z" style="fill: #ffc629"/>
                                <path d="M532.1873,101.3242h13.2753v28.602h10.3483l16.4977-28.602h14.9347l-20.0109,34.0685,21.67,34.2645H573.6741L555.713,141.25h-10.25v28.4075H532.1873Z" style="fill: #ffc629"/>
                                <path d="M594.1734,101.3242h49.3951v11.2271h-36.12V129.83h33.2878v11.03H607.4487v17.5723h36.12v11.2256H594.1734Z" style="fill: #ffc629"/>
                                <path d="M650.7909,158.4316v-45.88l11.2271-11.2271H697.16l11.227,11.2271v45.88L697.16,169.6572H662.018Zm39.3406-.0979,4.9783-4.9783V117.626l-4.9783-4.9782H669.046l-4.9783,4.9782v35.7294l4.9783,4.9783Z" style="fill: #ffc629"/>
                                <path d="M718.5375,101.3242h48.4184v11.2271H731.8128v18.9378H762.27v11.2256H731.8128v26.9425H718.5375Z" style="fill: #ffc629"/>
                                <path d="M773.2032,101.3242h48.4185v11.2271H786.4785v18.9378h30.4573v11.2256H786.4785v26.9425H773.2032Z" style="fill: #ffc629"/>
                                <path d="M851.3916,159.2124V140.6649l6.0529-6.1509-3.2209-3.3188V111.867l10.4448-10.5428H890.83l10.2489,10.3484v7.2224h-12.885v-3.1228l-3.0264-3.1244H870.135l-3.0264,3.1244v11.3235l3.2208,3.3188h20.8912v-6.4432h12.4946v6.4432h6.4432v11.1291h-6.2473v17.5708l-10.4448,10.5428H861.8379Zm36.4122-.8787,3.2208-3.3189V141.5436H867.4989l-3.2208,3.2208v10.3484l3.2208,3.2209Z" style="fill: #ffc629"/>
                                <path d="M435.5019,187.9761h49.3947v11.2261H448.7779v17.2786h33.288v11.0309h-33.288v17.571h36.1187v11.2261H435.5019Z" style="fill: #ffffff"/>
                                <path d="M491.63,245.7662v-9.7618h13.0814v5.7593l3.2211,3.2217h20.2066l3.319-3.319v-11.324l-3.2211-3.2211H502.3679l-10.542-10.5433V198.5187l10.542-10.5426h30.8477l10.5432,10.5426v9.86H530.6774v-5.8572L527.4563,199.3H508.1284l-3.2223,3.2211v10.0549l3.2223,3.2211h25.868L544.54,226.34V245.571l-10.7378,10.7378H502.1733Z" style="fill: #ffffff"/>
                                <path d="M566.7961,199.2022H546.3937V187.9761h54.0807v11.2261H580.0721v57.1066h-13.276Z" style="fill: #ffffff"/>
                                <path d="M607.21,187.9761h13.276v68.3327H607.21Z" style="fill: #ffffff"/>
                                <path d="M632.1017,187.9761h12.2994L664.7056,232.1h.1958l20.4023-44.1237h12.2994v68.3327H684.8154V214.7233H684.62l-15.7163,32.0189h-8.2l-15.62-32.0189h-.1946v41.5855H632.1017Z" style="fill: #ffffff"/>
                                <path d="M727.8646,187.9761h12.1036l24.99,68.3327H751.4881l-5.5648-15.1307H721.91l-5.5647,15.1307H702.8741Zm15.13,42.269-9.0783-25.9665h-.1946l-8.7858,25.9665Z" style="fill: #ffffff"/>
                                <path d="M776.9656,199.2022H756.5633V187.9761H810.644v11.2261H790.2416v57.1066h-13.276Z" style="fill: #ffffff"/>
                                <path d="M817.3811,187.9761h13.2761v68.3327H817.3811Z" style="fill: #ffffff"/>
                                <path d="M842.2712,187.9761H854.18l30.4572,46.3688h.1946V187.9761H897.62v68.3327H885.7108l-30.4572-46.2709h-.1946v46.2709H842.2712Z" style="fill: #ffffff"/>
                                <path d="M907.7715,245.0827v-45.88l11.2261-11.2261h33.9709L964,199.007v10.4453H950.724v-5.5641L946.1359,199.3h-20.11l-4.9785,4.9785v35.7283l4.9785,4.9785h20.3045l4.7839-4.7833V229.5616H936.4713V218.2375H964v26.8452l-11.2261,11.2261H918.9976Z" style="fill: #ffffff"/>
                                <path d="M315.485,193.0132l-23.704.1032-5.2359.0229c-.3541.79-.6517,1.6205-1.045,2.3843q-.6682,1.2989-1.4266,2.5709c-.48.8081-.9914,1.6066-1.5239,2.3992-.0213.0313-.0392.0633-.0608.095a55.74,55.74,0,0,1-3.9215,5.1335l-.1594-.2727h0L262.4371,178.1c1.0158-.4766,1.9752-.9641,2.9444-1.45v0c1.2447-.6241,2.4461-1.257,3.6149-1.8961.0936-.0515.1888-.1022.2817-.1537,1.09-.6,2.1406-1.2079,3.163-1.8219q.2607-.1562.5181-.3133,1.4081-.858,2.7283-1.7333c.2491-.1652.4917-.3315.7359-.4979.7932-.5379,1.5661-1.08,2.31-1.6281.3145-.232.6158-.467.9217-.7012.651-.4964,1.2937-.995,1.9053-1.4994.381-.3157.7394-.6358,1.1054-.9544.5062-.44,1.0178-.8788,1.4944-1.3245.4694-.44.9036-.8866,1.3445-1.3321.3391-.3418.696-.68,1.0183-1.0257.7492-.8052,1.46-1.6181,2.1183-2.442.5738-.7181,1.099-1.4554,1.613-2.1976q.7149-1.0545,1.36-2.1371h0a37.4735,37.4735,0,0,0,5.2512-19.77q-.0735-16.8748-12.2336-27.0984a40.6949,40.6949,0,0,0-14.0233-7.6193L386.1141,100l.1424,32.668-71.0331.3095.1225,28.1248,54.8794-.2391.139,31.9108-51.2676.2234Zm.1484,34.0742-.1042-23.93a78.5587,78.5587,0,0,1-3.5153,7.3411,90.267,90.267,0,0,1-17.8583,22.6322l15.3683,26.5439,77.2845-.3368-.1418-32.56Z" style="fill: #ffffff"/>
                                <path d="M209.2593,133.1148l-22.6887.0988.2458,56.41a47.0561,47.0561,0,0,0-9.8769,28.9819q.0789,18.1,10.1325,29.6723l.052,11.93-40.781.1777L145.79,133.3913l-45.6487.1989L100,101.2467l135.6217-.5909a41.7323,41.7323,0,0,0-14.2679,8.2293A34.0777,34.0777,0,0,0,209.2593,133.1148Z" style="fill: #ffffff"/>
                                <path d="M232.8568,191.7506l20.7149,37.1217a42.8552,42.8552,0,0,1-11.0069,6.16,31.382,31.382,0,0,1-10.8081,2.1565,18.12,18.12,0,0,1-13.9258-5.8348,21.8571,21.8571,0,0,1-.61-28.339Q222.17,196.9894,232.8568,191.7506Zm15.7439-36.1988q9.9339-4.1539,14.3487-8.8247a15.0669,15.0669,0,0,0,4.3884-10.7284q-.0273-6.2739-3.6128-9.8822t-9.9676-3.58a13.9144,13.9144,0,0,0-9.9363,3.6131,12.2007,12.2007,0,0,0-3.7455,9.3193,24.1547,24.1547,0,0,0,2.15,9.4018A53.9972,53.9972,0,0,0,248.6007,155.5518Z" style="fill: #ffc629"/>
                                <path d="M266.9031,252.37q-3.4772,2.0363-6.8132,3.7947a53.2345,53.2345,0,0,1-8.7431,3.652c-.6616.21-1.3665.3763-2.0461.5686h22.104Z" style="fill: #ffffff"/>
                            </g>
                        </svg>
                    </a>
                    <div class="footer-text">
                        <strong>${config.title}</strong> Reference Tool by <a href="https://takeoffandestimating.com.au" target="_blank">Takeoff and Estimating</a>
                    </div>
                </div>
                <div class="footer-contact">
                    <a href="tel:1300818620">📞 1300 818 620</a>
                    <a href="mailto:info@takeoffandestimating.com.au">✉️ info@takeoffandestimating.com.au</a>
                    <a href="https://takeoffandestimating.com.au" target="_blank">🌐 Website</a>
                </div>
            </div>
        </footer>
    </div>

    <script>
        // Classification Tree Data
        const treeData = ${JSON.stringify(treeData, null, 2)};

        // Build lookup maps for fast access
        const nodeMap = new Map();
        const parentMap = new Map();
        let selectedNode = null;

        function buildMaps(nodes, parent = null) {
            nodes.forEach(node => {
                nodeMap.set(node.id, node);
                if (parent) parentMap.set(node.id, parent.id);
                if (node.children && node.children.length > 0) {
                    buildMaps(node.children, node);
                }
            });
        }
        buildMaps(treeData);

        // Render tree
        function renderTree(nodes, container, level = 0) {
            nodes.forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = \`tree-node level-\${level}\`;
                nodeEl.dataset.id = node.id;
                nodeEl.dataset.level = level;

                const hasChildren = node.children && node.children.length > 0;

                nodeEl.innerHTML = \`
                    <div class="tree-node-content">
                        <span class="tree-toggle \${hasChildren ? '' : 'hidden'}">▶</span>
                        <div class="tree-label">
                            <span class="tree-code">\${node.id_display}</span>
                            <span class="tree-name">\${node.name}</span>
                        </div>
                    </div>
                    <div class="tree-children"></div>
                \`;

                const content = nodeEl.querySelector('.tree-node-content');
                const toggle = nodeEl.querySelector('.tree-toggle');

                content.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                });

                if (hasChildren) {
                    toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleNode(nodeEl);
                    });
                    renderTree(node.children, nodeEl.querySelector('.tree-children'), level + 1);
                }

                container.appendChild(nodeEl);
            });
        }

        function toggleNode(nodeEl, expand = null) {
            const shouldExpand = expand !== null ? expand : !nodeEl.classList.contains('expanded');
            nodeEl.classList.toggle('expanded', shouldExpand);
            const toggle = nodeEl.querySelector(':scope > .tree-node-content .tree-toggle');
            if (toggle) toggle.classList.toggle('expanded', shouldExpand);
        }

        function selectNode(nodeId) {
            document.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected'));

            const nodeEl = document.querySelector(\`.tree-node[data-id="\${nodeId}"]\`);
            if (nodeEl) {
                nodeEl.querySelector('.tree-node-content').classList.add('selected');

                // Expand parents
                let parent = nodeEl.parentElement;
                while (parent && parent.classList) {
                    if (parent.classList.contains('tree-node')) {
                        toggleNode(parent, true);
                    }
                    parent = parent.parentElement;
                }

                nodeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            selectedNode = nodeId;
            showDetail(nodeId);
        }

        function showDetail(nodeId) {
            const node = nodeMap.get(nodeId);
            if (!node) return;

            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('detailView').style.display = 'block';

            document.getElementById('detailCode').textContent = node.id_display;
            document.getElementById('detailName').textContent = node.name;
            document.getElementById('descriptionText').textContent = node.description || 'No description available.';

            // Stats
            document.getElementById('statChildren').textContent = node.children ? node.children.length : 0;
            document.getElementById('statDescendants').textContent = countDescendants(node);
            document.getElementById('statLevel').textContent = getPath(nodeId).length;

            // Breadcrumb
            const path = getPath(nodeId);
            const breadcrumb = document.getElementById('breadcrumb');
            breadcrumb.innerHTML = path.map((id, i) => {
                const n = nodeMap.get(id);
                return \`<span onclick="selectNode('\${id}')">\${n.id_display}</span>\${i < path.length - 1 ? '<span class="separator">›</span>' : ''}\`;
            }).join('');

            // Hierarchy
            const hierarchyPath = document.getElementById('hierarchyPath');
            hierarchyPath.innerHTML = path.map((id, i) => {
                const n = nodeMap.get(id);
                return \`
                    <div class="hierarchy-item \${id === nodeId ? 'current' : ''}" onclick="selectNode('\${id}')">
                        <span class="hierarchy-level">L\${i + 1}</span>
                        <span class="hierarchy-code">\${n.id_display}</span>
                        <span class="hierarchy-name">\${n.name}</span>
                    </div>
                \`;
            }).join('');

            // Children
            const childrenContainer = document.getElementById('childrenContainer');
            if (node.children && node.children.length > 0) {
                childrenContainer.innerHTML = \`
                    <div class="children-grid">
                        \${node.children.map(child => \`
                            <div class="child-item" onclick="selectNode('\${child.id}')">
                                <span class="code">\${child.id_display}</span>
                                <span class="name">\${child.name}</span>
                                \${child.children && child.children.length > 0 ? \`<span class="count">\${child.children.length}</span>\` : ''}
                                <span class="arrow">→</span>
                            </div>
                        \`).join('')}
                    </div>
                \`;
            } else {
                childrenContainer.innerHTML = '<div class="no-children">No child items</div>';
            }
        }

        function getPath(nodeId) {
            const path = [nodeId];
            let current = nodeId;
            while (parentMap.has(current)) {
                current = parentMap.get(current);
                path.unshift(current);
            }
            return path;
        }

        function countDescendants(node) {
            if (!node.children || node.children.length === 0) return 0;
            return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => search(searchInput.value), 200);
        });

        function search(term) {
            const lowerTerm = term.toLowerCase().trim();

            document.querySelectorAll('.tree-node').forEach(node => {
                node.classList.remove('search-hidden', 'search-match');
            });

            document.querySelectorAll('.highlight-text').forEach(el => {
                el.outerHTML = el.textContent;
            });

            if (!lowerTerm) return;

            const matchingIds = new Set();

            nodeMap.forEach((node, id) => {
                if (node.id_display.toLowerCase().includes(lowerTerm) ||
                    node.name.toLowerCase().includes(lowerTerm)) {
                    matchingIds.add(id);
                    let current = id;
                    while (parentMap.has(current)) {
                        current = parentMap.get(current);
                        matchingIds.add(current);
                    }
                }
            });

            document.querySelectorAll('.tree-node').forEach(nodeEl => {
                const nodeId = nodeEl.dataset.id;
                if (!matchingIds.has(nodeId)) {
                    nodeEl.classList.add('search-hidden');
                } else {
                    const node = nodeMap.get(nodeId);
                    if (node.id_display.toLowerCase().includes(lowerTerm) ||
                        node.name.toLowerCase().includes(lowerTerm)) {
                        nodeEl.classList.add('search-match');
                        toggleNode(nodeEl, true);
                    }
                }
            });
        }

        // Controls
        document.getElementById('expandAll').addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(n => toggleNode(n, true));
        });

        document.getElementById('collapseAll').addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(n => toggleNode(n, false));
        });

        document.getElementById('expandLevel1').addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(n => {
                toggleNode(n, parseInt(n.dataset.level) < 1);
            });
        });

        document.getElementById('expandLevel2').addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(n => {
                toggleNode(n, parseInt(n.dataset.level) < 2);
            });
        });

        // Theme
        const lightBtn = document.getElementById('lightBtn');
        const darkBtn = document.getElementById('darkBtn');

        function setTheme(theme) {
            document.body.dataset.theme = theme;
            lightBtn.classList.toggle('active', theme !== 'dark');
            darkBtn.classList.toggle('active', theme === 'dark');
            localStorage.setItem('theme', theme);
        }

        lightBtn.addEventListener('click', () => setTheme('light'));
        darkBtn.addEventListener('click', () => setTheme('dark'));

        // Init
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        const treeContainer = document.getElementById('treeContainer');
        renderTree(treeData, treeContainer);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape') {
                searchInput.value = '';
                search('');
                searchInput.blur();
            }
        });
    </script>
</body>
</html>`;
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: node generate-classification-viewer.js <input-json> <output-folder> <system-key>');
        console.log('');
        console.log('System keys: uniclass, omniclass, uniformat, nbs');
        console.log('');
        console.log('Example:');
        console.log('  node generate-classification-viewer.js "O:\\Classification Systems\\Uniclass2015_jan2020.json" "C:\\Dev\\uniclass" uniclass');
        process.exit(1);
    }

    const [inputFile, outputFolder, systemKey] = args;
    const config = systemConfigs[systemKey.toLowerCase()];

    if (!config) {
        console.error(`Unknown system key: ${systemKey}`);
        console.log('Valid keys:', Object.keys(systemConfigs).join(', '));
        process.exit(1);
    }

    console.log(`Reading: ${inputFile}`);
    const sourceData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    console.log('Transforming data...');
    const { systemInfo, treeData } = transformData(sourceData);

    const totalItems = countItems(treeData);
    console.log(`Found ${treeData.length} top-level items, ${totalItems} total items`);

    // Create output folder
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    console.log('Generating HTML...');
    const html = generateHTML(treeData, systemInfo, config);

    const outputPath = path.join(outputFolder, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   Title: ${config.title} ${config.version}`);
    console.log(`   Items: ${totalItems}`);
}

main();
