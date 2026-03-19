// MedicalPKM Cloudflare Worker
// Built: 2026-02-22T11:29:32.427728
// Routes: 5 (including default)
// Total HTML: 248,771 bytes

export default {
  fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    let responseHTML;

    if (pathname.startsWith('/sandbox/fountain-pen')) {
      responseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fountain Pen Companion - MedicalPKM</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1a1a2e;
            color: #e8e8e8;
        }

        #app {
            display: flex;
            height: 100vh;
            flex-direction: column;
        }

        /* Header */
        header {
            background-color: #16213e;
            border-bottom: 2px solid rgba(226, 183, 20, 0.2);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        header h1 {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        /* Main container */
        .main-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Sidebar */
        sidebar {
            width: 250px;
            background-color: #16213e;
            border-right: 2px solid rgba(226, 183, 20, 0.2);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            overflow-y: auto;
        }

        .nav-tab {
            padding: 0.75rem 1rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 2px solid transparent;
            border-radius: 0.5rem;
            color: #e8e8e8;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .nav-tab:hover {
            background-color: rgba(226, 183, 20, 0.15);
            border-color: rgba(226, 183, 20, 0.3);
        }

        .nav-tab.active {
            background-color: rgba(226, 183, 20, 0.25);
            border-color: #e2b714;
            color: #e2b714;
        }

        /* Content area */
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
            display: none;
        }

        .content.active {
            display: block;
        }

        /* Cards and sections */
        .card {
            background-color: #16213e;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
        }

        .card:hover {
            border-color: rgba(226, 183, 20, 0.4);
            box-shadow: 0 0 20px rgba(226, 183, 20, 0.1);
        }

        .card-title {
            font-size: 1.25rem;
            color: #e2b714;
            margin-bottom: 1rem;
            font-weight: 600;
        }

        /* Stats grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: linear-gradient(135deg, #16213e 0%, #0f1927 100%);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            padding: 1.5rem;
            text-align: center;
        }

        .stat-value {
            font-size: 2.5rem;
            color: #e2b714;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #a0a0a0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background-color: #e2b714;
            color: #1a1a2e;
        }

        .btn-primary:hover {
            background-color: #f0c420;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(226, 183, 20, 0.3);
        }

        .btn-secondary {
            background-color: rgba(226, 183, 20, 0.2);
            color: #e2b714;
            border: 1px solid rgba(226, 183, 20, 0.4);
        }

        .btn-secondary:hover {
            background-color: rgba(226, 183, 20, 0.35);
            border-color: rgba(226, 183, 20, 0.6);
        }

        .btn-danger {
            background-color: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background-color: #dc2626;
        }

        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }

        /* Forms */
        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e2b714;
            font-weight: 500;
            font-size: 0.95rem;
        }

        input[type="text"],
        input[type="email"],
        input[type="number"],
        input[type="date"],
        input[type="url"],
        select,
        textarea {
            width: 100%;
            padding: 0.75rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            color: #e8e8e8;
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="number"]:focus,
        input[type="date"]:focus,
        input[type="url"]:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #e2b714;
            background-color: rgba(226, 183, 20, 0.1);
            box-shadow: 0 0 0 3px rgba(226, 183, 20, 0.1);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
        }

        /* Form layouts */
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(226, 183, 20, 0.2);
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background-color: #16213e;
            border: 2px solid rgba(226, 183, 20, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.2);
        }

        .modal-title {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        .modal-close {
            background: none;
            border: none;
            color: #e8e8e8;
            font-size: 1.5rem;
            cursor: pointer;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            color: #e2b714;
            transform: scale(1.1);
        }

        /* Tables */
        .table-container {
            overflow-x: auto;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
        }

        thead {
            background-color: rgba(226, 183, 20, 0.1);
            border-bottom: 2px solid rgba(226, 183, 20, 0.2);
        }

        th {
            padding: 1rem;
            text-align: left;
            color: #e2b714;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.15);
            color: #e8e8e8;
        }

        tbody tr {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        tbody tr:hover {
            background-color: rgba(226, 183, 20, 0.1);
            border-left: 3px solid #e2b714;
            padding-left: 0.75rem;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 0.35rem;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge-wishlist {
            background-color: rgba(107, 114, 128, 0.2);
            color: #9ca3af;
        }

        .badge-ordered {
            background-color: rgba(234, 179, 8, 0.2);
            color: #eab308;
        }

        .badge-in-collection {
            background-color: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .badge-inked {
            background-color: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }

        .badge-sold {
            background-color: rgba(249, 115, 22, 0.2);
            color: #f97316;
        }

        .badge-lost {
            background-color: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        /* Controls row */
        .controls-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-group {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .filter-group select {
            width: auto;
            min-width: 150px;
        }

        .search-box {
            flex: 1;
            min-width: 200px;
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #a0a0a0;
        }

        .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state-text {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        /* Rating stars */
        .stars {
            display: flex;
            gap: 0.5rem;
            cursor: pointer;
            font-size: 1.5rem;
        }

        .star {
            cursor: pointer;
            color: #6b7280;
            transition: all 0.3s ease;
        }

        .star:hover,
        .star.filled {
            color: #e2b714;
            transform: scale(1.2);
        }

        /* Radio and toggle buttons */
        .radio-group,
        .toggle-group {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .radio-option,
        .toggle-option {
            padding: 0.5rem 1rem;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            cursor: pointer;
            background-color: rgba(226, 183, 20, 0.05);
            color: #e8e8e8;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .radio-option.selected,
        .toggle-option.selected {
            background-color: #e2b714;
            color: #1a1a2e;
            border-color: #e2b714;
            font-weight: 600;
        }

        .radio-option:hover,
        .toggle-option:hover {
            border-color: rgba(226, 183, 20, 0.4);
            background-color: rgba(226, 183, 20, 0.15);
        }

        /* ComboBox styling */
        .combobox-container {
            position: relative;
        }

        .combobox-input {
            width: 100%;
            padding: 0.75rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            color: #e8e8e8;
            font-size: 1rem;
            cursor: pointer;
        }

        .combobox-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #16213e;
            border: 1px solid rgba(226, 183, 20, 0.3);
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            max-height: 200px;
            overflow-y: auto;
            z-index: 10;
            margin-top: -0.5rem;
            padding: 0.5rem 0;
        }

        .combobox-dropdown.active {
            display: block;
        }

        .combobox-option {
            padding: 0.75rem 1rem;
            cursor: pointer;
            color: #e8e8e8;
            transition: all 0.2s ease;
        }

        .combobox-option:hover {
            background-color: rgba(226, 183, 20, 0.15);
            color: #e2b714;
        }

        /* Detail view */
        .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.2);
        }

        .detail-title {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        .detail-actions {
            display: flex;
            gap: 1rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .detail-group {
            padding: 1.5rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.15);
            border-radius: 0.75rem;
        }

        .detail-label {
            font-size: 0.85rem;
            color: #a0a0a0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
            display: block;
        }

        .detail-value {
            font-size: 1.1rem;
            color: #e8e8e8;
            word-break: break-word;
        }

        .detail-value.link {
            color: #e2b714;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .detail-value.link:hover {
            text-decoration: underline;
        }

        /* Back button */
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            color: #e2b714;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateX(-4px);
        }

        /* Utility classes */
        .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .mt-1 {
            margin-top: 1rem;
        }

        .mt-2 {
            margin-top: 2rem;
        }

        .mb-1 {
            margin-bottom: 1rem;
        }

        .mb-2 {
            margin-bottom: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
            }

            sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 2px solid rgba(226, 183, 20, 0.2);
                padding: 0.5rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                height: auto;
            }

            .content {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .filter-group {
                width: 100%;
            }

            .filter-group select {
                flex: 1;
                min-width: 120px;
            }

            .modal-content {
                width: 95%;
            }
        }

        @media (max-width: 480px) {
            header h1 {
                font-size: 1.25rem;
            }

            .btn {
                padding: 0.6rem 1rem;
                font-size: 0.9rem;
            }

            .card {
                padding: 1rem;
            }

            table {
                font-size: 0.85rem;
            }

            th, td {
                padding: 0.75rem;
            }

            .detail-grid {
                gap: 1rem;
            }

            .detail-group {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <nav style="background:#1e293b;height:40px;display:flex;align-items:center;padding:0 1.5rem;">
        <div style="max-width:1120px;width:100%;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
            <a href="https://medicalpkm.com" style="display:flex;align-items:center;gap:6px;color:white;text-decoration:none;font-weight:600;font-size:0.875rem;">
                <span style="color:#f59e0b;font-weight:700;">&#9672;</span>
                <span>MedicalPKM</span>
                <span style="color:#64748b;margin:0 4px;">/</span>
                <span style="color:#cbd5e1;font-size:0.875rem;font-weight:500;">Fountain Pen</span>
            </a>
            <div style="display:flex;align-items:center;gap:4px;">
                <a href="https://kol.medicalpkm.com" style="color:#94a3b8;text-decoration:none;font-size:0.8125rem;font-weight:500;padding:4px 8px;border-radius:6px;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#94a3b8';this.style.background='none'">KOL Briefs</a>
                <a href="https://coc.medicalpkm.com" style="color:#94a3b8;text-decoration:none;font-size:0.8125rem;font-weight:500;padding:4px 8px;border-radius:6px;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#94a3b8';this.style.background='none'">Cthulhu Investigator</a>
            </div>
        </div>
    </nav>
    <div id="app">
        <header>
            <span style="font-size: 1.8rem;">✒️</span>
            <h1>Fountain Pen Companion</h1>
        </header>

        <div class="main-container">
            <sidebar>
                <button class="nav-tab active" data-tab="dashboard">📊 Dashboard</button>
                <button class="nav-tab" data-tab="pens">🖊️ Pens</button>
                <button class="nav-tab" data-tab="inks">🎨 Inks</button>
                <button class="nav-tab" data-tab="pairings">💫 Pairings</button>
                <button class="nav-tab" data-tab="value">💰 Value</button>
                <button class="nav-tab" data-tab="settings">⚙️ Settings</button>
            </sidebar>

            <!-- Dashboard Tab -->
            <div id="dashboard" class="content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="stat-pens">0</div>
                        <div class="stat-label">Total Pens</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-inks">0</div>
                        <div class="stat-label">Total Inks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-pairings">0</div>
                        <div class="stat-label">Active Pairings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-investment" style="font-size: 1.8rem;">-</div>
                        <div class="stat-label">Total Investment</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Quick Add</div>
                    <div class="controls-row">
                        <button class="btn btn-primary" onclick="app.openPenModal()">
                            <span>➕</span> Add Pen
                        </button>
                        <button class="btn btn-primary" onclick="app.openInkModal()">
                            <span>➕</span> Add Ink
                        </button>
                        <button class="btn btn-primary" onclick="app.openPairingModal()">
                            <span>➕</span> Add Pairing
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Recent Additions</div>
                    <div id="recent-list"></div>
                </div>
            </div>

            <!-- Pens Tab -->
            <div id="pens" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Pens</h2>
                    <button class="btn btn-primary" onclick="app.openPenModal()">
                        <span>➕</span> Add Pen
                    </button>
                </div>

                <div class="card">
                    <div class="controls-row">
                        <input type="text" id="pens-search" class="search-box" placeholder="Search pens...">
                        <div class="filter-group">
                            <select id="pens-filter-brand">
                                <option value="">All Brands</option>
                            </select>
                            <select id="pens-filter-status">
                                <option value="">All Status</option>
                                <option value="Wishlist">Wishlist</option>
                                <option value="Ordered">Ordered</option>
                                <option value="In Collection">In Collection</option>
                                <option value="Inked">Inked</option>
                                <option value="Sold">Sold</option>
                                <option value="Lost">Lost</option>
                            </select>
                            <select id="pens-filter-nib">
                                <option value="">All Nib Sizes</option>
                            </select>
                            <select id="pens-filter-filling">
                                <option value="">All Filling Systems</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="pens-table">
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Line</th>
                                    <th>Model</th>
                                    <th>Nib</th>
                                    <th>Filling System</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="pens-tbody"></tbody>
                        </table>
                    </div>
                    <div id="pens-empty" class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">No pens yet. Add your first pen to get started!</div>
                        <button class="btn btn-primary" onclick="app.openPenModal()">Add Pen</button>
                    </div>
                </div>
            </div>

            <!-- Inks Tab -->
            <div id="inks" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Inks</h2>
                    <button class="btn btn-primary" onclick="app.openInkModal()">
                        <span>➕</span> Add Ink
                    </button>
                </div>

                <div class="card">
                    <div class="controls-row">
                        <input type="text" id="inks-search" class="search-box" placeholder="Search inks...">
                        <div class="filter-group">
                            <select id="inks-filter-brand">
                                <option value="">All Brands</option>
                            </select>
                            <select id="inks-filter-color">
                                <option value="">All Colors</option>
                            </select>
                            <select id="inks-filter-properties">
                                <option value="">All Properties</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="inks-table">
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Name</th>
                                    <th>Color Family</th>
                                    <th>Volume</th>
                                    <th>Properties</th>
                                </tr>
                            </thead>
                            <tbody id="inks-tbody"></tbody>
                        </table>
                    </div>
                    <div id="inks-empty" class="empty-state">
                        <div class="empty-state-icon">🎨</div>
                        <div class="empty-state-text">No inks yet. Add your first ink to get started!</div>
                        <button class="btn btn-primary" onclick="app.openInkModal()">Add Ink</button>
                    </div>
                </div>
            </div>

            <!-- Pairings Tab -->
            <div id="pairings" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Pairings</h2>
                    <button class="btn btn-primary" onclick="app.openPairingModal()">
                        <span>➕</span> Add Pairing
                    </button>
                </div>

                <div class="card">
                    <input type="text" id="pairings-search" class="search-box" placeholder="Search pairings...">
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="pairings-table">
                            <thead>
                                <tr>
                                    <th>Pen</th>
                                    <th>Ink</th>
                                    <th>Rating</th>
                                    <th>Flow</th>
                                </tr>
                            </thead>
                            <tbody id="pairings-tbody"></tbody>
                        </table>
                    </div>
                    <div id="pairings-empty" class="empty-state">
                        <div class="empty-state-icon">💫</div>
                        <div class="empty-state-text">No pairings yet. Create your first pairing!</div>
                        <button class="btn btn-primary" onclick="app.openPairingModal()">Add Pairing</button>
                    </div>
                </div>
            </div>

            <!-- Value Tab -->
            <div id="value" class="content">
                <h2 style="font-size: 1.5rem; color: #e2b714; margin-bottom: 1.5rem;">Collection Value</h2>

                <div class="stats-grid" id="value-stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="value-total-usd" style="font-size: 1.8rem;">$0</div>
                        <div class="stat-label">Total (USD)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-total-eur" style="font-size: 1.8rem;">\u20AC0</div>
                        <div class="stat-label">Total (EUR)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-avg" style="font-size: 1.8rem;">-</div>
                        <div class="stat-label">Avg. Pen Price</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-most-expensive" style="font-size: 1.4rem;">-</div>
                        <div class="stat-label">Most Expensive</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Investment by Brand</div>
                    <div id="value-brand-breakdown"></div>
                </div>

                <div class="card">
                    <div class="card-title">All Pens by Price (Highest First)</div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pen</th>
                                    <th>Nib</th>
                                    <th style="text-align: right;">Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="value-price-list"></tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Spending Timeline</div>
                    <div id="value-timeline"></div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div id="settings" class="content">
                <h2 style="font-size: 1.5rem; color: #e2b714; margin-bottom: 1.5rem;">Settings</h2>

                <div class="card">
                    <div class="card-title">Data Management</div>
                    <div class="form-group">
                        <label>Export Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Download all your pens, inks, and pairings as a JSON file for backup.
                        </p>
                        <button class="btn btn-secondary" onclick="app.exportData()">
                            <span>⬇️</span> Export as JSON
                        </button>
                    </div>

                    <div class="form-group mt-2">
                        <label>Import Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Upload a JSON file to restore your data. This will merge with existing data.
                        </p>
                        <input type="file" id="import-file" accept=".json" style="margin-bottom: 1rem;">
                        <button class="btn btn-secondary" onclick="app.importData()">
                            <span>⬆️</span> Import from JSON
                        </button>
                    </div>

                    <div class="form-group mt-2">
                        <label>Restore from Backup</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Restore your collection from the latest auto-backup snapshot.
                        </p>
                        <button class="btn btn-secondary" onclick="app.restoreFromBackup()">
                            <span>🔄</span> Restore Latest Backup
                        </button>
                        <p id="backup-info" style="color: #a0a0a0; margin-top: 0.5rem; font-size: 0.85rem;"></p>
                    </div>

                    <div class="form-group mt-2">
                        <label>Clear All Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Permanently delete all pens, inks, and pairings. This action cannot be undone.
                        </p>
                        <button class="btn btn-danger" onclick="app.confirmClearAll()">
                            <span>🗑️</span> Clear All Data
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Information</div>
                    <p style="color: #a0a0a0; font-size: 0.95rem;">
                        <strong style="color: #e2b714;">Fountain Pen Companion</strong> is a MedicalPKM application for managing your fountain pen collection.
                    </p>
                    <p style="color: #a0a0a0; font-size: 0.95rem; margin-top: 1rem;">
                        All data is stored locally in your browser. No data is sent to any server.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->

    <!-- Pen Modal -->
    <div id="pen-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="pen-modal-title">Add Pen</div>
                <button class="modal-close" onclick="app.closePenModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-brand">Brand</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-brand" class="combobox-input" placeholder="Select or type brand...">
                        <div id="pen-brand-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="pen-line">Line</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-line" class="combobox-input" placeholder="Select or type line...">
                        <div id="pen-line-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-model">Model</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-model" class="combobox-input" placeholder="Select or type model...">
                        <div id="pen-model-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-nib-size">Nib Size</label>
                    <select id="pen-nib-size">
                        <option value="">Select nib size...</option>
                        <option value="EF">EF (Extra Fine)</option>
                        <option value="F">F (Fine)</option>
                        <option value="M">M (Medium)</option>
                        <option value="B">B (Broad)</option>
                        <option value="BB">BB (Double Broad)</option>
                        <option value="Stub 1.1">Stub 1.1</option>
                        <option value="Stub 1.5">Stub 1.5</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-nib-material">Nib Material</label>
                    <select id="pen-nib-material">
                        <option value="">Select material...</option>
                        <option value="Steel">Steel</option>
                        <option value="Gold 14k">Gold 14k</option>
                        <option value="Gold 18k">Gold 18k</option>
                        <option value="Gold 21k">Gold 21k</option>
                        <option value="Titanium">Titanium</option>
                        <option value="Palladium">Palladium</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-nib-grind">Nib Grind</label>
                    <select id="pen-nib-grind">
                        <option value="">Select grind...</option>
                        <option value="Standard">Standard</option>
                        <option value="CI">CI (Cursive Italic)</option>
                        <option value="Architect">Architect</option>
                        <option value="Stub">Stub</option>
                        <option value="Zoom">Zoom</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-filling">Filling System</label>
                    <select id="pen-filling">
                        <option value="">Select filling system...</option>
                        <option value="Cartridge">Cartridge</option>
                        <option value="Converter">Converter</option>
                        <option value="Piston">Piston</option>
                        <option value="Vacuum">Vacuum</option>
                        <option value="Eyedropper">Eyedropper</option>
                        <option value="Lever">Lever</option>
                        <option value="Plunger">Plunger</option>
                        <option value="Pneumatic">Pneumatic</option>
                        <option value="Bulb">Bulb</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-price">Purchase Price</label>
                    <input type="number" id="pen-price" placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="pen-currency">Currency</label>
                    <select id="pen-currency">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BRL">BRL</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-status">Status</label>
                    <select id="pen-status">
                        <option value="Wishlist">Wishlist</option>
                        <option value="Ordered">Ordered</option>
                        <option value="In Collection">In Collection</option>
                        <option value="Inked">Inked</option>
                        <option value="Sold">Sold</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-date">Date of Purchase</label>
                    <input type="date" id="pen-date">
                </div>
            </div>

            <div class="form-group">
                <label for="pen-notes">Notes</label>
                <textarea id="pen-notes" placeholder="Add any notes about this pen..."></textarea>
            </div>

            <div class="form-group">
                <label for="pen-url">Store/Website URL</label>
                <input type="url" id="pen-url" placeholder="https://...">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closePenModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.savePen()">Save Pen</button>
            </div>
        </div>
    </div>

    <!-- Ink Modal -->
    <div id="ink-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="ink-modal-title">Add Ink</div>
                <button class="modal-close" onclick="app.closeInkModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-brand">Brand</label>
                    <div class="combobox-container">
                        <input type="text" id="ink-brand" class="combobox-input" placeholder="Select or type brand...">
                        <div id="ink-brand-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ink-name">Name</label>
                    <input type="text" id="ink-name" placeholder="Ink name">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-color">Color Family</label>
                    <select id="ink-color">
                        <option value="">Select color...</option>
                        <option value="Blue">Blue</option>
                        <option value="Blue-Black">Blue-Black</option>
                        <option value="Black">Black</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Purple">Purple</option>
                        <option value="Brown">Brown</option>
                        <option value="Orange">Orange</option>
                        <option value="Yellow">Yellow</option>
                        <option value="Pink">Pink</option>
                        <option value="Turquoise">Turquoise</option>
                        <option value="Grey">Grey</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ink-volume">Volume</label>
                    <input type="text" id="ink-volume" placeholder="e.g., 50ml">
                </div>
            </div>

            <div class="form-group">
                <label>Properties</label>
                <div class="toggle-group">
                    <button class="toggle-option" data-property="Waterproof" onclick="app.toggleInkProperty(this, 'Waterproof')">Waterproof</button>
                    <button class="toggle-option" data-property="Water Resistant" onclick="app.toggleInkProperty(this, 'Water Resistant')">Water Resistant</button>
                    <button class="toggle-option" data-property="Bulletproof" onclick="app.toggleInkProperty(this, 'Bulletproof')">Bulletproof</button>
                    <button class="toggle-option" data-property="Shimmer" onclick="app.toggleInkProperty(this, 'Shimmer')">Shimmer</button>
                    <button class="toggle-option" data-property="Sheen" onclick="app.toggleInkProperty(this, 'Sheen')">Sheen</button>
                    <button class="toggle-option" data-property="Shading" onclick="app.toggleInkProperty(this, 'Shading')">Shading</button>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-price">Purchase Price</label>
                    <input type="number" id="ink-price" placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="ink-currency">Currency</label>
                    <select id="ink-currency">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BRL">BRL</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="ink-notes">Notes</label>
                <textarea id="ink-notes" placeholder="Add any notes about this ink..."></textarea>
            </div>

            <div class="form-group">
                <label for="ink-url">Store/Website URL</label>
                <input type="url" id="ink-url" placeholder="https://...">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closeInkModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.saveInk()">Save Ink</button>
            </div>
        </div>
    </div>

    <!-- Pairing Modal -->
    <div id="pairing-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="pairing-modal-title">Add Pairing</div>
                <button class="modal-close" onclick="app.closePairingModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pairing-pen">Select Pen</label>
                    <select id="pairing-pen">
                        <option value="">Choose a pen...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pairing-ink">Select Ink</label>
                    <select id="pairing-ink">
                        <option value="">Choose an ink...</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Rating</label>
                <div id="pairing-rating" class="stars">
                    <span class="star" onclick="app.setRating(1)">★</span>
                    <span class="star" onclick="app.setRating(2)">★</span>
                    <span class="star" onclick="app.setRating(3)">★</span>
                    <span class="star" onclick="app.setRating(4)">★</span>
                    <span class="star" onclick="app.setRating(5)">★</span>
                </div>
                <div style="color: #a0a0a0; font-size: 0.9rem; margin-top: 0.5rem;" id="pairing-rating-display">Not rated</div>
            </div>

            <div class="form-group">
                <label>Flow</label>
                <div class="radio-group">
                    <button class="radio-option" onclick="app.setFlow('Dry')">Dry</button>
                    <button class="radio-option" onclick="app.setFlow('Medium')">Medium</button>
                    <button class="radio-option" onclick="app.setFlow('Wet')">Wet</button>
                </div>
            </div>

            <div class="form-group">
                <label for="pairing-comments">Comments</label>
                <textarea id="pairing-comments" placeholder="Add notes about this pairing..."></textarea>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closePairingModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.savePairing()">Save Pairing</button>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirm-modal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Confirm Action</div>
                <button class="modal-close" onclick="app.closeConfirm()">✕</button>
            </div>
            <p id="confirm-message" style="margin-bottom: 2rem; color: #e8e8e8;"></p>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closeConfirm()">Cancel</button>
                <button class="btn btn-danger" id="confirm-btn" onclick="app.confirmAction()">Confirm</button>
            </div>
        </div>
    </div>

    <script>
        // Utility functions
        const generateId = () => crypto.randomUUID();

        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Data management
        const DataManager = {
            pens: [],
            inks: [],
            pairings: [],
            dropdowns: {
                brands: ['Montblanc', 'Visconti', 'Pilot', 'Pelikan', 'Leonardo', 'Lamy', 'TWSBI', 'Esterbrook', 'Scribo', 'Gravitas', 'Omas', 'Sailor'],
                lines: {
                    'Visconti': ['Homo Sapiens', 'Divina', 'Mythos', 'Van Gogh', 'Rembrandt', 'Opera']
                },
                inkBrands: ['Noodler\\'s', 'Pilot Iroshizuku', 'Diamine', 'Montblanc', 'Sailor', 'Platinum', 'Pelikan', 'Rohrer & Klingner', 'J. Herbin', 'Krishna', 'Robert Oster'],
                nibSizes: ['EF', 'F', 'M', 'B', 'BB', 'Stub 1.1', 'Stub 1.5'],
                fillingSystems: ['Cartridge', 'Converter', 'Piston', 'Vacuum', 'Eyedropper', 'Lever', 'Plunger', 'Pneumatic', 'Bulb'],
                colorFamilies: ['Blue', 'Blue-Black', 'Black', 'Red', 'Green', 'Purple', 'Brown', 'Orange', 'Yellow', 'Pink', 'Turquoise', 'Grey']
            },

            load() {
                const pens = localStorage.getItem('fpens');
                const inks = localStorage.getItem('finks');
                const pairings = localStorage.getItem('fpairings');
                const dropdowns = localStorage.getItem('fdropdowns');

                this.pens = pens ? JSON.parse(pens) : [];
                this.inks = inks ? JSON.parse(inks) : [];
                this.pairings = pairings ? JSON.parse(pairings) : [];

                if (dropdowns) {
                    const loaded = JSON.parse(dropdowns);
                    this.dropdowns = { ...this.dropdowns, ...loaded };
                } else {
                    this.save();
                }
            },

            save() {
                localStorage.setItem('fpens', JSON.stringify(this.pens));
                localStorage.setItem('finks', JSON.stringify(this.inks));
                localStorage.setItem('fpairings', JSON.stringify(this.pairings));
                localStorage.setItem('fdropdowns', JSON.stringify(this.dropdowns));
                // Auto-backup: keep a rolling snapshot for recovery
                try {
                    var backup = JSON.stringify({
                        pens: this.pens, inks: this.inks,
                        pairings: this.pairings, dropdowns: this.dropdowns,
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('fp_latest_backup', backup);
                    var today = new Date().toISOString().split('T')[0];
                    if (!localStorage.getItem('fp_backup_' + today)) {
                        localStorage.setItem('fp_backup_' + today, backup);
                    }
                } catch(e) { /* localStorage quota — skip backup silently */ }
            },

            addPen(pen) {
                pen.id = generateId();
                pen.createdAt = new Date().toISOString();
                this.pens.push(pen);
                this.updateDropdowns('brands', pen.brand);
                if (pen.brand && pen.line) {
                    if (!this.dropdowns.lines[pen.brand]) {
                        this.dropdowns.lines[pen.brand] = [];
                    }
                    if (!this.dropdowns.lines[pen.brand].includes(pen.line)) {
                        this.dropdowns.lines[pen.brand].push(pen.line);
                    }
                }
                this.save();
                return pen;
            },

            updatePen(id, pen) {
                const index = this.pens.findIndex(p => p.id === id);
                if (index !== -1) {
                    pen.id = id;
                    pen.createdAt = this.pens[index].createdAt;
                    this.pens[index] = pen;
                    this.updateDropdowns('brands', pen.brand);
                    if (pen.brand && pen.line) {
                        if (!this.dropdowns.lines[pen.brand]) {
                            this.dropdowns.lines[pen.brand] = [];
                        }
                        if (!this.dropdowns.lines[pen.brand].includes(pen.line)) {
                            this.dropdowns.lines[pen.brand].push(pen.line);
                        }
                    }
                    this.save();
                    return true;
                }
                return false;
            },

            deletePen(id) {
                const index = this.pens.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.pens.splice(index, 1);
                    this.pairings = this.pairings.filter(p => p.penId !== id);
                    this.save();
                    return true;
                }
                return false;
            },

            addInk(ink) {
                ink.id = generateId();
                ink.createdAt = new Date().toISOString();
                this.inks.push(ink);
                this.updateDropdowns('inkBrands', ink.brand);
                this.save();
                return ink;
            },

            updateInk(id, ink) {
                const index = this.inks.findIndex(i => i.id === id);
                if (index !== -1) {
                    ink.id = id;
                    ink.createdAt = this.inks[index].createdAt;
                    this.inks[index] = ink;
                    this.updateDropdowns('inkBrands', ink.brand);
                    this.save();
                    return true;
                }
                return false;
            },

            deleteInk(id) {
                const index = this.inks.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.inks.splice(index, 1);
                    this.pairings = this.pairings.filter(p => p.inkId !== id);
                    this.save();
                    return true;
                }
                return false;
            },

            addPairing(pairing) {
                pairing.id = generateId();
                pairing.createdAt = new Date().toISOString();
                this.pairings.push(pairing);
                this.save();
                return pairing;
            },

            updatePairing(id, pairing) {
                const index = this.pairings.findIndex(p => p.id === id);
                if (index !== -1) {
                    pairing.id = id;
                    pairing.createdAt = this.pairings[index].createdAt;
                    this.pairings[index] = pairing;
                    this.save();
                    return true;
                }
                return false;
            },

            deletePairing(id) {
                const index = this.pairings.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.pairings.splice(index, 1);
                    this.save();
                    return true;
                }
                return false;
            },

            updateDropdowns(key, value) {
                if (value && !this.dropdowns[key].includes(value)) {
                    this.dropdowns[key].push(value);
                    this.dropdowns[key].sort();
                }
            },

            export() {
                return {
                    pens: this.pens,
                    inks: this.inks,
                    pairings: this.pairings,
                    dropdowns: this.dropdowns
                };
            },

            import(data) {
                if (data.pens) this.pens.push(...data.pens);
                if (data.inks) this.inks.push(...data.inks);
                if (data.pairings) this.pairings.push(...data.pairings);
                if (data.dropdowns) {
                    if (data.dropdowns.brands) {
                        data.dropdowns.brands.forEach(b => this.updateDropdowns('brands', b));
                    }
                    if (data.dropdowns.inkBrands) {
                        data.dropdowns.inkBrands.forEach(b => this.updateDropdowns('inkBrands', b));
                    }
                    if (data.dropdowns.lines) {
                        Object.keys(data.dropdowns.lines).forEach(brand => {
                            if (!this.dropdowns.lines[brand]) {
                                this.dropdowns.lines[brand] = [];
                            }
                            data.dropdowns.lines[brand].forEach(line => {
                                if (!this.dropdowns.lines[brand].includes(line)) {
                                    this.dropdowns.lines[brand].push(line);
                                }
                            });
                        });
                    }
                }
                this.save();
            },

            clear() {
                this.pens = [];
                this.inks = [];
                this.pairings = [];
                this.dropdowns = {
                    brands: ['Montblanc', 'Visconti', 'Pilot', 'Pelikan', 'Leonardo', 'Lamy', 'TWSBI', 'Esterbrook', 'Scribo', 'Gravitas', 'Omas', 'Sailor'],
                    lines: {
                        'Visconti': ['Homo Sapiens', 'Divina', 'Mythos', 'Van Gogh', 'Rembrandt', 'Opera']
                    },
                    inkBrands: ['Noodler\\'s', 'Pilot Iroshizuku', 'Diamine', 'Montblanc', 'Sailor', 'Platinum', 'Pelikan', 'Rohrer & Klingner', 'J. Herbin', 'Krishna', 'Robert Oster'],
                    nibSizes: ['EF', 'F', 'M', 'B', 'BB', 'Stub 1.1', 'Stub 1.5'],
                    fillingSystems: ['Cartridge', 'Converter', 'Piston', 'Vacuum', 'Eyedropper', 'Lever', 'Plunger', 'Pneumatic', 'Bulb'],
                    colorFamilies: ['Blue', 'Blue-Black', 'Black', 'Red', 'Green', 'Purple', 'Brown', 'Orange', 'Yellow', 'Pink', 'Turquoise', 'Grey']
                };
                this.save();
            }
        };

        // Main app
        const app = {
            currentPenId: null,
            currentInkId: null,
            currentPairingId: null,
            currentRating: 0,
            currentFlow: '',
            currentInkProperties: [],
            confirmCallback: null,

            init() {
                DataManager.load();
                this.setupEventListeners();
                this.renderDashboard();
                this.renderPens();
                this.renderInks();
                this.renderPairings();
                this.renderValue();
                this.setupComboBoxes();
            },

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.nav-tab').forEach(btn => {
                    btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
                });

                // Pens filters
                document.getElementById('pens-search').addEventListener('input', () => this.renderPens());
                document.getElementById('pens-filter-brand').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-status').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-nib').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-filling').addEventListener('change', () => this.renderPens());

                // Inks filters
                document.getElementById('inks-search').addEventListener('input', () => this.renderInks());
                document.getElementById('inks-filter-brand').addEventListener('change', () => this.renderInks());
                document.getElementById('inks-filter-color').addEventListener('change', () => this.renderInks());
                document.getElementById('inks-filter-properties').addEventListener('change', () => this.renderInks());

                // Pairings filter
                document.getElementById('pairings-search').addEventListener('input', () => this.renderPairings());

                // Combobox click outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.combobox-container')) {
                        document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));
                    }
                });
            },

            setupComboBoxes() {
                this.setupComboBox('pen-brand', DataManager.dropdowns.brands, 'pen-brand-dropdown');
                this.setupComboBox('ink-brand', DataManager.dropdowns.inkBrands, 'ink-brand-dropdown');
            },

            setupComboBox(inputId, options, dropdownId) {
                const input = document.getElementById(inputId);
                const dropdown = document.getElementById(dropdownId);

                input.addEventListener('click', () => {
                    this.updateComboBoxOptions(inputId, options, dropdownId, options);
                    dropdown.classList.add('active');
                });

                input.addEventListener('input', () => {
                    const filtered = options.filter(opt =>
                        opt.toLowerCase().includes(input.value.toLowerCase())
                    );
                    this.updateComboBoxOptions(inputId, options, dropdownId, filtered);
                    if (filtered.length > 0) {
                        dropdown.classList.add('active');
                    }
                });
            },

            updateComboBoxOptions(inputId, allOptions, dropdownId, filtered) {
                const dropdown = document.getElementById(dropdownId);
                dropdown.innerHTML = '';

                filtered.forEach(option => {
                    const div = document.createElement('div');
                    div.className = 'combobox-option';
                    div.textContent = option;
                    div.onclick = () => {
                        document.getElementById(inputId).value = option;
                        dropdown.classList.remove('active');

                        // Update cascading dropdowns for pens
                        if (inputId === 'pen-brand') {
                            this.updatePenLineDropdown();
                        }
                    };
                    dropdown.appendChild(div);
                });
            },

            updatePenLineDropdown() {
                const brand = document.getElementById('pen-brand').value;
                const lineInput = document.getElementById('pen-line');
                const lineDropdown = document.getElementById('pen-line-dropdown');

                if (brand && DataManager.dropdowns.lines[brand]) {
                    const lineOptions = DataManager.dropdowns.lines[brand];
                    this.setupComboBox('pen-line', lineOptions, 'pen-line-dropdown');
                } else {
                    this.setupComboBox('pen-line', [], 'pen-line-dropdown');
                }

                lineInput.value = '';
                lineDropdown.classList.remove('active');
            },

            switchTab(tabName) {
                // Update nav tabs
                document.querySelectorAll('.nav-tab').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active');

                // Update content
                document.querySelectorAll('.content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName).classList.add('active');
            },

            renderDashboard() {
                document.getElementById('stat-pens').textContent = DataManager.pens.length;
                document.getElementById('stat-inks').textContent = DataManager.inks.length;
                document.getElementById('stat-pairings').textContent = DataManager.pairings.length;

                // Calculate investment totals
                let totalUSD = 0, totalEUR = 0;
                DataManager.pens.forEach(p => {
                    if (p.price) {
                        const val = parseFloat(p.price);
                        if (p.currency === 'EUR') totalEUR += val;
                        else totalUSD += val;
                    }
                });
                let investmentLabel = '';
                if (totalUSD > 0) investmentLabel += '$' + totalUSD.toLocaleString();
                if (totalEUR > 0) investmentLabel += (investmentLabel ? ' + ' : '') + '\u20AC' + totalEUR.toLocaleString();
                document.getElementById('stat-investment').textContent = investmentLabel || '-';

                const recentList = document.getElementById('recent-list');
                recentList.innerHTML = '';

                const recent = [
                    ...DataManager.pens.map(p => ({ type: 'Pen', item: p })),
                    ...DataManager.inks.map(i => ({ type: 'Ink', item: i })),
                    ...DataManager.pairings.map(pa => ({ type: 'Pairing', item: pa }))
                ]
                    .sort((a, b) => new Date(b.item.createdAt) - new Date(a.item.createdAt))
                    .slice(0, 10);

                if (recent.length === 0) {
                    recentList.innerHTML = '<p style="color: #a0a0a0; text-align: center;">No items yet</p>';
                    return;
                }

                recent.forEach(r => {
                    const div = document.createElement('div');
                    div.style.padding = '0.75rem';
                    div.style.borderBottom = '1px solid rgba(226, 183, 20, 0.1)';
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.alignItems = 'center';

                    let label = '';
                    if (r.type === 'Pen') {
                        label = \`\${r.item.brand} \${r.item.model}\`;
                    } else if (r.type === 'Ink') {
                        label = \`\${r.item.brand} - \${r.item.name}\`;
                    } else if (r.type === 'Pairing') {
                        const pen = DataManager.pens.find(p => p.id === r.item.penId);
                        const ink = DataManager.inks.find(i => i.id === r.item.inkId);
                        label = \`\${pen ? pen.brand + ' ' + pen.model : 'Unknown'} + \${ink ? ink.brand + ' ' + ink.name : 'Unknown'}\`;
                    }

                    div.innerHTML = \`
                        <span style="color: #e8e8e8;">\${escapeHtml(label)}</span>
                        <span style="color: #a0a0a0; font-size: 0.85rem;">\${r.type}</span>
                    \`;

                    recentList.appendChild(div);
                });
            },

            renderPens() {
                const tbody = document.getElementById('pens-tbody');
                const emptyState = document.getElementById('pens-empty');
                const searchTerm = document.getElementById('pens-search').value.toLowerCase();
                const brandFilter = document.getElementById('pens-filter-brand').value;
                const statusFilter = document.getElementById('pens-filter-status').value;
                const nibFilter = document.getElementById('pens-filter-nib').value;
                const fillingFilter = document.getElementById('pens-filter-filling').value;

                const filtered = DataManager.pens.filter(pen => {
                    const matchSearch = !searchTerm ||
                        pen.brand.toLowerCase().includes(searchTerm) ||
                        pen.model.toLowerCase().includes(searchTerm) ||
                        pen.line.toLowerCase().includes(searchTerm);

                    const matchBrand = !brandFilter || pen.brand === brandFilter;
                    const matchStatus = !statusFilter || pen.status === statusFilter;
                    const matchNib = !nibFilter || pen.nibSize === nibFilter;
                    const matchFilling = !fillingFilter || pen.filling === fillingFilter;

                    return matchSearch && matchBrand && matchStatus && matchNib && matchFilling;
                });

                // Update filter options
                const brands = [...new Set(DataManager.pens.map(p => p.brand))].sort();
                const nibs = [...new Set(DataManager.pens.map(p => p.nibSize))].filter(n => n);
                const fillings = [...new Set(DataManager.pens.map(p => p.filling))].filter(f => f);

                document.getElementById('pens-filter-brand').innerHTML = '<option value="">All Brands</option>' +
                    brands.map(b => \`<option value="\${escapeHtml(b)}">\${escapeHtml(b)}</option>\`).join('');

                document.getElementById('pens-filter-nib').innerHTML = '<option value="">All Nib Sizes</option>' +
                    nibs.map(n => \`<option value="\${escapeHtml(n)}">\${escapeHtml(n)}</option>\`).join('');

                document.getElementById('pens-filter-filling').innerHTML = '<option value="">All Filling Systems</option>' +
                    fillings.map(f => \`<option value="\${escapeHtml(f)}">\${escapeHtml(f)}</option>\`).join('');

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(pen => {
                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPenDetail(pen.id);

                    const statusClass = \`badge-\${pen.status.toLowerCase().replace(' ', '-')}\`;

                    const priceDisplay = pen.price ? \`\${pen.currency === 'EUR' ? '\u20AC' : '$'}\${Number(pen.price).toLocaleString()}\` : '-';
                    row.innerHTML = \`
                        <td>\${escapeHtml(pen.brand)}</td>
                        <td>\${escapeHtml(pen.line || '-')}</td>
                        <td>\${escapeHtml(pen.model)}</td>
                        <td>\${escapeHtml(pen.nibSize || '-')}</td>
                        <td>\${escapeHtml(pen.filling || '-')}</td>
                        <td style="text-align: right; font-weight: 500;">\${priceDisplay}</td>
                        <td><span class="badge \${statusClass}">\${escapeHtml(pen.status)}</span></td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderInks() {
                const tbody = document.getElementById('inks-tbody');
                const emptyState = document.getElementById('inks-empty');
                const searchTerm = document.getElementById('inks-search').value.toLowerCase();
                const brandFilter = document.getElementById('inks-filter-brand').value;
                const colorFilter = document.getElementById('inks-filter-color').value;
                const propertiesFilter = document.getElementById('inks-filter-properties').value;

                const filtered = DataManager.inks.filter(ink => {
                    const matchSearch = !searchTerm ||
                        ink.brand.toLowerCase().includes(searchTerm) ||
                        ink.name.toLowerCase().includes(searchTerm);

                    const matchBrand = !brandFilter || ink.brand === brandFilter;
                    const matchColor = !colorFilter || ink.color === colorFilter;
                    const matchProperties = !propertiesFilter || (ink.properties && ink.properties.includes(propertiesFilter));

                    return matchSearch && matchBrand && matchColor && matchProperties;
                });

                // Update filter options
                const brands = [...new Set(DataManager.inks.map(i => i.brand))].sort();
                const colors = [...new Set(DataManager.inks.map(i => i.color))].filter(c => c);
                const properties = new Set();
                DataManager.inks.forEach(ink => {
                    if (ink.properties) {
                        ink.properties.forEach(p => properties.add(p));
                    }
                });

                document.getElementById('inks-filter-brand').innerHTML = '<option value="">All Brands</option>' +
                    brands.map(b => \`<option value="\${escapeHtml(b)}">\${escapeHtml(b)}</option>\`).join('');

                document.getElementById('inks-filter-color').innerHTML = '<option value="">All Colors</option>' +
                    colors.map(c => \`<option value="\${escapeHtml(c)}">\${escapeHtml(c)}</option>\`).join('');

                document.getElementById('inks-filter-properties').innerHTML = '<option value="">All Properties</option>' +
                    Array.from(properties).sort().map(p => \`<option value="\${escapeHtml(p)}">\${escapeHtml(p)}</option>\`).join('');

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(ink => {
                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewInkDetail(ink.id);

                    const properties = (ink.properties || []).map(p => \`<span class="badge badge-ordered" style="margin-right: 0.25rem;">\${escapeHtml(p)}</span>\`).join('');

                    row.innerHTML = \`
                        <td>\${escapeHtml(ink.brand)}</td>
                        <td>\${escapeHtml(ink.name)}</td>
                        <td>\${escapeHtml(ink.color || '-')}</td>
                        <td>\${escapeHtml(ink.volume || '-')}</td>
                        <td>\${properties || '-'}</td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderPairings() {
                const tbody = document.getElementById('pairings-tbody');
                const emptyState = document.getElementById('pairings-empty');
                const searchTerm = document.getElementById('pairings-search').value.toLowerCase();

                const filtered = DataManager.pairings.filter(pairing => {
                    const pen = DataManager.pens.find(p => p.id === pairing.penId);
                    const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                    const penLabel = pen ? \`\${pen.brand} \${pen.model}\` : 'Unknown';
                    const inkLabel = ink ? \`\${ink.brand} \${ink.name}\` : 'Unknown';

                    return !searchTerm ||
                        penLabel.toLowerCase().includes(searchTerm) ||
                        inkLabel.toLowerCase().includes(searchTerm);
                });

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(pairing => {
                    const pen = DataManager.pens.find(p => p.id === pairing.penId);
                    const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPairingDetail(pairing.id);

                    const penLabel = pen ? \`\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}\` : 'Unknown';
                    const inkLabel = ink ? \`\${escapeHtml(ink.brand)} \${escapeHtml(ink.name)}\` : 'Unknown';
                    const stars = '★'.repeat(pairing.rating) + '☆'.repeat(5 - pairing.rating);

                    row.innerHTML = \`
                        <td>\${penLabel}</td>
                        <td>\${inkLabel}</td>
                        <td><span style="color: #e2b714;">\${stars}</span></td>
                        <td>\${escapeHtml(pairing.flow || '-')}</td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderValue() {
                const pens = DataManager.pens;
                let totalUSD = 0, totalEUR = 0, pensWithPrice = 0;
                const byBrand = {};

                pens.forEach(p => {
                    if (p.price) {
                        const val = parseFloat(p.price);
                        pensWithPrice++;
                        if (p.currency === 'EUR') totalEUR += val;
                        else totalUSD += val;

                        if (!byBrand[p.brand]) byBrand[p.brand] = { usd: 0, eur: 0, count: 0 };
                        byBrand[p.brand].count++;
                        if (p.currency === 'EUR') byBrand[p.brand].eur += val;
                        else byBrand[p.brand].usd += val;
                    }
                });

                // Stats
                document.getElementById('value-total-usd').textContent = '$' + totalUSD.toLocaleString();
                document.getElementById('value-total-eur').textContent = '\u20AC' + totalEUR.toLocaleString();

                if (pensWithPrice > 0) {
                    // Rough combined average (treat EUR ~ USD for avg display)
                    const combined = totalUSD + totalEUR;
                    const avg = Math.round(combined / pensWithPrice);
                    document.getElementById('value-avg').textContent = '~$' + avg.toLocaleString();
                } else {
                    document.getElementById('value-avg').textContent = '-';
                }

                // Most expensive
                const sorted = pens.filter(p => p.price).sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                if (sorted.length > 0) {
                    const top = sorted[0];
                    const sym = top.currency === 'EUR' ? '\u20AC' : '$';
                    document.getElementById('value-most-expensive').textContent = \`\${top.brand} \${top.model}\`;
                }

                // Brand breakdown
                const brandDiv = document.getElementById('value-brand-breakdown');
                const brandEntries = Object.entries(byBrand).sort((a, b) => (b[1].usd + b[1].eur) - (a[1].usd + a[1].eur));

                if (brandEntries.length === 0) {
                    brandDiv.innerHTML = '<p style="color: #a0a0a0; text-align: center;">No price data yet</p>';
                } else {
                    const maxTotal = Math.max(...brandEntries.map(([, v]) => v.usd + v.eur));
                    brandDiv.innerHTML = brandEntries.map(([brand, v]) => {
                        const total = v.usd + v.eur;
                        const pct = maxTotal > 0 ? (total / maxTotal * 100) : 0;
                        let priceStr = '';
                        if (v.usd > 0) priceStr += '$' + v.usd.toLocaleString();
                        if (v.eur > 0) priceStr += (priceStr ? ' + ' : '') + '\u20AC' + v.eur.toLocaleString();
                        return \`
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                    <span style="color: #e8e8e8; font-weight: 500;">\${escapeHtml(brand)} <span style="color: #a0a0a0; font-size: 0.85rem;">(\${v.count} pen\${v.count > 1 ? 's' : ''})</span></span>
                                    <span style="color: #e2b714; font-weight: 600;">\${priceStr}</span>
                                </div>
                                <div style="background: rgba(226, 183, 20, 0.1); border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, #e2b714, #f0c420); height: 100%; width: \${pct}%; border-radius: 4px; transition: width 0.5s;"></div>
                                </div>
                            </div>
                        \`;
                    }).join('');
                }

                // Price-sorted list
                const priceList = document.getElementById('value-price-list');
                priceList.innerHTML = '';
                sorted.forEach(pen => {
                    const row = document.createElement('tr');
                    const sym = pen.currency === 'EUR' ? '\u20AC' : '$';
                    const statusClass = \`badge-\${pen.status.toLowerCase().replace(' ', '-')}\`;
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPenDetail(pen.id);
                    row.innerHTML = \`
                        <td>\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}</td>
                        <td>\${escapeHtml(pen.nibSize || '-')}</td>
                        <td style="text-align: right; font-weight: 600; color: #e2b714;">\${sym}\${Number(pen.price).toLocaleString()}</td>
                        <td><span class="badge \${statusClass}">\${escapeHtml(pen.status)}</span></td>
                    \`;
                    priceList.appendChild(row);
                });

                // Spending timeline
                const timelineDiv = document.getElementById('value-timeline');
                const pensWithDate = pens.filter(p => p.price && p.purchaseDate).sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

                if (pensWithDate.length === 0) {
                    timelineDiv.innerHTML = '<p style="color: #a0a0a0; text-align: center;">Add purchase dates to see your spending timeline</p>';
                } else {
                    // Group by month
                    const byMonth = {};
                    let runningUSD = 0, runningEUR = 0;
                    pensWithDate.forEach(p => {
                        const month = p.purchaseDate.substring(0, 7); // YYYY-MM
                        if (!byMonth[month]) byMonth[month] = { pens: [], totalUSD: 0, totalEUR: 0, cumulativeUSD: 0, cumulativeEUR: 0 };
                        byMonth[month].pens.push(p);
                        const val = parseFloat(p.price);
                        if (p.currency === 'EUR') {
                            byMonth[month].totalEUR += val;
                            runningEUR += val;
                        } else {
                            byMonth[month].totalUSD += val;
                            runningUSD += val;
                        }
                        byMonth[month].cumulativeUSD = runningUSD;
                        byMonth[month].cumulativeEUR = runningEUR;
                    });

                    timelineDiv.innerHTML = Object.entries(byMonth).map(([month, data]) => {
                        const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                        let spentStr = '';
                        if (data.totalUSD > 0) spentStr += '$' + data.totalUSD.toLocaleString();
                        if (data.totalEUR > 0) spentStr += (spentStr ? ' + ' : '') + '\u20AC' + data.totalEUR.toLocaleString();
                        let cumStr = '';
                        if (data.cumulativeUSD > 0) cumStr += '$' + data.cumulativeUSD.toLocaleString();
                        if (data.cumulativeEUR > 0) cumStr += (cumStr ? ' + ' : '') + '\u20AC' + data.cumulativeEUR.toLocaleString();

                        const penItems = data.pens.map(p => {
                            const sym = p.currency === 'EUR' ? '\u20AC' : '$';
                            return \`<div style="color: #a0a0a0; font-size: 0.85rem; padding-left: 1rem;">\${escapeHtml(p.brand)} \${escapeHtml(p.model)} — \${sym}\${Number(p.price).toLocaleString()}</div>\`;
                        }).join('');

                        return \`
                            <div style="border-left: 3px solid #e2b714; padding: 1rem 1rem 1rem 1.5rem; margin-bottom: 1rem; background: rgba(226, 183, 20, 0.03); border-radius: 0 0.5rem 0.5rem 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: #e2b714; font-weight: 600;">\${monthLabel}</span>
                                    <span style="color: #e8e8e8; font-weight: 500;">\${spentStr}</span>
                                </div>
                                \${penItems}
                                <div style="text-align: right; margin-top: 0.5rem; font-size: 0.8rem; color: #a0a0a0;">Running total: \${cumStr}</div>
                            </div>
                        \`;
                    }).join('');
                }
            },

            // Pen operations
            openPenModal(id = null) {
                this.currentPenId = id;
                const modal = document.getElementById('pen-modal');
                const title = document.getElementById('pen-modal-title');

                // Reset form
                document.getElementById('pen-brand').value = '';
                document.getElementById('pen-line').value = '';
                document.getElementById('pen-model').value = '';
                document.getElementById('pen-nib-size').value = '';
                document.getElementById('pen-nib-material').value = '';
                document.getElementById('pen-nib-grind').value = '';
                document.getElementById('pen-filling').value = '';
                document.getElementById('pen-price').value = '';
                document.getElementById('pen-currency').value = 'USD';
                document.getElementById('pen-status').value = 'In Collection';
                document.getElementById('pen-date').value = '';
                document.getElementById('pen-notes').value = '';
                document.getElementById('pen-url').value = '';

                // Close dropdowns
                document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));

                if (id) {
                    title.textContent = 'Edit Pen';
                    const pen = DataManager.pens.find(p => p.id === id);
                    if (pen) {
                        document.getElementById('pen-brand').value = pen.brand;
                        document.getElementById('pen-line').value = pen.line;
                        document.getElementById('pen-model').value = pen.model;
                        document.getElementById('pen-nib-size').value = pen.nibSize;
                        document.getElementById('pen-nib-material').value = pen.nibMaterial;
                        document.getElementById('pen-nib-grind').value = pen.nibGrind;
                        document.getElementById('pen-filling').value = pen.filling;
                        document.getElementById('pen-price').value = pen.price;
                        document.getElementById('pen-currency').value = pen.currency;
                        document.getElementById('pen-status').value = pen.status;
                        document.getElementById('pen-date').value = pen.purchaseDate;
                        document.getElementById('pen-notes').value = pen.notes;
                        document.getElementById('pen-url').value = pen.url;
                    }
                } else {
                    title.textContent = 'Add Pen';
                }

                modal.classList.add('active');
            },

            closePenModal() {
                document.getElementById('pen-modal').classList.remove('active');
                this.currentPenId = null;
            },

            savePen() {
                const pen = {
                    brand: document.getElementById('pen-brand').value.trim(),
                    line: document.getElementById('pen-line').value.trim(),
                    model: document.getElementById('pen-model').value.trim(),
                    nibSize: document.getElementById('pen-nib-size').value,
                    nibMaterial: document.getElementById('pen-nib-material').value,
                    nibGrind: document.getElementById('pen-nib-grind').value,
                    filling: document.getElementById('pen-filling').value,
                    price: document.getElementById('pen-price').value,
                    currency: document.getElementById('pen-currency').value,
                    status: document.getElementById('pen-status').value,
                    purchaseDate: document.getElementById('pen-date').value,
                    notes: document.getElementById('pen-notes').value.trim(),
                    url: document.getElementById('pen-url').value.trim()
                };

                if (!pen.brand || !pen.model) {
                    alert('Please fill in Brand and Model');
                    return;
                }

                if (this.currentPenId) {
                    DataManager.updatePen(this.currentPenId, pen);
                } else {
                    DataManager.addPen(pen);
                }

                this.closePenModal();
                this.renderDashboard();
                this.renderPens();
                this.renderValue();
                this.updatePairingSelects();
            },

            viewPenDetail(id) {
                const pen = DataManager.pens.find(p => p.id === id);
                if (!pen) return;

                this.showDetailView('Pen Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderPens();">← Back to Pens</button>
                    <div class="detail-header">
                        <div class="detail-title">\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openPenModal('\${pen.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('pen', '\${pen.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Brand</span>
                            <div class="detail-value">\${escapeHtml(pen.brand)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Line</span>
                            <div class="detail-value">\${escapeHtml(pen.line || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Model</span>
                            <div class="detail-value">\${escapeHtml(pen.model)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Size</span>
                            <div class="detail-value">\${escapeHtml(pen.nibSize || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Material</span>
                            <div class="detail-value">\${escapeHtml(pen.nibMaterial || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Grind</span>
                            <div class="detail-value">\${escapeHtml(pen.nibGrind || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Filling System</span>
                            <div class="detail-value">\${escapeHtml(pen.filling || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Status</span>
                            <div class="detail-value"><span class="badge badge-\${pen.status.toLowerCase().replace(' ', '-')}">\${escapeHtml(pen.status)}</span></div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Price</span>
                            <div class="detail-value">\${pen.price ? \`\${escapeHtml(pen.currency)} \${escapeHtml(pen.price)}\` : '-'}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Date</span>
                            <div class="detail-value">\${pen.purchaseDate ? new Date(pen.purchaseDate).toLocaleDateString() : '-'}</div>
                        </div>
                    </div>

                    \${pen.notes ? \`
                        <div class="card">
                            <div class="detail-label">Notes</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(pen.notes).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}

                    \${pen.url ? \`
                        <div class="card">
                            <div class="detail-label">Store/Website</div>
                            <a href="\${escapeHtml(pen.url)}" target="_blank" class="detail-value link">\${escapeHtml(pen.url)}</a>
                        </div>
                    \` : ''}
                \`);
            },

            deletePen(id) {
                DataManager.deletePen(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderPens();
                this.renderPairings();
                this.renderValue();
                this.updatePairingSelects();
            },

            // Ink operations
            openInkModal(id = null) {
                this.currentInkId = id;
                this.currentInkProperties = [];
                const modal = document.getElementById('ink-modal');
                const title = document.getElementById('ink-modal-title');

                // Reset form
                document.getElementById('ink-brand').value = '';
                document.getElementById('ink-name').value = '';
                document.getElementById('ink-color').value = '';
                document.getElementById('ink-volume').value = '';
                document.getElementById('ink-price').value = '';
                document.getElementById('ink-currency').value = 'USD';
                document.getElementById('ink-notes').value = '';
                document.getElementById('ink-url').value = '';

                // Reset properties
                document.querySelectorAll('.toggle-option').forEach(btn => {
                    btn.classList.remove('selected');
                });

                // Close dropdowns
                document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));

                if (id) {
                    title.textContent = 'Edit Ink';
                    const ink = DataManager.inks.find(i => i.id === id);
                    if (ink) {
                        document.getElementById('ink-brand').value = ink.brand;
                        document.getElementById('ink-name').value = ink.name;
                        document.getElementById('ink-color').value = ink.color;
                        document.getElementById('ink-volume').value = ink.volume;
                        document.getElementById('ink-price').value = ink.price;
                        document.getElementById('ink-currency').value = ink.currency;
                        document.getElementById('ink-notes').value = ink.notes;
                        document.getElementById('ink-url').value = ink.url;

                        if (ink.properties) {
                            this.currentInkProperties = [...ink.properties];
                            document.querySelectorAll('.toggle-option').forEach(btn => {
                                if (ink.properties.includes(btn.dataset.property)) {
                                    btn.classList.add('selected');
                                }
                            });
                        }
                    }
                } else {
                    title.textContent = 'Add Ink';
                }

                modal.classList.add('active');
            },

            closeInkModal() {
                document.getElementById('ink-modal').classList.remove('active');
                this.currentInkId = null;
                this.currentInkProperties = [];
            },

            toggleInkProperty(btn, property) {
                btn.classList.toggle('selected');
                if (btn.classList.contains('selected')) {
                    if (!this.currentInkProperties.includes(property)) {
                        this.currentInkProperties.push(property);
                    }
                } else {
                    this.currentInkProperties = this.currentInkProperties.filter(p => p !== property);
                }
            },

            saveInk() {
                const ink = {
                    brand: document.getElementById('ink-brand').value.trim(),
                    name: document.getElementById('ink-name').value.trim(),
                    color: document.getElementById('ink-color').value,
                    volume: document.getElementById('ink-volume').value.trim(),
                    price: document.getElementById('ink-price').value,
                    currency: document.getElementById('ink-currency').value,
                    notes: document.getElementById('ink-notes').value.trim(),
                    url: document.getElementById('ink-url').value.trim(),
                    properties: this.currentInkProperties
                };

                if (!ink.brand || !ink.name) {
                    alert('Please fill in Brand and Name');
                    return;
                }

                if (this.currentInkId) {
                    DataManager.updateInk(this.currentInkId, ink);
                } else {
                    DataManager.addInk(ink);
                }

                this.closeInkModal();
                this.renderDashboard();
                this.renderInks();
                this.renderPairings();
                this.updatePairingSelects();
            },

            viewInkDetail(id) {
                const ink = DataManager.inks.find(i => i.id === id);
                if (!ink) return;

                this.showDetailView('Ink Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderInks();">← Back to Inks</button>
                    <div class="detail-header">
                        <div class="detail-title">\${escapeHtml(ink.brand)} - \${escapeHtml(ink.name)}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openInkModal('\${ink.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('ink', '\${ink.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Brand</span>
                            <div class="detail-value">\${escapeHtml(ink.brand)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Name</span>
                            <div class="detail-value">\${escapeHtml(ink.name)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Color Family</span>
                            <div class="detail-value">\${escapeHtml(ink.color || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Volume</span>
                            <div class="detail-value">\${escapeHtml(ink.volume || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Price</span>
                            <div class="detail-value">\${ink.price ? \`\${escapeHtml(ink.currency)} \${escapeHtml(ink.price)}\` : '-'}</div>
                        </div>
                    </div>

                    \${ink.properties && ink.properties.length > 0 ? \`
                        <div class="card">
                            <div class="detail-label">Properties</div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                \${ink.properties.map(p => \`<span class="badge badge-ordered">\${escapeHtml(p)}</span>\`).join('')}
                            </div>
                        </div>
                    \` : ''}

                    \${ink.notes ? \`
                        <div class="card">
                            <div class="detail-label">Notes</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(ink.notes).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}

                    \${ink.url ? \`
                        <div class="card">
                            <div class="detail-label">Store/Website</div>
                            <a href="\${escapeHtml(ink.url)}" target="_blank" class="detail-value link">\${escapeHtml(ink.url)}</a>
                        </div>
                    \` : ''}
                \`);
            },

            deleteInk(id) {
                DataManager.deleteInk(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderInks();
                this.renderPairings();
                this.updatePairingSelects();
            },

            // Pairing operations
            openPairingModal(id = null) {
                this.currentPairingId = id;
                this.currentRating = 0;
                this.currentFlow = '';
                const modal = document.getElementById('pairing-modal');
                const title = document.getElementById('pairing-modal-title');

                // Reset form
                document.getElementById('pairing-pen').value = '';
                document.getElementById('pairing-ink').value = '';
                document.getElementById('pairing-comments').value = '';

                // Reset rating
                document.querySelectorAll('#pairing-rating .star').forEach(s => s.classList.remove('filled'));
                document.getElementById('pairing-rating-display').textContent = 'Not rated';

                // Reset flow
                document.querySelectorAll('.radio-option').forEach(btn => btn.classList.remove('selected'));

                // Populate selects
                document.getElementById('pairing-pen').innerHTML = '<option value="">Choose a pen...</option>' +
                    DataManager.pens.map(p => \`<option value="\${p.id}">\${escapeHtml(p.brand)} \${escapeHtml(p.model)}</option>\`).join('');

                document.getElementById('pairing-ink').innerHTML = '<option value="">Choose an ink...</option>' +
                    DataManager.inks.map(i => \`<option value="\${i.id}">\${escapeHtml(i.brand)} - \${escapeHtml(i.name)}</option>\`).join('');

                if (id) {
                    title.textContent = 'Edit Pairing';
                    const pairing = DataManager.pairings.find(p => p.id === id);
                    if (pairing) {
                        document.getElementById('pairing-pen').value = pairing.penId;
                        document.getElementById('pairing-ink').value = pairing.inkId;
                        document.getElementById('pairing-comments').value = pairing.comments;
                        this.currentRating = pairing.rating || 0;
                        this.currentFlow = pairing.flow || '';

                        // Set rating display
                        document.querySelectorAll('#pairing-rating .star').forEach((s, i) => {
                            if (i < this.currentRating) {
                                s.classList.add('filled');
                            }
                        });
                        if (this.currentRating > 0) {
                            document.getElementById('pairing-rating-display').textContent = \`\${this.currentRating} star\${this.currentRating !== 1 ? 's' : ''}\`;
                        }

                        // Set flow
                        document.querySelectorAll('.radio-option').forEach(btn => {
                            if (btn.textContent === this.currentFlow) {
                                btn.classList.add('selected');
                            }
                        });
                    }
                } else {
                    title.textContent = 'Add Pairing';
                }

                modal.classList.add('active');
            },

            closePairingModal() {
                document.getElementById('pairing-modal').classList.remove('active');
                this.currentPairingId = null;
                this.currentRating = 0;
                this.currentFlow = '';
            },

            setRating(value) {
                this.currentRating = value;
                document.querySelectorAll('#pairing-rating .star').forEach((s, i) => {
                    if (i < value) {
                        s.classList.add('filled');
                    } else {
                        s.classList.remove('filled');
                    }
                });
                document.getElementById('pairing-rating-display').textContent = \`\${value} star\${value !== 1 ? 's' : ''}\`;
            },

            setFlow(value) {
                this.currentFlow = value;
                document.querySelectorAll('.radio-option').forEach(btn => {
                    if (btn.textContent === value) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.remove('selected');
                    }
                });
            },

            savePairing() {
                const penId = document.getElementById('pairing-pen').value;
                const inkId = document.getElementById('pairing-ink').value;

                if (!penId || !inkId) {
                    alert('Please select both a pen and an ink');
                    return;
                }

                const pairing = {
                    penId: penId,
                    inkId: inkId,
                    rating: this.currentRating,
                    flow: this.currentFlow,
                    comments: document.getElementById('pairing-comments').value.trim()
                };

                if (this.currentPairingId) {
                    DataManager.updatePairing(this.currentPairingId, pairing);
                } else {
                    DataManager.addPairing(pairing);
                }

                this.closePairingModal();
                this.renderDashboard();
                this.renderPairings();
            },

            viewPairingDetail(id) {
                const pairing = DataManager.pairings.find(p => p.id === id);
                if (!pairing) return;

                const pen = DataManager.pens.find(p => p.id === pairing.penId);
                const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                const penLabel = pen ? \`\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}\` : 'Unknown';
                const inkLabel = ink ? \`\${escapeHtml(ink.brand)} - \${escapeHtml(ink.name)}\` : 'Unknown';
                const stars = '★'.repeat(pairing.rating) + '☆'.repeat(5 - pairing.rating);

                this.showDetailView('Pairing Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderPairings();">← Back to Pairings</button>
                    <div class="detail-header">
                        <div class="detail-title">\${penLabel} + \${inkLabel}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openPairingModal('\${pairing.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('pairing', '\${pairing.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Pen</span>
                            <div class="detail-value">\${penLabel}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Ink</span>
                            <div class="detail-value">\${inkLabel}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Rating</span>
                            <div class="detail-value" style="font-size: 1.5rem; color: #e2b714;">\${stars}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Flow</span>
                            <div class="detail-value">\${escapeHtml(pairing.flow || '-')}</div>
                        </div>
                    </div>

                    \${pairing.comments ? \`
                        <div class="card">
                            <div class="detail-label">Comments</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(pairing.comments).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}
                \`);
            },

            deletePairing(id) {
                DataManager.deletePairing(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderPairings();
            },

            // Utility
            updatePairingSelects() {
                if (document.getElementById('pairing-modal').classList.contains('active')) {
                    document.getElementById('pairing-pen').innerHTML = '<option value="">Choose a pen...</option>' +
                        DataManager.pens.map(p => \`<option value="\${p.id}">\${escapeHtml(p.brand)} \${escapeHtml(p.model)}</option>\`).join('');

                    document.getElementById('pairing-ink').innerHTML = '<option value="">Choose an ink...</option>' +
                        DataManager.inks.map(i => \`<option value="\${i.id}">\${escapeHtml(i.brand)} - \${escapeHtml(i.name)}</option>\`).join('');
                }
            },

            showDetailView(title, content) {
                const detailView = document.createElement('div');
                detailView.id = 'detail-view-overlay';
                detailView.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 999;
                    overflow-y: auto;
                    padding: 2rem 1rem;
                \`;

                const detailContent = document.createElement('div');
                detailContent.style.cssText = \`
                    background-color: #16213e;
                    border: 2px solid rgba(226, 183, 20, 0.3);
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                \`;

                detailContent.innerHTML = content;
                detailView.appendChild(detailContent);
                document.body.appendChild(detailView);
            },

            closeDetailView() {
                const detailView = document.getElementById('detail-view-overlay');
                if (detailView) {
                    detailView.remove();
                }
            },

            confirmDelete(type, id) {
                this.confirmCallback = () => {
                    if (type === 'pen') {
                        this.deletePen(id);
                    } else if (type === 'ink') {
                        this.deleteInk(id);
                    } else if (type === 'pairing') {
                        this.deletePairing(id);
                    }
                };

                document.getElementById('confirm-message').textContent = \`Are you sure you want to delete this \${type}? This action cannot be undone.\`;
                document.getElementById('confirm-modal').classList.add('active');
            },

            confirmClearAll() {
                this.confirmCallback = () => {
                    DataManager.clear();
                    this.renderDashboard();
                    this.renderPens();
                    this.renderInks();
                    this.renderPairings();
                    this.renderValue();
                    this.closeConfirm();
                };

                document.getElementById('confirm-message').textContent = 'Are you sure you want to delete ALL data? This cannot be undone.';
                document.getElementById('confirm-modal').classList.add('active');
            },

            confirmAction() {
                if (this.confirmCallback) {
                    this.confirmCallback();
                    this.confirmCallback = null;
                }
            },

            closeConfirm() {
                document.getElementById('confirm-modal').classList.remove('active');
                this.confirmCallback = null;
            },

            // Import/Export
            exportData() {
                const data = DataManager.export();
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`fountain-pen-collection-\${new Date().toISOString().split('T')[0]}.json\`;
                a.click();
                URL.revokeObjectURL(url);
            },

            importData() {
                const fileInput = document.getElementById('import-file');
                const file = fileInput.files[0];

                if (!file) {
                    alert('Please select a file to import');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        DataManager.import(data);
                        this.renderDashboard();
                        this.renderPens();
                        this.renderInks();
                        this.renderPairings();
                        this.renderValue();
                        this.setupComboBoxes();
                        alert('Data imported successfully!');
                        fileInput.value = '';
                    } catch (error) {
                        alert('Error importing file. Please make sure it is a valid JSON file.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            },

            restoreFromBackup() {
                const backup = localStorage.getItem('fp_latest_backup');
                if (!backup) {
                    alert('No backup found. Use Export to create manual backups.');
                    return;
                }
                try {
                    const data = JSON.parse(backup);
                    const msg = 'Restore from backup taken at ' + new Date(data.timestamp).toLocaleString() + '?\\n\\n' +
                        'Backup contains: ' + data.pens.length + ' pens, ' + data.inks.length + ' inks, ' + data.pairings.length + ' pairings.\\n\\n' +
                        'This will REPLACE your current data.';
                    if (!confirm(msg)) return;
                    DataManager.pens = data.pens;
                    DataManager.inks = data.inks;
                    DataManager.pairings = data.pairings;
                    if (data.dropdowns) DataManager.dropdowns = { ...DataManager.dropdowns, ...data.dropdowns };
                    DataManager.save();
                    this.renderDashboard();
                    this.renderPens();
                    this.renderInks();
                    this.renderPairings();
                    this.renderValue();
                    this.setupComboBoxes();
                    alert('Data restored successfully from backup!');
                } catch(e) {
                    alert('Error restoring backup: ' + e.message);
                }
            }
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
    </script>
</body>
</html>
`;
    } else     if (pathname.startsWith('/sandbox')) {
      responseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedicalPKM &mdash; Sandbox</title>
    <style>
        :root {
            --sand: #92400e;
            --sand-light: #d97706;
            --sand-glow: #fbbf24;
            --sand-bg: #1c1207;
            --sand-surface: #2a1f10;
            --sand-card: #352814;
            --text-sand: #fef3c7;
            --text-sand-dim: #d4a574;
            --border-sand: rgba(251,191,36,0.2);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--sand-bg);
            color: var(--text-sand);
            line-height: 1.6;
            min-height: 100vh;
        }

        header {
            background: linear-gradient(135deg, #1c1207 0%, #3d2a0f 50%, #1c1207 100%);
            padding: 2.5rem 1.5rem 2rem;
            text-align: center;
            border-bottom: 1px solid var(--border-sand);
            position: relative;
            overflow: hidden;
        }

        header::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, rgba(251,191,36,0.1) 0%, transparent 70%);
        }

        header h1 {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--sand-glow);
            letter-spacing: 0.5px;
            position: relative;
        }

        header p {
            font-size: 1rem;
            color: var(--text-sand-dim);
            margin-top: 0.4rem;
            font-style: italic;
            position: relative;
        }

        .env-badge {
            display: inline-block;
            margin-top: 0.8rem;
            padding: 0.3rem 1.2rem;
            background: rgba(251,191,36,0.15);
            border: 1px solid var(--border-sand);
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--sand-glow);
            position: relative;
        }

        .nav-back {
            display: inline-block;
            margin: 1.5rem 0 0.5rem 2rem;
            color: var(--text-sand-dim);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s;
        }
        .nav-back:hover { color: var(--sand-glow); }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 1.5rem;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--text-sand-dim);
            margin: 1.5rem 0 1rem;
        }

        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border-sand);
        }

        .app-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 1rem;
        }

        .app-card {
            background: var(--sand-card);
            border: 1px solid var(--border-sand);
            border-radius: 12px;
            padding: 1.5rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .app-card:hover {
            border-color: rgba(251,191,36,0.4);
            box-shadow: 0 4px 12px rgba(251,191,36,0.1);
        }

        .app-card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.8rem;
        }

        .app-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background: rgba(251,191,36,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            flex-shrink: 0;
        }

        .app-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-sand);
        }

        .app-card .version {
            font-size: 0.8rem;
            color: var(--text-sand-dim);
            margin-top: 0.15rem;
        }

        .app-card .description {
            font-size: 0.9rem;
            color: var(--text-sand-dim);
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .app-links {
            display: flex;
            gap: 0.8rem;
            flex-wrap: wrap;
        }

        .app-links a {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-sandbox {
            background: rgba(251,191,36,0.15);
            border: 1px solid var(--border-sand);
            color: var(--sand-glow);
        }
        .btn-sandbox:hover {
            background: rgba(251,191,36,0.25);
            border-color: var(--sand-glow);
        }

        .btn-prod {
            background: rgba(49,130,206,0.15);
            border: 1px solid rgba(49,130,206,0.3);
            color: #90cdf4;
        }
        .btn-prod:hover {
            background: rgba(49,130,206,0.25);
            border-color: #90cdf4;
        }

        .btn-disabled {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.3);
            cursor: not-allowed;
            pointer-events: none;
        }

        .status-badge {
            display: inline-block;
            padding: 0.15rem 0.6rem;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-dev {
            background: rgba(251,191,36,0.2);
            color: var(--sand-glow);
        }
        .status-prod {
            background: rgba(72,187,120,0.2);
            color: #68d391;
        }
        .status-none {
            background: rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.4);
        }

        .info-box {
            background: var(--sand-surface);
            border: 1px solid var(--border-sand);
            border-radius: 10px;
            padding: 1.2rem 1.5rem;
            margin: 1.5rem 0;
            font-size: 0.88rem;
            color: var(--text-sand-dim);
            line-height: 1.7;
        }

        .info-box strong {
            color: var(--sand-glow);
        }

        footer {
            text-align: center;
            padding: 2rem 1.5rem;
            color: var(--text-sand-dim);
            font-size: 0.8rem;
            font-style: italic;
            opacity: 0.6;
        }

        @media (max-width: 480px) {
            .app-grid { grid-template-columns: 1fr; }
            header h1 { font-size: 1.6rem; }
        }
    </style>
</head>
<body>
    <header>
        <h1>&#9881; The Sandbox</h1>
        <p>&ldquo;Where ideas are forged before they face the world.&rdquo;</p>
        <span class="env-badge">&#9888; Development Environment</span>
    </header>

    <a href="/" class="nav-back">&#9664; Return to main site</a>

    <div class="container">

        <div class="info-box">
            <strong>How this works:</strong> Apps are developed and tested here in the sandbox before being promoted to production.
            Each app has a sandbox link (for testing) and a production link (the live version visitors see).
            Only admin accounts can access this area.
        </div>

        <div class="section-title">&#128295; Apps in Development</div>

        <div class="app-grid">
            <div class="app-card">
                <div class="app-card-header">
                    <div class="app-icon">&#128209;</div>
                    <div>
                        <h3>KOL Brief Generator</h3>
                        <div class="version">v0.1.0 &mdash; Initial scaffold</div>
                    </div>
                </div>
                <p class="description">
                    Generate comprehensive 6-page PDF briefs for Key Opinion Leaders.
                    Conference prep with leadership analysis, expertise mapping, and conversation starters.
                </p>
                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem;">
                    <span class="status-badge status-dev">Sandbox: v0.1.0</span>
                    <span class="status-badge status-live">Production: kol.medicalpkm.com</span>
                </div>
                <div class="app-links">
                    <a href="/sandbox/kol-brief/" class="btn-sandbox">&#128736; Open Sandbox</a>
                    <a href="https://kol.medicalpkm.com" class="btn-prod">&#127760; View Production</a>
                </div>
            </div>

            <div class="app-card">
                <div class="app-card-header">
                    <div class="app-icon">&#9997;</div>
                    <div>
                        <h3>Fountain Pen Companion</h3>
                        <div class="version">v0.1.0 &mdash; Live in production</div>
                    </div>
                </div>
                <p class="description">
                    Track your fountain pen collection, ink inventory, and pen-ink pairings.
                    Visual catalog with usage notes.
                </p>
                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem;">
                    <span class="status-badge status-dev">Sandbox: v0.1.0</span>
                    <span class="status-badge status-prod">Production: live</span>
                </div>
                <div class="app-links">
                    <a href="/sandbox/fountain-pen/" class="btn-sandbox">&#128736; Open Sandbox</a>
                    <a href="/apps/shared/fountain-pen/" class="btn-prod">&#127760; View Production</a>
                </div>
            </div>

            <div class="app-card">
                <div class="app-card-header">
                    <div class="app-icon">&#128203;</div>
                    <div>
                        <h3>Clinical Notes Organizer</h3>
                        <div class="version">Not started</div>
                    </div>
                </div>
                <p class="description">
                    Structured note-taking tool for clinical observations and study references.
                    Searchable and tagged.
                </p>
                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem;">
                    <span class="status-badge status-none">Sandbox: &mdash;</span>
                    <span class="status-badge status-none">Production: &mdash;</span>
                </div>
                <div class="app-links">
                    <a href="#" class="btn-sandbox btn-disabled">&#128736; Open Sandbox</a>
                    <a href="#" class="btn-prod btn-disabled">&#127760; View Production</a>
                </div>
            </div>
        </div>

    </div>

    <footer>
        &ldquo;Every great spell was once just an experiment.&rdquo; &mdash; The Archivist<br>
        Protected by Cloudflare Access &mdash; Admin Only
    </footer>
</body>
</html>
`;
    } else     if (pathname.startsWith('/apps/private')) {
      responseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedicalPKM &mdash; Inner Sanctum</title>
    <style>
        :root {
            --arcane: #7c3aed;
            --arcane-glow: #a78bfa;
            --arcane-dark: #4c1d95;
            --arcane-bg: #1a0a2e;
            --text-arcane: #e9d5ff;
            --text-arcane-dim: #c4b5fd;
            --border-arcane: rgba(167,139,250,0.2);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--arcane-bg);
            color: var(--text-arcane);
            line-height: 1.6;
            min-height: 100vh;
        }

        /* Header */
        header {
            background: linear-gradient(135deg, #1a0a2e 0%, #2d1054 50%, #1a0a2e 100%);
            padding: 2.5rem 1.5rem 2rem;
            text-align: center;
            border-bottom: 1px solid var(--border-arcane);
            position: relative;
            overflow: hidden;
        }

        header::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%);
        }

        header h1 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            margin-bottom: 0.4rem;
            text-shadow: 0 0 30px rgba(167,139,250,0.4);
            position: relative;
        }

        header p {
            font-size: 0.95rem;
            color: var(--text-arcane-dim);
            font-style: italic;
            position: relative;
        }

        .ward-badge {
            display: inline-block;
            margin-top: 0.8rem;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--arcane-glow);
            border: 1px solid rgba(167,139,250,0.3);
            padding: 0.25rem 1rem;
            border-radius: 20px;
            position: relative;
        }

        /* Main content */
        main {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--arcane-glow);
            margin-bottom: 1.2rem;
            font-weight: 600;
        }

        .section-divider {
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, var(--border-arcane), transparent);
        }

        /* App cards */
        .app-grid {
            display: grid;
            gap: 0.8rem;
            margin-bottom: 2.5rem;
        }

        .app-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            background: rgba(124,58,237,0.08);
            border: 1px solid var(--border-arcane);
            border-radius: 12px;
            padding: 1.2rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
        }

        .app-card:hover {
            background: rgba(124,58,237,0.15);
            border-color: rgba(167,139,250,0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(124,58,237,0.2);
        }

        .app-icon {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            background: rgba(124,58,237,0.15);
            border: 1px solid rgba(167,139,250,0.2);
        }

        .app-info h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.2rem;
            color: var(--text-arcane);
        }

        .app-info p {
            font-size: 0.88rem;
            color: var(--text-arcane-dim);
            line-height: 1.5;
            opacity: 0.8;
        }

        .app-tag {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            margin-top: 0.5rem;
        }

        .tag-live { background: rgba(72,187,120,0.2); color: #68d391; }
        .tag-dev { background: rgba(236,201,75,0.2); color: #ecc94b; }
        .tag-soon { background: rgba(167,139,250,0.2); color: #a78bfa; }

        /* Back link */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            color: var(--arcane-glow);
            text-decoration: none;
            font-size: 0.85rem;
            margin-bottom: 2rem;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }

        .back-link:hover { opacity: 1; }

        /* Flavor text */
        .flavor {
            text-align: center;
            font-size: 0.78rem;
            color: var(--arcane);
            font-style: italic;
            margin-top: 1rem;
            opacity: 0.5;
        }

        /* Footer */
        footer {
            text-align: center;
            padding: 2rem 1.5rem;
            font-size: 0.78rem;
            color: rgba(167,139,250,0.4);
            border-top: 1px solid var(--border-arcane);
            margin-top: 2rem;
        }

        footer a { color: var(--arcane-glow); text-decoration: none; }

        /* Responsive */
        @media (min-width: 640px) {
            header h1 { font-size: 2.4rem; }
            .app-grid { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>

<header>
    <h1>&#9876; The Inner Sanctum</h1>
    <p>&ldquo;You have proven worthy, adventurer.&rdquo;</p>
    <span class="ward-badge">&#9733; Owner Access Granted &#9733;</span>
</header>

<main>

    <a href="/" class="back-link">&#9664; Return to the surface</a>

    <!-- ===================== PRIVATE APPS ===================== -->
    <div class="section-header">
        <span>&#128274;</span>
        Private Applications
        <span class="section-divider"></span>
    </div>

    <div class="app-grid">

        <a href="/apps/private/medical-notes/" class="app-card">
            <div class="app-icon">&#9764;</div>
            <div class="app-info">
                <h3>Medical Study Notes</h3>
                <p>Personal medical study notes, case summaries, and exam prep materials. Private and searchable.</p>
                <span class="app-tag tag-dev">In Development</span>
            </div>
        </a>

        <a href="/apps/private/pkm-dashboard/" class="app-card">
            <div class="app-icon">&#128218;</div>
            <div class="app-info">
                <h3>PKM Dashboard</h3>
                <p>Central hub for personal knowledge management. Links, notes, and connections in one place.</p>
                <span class="app-tag tag-soon">Coming Soon</span>
            </div>
        </a>

        <a href="/apps/private/journal/" class="app-card">
            <div class="app-icon">&#128221;</div>
            <div class="app-info">
                <h3>Learning Journal</h3>
                <p>Daily reflections and learning log. Track what you studied, insights gained, and questions to explore.</p>
                <span class="app-tag tag-soon">Coming Soon</span>
            </div>
        </a>

        <a href="/apps/private/api-tools/" class="app-card">
            <div class="app-icon">&#9881;</div>
            <div class="app-info">
                <h3>API Tools &amp; Sandbox</h3>
                <p>Private API testing playground and developer tools. Experiment with integrations safely.</p>
                <span class="app-tag tag-soon">Coming Soon</span>
            </div>
        </a>

    </div>

    <div class="flavor">
        &ldquo;The greatest treasures are guarded not by strength, but by wisdom.&rdquo; &mdash; The Archivist
    </div>

</main>

<footer>
    <p>MedicalPKM &copy; 2026 &mdash; The Inner Sanctum</p>
    <p style="margin-top: 0.4rem;">Protected by <a href="https://www.cloudflare.com/zero-trust/products/access/" target="_blank" rel="noopener">Cloudflare Access</a> &mdash; Owner Only</p>
</footer>

</body>
</html>
`;
    } else     if (pathname.startsWith('/apps/shared/fountain-pen')) {
      responseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fountain Pen Companion - MedicalPKM</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1a1a2e;
            color: #e8e8e8;
        }

        #app {
            display: flex;
            height: 100vh;
            flex-direction: column;
        }

        /* Header */
        header {
            background-color: #16213e;
            border-bottom: 2px solid rgba(226, 183, 20, 0.2);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        header h1 {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        /* Main container */
        .main-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Sidebar */
        sidebar {
            width: 250px;
            background-color: #16213e;
            border-right: 2px solid rgba(226, 183, 20, 0.2);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            overflow-y: auto;
        }

        .nav-tab {
            padding: 0.75rem 1rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 2px solid transparent;
            border-radius: 0.5rem;
            color: #e8e8e8;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .nav-tab:hover {
            background-color: rgba(226, 183, 20, 0.15);
            border-color: rgba(226, 183, 20, 0.3);
        }

        .nav-tab.active {
            background-color: rgba(226, 183, 20, 0.25);
            border-color: #e2b714;
            color: #e2b714;
        }

        /* Content area */
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
            display: none;
        }

        .content.active {
            display: block;
        }

        /* Cards and sections */
        .card {
            background-color: #16213e;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
        }

        .card:hover {
            border-color: rgba(226, 183, 20, 0.4);
            box-shadow: 0 0 20px rgba(226, 183, 20, 0.1);
        }

        .card-title {
            font-size: 1.25rem;
            color: #e2b714;
            margin-bottom: 1rem;
            font-weight: 600;
        }

        /* Stats grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: linear-gradient(135deg, #16213e 0%, #0f1927 100%);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            padding: 1.5rem;
            text-align: center;
        }

        .stat-value {
            font-size: 2.5rem;
            color: #e2b714;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #a0a0a0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background-color: #e2b714;
            color: #1a1a2e;
        }

        .btn-primary:hover {
            background-color: #f0c420;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(226, 183, 20, 0.3);
        }

        .btn-secondary {
            background-color: rgba(226, 183, 20, 0.2);
            color: #e2b714;
            border: 1px solid rgba(226, 183, 20, 0.4);
        }

        .btn-secondary:hover {
            background-color: rgba(226, 183, 20, 0.35);
            border-color: rgba(226, 183, 20, 0.6);
        }

        .btn-danger {
            background-color: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background-color: #dc2626;
        }

        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }

        /* Forms */
        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e2b714;
            font-weight: 500;
            font-size: 0.95rem;
        }

        input[type="text"],
        input[type="email"],
        input[type="number"],
        input[type="date"],
        input[type="url"],
        select,
        textarea {
            width: 100%;
            padding: 0.75rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            color: #e8e8e8;
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="number"]:focus,
        input[type="date"]:focus,
        input[type="url"]:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #e2b714;
            background-color: rgba(226, 183, 20, 0.1);
            box-shadow: 0 0 0 3px rgba(226, 183, 20, 0.1);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
        }

        /* Form layouts */
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(226, 183, 20, 0.2);
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background-color: #16213e;
            border: 2px solid rgba(226, 183, 20, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.2);
        }

        .modal-title {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        .modal-close {
            background: none;
            border: none;
            color: #e8e8e8;
            font-size: 1.5rem;
            cursor: pointer;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            color: #e2b714;
            transform: scale(1.1);
        }

        /* Tables */
        .table-container {
            overflow-x: auto;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
        }

        thead {
            background-color: rgba(226, 183, 20, 0.1);
            border-bottom: 2px solid rgba(226, 183, 20, 0.2);
        }

        th {
            padding: 1rem;
            text-align: left;
            color: #e2b714;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.15);
            color: #e8e8e8;
        }

        tbody tr {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        tbody tr:hover {
            background-color: rgba(226, 183, 20, 0.1);
            border-left: 3px solid #e2b714;
            padding-left: 0.75rem;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 0.35rem;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge-wishlist {
            background-color: rgba(107, 114, 128, 0.2);
            color: #9ca3af;
        }

        .badge-ordered {
            background-color: rgba(234, 179, 8, 0.2);
            color: #eab308;
        }

        .badge-in-collection {
            background-color: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .badge-inked {
            background-color: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }

        .badge-sold {
            background-color: rgba(249, 115, 22, 0.2);
            color: #f97316;
        }

        .badge-lost {
            background-color: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        /* Controls row */
        .controls-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-group {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .filter-group select {
            width: auto;
            min-width: 150px;
        }

        .search-box {
            flex: 1;
            min-width: 200px;
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #a0a0a0;
        }

        .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state-text {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        /* Rating stars */
        .stars {
            display: flex;
            gap: 0.5rem;
            cursor: pointer;
            font-size: 1.5rem;
        }

        .star {
            cursor: pointer;
            color: #6b7280;
            transition: all 0.3s ease;
        }

        .star:hover,
        .star.filled {
            color: #e2b714;
            transform: scale(1.2);
        }

        /* Radio and toggle buttons */
        .radio-group,
        .toggle-group {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .radio-option,
        .toggle-option {
            padding: 0.5rem 1rem;
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            cursor: pointer;
            background-color: rgba(226, 183, 20, 0.05);
            color: #e8e8e8;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .radio-option.selected,
        .toggle-option.selected {
            background-color: #e2b714;
            color: #1a1a2e;
            border-color: #e2b714;
            font-weight: 600;
        }

        .radio-option:hover,
        .toggle-option:hover {
            border-color: rgba(226, 183, 20, 0.4);
            background-color: rgba(226, 183, 20, 0.15);
        }

        /* ComboBox styling */
        .combobox-container {
            position: relative;
        }

        .combobox-input {
            width: 100%;
            padding: 0.75rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.2);
            border-radius: 0.5rem;
            color: #e8e8e8;
            font-size: 1rem;
            cursor: pointer;
        }

        .combobox-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #16213e;
            border: 1px solid rgba(226, 183, 20, 0.3);
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            max-height: 200px;
            overflow-y: auto;
            z-index: 10;
            margin-top: -0.5rem;
            padding: 0.5rem 0;
        }

        .combobox-dropdown.active {
            display: block;
        }

        .combobox-option {
            padding: 0.75rem 1rem;
            cursor: pointer;
            color: #e8e8e8;
            transition: all 0.2s ease;
        }

        .combobox-option:hover {
            background-color: rgba(226, 183, 20, 0.15);
            color: #e2b714;
        }

        /* Detail view */
        .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(226, 183, 20, 0.2);
        }

        .detail-title {
            font-size: 1.5rem;
            color: #e2b714;
            font-weight: 600;
        }

        .detail-actions {
            display: flex;
            gap: 1rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .detail-group {
            padding: 1.5rem;
            background-color: rgba(226, 183, 20, 0.05);
            border: 1px solid rgba(226, 183, 20, 0.15);
            border-radius: 0.75rem;
        }

        .detail-label {
            font-size: 0.85rem;
            color: #a0a0a0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
            display: block;
        }

        .detail-value {
            font-size: 1.1rem;
            color: #e8e8e8;
            word-break: break-word;
        }

        .detail-value.link {
            color: #e2b714;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .detail-value.link:hover {
            text-decoration: underline;
        }

        /* Back button */
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            color: #e2b714;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateX(-4px);
        }

        /* Utility classes */
        .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .mt-1 {
            margin-top: 1rem;
        }

        .mt-2 {
            margin-top: 2rem;
        }

        .mb-1 {
            margin-bottom: 1rem;
        }

        .mb-2 {
            margin-bottom: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
            }

            sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 2px solid rgba(226, 183, 20, 0.2);
                padding: 0.5rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                height: auto;
            }

            .content {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .filter-group {
                width: 100%;
            }

            .filter-group select {
                flex: 1;
                min-width: 120px;
            }

            .modal-content {
                width: 95%;
            }
        }

        @media (max-width: 480px) {
            header h1 {
                font-size: 1.25rem;
            }

            .btn {
                padding: 0.6rem 1rem;
                font-size: 0.9rem;
            }

            .card {
                padding: 1rem;
            }

            table {
                font-size: 0.85rem;
            }

            th, td {
                padding: 0.75rem;
            }

            .detail-grid {
                gap: 1rem;
            }

            .detail-group {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <nav style="background:#1e293b;height:40px;display:flex;align-items:center;padding:0 1.5rem;">
        <div style="max-width:1120px;width:100%;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
            <a href="https://medicalpkm.com" style="display:flex;align-items:center;gap:6px;color:white;text-decoration:none;font-weight:600;font-size:0.875rem;">
                <span style="color:#f59e0b;font-weight:700;">&#9672;</span>
                <span>MedicalPKM</span>
                <span style="color:#64748b;margin:0 4px;">/</span>
                <span style="color:#cbd5e1;font-size:0.875rem;font-weight:500;">Fountain Pen</span>
            </a>
            <div style="display:flex;align-items:center;gap:4px;">
                <a href="https://kol.medicalpkm.com" style="color:#94a3b8;text-decoration:none;font-size:0.8125rem;font-weight:500;padding:4px 8px;border-radius:6px;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#94a3b8';this.style.background='none'">KOL Briefs</a>
                <a href="https://coc.medicalpkm.com" style="color:#94a3b8;text-decoration:none;font-size:0.8125rem;font-weight:500;padding:4px 8px;border-radius:6px;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#94a3b8';this.style.background='none'">Cthulhu Investigator</a>
            </div>
        </div>
    </nav>
    <div id="app">
        <header>
            <span style="font-size: 1.8rem;">✒️</span>
            <h1>Fountain Pen Companion</h1>
        </header>

        <div class="main-container">
            <sidebar>
                <button class="nav-tab active" data-tab="dashboard">📊 Dashboard</button>
                <button class="nav-tab" data-tab="pens">🖊️ Pens</button>
                <button class="nav-tab" data-tab="inks">🎨 Inks</button>
                <button class="nav-tab" data-tab="pairings">💫 Pairings</button>
                <button class="nav-tab" data-tab="value">💰 Value</button>
                <button class="nav-tab" data-tab="settings">⚙️ Settings</button>
            </sidebar>

            <!-- Dashboard Tab -->
            <div id="dashboard" class="content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="stat-pens">0</div>
                        <div class="stat-label">Total Pens</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-inks">0</div>
                        <div class="stat-label">Total Inks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-pairings">0</div>
                        <div class="stat-label">Active Pairings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stat-investment" style="font-size: 1.8rem;">-</div>
                        <div class="stat-label">Total Investment</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Quick Add</div>
                    <div class="controls-row">
                        <button class="btn btn-primary" onclick="app.openPenModal()">
                            <span>➕</span> Add Pen
                        </button>
                        <button class="btn btn-primary" onclick="app.openInkModal()">
                            <span>➕</span> Add Ink
                        </button>
                        <button class="btn btn-primary" onclick="app.openPairingModal()">
                            <span>➕</span> Add Pairing
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Recent Additions</div>
                    <div id="recent-list"></div>
                </div>
            </div>

            <!-- Pens Tab -->
            <div id="pens" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Pens</h2>
                    <button class="btn btn-primary" onclick="app.openPenModal()">
                        <span>➕</span> Add Pen
                    </button>
                </div>

                <div class="card">
                    <div class="controls-row">
                        <input type="text" id="pens-search" class="search-box" placeholder="Search pens...">
                        <div class="filter-group">
                            <select id="pens-filter-brand">
                                <option value="">All Brands</option>
                            </select>
                            <select id="pens-filter-status">
                                <option value="">All Status</option>
                                <option value="Wishlist">Wishlist</option>
                                <option value="Ordered">Ordered</option>
                                <option value="In Collection">In Collection</option>
                                <option value="Inked">Inked</option>
                                <option value="Sold">Sold</option>
                                <option value="Lost">Lost</option>
                            </select>
                            <select id="pens-filter-nib">
                                <option value="">All Nib Sizes</option>
                            </select>
                            <select id="pens-filter-filling">
                                <option value="">All Filling Systems</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="pens-table">
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Line</th>
                                    <th>Model</th>
                                    <th>Nib</th>
                                    <th>Filling System</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="pens-tbody"></tbody>
                        </table>
                    </div>
                    <div id="pens-empty" class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">No pens yet. Add your first pen to get started!</div>
                        <button class="btn btn-primary" onclick="app.openPenModal()">Add Pen</button>
                    </div>
                </div>
            </div>

            <!-- Inks Tab -->
            <div id="inks" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Inks</h2>
                    <button class="btn btn-primary" onclick="app.openInkModal()">
                        <span>➕</span> Add Ink
                    </button>
                </div>

                <div class="card">
                    <div class="controls-row">
                        <input type="text" id="inks-search" class="search-box" placeholder="Search inks...">
                        <div class="filter-group">
                            <select id="inks-filter-brand">
                                <option value="">All Brands</option>
                            </select>
                            <select id="inks-filter-color">
                                <option value="">All Colors</option>
                            </select>
                            <select id="inks-filter-properties">
                                <option value="">All Properties</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="inks-table">
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Name</th>
                                    <th>Color Family</th>
                                    <th>Volume</th>
                                    <th>Properties</th>
                                </tr>
                            </thead>
                            <tbody id="inks-tbody"></tbody>
                        </table>
                    </div>
                    <div id="inks-empty" class="empty-state">
                        <div class="empty-state-icon">🎨</div>
                        <div class="empty-state-text">No inks yet. Add your first ink to get started!</div>
                        <button class="btn btn-primary" onclick="app.openInkModal()">Add Ink</button>
                    </div>
                </div>
            </div>

            <!-- Pairings Tab -->
            <div id="pairings" class="content">
                <div class="flex-between mb-2">
                    <h2 style="font-size: 1.5rem; color: #e2b714;">My Pairings</h2>
                    <button class="btn btn-primary" onclick="app.openPairingModal()">
                        <span>➕</span> Add Pairing
                    </button>
                </div>

                <div class="card">
                    <input type="text" id="pairings-search" class="search-box" placeholder="Search pairings...">
                </div>

                <div class="card">
                    <div class="table-container">
                        <table id="pairings-table">
                            <thead>
                                <tr>
                                    <th>Pen</th>
                                    <th>Ink</th>
                                    <th>Rating</th>
                                    <th>Flow</th>
                                </tr>
                            </thead>
                            <tbody id="pairings-tbody"></tbody>
                        </table>
                    </div>
                    <div id="pairings-empty" class="empty-state">
                        <div class="empty-state-icon">💫</div>
                        <div class="empty-state-text">No pairings yet. Create your first pairing!</div>
                        <button class="btn btn-primary" onclick="app.openPairingModal()">Add Pairing</button>
                    </div>
                </div>
            </div>

            <!-- Value Tab -->
            <div id="value" class="content">
                <h2 style="font-size: 1.5rem; color: #e2b714; margin-bottom: 1.5rem;">Collection Value</h2>

                <div class="stats-grid" id="value-stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="value-total-usd" style="font-size: 1.8rem;">$0</div>
                        <div class="stat-label">Total (USD)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-total-eur" style="font-size: 1.8rem;">\u20AC0</div>
                        <div class="stat-label">Total (EUR)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-avg" style="font-size: 1.8rem;">-</div>
                        <div class="stat-label">Avg. Pen Price</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="value-most-expensive" style="font-size: 1.4rem;">-</div>
                        <div class="stat-label">Most Expensive</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Investment by Brand</div>
                    <div id="value-brand-breakdown"></div>
                </div>

                <div class="card">
                    <div class="card-title">All Pens by Price (Highest First)</div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pen</th>
                                    <th>Nib</th>
                                    <th style="text-align: right;">Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="value-price-list"></tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Spending Timeline</div>
                    <div id="value-timeline"></div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div id="settings" class="content">
                <h2 style="font-size: 1.5rem; color: #e2b714; margin-bottom: 1.5rem;">Settings</h2>

                <div class="card">
                    <div class="card-title">Data Management</div>
                    <div class="form-group">
                        <label>Export Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Download all your pens, inks, and pairings as a JSON file for backup.
                        </p>
                        <button class="btn btn-secondary" onclick="app.exportData()">
                            <span>⬇️</span> Export as JSON
                        </button>
                    </div>

                    <div class="form-group mt-2">
                        <label>Import Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Upload a JSON file to restore your data. This will merge with existing data.
                        </p>
                        <input type="file" id="import-file" accept=".json" style="margin-bottom: 1rem;">
                        <button class="btn btn-secondary" onclick="app.importData()">
                            <span>⬆️</span> Import from JSON
                        </button>
                    </div>

                    <div class="form-group mt-2">
                        <label>Restore from Backup</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Restore your collection from the latest auto-backup snapshot.
                        </p>
                        <button class="btn btn-secondary" onclick="app.restoreFromBackup()">
                            <span>🔄</span> Restore Latest Backup
                        </button>
                        <p id="backup-info" style="color: #a0a0a0; margin-top: 0.5rem; font-size: 0.85rem;"></p>
                    </div>

                    <div class="form-group mt-2">
                        <label>Clear All Data</label>
                        <p style="color: #a0a0a0; margin-bottom: 1rem; font-size: 0.9rem;">
                            Permanently delete all pens, inks, and pairings. This action cannot be undone.
                        </p>
                        <button class="btn btn-danger" onclick="app.confirmClearAll()">
                            <span>🗑️</span> Clear All Data
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Information</div>
                    <p style="color: #a0a0a0; font-size: 0.95rem;">
                        <strong style="color: #e2b714;">Fountain Pen Companion</strong> is a MedicalPKM application for managing your fountain pen collection.
                    </p>
                    <p style="color: #a0a0a0; font-size: 0.95rem; margin-top: 1rem;">
                        All data is stored locally in your browser. No data is sent to any server.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->

    <!-- Pen Modal -->
    <div id="pen-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="pen-modal-title">Add Pen</div>
                <button class="modal-close" onclick="app.closePenModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-brand">Brand</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-brand" class="combobox-input" placeholder="Select or type brand...">
                        <div id="pen-brand-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="pen-line">Line</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-line" class="combobox-input" placeholder="Select or type line...">
                        <div id="pen-line-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-model">Model</label>
                    <div class="combobox-container">
                        <input type="text" id="pen-model" class="combobox-input" placeholder="Select or type model...">
                        <div id="pen-model-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-nib-size">Nib Size</label>
                    <select id="pen-nib-size">
                        <option value="">Select nib size...</option>
                        <option value="EF">EF (Extra Fine)</option>
                        <option value="F">F (Fine)</option>
                        <option value="M">M (Medium)</option>
                        <option value="B">B (Broad)</option>
                        <option value="BB">BB (Double Broad)</option>
                        <option value="Stub 1.1">Stub 1.1</option>
                        <option value="Stub 1.5">Stub 1.5</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-nib-material">Nib Material</label>
                    <select id="pen-nib-material">
                        <option value="">Select material...</option>
                        <option value="Steel">Steel</option>
                        <option value="Gold 14k">Gold 14k</option>
                        <option value="Gold 18k">Gold 18k</option>
                        <option value="Gold 21k">Gold 21k</option>
                        <option value="Titanium">Titanium</option>
                        <option value="Palladium">Palladium</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-nib-grind">Nib Grind</label>
                    <select id="pen-nib-grind">
                        <option value="">Select grind...</option>
                        <option value="Standard">Standard</option>
                        <option value="CI">CI (Cursive Italic)</option>
                        <option value="Architect">Architect</option>
                        <option value="Stub">Stub</option>
                        <option value="Zoom">Zoom</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-filling">Filling System</label>
                    <select id="pen-filling">
                        <option value="">Select filling system...</option>
                        <option value="Cartridge">Cartridge</option>
                        <option value="Converter">Converter</option>
                        <option value="Piston">Piston</option>
                        <option value="Vacuum">Vacuum</option>
                        <option value="Eyedropper">Eyedropper</option>
                        <option value="Lever">Lever</option>
                        <option value="Plunger">Plunger</option>
                        <option value="Pneumatic">Pneumatic</option>
                        <option value="Bulb">Bulb</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-price">Purchase Price</label>
                    <input type="number" id="pen-price" placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="pen-currency">Currency</label>
                    <select id="pen-currency">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BRL">BRL</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pen-status">Status</label>
                    <select id="pen-status">
                        <option value="Wishlist">Wishlist</option>
                        <option value="Ordered">Ordered</option>
                        <option value="In Collection">In Collection</option>
                        <option value="Inked">Inked</option>
                        <option value="Sold">Sold</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pen-date">Date of Purchase</label>
                    <input type="date" id="pen-date">
                </div>
            </div>

            <div class="form-group">
                <label for="pen-notes">Notes</label>
                <textarea id="pen-notes" placeholder="Add any notes about this pen..."></textarea>
            </div>

            <div class="form-group">
                <label for="pen-url">Store/Website URL</label>
                <input type="url" id="pen-url" placeholder="https://...">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closePenModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.savePen()">Save Pen</button>
            </div>
        </div>
    </div>

    <!-- Ink Modal -->
    <div id="ink-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="ink-modal-title">Add Ink</div>
                <button class="modal-close" onclick="app.closeInkModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-brand">Brand</label>
                    <div class="combobox-container">
                        <input type="text" id="ink-brand" class="combobox-input" placeholder="Select or type brand...">
                        <div id="ink-brand-dropdown" class="combobox-dropdown"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ink-name">Name</label>
                    <input type="text" id="ink-name" placeholder="Ink name">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-color">Color Family</label>
                    <select id="ink-color">
                        <option value="">Select color...</option>
                        <option value="Blue">Blue</option>
                        <option value="Blue-Black">Blue-Black</option>
                        <option value="Black">Black</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Purple">Purple</option>
                        <option value="Brown">Brown</option>
                        <option value="Orange">Orange</option>
                        <option value="Yellow">Yellow</option>
                        <option value="Pink">Pink</option>
                        <option value="Turquoise">Turquoise</option>
                        <option value="Grey">Grey</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ink-volume">Volume</label>
                    <input type="text" id="ink-volume" placeholder="e.g., 50ml">
                </div>
            </div>

            <div class="form-group">
                <label>Properties</label>
                <div class="toggle-group">
                    <button class="toggle-option" data-property="Waterproof" onclick="app.toggleInkProperty(this, 'Waterproof')">Waterproof</button>
                    <button class="toggle-option" data-property="Water Resistant" onclick="app.toggleInkProperty(this, 'Water Resistant')">Water Resistant</button>
                    <button class="toggle-option" data-property="Bulletproof" onclick="app.toggleInkProperty(this, 'Bulletproof')">Bulletproof</button>
                    <button class="toggle-option" data-property="Shimmer" onclick="app.toggleInkProperty(this, 'Shimmer')">Shimmer</button>
                    <button class="toggle-option" data-property="Sheen" onclick="app.toggleInkProperty(this, 'Sheen')">Sheen</button>
                    <button class="toggle-option" data-property="Shading" onclick="app.toggleInkProperty(this, 'Shading')">Shading</button>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="ink-price">Purchase Price</label>
                    <input type="number" id="ink-price" placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="ink-currency">Currency</label>
                    <select id="ink-currency">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BRL">BRL</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="ink-notes">Notes</label>
                <textarea id="ink-notes" placeholder="Add any notes about this ink..."></textarea>
            </div>

            <div class="form-group">
                <label for="ink-url">Store/Website URL</label>
                <input type="url" id="ink-url" placeholder="https://...">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closeInkModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.saveInk()">Save Ink</button>
            </div>
        </div>
    </div>

    <!-- Pairing Modal -->
    <div id="pairing-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="pairing-modal-title">Add Pairing</div>
                <button class="modal-close" onclick="app.closePairingModal()">✕</button>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="pairing-pen">Select Pen</label>
                    <select id="pairing-pen">
                        <option value="">Choose a pen...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pairing-ink">Select Ink</label>
                    <select id="pairing-ink">
                        <option value="">Choose an ink...</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Rating</label>
                <div id="pairing-rating" class="stars">
                    <span class="star" onclick="app.setRating(1)">★</span>
                    <span class="star" onclick="app.setRating(2)">★</span>
                    <span class="star" onclick="app.setRating(3)">★</span>
                    <span class="star" onclick="app.setRating(4)">★</span>
                    <span class="star" onclick="app.setRating(5)">★</span>
                </div>
                <div style="color: #a0a0a0; font-size: 0.9rem; margin-top: 0.5rem;" id="pairing-rating-display">Not rated</div>
            </div>

            <div class="form-group">
                <label>Flow</label>
                <div class="radio-group">
                    <button class="radio-option" onclick="app.setFlow('Dry')">Dry</button>
                    <button class="radio-option" onclick="app.setFlow('Medium')">Medium</button>
                    <button class="radio-option" onclick="app.setFlow('Wet')">Wet</button>
                </div>
            </div>

            <div class="form-group">
                <label for="pairing-comments">Comments</label>
                <textarea id="pairing-comments" placeholder="Add notes about this pairing..."></textarea>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closePairingModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.savePairing()">Save Pairing</button>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirm-modal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Confirm Action</div>
                <button class="modal-close" onclick="app.closeConfirm()">✕</button>
            </div>
            <p id="confirm-message" style="margin-bottom: 2rem; color: #e8e8e8;"></p>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.closeConfirm()">Cancel</button>
                <button class="btn btn-danger" id="confirm-btn" onclick="app.confirmAction()">Confirm</button>
            </div>
        </div>
    </div>

    <script>
        // Utility functions
        const generateId = () => crypto.randomUUID();

        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Data management
        const DataManager = {
            pens: [],
            inks: [],
            pairings: [],
            dropdowns: {
                brands: ['Montblanc', 'Visconti', 'Pilot', 'Pelikan', 'Leonardo', 'Lamy', 'TWSBI', 'Esterbrook', 'Scribo', 'Gravitas', 'Omas', 'Sailor'],
                lines: {
                    'Visconti': ['Homo Sapiens', 'Divina', 'Mythos', 'Van Gogh', 'Rembrandt', 'Opera']
                },
                inkBrands: ['Noodler\\'s', 'Pilot Iroshizuku', 'Diamine', 'Montblanc', 'Sailor', 'Platinum', 'Pelikan', 'Rohrer & Klingner', 'J. Herbin', 'Krishna', 'Robert Oster'],
                nibSizes: ['EF', 'F', 'M', 'B', 'BB', 'Stub 1.1', 'Stub 1.5'],
                fillingSystems: ['Cartridge', 'Converter', 'Piston', 'Vacuum', 'Eyedropper', 'Lever', 'Plunger', 'Pneumatic', 'Bulb'],
                colorFamilies: ['Blue', 'Blue-Black', 'Black', 'Red', 'Green', 'Purple', 'Brown', 'Orange', 'Yellow', 'Pink', 'Turquoise', 'Grey']
            },

            load() {
                const pens = localStorage.getItem('fpens');
                const inks = localStorage.getItem('finks');
                const pairings = localStorage.getItem('fpairings');
                const dropdowns = localStorage.getItem('fdropdowns');

                this.pens = pens ? JSON.parse(pens) : [];
                this.inks = inks ? JSON.parse(inks) : [];
                this.pairings = pairings ? JSON.parse(pairings) : [];

                if (dropdowns) {
                    const loaded = JSON.parse(dropdowns);
                    this.dropdowns = { ...this.dropdowns, ...loaded };
                } else {
                    this.save();
                }
            },

            save() {
                localStorage.setItem('fpens', JSON.stringify(this.pens));
                localStorage.setItem('finks', JSON.stringify(this.inks));
                localStorage.setItem('fpairings', JSON.stringify(this.pairings));
                localStorage.setItem('fdropdowns', JSON.stringify(this.dropdowns));
                // Auto-backup: keep a rolling snapshot for recovery
                try {
                    var backup = JSON.stringify({
                        pens: this.pens, inks: this.inks,
                        pairings: this.pairings, dropdowns: this.dropdowns,
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('fp_latest_backup', backup);
                    var today = new Date().toISOString().split('T')[0];
                    if (!localStorage.getItem('fp_backup_' + today)) {
                        localStorage.setItem('fp_backup_' + today, backup);
                    }
                } catch(e) { /* localStorage quota — skip backup silently */ }
            },

            addPen(pen) {
                pen.id = generateId();
                pen.createdAt = new Date().toISOString();
                this.pens.push(pen);
                this.updateDropdowns('brands', pen.brand);
                if (pen.brand && pen.line) {
                    if (!this.dropdowns.lines[pen.brand]) {
                        this.dropdowns.lines[pen.brand] = [];
                    }
                    if (!this.dropdowns.lines[pen.brand].includes(pen.line)) {
                        this.dropdowns.lines[pen.brand].push(pen.line);
                    }
                }
                this.save();
                return pen;
            },

            updatePen(id, pen) {
                const index = this.pens.findIndex(p => p.id === id);
                if (index !== -1) {
                    pen.id = id;
                    pen.createdAt = this.pens[index].createdAt;
                    this.pens[index] = pen;
                    this.updateDropdowns('brands', pen.brand);
                    if (pen.brand && pen.line) {
                        if (!this.dropdowns.lines[pen.brand]) {
                            this.dropdowns.lines[pen.brand] = [];
                        }
                        if (!this.dropdowns.lines[pen.brand].includes(pen.line)) {
                            this.dropdowns.lines[pen.brand].push(pen.line);
                        }
                    }
                    this.save();
                    return true;
                }
                return false;
            },

            deletePen(id) {
                const index = this.pens.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.pens.splice(index, 1);
                    this.pairings = this.pairings.filter(p => p.penId !== id);
                    this.save();
                    return true;
                }
                return false;
            },

            addInk(ink) {
                ink.id = generateId();
                ink.createdAt = new Date().toISOString();
                this.inks.push(ink);
                this.updateDropdowns('inkBrands', ink.brand);
                this.save();
                return ink;
            },

            updateInk(id, ink) {
                const index = this.inks.findIndex(i => i.id === id);
                if (index !== -1) {
                    ink.id = id;
                    ink.createdAt = this.inks[index].createdAt;
                    this.inks[index] = ink;
                    this.updateDropdowns('inkBrands', ink.brand);
                    this.save();
                    return true;
                }
                return false;
            },

            deleteInk(id) {
                const index = this.inks.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.inks.splice(index, 1);
                    this.pairings = this.pairings.filter(p => p.inkId !== id);
                    this.save();
                    return true;
                }
                return false;
            },

            addPairing(pairing) {
                pairing.id = generateId();
                pairing.createdAt = new Date().toISOString();
                this.pairings.push(pairing);
                this.save();
                return pairing;
            },

            updatePairing(id, pairing) {
                const index = this.pairings.findIndex(p => p.id === id);
                if (index !== -1) {
                    pairing.id = id;
                    pairing.createdAt = this.pairings[index].createdAt;
                    this.pairings[index] = pairing;
                    this.save();
                    return true;
                }
                return false;
            },

            deletePairing(id) {
                const index = this.pairings.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.pairings.splice(index, 1);
                    this.save();
                    return true;
                }
                return false;
            },

            updateDropdowns(key, value) {
                if (value && !this.dropdowns[key].includes(value)) {
                    this.dropdowns[key].push(value);
                    this.dropdowns[key].sort();
                }
            },

            export() {
                return {
                    pens: this.pens,
                    inks: this.inks,
                    pairings: this.pairings,
                    dropdowns: this.dropdowns
                };
            },

            import(data) {
                if (data.pens) this.pens.push(...data.pens);
                if (data.inks) this.inks.push(...data.inks);
                if (data.pairings) this.pairings.push(...data.pairings);
                if (data.dropdowns) {
                    if (data.dropdowns.brands) {
                        data.dropdowns.brands.forEach(b => this.updateDropdowns('brands', b));
                    }
                    if (data.dropdowns.inkBrands) {
                        data.dropdowns.inkBrands.forEach(b => this.updateDropdowns('inkBrands', b));
                    }
                    if (data.dropdowns.lines) {
                        Object.keys(data.dropdowns.lines).forEach(brand => {
                            if (!this.dropdowns.lines[brand]) {
                                this.dropdowns.lines[brand] = [];
                            }
                            data.dropdowns.lines[brand].forEach(line => {
                                if (!this.dropdowns.lines[brand].includes(line)) {
                                    this.dropdowns.lines[brand].push(line);
                                }
                            });
                        });
                    }
                }
                this.save();
            },

            clear() {
                this.pens = [];
                this.inks = [];
                this.pairings = [];
                this.dropdowns = {
                    brands: ['Montblanc', 'Visconti', 'Pilot', 'Pelikan', 'Leonardo', 'Lamy', 'TWSBI', 'Esterbrook', 'Scribo', 'Gravitas', 'Omas', 'Sailor'],
                    lines: {
                        'Visconti': ['Homo Sapiens', 'Divina', 'Mythos', 'Van Gogh', 'Rembrandt', 'Opera']
                    },
                    inkBrands: ['Noodler\\'s', 'Pilot Iroshizuku', 'Diamine', 'Montblanc', 'Sailor', 'Platinum', 'Pelikan', 'Rohrer & Klingner', 'J. Herbin', 'Krishna', 'Robert Oster'],
                    nibSizes: ['EF', 'F', 'M', 'B', 'BB', 'Stub 1.1', 'Stub 1.5'],
                    fillingSystems: ['Cartridge', 'Converter', 'Piston', 'Vacuum', 'Eyedropper', 'Lever', 'Plunger', 'Pneumatic', 'Bulb'],
                    colorFamilies: ['Blue', 'Blue-Black', 'Black', 'Red', 'Green', 'Purple', 'Brown', 'Orange', 'Yellow', 'Pink', 'Turquoise', 'Grey']
                };
                this.save();
            }
        };

        // Main app
        const app = {
            currentPenId: null,
            currentInkId: null,
            currentPairingId: null,
            currentRating: 0,
            currentFlow: '',
            currentInkProperties: [],
            confirmCallback: null,

            init() {
                DataManager.load();
                this.setupEventListeners();
                this.renderDashboard();
                this.renderPens();
                this.renderInks();
                this.renderPairings();
                this.renderValue();
                this.setupComboBoxes();
            },

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.nav-tab').forEach(btn => {
                    btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
                });

                // Pens filters
                document.getElementById('pens-search').addEventListener('input', () => this.renderPens());
                document.getElementById('pens-filter-brand').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-status').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-nib').addEventListener('change', () => this.renderPens());
                document.getElementById('pens-filter-filling').addEventListener('change', () => this.renderPens());

                // Inks filters
                document.getElementById('inks-search').addEventListener('input', () => this.renderInks());
                document.getElementById('inks-filter-brand').addEventListener('change', () => this.renderInks());
                document.getElementById('inks-filter-color').addEventListener('change', () => this.renderInks());
                document.getElementById('inks-filter-properties').addEventListener('change', () => this.renderInks());

                // Pairings filter
                document.getElementById('pairings-search').addEventListener('input', () => this.renderPairings());

                // Combobox click outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.combobox-container')) {
                        document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));
                    }
                });
            },

            setupComboBoxes() {
                this.setupComboBox('pen-brand', DataManager.dropdowns.brands, 'pen-brand-dropdown');
                this.setupComboBox('ink-brand', DataManager.dropdowns.inkBrands, 'ink-brand-dropdown');
            },

            setupComboBox(inputId, options, dropdownId) {
                const input = document.getElementById(inputId);
                const dropdown = document.getElementById(dropdownId);

                input.addEventListener('click', () => {
                    this.updateComboBoxOptions(inputId, options, dropdownId, options);
                    dropdown.classList.add('active');
                });

                input.addEventListener('input', () => {
                    const filtered = options.filter(opt =>
                        opt.toLowerCase().includes(input.value.toLowerCase())
                    );
                    this.updateComboBoxOptions(inputId, options, dropdownId, filtered);
                    if (filtered.length > 0) {
                        dropdown.classList.add('active');
                    }
                });
            },

            updateComboBoxOptions(inputId, allOptions, dropdownId, filtered) {
                const dropdown = document.getElementById(dropdownId);
                dropdown.innerHTML = '';

                filtered.forEach(option => {
                    const div = document.createElement('div');
                    div.className = 'combobox-option';
                    div.textContent = option;
                    div.onclick = () => {
                        document.getElementById(inputId).value = option;
                        dropdown.classList.remove('active');

                        // Update cascading dropdowns for pens
                        if (inputId === 'pen-brand') {
                            this.updatePenLineDropdown();
                        }
                    };
                    dropdown.appendChild(div);
                });
            },

            updatePenLineDropdown() {
                const brand = document.getElementById('pen-brand').value;
                const lineInput = document.getElementById('pen-line');
                const lineDropdown = document.getElementById('pen-line-dropdown');

                if (brand && DataManager.dropdowns.lines[brand]) {
                    const lineOptions = DataManager.dropdowns.lines[brand];
                    this.setupComboBox('pen-line', lineOptions, 'pen-line-dropdown');
                } else {
                    this.setupComboBox('pen-line', [], 'pen-line-dropdown');
                }

                lineInput.value = '';
                lineDropdown.classList.remove('active');
            },

            switchTab(tabName) {
                // Update nav tabs
                document.querySelectorAll('.nav-tab').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active');

                // Update content
                document.querySelectorAll('.content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName).classList.add('active');
            },

            renderDashboard() {
                document.getElementById('stat-pens').textContent = DataManager.pens.length;
                document.getElementById('stat-inks').textContent = DataManager.inks.length;
                document.getElementById('stat-pairings').textContent = DataManager.pairings.length;

                // Calculate investment totals
                let totalUSD = 0, totalEUR = 0;
                DataManager.pens.forEach(p => {
                    if (p.price) {
                        const val = parseFloat(p.price);
                        if (p.currency === 'EUR') totalEUR += val;
                        else totalUSD += val;
                    }
                });
                let investmentLabel = '';
                if (totalUSD > 0) investmentLabel += '$' + totalUSD.toLocaleString();
                if (totalEUR > 0) investmentLabel += (investmentLabel ? ' + ' : '') + '\u20AC' + totalEUR.toLocaleString();
                document.getElementById('stat-investment').textContent = investmentLabel || '-';

                const recentList = document.getElementById('recent-list');
                recentList.innerHTML = '';

                const recent = [
                    ...DataManager.pens.map(p => ({ type: 'Pen', item: p })),
                    ...DataManager.inks.map(i => ({ type: 'Ink', item: i })),
                    ...DataManager.pairings.map(pa => ({ type: 'Pairing', item: pa }))
                ]
                    .sort((a, b) => new Date(b.item.createdAt) - new Date(a.item.createdAt))
                    .slice(0, 10);

                if (recent.length === 0) {
                    recentList.innerHTML = '<p style="color: #a0a0a0; text-align: center;">No items yet</p>';
                    return;
                }

                recent.forEach(r => {
                    const div = document.createElement('div');
                    div.style.padding = '0.75rem';
                    div.style.borderBottom = '1px solid rgba(226, 183, 20, 0.1)';
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.alignItems = 'center';

                    let label = '';
                    if (r.type === 'Pen') {
                        label = \`\${r.item.brand} \${r.item.model}\`;
                    } else if (r.type === 'Ink') {
                        label = \`\${r.item.brand} - \${r.item.name}\`;
                    } else if (r.type === 'Pairing') {
                        const pen = DataManager.pens.find(p => p.id === r.item.penId);
                        const ink = DataManager.inks.find(i => i.id === r.item.inkId);
                        label = \`\${pen ? pen.brand + ' ' + pen.model : 'Unknown'} + \${ink ? ink.brand + ' ' + ink.name : 'Unknown'}\`;
                    }

                    div.innerHTML = \`
                        <span style="color: #e8e8e8;">\${escapeHtml(label)}</span>
                        <span style="color: #a0a0a0; font-size: 0.85rem;">\${r.type}</span>
                    \`;

                    recentList.appendChild(div);
                });
            },

            renderPens() {
                const tbody = document.getElementById('pens-tbody');
                const emptyState = document.getElementById('pens-empty');
                const searchTerm = document.getElementById('pens-search').value.toLowerCase();
                const brandFilter = document.getElementById('pens-filter-brand').value;
                const statusFilter = document.getElementById('pens-filter-status').value;
                const nibFilter = document.getElementById('pens-filter-nib').value;
                const fillingFilter = document.getElementById('pens-filter-filling').value;

                const filtered = DataManager.pens.filter(pen => {
                    const matchSearch = !searchTerm ||
                        pen.brand.toLowerCase().includes(searchTerm) ||
                        pen.model.toLowerCase().includes(searchTerm) ||
                        pen.line.toLowerCase().includes(searchTerm);

                    const matchBrand = !brandFilter || pen.brand === brandFilter;
                    const matchStatus = !statusFilter || pen.status === statusFilter;
                    const matchNib = !nibFilter || pen.nibSize === nibFilter;
                    const matchFilling = !fillingFilter || pen.filling === fillingFilter;

                    return matchSearch && matchBrand && matchStatus && matchNib && matchFilling;
                });

                // Update filter options
                const brands = [...new Set(DataManager.pens.map(p => p.brand))].sort();
                const nibs = [...new Set(DataManager.pens.map(p => p.nibSize))].filter(n => n);
                const fillings = [...new Set(DataManager.pens.map(p => p.filling))].filter(f => f);

                document.getElementById('pens-filter-brand').innerHTML = '<option value="">All Brands</option>' +
                    brands.map(b => \`<option value="\${escapeHtml(b)}">\${escapeHtml(b)}</option>\`).join('');

                document.getElementById('pens-filter-nib').innerHTML = '<option value="">All Nib Sizes</option>' +
                    nibs.map(n => \`<option value="\${escapeHtml(n)}">\${escapeHtml(n)}</option>\`).join('');

                document.getElementById('pens-filter-filling').innerHTML = '<option value="">All Filling Systems</option>' +
                    fillings.map(f => \`<option value="\${escapeHtml(f)}">\${escapeHtml(f)}</option>\`).join('');

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(pen => {
                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPenDetail(pen.id);

                    const statusClass = \`badge-\${pen.status.toLowerCase().replace(' ', '-')}\`;

                    const priceDisplay = pen.price ? \`\${pen.currency === 'EUR' ? '\u20AC' : '$'}\${Number(pen.price).toLocaleString()}\` : '-';
                    row.innerHTML = \`
                        <td>\${escapeHtml(pen.brand)}</td>
                        <td>\${escapeHtml(pen.line || '-')}</td>
                        <td>\${escapeHtml(pen.model)}</td>
                        <td>\${escapeHtml(pen.nibSize || '-')}</td>
                        <td>\${escapeHtml(pen.filling || '-')}</td>
                        <td style="text-align: right; font-weight: 500;">\${priceDisplay}</td>
                        <td><span class="badge \${statusClass}">\${escapeHtml(pen.status)}</span></td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderInks() {
                const tbody = document.getElementById('inks-tbody');
                const emptyState = document.getElementById('inks-empty');
                const searchTerm = document.getElementById('inks-search').value.toLowerCase();
                const brandFilter = document.getElementById('inks-filter-brand').value;
                const colorFilter = document.getElementById('inks-filter-color').value;
                const propertiesFilter = document.getElementById('inks-filter-properties').value;

                const filtered = DataManager.inks.filter(ink => {
                    const matchSearch = !searchTerm ||
                        ink.brand.toLowerCase().includes(searchTerm) ||
                        ink.name.toLowerCase().includes(searchTerm);

                    const matchBrand = !brandFilter || ink.brand === brandFilter;
                    const matchColor = !colorFilter || ink.color === colorFilter;
                    const matchProperties = !propertiesFilter || (ink.properties && ink.properties.includes(propertiesFilter));

                    return matchSearch && matchBrand && matchColor && matchProperties;
                });

                // Update filter options
                const brands = [...new Set(DataManager.inks.map(i => i.brand))].sort();
                const colors = [...new Set(DataManager.inks.map(i => i.color))].filter(c => c);
                const properties = new Set();
                DataManager.inks.forEach(ink => {
                    if (ink.properties) {
                        ink.properties.forEach(p => properties.add(p));
                    }
                });

                document.getElementById('inks-filter-brand').innerHTML = '<option value="">All Brands</option>' +
                    brands.map(b => \`<option value="\${escapeHtml(b)}">\${escapeHtml(b)}</option>\`).join('');

                document.getElementById('inks-filter-color').innerHTML = '<option value="">All Colors</option>' +
                    colors.map(c => \`<option value="\${escapeHtml(c)}">\${escapeHtml(c)}</option>\`).join('');

                document.getElementById('inks-filter-properties').innerHTML = '<option value="">All Properties</option>' +
                    Array.from(properties).sort().map(p => \`<option value="\${escapeHtml(p)}">\${escapeHtml(p)}</option>\`).join('');

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(ink => {
                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewInkDetail(ink.id);

                    const properties = (ink.properties || []).map(p => \`<span class="badge badge-ordered" style="margin-right: 0.25rem;">\${escapeHtml(p)}</span>\`).join('');

                    row.innerHTML = \`
                        <td>\${escapeHtml(ink.brand)}</td>
                        <td>\${escapeHtml(ink.name)}</td>
                        <td>\${escapeHtml(ink.color || '-')}</td>
                        <td>\${escapeHtml(ink.volume || '-')}</td>
                        <td>\${properties || '-'}</td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderPairings() {
                const tbody = document.getElementById('pairings-tbody');
                const emptyState = document.getElementById('pairings-empty');
                const searchTerm = document.getElementById('pairings-search').value.toLowerCase();

                const filtered = DataManager.pairings.filter(pairing => {
                    const pen = DataManager.pens.find(p => p.id === pairing.penId);
                    const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                    const penLabel = pen ? \`\${pen.brand} \${pen.model}\` : 'Unknown';
                    const inkLabel = ink ? \`\${ink.brand} \${ink.name}\` : 'Unknown';

                    return !searchTerm ||
                        penLabel.toLowerCase().includes(searchTerm) ||
                        inkLabel.toLowerCase().includes(searchTerm);
                });

                tbody.innerHTML = '';

                if (filtered.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';

                filtered.forEach(pairing => {
                    const pen = DataManager.pens.find(p => p.id === pairing.penId);
                    const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                    const row = document.createElement('tr');
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPairingDetail(pairing.id);

                    const penLabel = pen ? \`\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}\` : 'Unknown';
                    const inkLabel = ink ? \`\${escapeHtml(ink.brand)} \${escapeHtml(ink.name)}\` : 'Unknown';
                    const stars = '★'.repeat(pairing.rating) + '☆'.repeat(5 - pairing.rating);

                    row.innerHTML = \`
                        <td>\${penLabel}</td>
                        <td>\${inkLabel}</td>
                        <td><span style="color: #e2b714;">\${stars}</span></td>
                        <td>\${escapeHtml(pairing.flow || '-')}</td>
                    \`;

                    tbody.appendChild(row);
                });
            },

            renderValue() {
                const pens = DataManager.pens;
                let totalUSD = 0, totalEUR = 0, pensWithPrice = 0;
                const byBrand = {};

                pens.forEach(p => {
                    if (p.price) {
                        const val = parseFloat(p.price);
                        pensWithPrice++;
                        if (p.currency === 'EUR') totalEUR += val;
                        else totalUSD += val;

                        if (!byBrand[p.brand]) byBrand[p.brand] = { usd: 0, eur: 0, count: 0 };
                        byBrand[p.brand].count++;
                        if (p.currency === 'EUR') byBrand[p.brand].eur += val;
                        else byBrand[p.brand].usd += val;
                    }
                });

                // Stats
                document.getElementById('value-total-usd').textContent = '$' + totalUSD.toLocaleString();
                document.getElementById('value-total-eur').textContent = '\u20AC' + totalEUR.toLocaleString();

                if (pensWithPrice > 0) {
                    // Rough combined average (treat EUR ~ USD for avg display)
                    const combined = totalUSD + totalEUR;
                    const avg = Math.round(combined / pensWithPrice);
                    document.getElementById('value-avg').textContent = '~$' + avg.toLocaleString();
                } else {
                    document.getElementById('value-avg').textContent = '-';
                }

                // Most expensive
                const sorted = pens.filter(p => p.price).sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                if (sorted.length > 0) {
                    const top = sorted[0];
                    const sym = top.currency === 'EUR' ? '\u20AC' : '$';
                    document.getElementById('value-most-expensive').textContent = \`\${top.brand} \${top.model}\`;
                }

                // Brand breakdown
                const brandDiv = document.getElementById('value-brand-breakdown');
                const brandEntries = Object.entries(byBrand).sort((a, b) => (b[1].usd + b[1].eur) - (a[1].usd + a[1].eur));

                if (brandEntries.length === 0) {
                    brandDiv.innerHTML = '<p style="color: #a0a0a0; text-align: center;">No price data yet</p>';
                } else {
                    const maxTotal = Math.max(...brandEntries.map(([, v]) => v.usd + v.eur));
                    brandDiv.innerHTML = brandEntries.map(([brand, v]) => {
                        const total = v.usd + v.eur;
                        const pct = maxTotal > 0 ? (total / maxTotal * 100) : 0;
                        let priceStr = '';
                        if (v.usd > 0) priceStr += '$' + v.usd.toLocaleString();
                        if (v.eur > 0) priceStr += (priceStr ? ' + ' : '') + '\u20AC' + v.eur.toLocaleString();
                        return \`
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                    <span style="color: #e8e8e8; font-weight: 500;">\${escapeHtml(brand)} <span style="color: #a0a0a0; font-size: 0.85rem;">(\${v.count} pen\${v.count > 1 ? 's' : ''})</span></span>
                                    <span style="color: #e2b714; font-weight: 600;">\${priceStr}</span>
                                </div>
                                <div style="background: rgba(226, 183, 20, 0.1); border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, #e2b714, #f0c420); height: 100%; width: \${pct}%; border-radius: 4px; transition: width 0.5s;"></div>
                                </div>
                            </div>
                        \`;
                    }).join('');
                }

                // Price-sorted list
                const priceList = document.getElementById('value-price-list');
                priceList.innerHTML = '';
                sorted.forEach(pen => {
                    const row = document.createElement('tr');
                    const sym = pen.currency === 'EUR' ? '\u20AC' : '$';
                    const statusClass = \`badge-\${pen.status.toLowerCase().replace(' ', '-')}\`;
                    row.style.cursor = 'pointer';
                    row.onclick = () => this.viewPenDetail(pen.id);
                    row.innerHTML = \`
                        <td>\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}</td>
                        <td>\${escapeHtml(pen.nibSize || '-')}</td>
                        <td style="text-align: right; font-weight: 600; color: #e2b714;">\${sym}\${Number(pen.price).toLocaleString()}</td>
                        <td><span class="badge \${statusClass}">\${escapeHtml(pen.status)}</span></td>
                    \`;
                    priceList.appendChild(row);
                });

                // Spending timeline
                const timelineDiv = document.getElementById('value-timeline');
                const pensWithDate = pens.filter(p => p.price && p.purchaseDate).sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

                if (pensWithDate.length === 0) {
                    timelineDiv.innerHTML = '<p style="color: #a0a0a0; text-align: center;">Add purchase dates to see your spending timeline</p>';
                } else {
                    // Group by month
                    const byMonth = {};
                    let runningUSD = 0, runningEUR = 0;
                    pensWithDate.forEach(p => {
                        const month = p.purchaseDate.substring(0, 7); // YYYY-MM
                        if (!byMonth[month]) byMonth[month] = { pens: [], totalUSD: 0, totalEUR: 0, cumulativeUSD: 0, cumulativeEUR: 0 };
                        byMonth[month].pens.push(p);
                        const val = parseFloat(p.price);
                        if (p.currency === 'EUR') {
                            byMonth[month].totalEUR += val;
                            runningEUR += val;
                        } else {
                            byMonth[month].totalUSD += val;
                            runningUSD += val;
                        }
                        byMonth[month].cumulativeUSD = runningUSD;
                        byMonth[month].cumulativeEUR = runningEUR;
                    });

                    timelineDiv.innerHTML = Object.entries(byMonth).map(([month, data]) => {
                        const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                        let spentStr = '';
                        if (data.totalUSD > 0) spentStr += '$' + data.totalUSD.toLocaleString();
                        if (data.totalEUR > 0) spentStr += (spentStr ? ' + ' : '') + '\u20AC' + data.totalEUR.toLocaleString();
                        let cumStr = '';
                        if (data.cumulativeUSD > 0) cumStr += '$' + data.cumulativeUSD.toLocaleString();
                        if (data.cumulativeEUR > 0) cumStr += (cumStr ? ' + ' : '') + '\u20AC' + data.cumulativeEUR.toLocaleString();

                        const penItems = data.pens.map(p => {
                            const sym = p.currency === 'EUR' ? '\u20AC' : '$';
                            return \`<div style="color: #a0a0a0; font-size: 0.85rem; padding-left: 1rem;">\${escapeHtml(p.brand)} \${escapeHtml(p.model)} — \${sym}\${Number(p.price).toLocaleString()}</div>\`;
                        }).join('');

                        return \`
                            <div style="border-left: 3px solid #e2b714; padding: 1rem 1rem 1rem 1.5rem; margin-bottom: 1rem; background: rgba(226, 183, 20, 0.03); border-radius: 0 0.5rem 0.5rem 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: #e2b714; font-weight: 600;">\${monthLabel}</span>
                                    <span style="color: #e8e8e8; font-weight: 500;">\${spentStr}</span>
                                </div>
                                \${penItems}
                                <div style="text-align: right; margin-top: 0.5rem; font-size: 0.8rem; color: #a0a0a0;">Running total: \${cumStr}</div>
                            </div>
                        \`;
                    }).join('');
                }
            },

            // Pen operations
            openPenModal(id = null) {
                this.currentPenId = id;
                const modal = document.getElementById('pen-modal');
                const title = document.getElementById('pen-modal-title');

                // Reset form
                document.getElementById('pen-brand').value = '';
                document.getElementById('pen-line').value = '';
                document.getElementById('pen-model').value = '';
                document.getElementById('pen-nib-size').value = '';
                document.getElementById('pen-nib-material').value = '';
                document.getElementById('pen-nib-grind').value = '';
                document.getElementById('pen-filling').value = '';
                document.getElementById('pen-price').value = '';
                document.getElementById('pen-currency').value = 'USD';
                document.getElementById('pen-status').value = 'In Collection';
                document.getElementById('pen-date').value = '';
                document.getElementById('pen-notes').value = '';
                document.getElementById('pen-url').value = '';

                // Close dropdowns
                document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));

                if (id) {
                    title.textContent = 'Edit Pen';
                    const pen = DataManager.pens.find(p => p.id === id);
                    if (pen) {
                        document.getElementById('pen-brand').value = pen.brand;
                        document.getElementById('pen-line').value = pen.line;
                        document.getElementById('pen-model').value = pen.model;
                        document.getElementById('pen-nib-size').value = pen.nibSize;
                        document.getElementById('pen-nib-material').value = pen.nibMaterial;
                        document.getElementById('pen-nib-grind').value = pen.nibGrind;
                        document.getElementById('pen-filling').value = pen.filling;
                        document.getElementById('pen-price').value = pen.price;
                        document.getElementById('pen-currency').value = pen.currency;
                        document.getElementById('pen-status').value = pen.status;
                        document.getElementById('pen-date').value = pen.purchaseDate;
                        document.getElementById('pen-notes').value = pen.notes;
                        document.getElementById('pen-url').value = pen.url;
                    }
                } else {
                    title.textContent = 'Add Pen';
                }

                modal.classList.add('active');
            },

            closePenModal() {
                document.getElementById('pen-modal').classList.remove('active');
                this.currentPenId = null;
            },

            savePen() {
                const pen = {
                    brand: document.getElementById('pen-brand').value.trim(),
                    line: document.getElementById('pen-line').value.trim(),
                    model: document.getElementById('pen-model').value.trim(),
                    nibSize: document.getElementById('pen-nib-size').value,
                    nibMaterial: document.getElementById('pen-nib-material').value,
                    nibGrind: document.getElementById('pen-nib-grind').value,
                    filling: document.getElementById('pen-filling').value,
                    price: document.getElementById('pen-price').value,
                    currency: document.getElementById('pen-currency').value,
                    status: document.getElementById('pen-status').value,
                    purchaseDate: document.getElementById('pen-date').value,
                    notes: document.getElementById('pen-notes').value.trim(),
                    url: document.getElementById('pen-url').value.trim()
                };

                if (!pen.brand || !pen.model) {
                    alert('Please fill in Brand and Model');
                    return;
                }

                if (this.currentPenId) {
                    DataManager.updatePen(this.currentPenId, pen);
                } else {
                    DataManager.addPen(pen);
                }

                this.closePenModal();
                this.renderDashboard();
                this.renderPens();
                this.renderValue();
                this.updatePairingSelects();
            },

            viewPenDetail(id) {
                const pen = DataManager.pens.find(p => p.id === id);
                if (!pen) return;

                this.showDetailView('Pen Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderPens();">← Back to Pens</button>
                    <div class="detail-header">
                        <div class="detail-title">\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openPenModal('\${pen.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('pen', '\${pen.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Brand</span>
                            <div class="detail-value">\${escapeHtml(pen.brand)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Line</span>
                            <div class="detail-value">\${escapeHtml(pen.line || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Model</span>
                            <div class="detail-value">\${escapeHtml(pen.model)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Size</span>
                            <div class="detail-value">\${escapeHtml(pen.nibSize || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Material</span>
                            <div class="detail-value">\${escapeHtml(pen.nibMaterial || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Nib Grind</span>
                            <div class="detail-value">\${escapeHtml(pen.nibGrind || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Filling System</span>
                            <div class="detail-value">\${escapeHtml(pen.filling || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Status</span>
                            <div class="detail-value"><span class="badge badge-\${pen.status.toLowerCase().replace(' ', '-')}">\${escapeHtml(pen.status)}</span></div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Price</span>
                            <div class="detail-value">\${pen.price ? \`\${escapeHtml(pen.currency)} \${escapeHtml(pen.price)}\` : '-'}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Date</span>
                            <div class="detail-value">\${pen.purchaseDate ? new Date(pen.purchaseDate).toLocaleDateString() : '-'}</div>
                        </div>
                    </div>

                    \${pen.notes ? \`
                        <div class="card">
                            <div class="detail-label">Notes</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(pen.notes).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}

                    \${pen.url ? \`
                        <div class="card">
                            <div class="detail-label">Store/Website</div>
                            <a href="\${escapeHtml(pen.url)}" target="_blank" class="detail-value link">\${escapeHtml(pen.url)}</a>
                        </div>
                    \` : ''}
                \`);
            },

            deletePen(id) {
                DataManager.deletePen(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderPens();
                this.renderPairings();
                this.renderValue();
                this.updatePairingSelects();
            },

            // Ink operations
            openInkModal(id = null) {
                this.currentInkId = id;
                this.currentInkProperties = [];
                const modal = document.getElementById('ink-modal');
                const title = document.getElementById('ink-modal-title');

                // Reset form
                document.getElementById('ink-brand').value = '';
                document.getElementById('ink-name').value = '';
                document.getElementById('ink-color').value = '';
                document.getElementById('ink-volume').value = '';
                document.getElementById('ink-price').value = '';
                document.getElementById('ink-currency').value = 'USD';
                document.getElementById('ink-notes').value = '';
                document.getElementById('ink-url').value = '';

                // Reset properties
                document.querySelectorAll('.toggle-option').forEach(btn => {
                    btn.classList.remove('selected');
                });

                // Close dropdowns
                document.querySelectorAll('.combobox-dropdown').forEach(d => d.classList.remove('active'));

                if (id) {
                    title.textContent = 'Edit Ink';
                    const ink = DataManager.inks.find(i => i.id === id);
                    if (ink) {
                        document.getElementById('ink-brand').value = ink.brand;
                        document.getElementById('ink-name').value = ink.name;
                        document.getElementById('ink-color').value = ink.color;
                        document.getElementById('ink-volume').value = ink.volume;
                        document.getElementById('ink-price').value = ink.price;
                        document.getElementById('ink-currency').value = ink.currency;
                        document.getElementById('ink-notes').value = ink.notes;
                        document.getElementById('ink-url').value = ink.url;

                        if (ink.properties) {
                            this.currentInkProperties = [...ink.properties];
                            document.querySelectorAll('.toggle-option').forEach(btn => {
                                if (ink.properties.includes(btn.dataset.property)) {
                                    btn.classList.add('selected');
                                }
                            });
                        }
                    }
                } else {
                    title.textContent = 'Add Ink';
                }

                modal.classList.add('active');
            },

            closeInkModal() {
                document.getElementById('ink-modal').classList.remove('active');
                this.currentInkId = null;
                this.currentInkProperties = [];
            },

            toggleInkProperty(btn, property) {
                btn.classList.toggle('selected');
                if (btn.classList.contains('selected')) {
                    if (!this.currentInkProperties.includes(property)) {
                        this.currentInkProperties.push(property);
                    }
                } else {
                    this.currentInkProperties = this.currentInkProperties.filter(p => p !== property);
                }
            },

            saveInk() {
                const ink = {
                    brand: document.getElementById('ink-brand').value.trim(),
                    name: document.getElementById('ink-name').value.trim(),
                    color: document.getElementById('ink-color').value,
                    volume: document.getElementById('ink-volume').value.trim(),
                    price: document.getElementById('ink-price').value,
                    currency: document.getElementById('ink-currency').value,
                    notes: document.getElementById('ink-notes').value.trim(),
                    url: document.getElementById('ink-url').value.trim(),
                    properties: this.currentInkProperties
                };

                if (!ink.brand || !ink.name) {
                    alert('Please fill in Brand and Name');
                    return;
                }

                if (this.currentInkId) {
                    DataManager.updateInk(this.currentInkId, ink);
                } else {
                    DataManager.addInk(ink);
                }

                this.closeInkModal();
                this.renderDashboard();
                this.renderInks();
                this.renderPairings();
                this.updatePairingSelects();
            },

            viewInkDetail(id) {
                const ink = DataManager.inks.find(i => i.id === id);
                if (!ink) return;

                this.showDetailView('Ink Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderInks();">← Back to Inks</button>
                    <div class="detail-header">
                        <div class="detail-title">\${escapeHtml(ink.brand)} - \${escapeHtml(ink.name)}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openInkModal('\${ink.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('ink', '\${ink.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Brand</span>
                            <div class="detail-value">\${escapeHtml(ink.brand)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Name</span>
                            <div class="detail-value">\${escapeHtml(ink.name)}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Color Family</span>
                            <div class="detail-value">\${escapeHtml(ink.color || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Volume</span>
                            <div class="detail-value">\${escapeHtml(ink.volume || '-')}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Purchase Price</span>
                            <div class="detail-value">\${ink.price ? \`\${escapeHtml(ink.currency)} \${escapeHtml(ink.price)}\` : '-'}</div>
                        </div>
                    </div>

                    \${ink.properties && ink.properties.length > 0 ? \`
                        <div class="card">
                            <div class="detail-label">Properties</div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                \${ink.properties.map(p => \`<span class="badge badge-ordered">\${escapeHtml(p)}</span>\`).join('')}
                            </div>
                        </div>
                    \` : ''}

                    \${ink.notes ? \`
                        <div class="card">
                            <div class="detail-label">Notes</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(ink.notes).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}

                    \${ink.url ? \`
                        <div class="card">
                            <div class="detail-label">Store/Website</div>
                            <a href="\${escapeHtml(ink.url)}" target="_blank" class="detail-value link">\${escapeHtml(ink.url)}</a>
                        </div>
                    \` : ''}
                \`);
            },

            deleteInk(id) {
                DataManager.deleteInk(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderInks();
                this.renderPairings();
                this.updatePairingSelects();
            },

            // Pairing operations
            openPairingModal(id = null) {
                this.currentPairingId = id;
                this.currentRating = 0;
                this.currentFlow = '';
                const modal = document.getElementById('pairing-modal');
                const title = document.getElementById('pairing-modal-title');

                // Reset form
                document.getElementById('pairing-pen').value = '';
                document.getElementById('pairing-ink').value = '';
                document.getElementById('pairing-comments').value = '';

                // Reset rating
                document.querySelectorAll('#pairing-rating .star').forEach(s => s.classList.remove('filled'));
                document.getElementById('pairing-rating-display').textContent = 'Not rated';

                // Reset flow
                document.querySelectorAll('.radio-option').forEach(btn => btn.classList.remove('selected'));

                // Populate selects
                document.getElementById('pairing-pen').innerHTML = '<option value="">Choose a pen...</option>' +
                    DataManager.pens.map(p => \`<option value="\${p.id}">\${escapeHtml(p.brand)} \${escapeHtml(p.model)}</option>\`).join('');

                document.getElementById('pairing-ink').innerHTML = '<option value="">Choose an ink...</option>' +
                    DataManager.inks.map(i => \`<option value="\${i.id}">\${escapeHtml(i.brand)} - \${escapeHtml(i.name)}</option>\`).join('');

                if (id) {
                    title.textContent = 'Edit Pairing';
                    const pairing = DataManager.pairings.find(p => p.id === id);
                    if (pairing) {
                        document.getElementById('pairing-pen').value = pairing.penId;
                        document.getElementById('pairing-ink').value = pairing.inkId;
                        document.getElementById('pairing-comments').value = pairing.comments;
                        this.currentRating = pairing.rating || 0;
                        this.currentFlow = pairing.flow || '';

                        // Set rating display
                        document.querySelectorAll('#pairing-rating .star').forEach((s, i) => {
                            if (i < this.currentRating) {
                                s.classList.add('filled');
                            }
                        });
                        if (this.currentRating > 0) {
                            document.getElementById('pairing-rating-display').textContent = \`\${this.currentRating} star\${this.currentRating !== 1 ? 's' : ''}\`;
                        }

                        // Set flow
                        document.querySelectorAll('.radio-option').forEach(btn => {
                            if (btn.textContent === this.currentFlow) {
                                btn.classList.add('selected');
                            }
                        });
                    }
                } else {
                    title.textContent = 'Add Pairing';
                }

                modal.classList.add('active');
            },

            closePairingModal() {
                document.getElementById('pairing-modal').classList.remove('active');
                this.currentPairingId = null;
                this.currentRating = 0;
                this.currentFlow = '';
            },

            setRating(value) {
                this.currentRating = value;
                document.querySelectorAll('#pairing-rating .star').forEach((s, i) => {
                    if (i < value) {
                        s.classList.add('filled');
                    } else {
                        s.classList.remove('filled');
                    }
                });
                document.getElementById('pairing-rating-display').textContent = \`\${value} star\${value !== 1 ? 's' : ''}\`;
            },

            setFlow(value) {
                this.currentFlow = value;
                document.querySelectorAll('.radio-option').forEach(btn => {
                    if (btn.textContent === value) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.remove('selected');
                    }
                });
            },

            savePairing() {
                const penId = document.getElementById('pairing-pen').value;
                const inkId = document.getElementById('pairing-ink').value;

                if (!penId || !inkId) {
                    alert('Please select both a pen and an ink');
                    return;
                }

                const pairing = {
                    penId: penId,
                    inkId: inkId,
                    rating: this.currentRating,
                    flow: this.currentFlow,
                    comments: document.getElementById('pairing-comments').value.trim()
                };

                if (this.currentPairingId) {
                    DataManager.updatePairing(this.currentPairingId, pairing);
                } else {
                    DataManager.addPairing(pairing);
                }

                this.closePairingModal();
                this.renderDashboard();
                this.renderPairings();
            },

            viewPairingDetail(id) {
                const pairing = DataManager.pairings.find(p => p.id === id);
                if (!pairing) return;

                const pen = DataManager.pens.find(p => p.id === pairing.penId);
                const ink = DataManager.inks.find(i => i.id === pairing.inkId);

                const penLabel = pen ? \`\${escapeHtml(pen.brand)} \${escapeHtml(pen.model)}\` : 'Unknown';
                const inkLabel = ink ? \`\${escapeHtml(ink.brand)} - \${escapeHtml(ink.name)}\` : 'Unknown';
                const stars = '★'.repeat(pairing.rating) + '☆'.repeat(5 - pairing.rating);

                this.showDetailView('Pairing Detail', \`
                    <button class="back-btn" onclick="app.closeDetailView(); app.renderPairings();">← Back to Pairings</button>
                    <div class="detail-header">
                        <div class="detail-title">\${penLabel} + \${inkLabel}</div>
                        <div class="detail-actions">
                            <button class="btn btn-secondary btn-small" onclick="app.openPairingModal('\${pairing.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="app.confirmDelete('pairing', '\${pairing.id}')">Delete</button>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Pen</span>
                            <div class="detail-value">\${penLabel}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Ink</span>
                            <div class="detail-value">\${inkLabel}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Rating</span>
                            <div class="detail-value" style="font-size: 1.5rem; color: #e2b714;">\${stars}</div>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">Flow</span>
                            <div class="detail-value">\${escapeHtml(pairing.flow || '-')}</div>
                        </div>
                    </div>

                    \${pairing.comments ? \`
                        <div class="card">
                            <div class="detail-label">Comments</div>
                            <p style="color: #e8e8e8; line-height: 1.6;">\${escapeHtml(pairing.comments).replace(/\\n/g, '<br>')}</p>
                        </div>
                    \` : ''}
                \`);
            },

            deletePairing(id) {
                DataManager.deletePairing(id);
                this.closeDetailView();
                this.renderDashboard();
                this.renderPairings();
            },

            // Utility
            updatePairingSelects() {
                if (document.getElementById('pairing-modal').classList.contains('active')) {
                    document.getElementById('pairing-pen').innerHTML = '<option value="">Choose a pen...</option>' +
                        DataManager.pens.map(p => \`<option value="\${p.id}">\${escapeHtml(p.brand)} \${escapeHtml(p.model)}</option>\`).join('');

                    document.getElementById('pairing-ink').innerHTML = '<option value="">Choose an ink...</option>' +
                        DataManager.inks.map(i => \`<option value="\${i.id}">\${escapeHtml(i.brand)} - \${escapeHtml(i.name)}</option>\`).join('');
                }
            },

            showDetailView(title, content) {
                const detailView = document.createElement('div');
                detailView.id = 'detail-view-overlay';
                detailView.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 999;
                    overflow-y: auto;
                    padding: 2rem 1rem;
                \`;

                const detailContent = document.createElement('div');
                detailContent.style.cssText = \`
                    background-color: #16213e;
                    border: 2px solid rgba(226, 183, 20, 0.3);
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                \`;

                detailContent.innerHTML = content;
                detailView.appendChild(detailContent);
                document.body.appendChild(detailView);
            },

            closeDetailView() {
                const detailView = document.getElementById('detail-view-overlay');
                if (detailView) {
                    detailView.remove();
                }
            },

            confirmDelete(type, id) {
                this.confirmCallback = () => {
                    if (type === 'pen') {
                        this.deletePen(id);
                    } else if (type === 'ink') {
                        this.deleteInk(id);
                    } else if (type === 'pairing') {
                        this.deletePairing(id);
                    }
                };

                document.getElementById('confirm-message').textContent = \`Are you sure you want to delete this \${type}? This action cannot be undone.\`;
                document.getElementById('confirm-modal').classList.add('active');
            },

            confirmClearAll() {
                this.confirmCallback = () => {
                    DataManager.clear();
                    this.renderDashboard();
                    this.renderPens();
                    this.renderInks();
                    this.renderPairings();
                    this.renderValue();
                    this.closeConfirm();
                };

                document.getElementById('confirm-message').textContent = 'Are you sure you want to delete ALL data? This cannot be undone.';
                document.getElementById('confirm-modal').classList.add('active');
            },

            confirmAction() {
                if (this.confirmCallback) {
                    this.confirmCallback();
                    this.confirmCallback = null;
                }
            },

            closeConfirm() {
                document.getElementById('confirm-modal').classList.remove('active');
                this.confirmCallback = null;
            },

            // Import/Export
            exportData() {
                const data = DataManager.export();
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`fountain-pen-collection-\${new Date().toISOString().split('T')[0]}.json\`;
                a.click();
                URL.revokeObjectURL(url);
            },

            importData() {
                const fileInput = document.getElementById('import-file');
                const file = fileInput.files[0];

                if (!file) {
                    alert('Please select a file to import');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        DataManager.import(data);
                        this.renderDashboard();
                        this.renderPens();
                        this.renderInks();
                        this.renderPairings();
                        this.renderValue();
                        this.setupComboBoxes();
                        alert('Data imported successfully!');
                        fileInput.value = '';
                    } catch (error) {
                        alert('Error importing file. Please make sure it is a valid JSON file.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            },

            restoreFromBackup() {
                const backup = localStorage.getItem('fp_latest_backup');
                if (!backup) {
                    alert('No backup found. Use Export to create manual backups.');
                    return;
                }
                try {
                    const data = JSON.parse(backup);
                    const msg = 'Restore from backup taken at ' + new Date(data.timestamp).toLocaleString() + '?\\n\\n' +
                        'Backup contains: ' + data.pens.length + ' pens, ' + data.inks.length + ' inks, ' + data.pairings.length + ' pairings.\\n\\n' +
                        'This will REPLACE your current data.';
                    if (!confirm(msg)) return;
                    DataManager.pens = data.pens;
                    DataManager.inks = data.inks;
                    DataManager.pairings = data.pairings;
                    if (data.dropdowns) DataManager.dropdowns = { ...DataManager.dropdowns, ...data.dropdowns };
                    DataManager.save();
                    this.renderDashboard();
                    this.renderPens();
                    this.renderInks();
                    this.renderPairings();
                    this.renderValue();
                    this.setupComboBoxes();
                    alert('Data restored successfully from backup!');
                } catch(e) {
                    alert('Error restoring backup: ' + e.message);
                }
            }
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
    </script>
</body>
</html>
`;
    } else {
      responseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedicalPKM &mdash; Your Tools</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --suite-nav: #1e293b;
            --suite-bg: #f8fafc;
            --suite-amber: #d97706;
            --suite-sky: #0ea5e9;
            --suite-emerald: #10b981;
            --text: #0f172a;
            --text-light: #64748b;
            --border: #e2e8f0;
            --card-bg: #ffffff;
            --shadow: 0 1px 3px rgba(0,0,0,0.08);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
            --radius: 12px;
            --arcane: #7c3aed;
            --arcane-glow: #a78bfa;
            --arcane-dark: #4c1d95;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--suite-bg);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ========= SUITE NAV (matches KOL app) ========= */
        .suite-nav {
            background: var(--suite-nav);
            height: 48px;
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .suite-nav-inner {
            max-width: 1120px;
            width: 100%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .suite-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: white;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: -0.01em;
        }

        .suite-logo-icon {
            color: #f59e0b;
            font-size: 1.1rem;
            font-weight: 700;
        }

        .suite-nav-right {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .suite-nav-link {
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.8125rem;
            font-weight: 500;
            padding: 0.375rem 0.625rem;
            border-radius: 6px;
            transition: color 0.15s, background 0.15s;
        }

        .suite-nav-link:hover {
            color: white;
            background: rgba(255,255,255,0.08);
        }

        /* ========= MAIN CONTENT ========= */
        main {
            max-width: 880px;
            width: 100%;
            margin: 0 auto;
            padding: 2.5rem 1.5rem 3rem;
            flex: 1;
        }

        .page-title {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-light);
            margin-bottom: 1.25rem;
        }

        /* ========= APP CARDS ========= */
        .app-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .app-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.5rem 1.5rem 1.5rem 0;
            box-shadow: var(--shadow);
            transition: box-shadow 0.2s, transform 0.2s;
            display: flex;
            text-decoration: none;
            color: inherit;
            overflow: hidden;
        }

        .app-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .card-accent {
            width: 4px;
            border-radius: 0 4px 4px 0;
            flex-shrink: 0;
            margin-right: 1.25rem;
        }

        .accent-sky { background: var(--suite-sky); }
        .accent-emerald { background: var(--suite-emerald); }

        .card-body {
            flex: 1;
            min-width: 0;
        }

        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text);
        }

        .card-version {
            font-size: 0.7rem;
            font-weight: 500;
            color: var(--text-light);
            background: #f1f5f9;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            flex-shrink: 0;
        }

        .card-desc {
            font-size: 0.875rem;
            color: var(--text-light);
            line-height: 1.5;
            margin-bottom: 1rem;
        }

        .card-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--suite-amber);
            transition: gap 0.15s;
        }

        .app-card:hover .card-cta {
            gap: 0.625rem;
        }

        .card-cta-arrow {
            transition: transform 0.15s;
        }

        .app-card:hover .card-cta-arrow {
            transform: translateX(2px);
        }

        /* ========= COMING SOON ========= */
        .coming-soon {
            margin-top: 2.5rem;
        }

        .coming-soon-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-light);
            margin-bottom: 0.75rem;
        }

        .coming-soon-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .coming-soon-item {
            font-size: 0.8125rem;
            color: var(--text-light);
            background: var(--card-bg);
            border: 1px solid var(--border);
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            white-space: nowrap;
        }

        /* ========= ARCANE SEAL ========= */
        .arcane-container {
            margin: 3rem 0 1rem;
            display: flex;
            justify-content: center;
        }

        .arcane-seal {
            position: relative;
            width: 100px;
            height: 100px;
            cursor: pointer;
            transition: transform 0.4s ease;
        }

        .arcane-seal:hover { transform: scale(1.08); }
        .arcane-seal:hover .seal-glow { opacity: 0.6; }

        .seal-glow {
            position: absolute;
            inset: -15px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
            opacity: 0.2;
            transition: opacity 0.4s ease;
            animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
        }

        .seal-svg {
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .arcane-hint {
            text-align: center;
            font-size: 0.7rem;
            color: var(--arcane-glow);
            opacity: 0.4;
            margin-top: 0.4rem;
            font-style: italic;
            letter-spacing: 0.05em;
            transition: opacity 0.3s;
        }

        .arcane-container:hover .arcane-hint { opacity: 0.7; }

        /* ========= D&D OVERLAY ========= */
        .dnd-overlay {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 1000;
            background: rgba(10, 5, 20, 0.92);
            backdrop-filter: blur(8px);
            justify-content: center;
            align-items: center;
            animation: overlay-in 0.3s ease;
        }

        .dnd-overlay.active { display: flex; }

        @keyframes overlay-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .dnd-content {
            text-align: center;
            max-width: 480px;
            padding: 2rem;
            animation: content-rise 0.4s ease 0.1s both;
        }

        @keyframes content-rise {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .mimic-container {
            width: 200px;
            height: 200px;
            margin: 0 auto 2rem;
            position: relative;
        }

        .mimic-container svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 0 20px rgba(124,58,237,0.4));
        }

        .dnd-title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 1.8rem;
            color: #e9d5ff;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 20px rgba(167,139,250,0.5);
        }

        .dnd-subtitle {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 1rem;
            color: #a78bfa;
            font-style: italic;
            margin-bottom: 1.5rem;
        }

        .dnd-text {
            font-size: 0.95rem;
            color: #c4b5fd;
            line-height: 1.7;
            margin-bottom: 2rem;
            opacity: 0.85;
        }

        .dnd-text em { color: #e9d5ff; font-style: normal; }

        .dnd-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--arcane) 0%, var(--arcane-dark) 100%);
            color: white;
            border: 1px solid rgba(167,139,250,0.3);
            border-radius: 8px;
            padding: 0.75rem 2rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }

        .dnd-btn:hover {
            background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(124,58,237,0.4);
        }

        .dnd-btn-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }

        .dnd-btn-enter {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            color: #a78bfa;
            border: 1px solid rgba(167,139,250,0.4);
            border-radius: 8px;
            padding: 0.75rem 2rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            text-decoration: none;
        }

        .dnd-btn-enter:hover {
            background: rgba(124,58,237,0.15);
            border-color: rgba(167,139,250,0.7);
            color: #c4b5fd;
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(124,58,237,0.2);
        }

        .dnd-flavor {
            margin-top: 1.5rem;
            font-size: 0.72rem;
            color: #6d28d9;
            opacity: 0.5;
            font-style: italic;
        }

        /* ========= FOOTER ========= */
        footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.78rem;
            color: var(--text-light);
            border-top: 1px solid var(--border);
        }

        footer a {
            color: var(--suite-sky);
            text-decoration: none;
        }

        footer a:hover { text-decoration: underline; }

        /* ========= RESPONSIVE ========= */
        @media (min-width: 640px) {
            .app-grid { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>

<!-- Suite Nav -->
<nav class="suite-nav">
    <div class="suite-nav-inner">
        <a href="/" class="suite-logo">
            <span class="suite-logo-icon">&#9672;</span>
            <span>MedicalPKM</span>
        </a>
        <div class="suite-nav-right">
            <a href="https://kol.medicalpkm.com" class="suite-nav-link">KOL Briefs</a>
            <a href="https://coc.medicalpkm.com" class="suite-nav-link">Cthulhu Investigator</a>
            <a href="/apps/shared/fountain-pen/" class="suite-nav-link">Fountain Pen</a>
        </div>
    </div>
</nav>

<main>
    <div class="page-title">Your Tools</div>

    <div class="app-grid">

        <a href="https://kol.medicalpkm.com" class="app-card">
            <div class="card-accent accent-sky"></div>
            <div class="card-body">
                <div class="card-header">
                    <span class="card-title">KOL Brief Generator</span>
                    <span class="card-version">v0.4.0</span>
                </div>
                <p class="card-desc">Generate comprehensive PDF briefs for Key Opinion Leaders. Conference prep with leadership analysis, expertise mapping, and conversation starters.</p>
                <span class="card-cta">Open <span class="card-cta-arrow">&rarr;</span></span>
            </div>
        </a>

        <a href="https://coc.medicalpkm.com" class="app-card">
            <div class="card-accent" style="background: #10b981;"></div>
            <div class="card-body">
                <div class="card-header">
                    <span class="card-title">Cthulhu Investigator</span>
                    <span class="card-version">v0.1.0</span>
                </div>
                <p class="card-desc">Play solo horror adventures with an AI Keeper, generate investigators, and roll your fate. AI-generated Call of Cthulhu RPG adventures.</p>
                <span class="card-cta">Open <span class="card-cta-arrow">&rarr;</span></span>
            </div>
        </a>

        <a href="/apps/shared/fountain-pen/" class="app-card">
            <div class="card-accent accent-emerald"></div>
            <div class="card-body">
                <div class="card-header">
                    <span class="card-title">Fountain Pen Companion</span>
                    <span class="card-version">v1.0</span>
                </div>
                <p class="card-desc">Track your fountain pen collection, ink inventory, and pen-ink pairings. Visual catalog with usage notes and ratings.</p>
                <span class="card-cta">Open <span class="card-cta-arrow">&rarr;</span></span>
            </div>
        </a>

    </div>

    <div class="coming-soon">
        <div class="coming-soon-title">Coming Soon</div>
        <div class="coming-soon-list">
            <span class="coming-soon-item">Clinical Notes</span>
            <span class="coming-soon-item">Data Viz</span>
            <span class="coming-soon-item">Reading List</span>
            <span class="coming-soon-item">Reference Manager</span>
        </div>
    </div>

    <!-- Arcane Seal (D&D Easter Egg) -->
    <div class="arcane-container" onclick="openSanctum()">
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div class="arcane-seal">
                <div class="seal-glow"></div>
                <svg class="seal-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="55" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.4"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.3" stroke-dasharray="4 6"/>
                    <circle cx="60" cy="60" r="38" fill="rgba(124,58,237,0.06)" stroke="#7c3aed" stroke-width="1" opacity="0.6"/>
                    <polygon points="60,25 88,50 80,82 40,82 32,50" fill="none" stroke="#a78bfa" stroke-width="1.2" opacity="0.7"/>
                    <polygon points="60,35 78,65 42,65" fill="none" stroke="#7c3aed" stroke-width="1" opacity="0.5"/>
                    <ellipse cx="60" cy="55" rx="10" ry="6" fill="none" stroke="#c4b5fd" stroke-width="1" opacity="0.8"/>
                    <circle cx="60" cy="55" r="2.5" fill="#a78bfa" opacity="0.9"/>
                    <circle cx="60" cy="8" r="2" fill="#7c3aed" opacity="0.5"/>
                    <circle cx="60" cy="112" r="2" fill="#7c3aed" opacity="0.5"/>
                    <circle cx="8" cy="60" r="2" fill="#7c3aed" opacity="0.5"/>
                    <circle cx="112" cy="60" r="2" fill="#7c3aed" opacity="0.5"/>
                    <line x1="60" y1="12" x2="60" y2="22" stroke="#7c3aed" stroke-width="0.6" opacity="0.3"/>
                    <line x1="60" y1="98" x2="60" y2="108" stroke="#7c3aed" stroke-width="0.6" opacity="0.3"/>
                    <line x1="12" y1="60" x2="22" y2="60" stroke="#7c3aed" stroke-width="0.6" opacity="0.3"/>
                    <line x1="98" y1="60" x2="108" y2="60" stroke="#7c3aed" stroke-width="0.6" opacity="0.3"/>
                    <text x="60" y="80" text-anchor="middle" font-size="9" fill="#a78bfa" opacity="0.5" font-family="Georgia, serif">XX</text>
                </svg>
            </div>
            <div class="arcane-hint">Roll for Perception</div>
        </div>
    </div>
</main>

<footer>
    <p>MedicalPKM &copy; 2026</p>
</footer>

<!-- D&D Overlay -->
<div class="dnd-overlay" id="dndOverlay">
    <div class="dnd-content">
        <div class="mimic-container">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="70" cy="95" rx="6" ry="4" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.6" transform="rotate(-20,70,95)"/>
                <ellipse cx="60" cy="90" rx="6" ry="4" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.5" transform="rotate(15,60,90)"/>
                <ellipse cx="130" cy="95" rx="6" ry="4" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.6" transform="rotate(20,130,95)"/>
                <ellipse cx="140" cy="90" rx="6" ry="4" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.5" transform="rotate(-15,140,90)"/>
                <rect x="45" y="100" width="110" height="65" rx="4" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
                <path d="M45,100 Q45,70 100,65 Q155,70 155,100 Z" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
                <path d="M55,95 Q55,78 100,74 Q145,78 145,95" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.4"/>
                <line x1="45" y1="120" x2="155" y2="120" stroke="#a78bfa" stroke-width="1.5" opacity="0.4"/>
                <line x1="45" y1="145" x2="155" y2="145" stroke="#a78bfa" stroke-width="1.5" opacity="0.4"/>
                <circle cx="100" cy="105" r="12" fill="none" stroke="#c4b5fd" stroke-width="1.5" opacity="0.7"/>
                <ellipse cx="100" cy="105" rx="8" ry="5" fill="none" stroke="#a78bfa" stroke-width="1"/>
                <circle cx="100" cy="105" r="3" fill="#7c3aed">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
                <rect x="98" y="110" width="4" height="8" rx="1" fill="#4c1d95" opacity="0.8"/>
                <circle cx="52" cy="107" r="2" fill="#a78bfa" opacity="0.3"/>
                <circle cx="148" cy="107" r="2" fill="#a78bfa" opacity="0.3"/>
                <circle cx="52" cy="158" r="2" fill="#a78bfa" opacity="0.3"/>
                <circle cx="148" cy="158" r="2" fill="#a78bfa" opacity="0.3"/>
                <text x="72" y="138" font-size="12" fill="#7c3aed" opacity="0.3" font-family="Georgia, serif">&#9734;</text>
                <text x="118" y="138" font-size="12" fill="#7c3aed" opacity="0.3" font-family="Georgia, serif">&#9734;</text>
                <circle cx="40" cy="85" r="1.5" fill="#a78bfa" opacity="0.4">
                    <animate attributeName="cy" values="85;78;85" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="160" cy="82" r="1" fill="#c4b5fd" opacity="0.3">
                    <animate attributeName="cy" values="82;75;82" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="55" r="1.5" fill="#a78bfa" opacity="0.3">
                    <animate attributeName="cy" values="55;48;55" dur="2.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite"/>
                </circle>
            </svg>
        </div>

        <div class="dnd-title">The Mimic&rsquo;s Warning</div>
        <div class="dnd-subtitle">&ldquo;Not every chest yields its treasures willingly.&rdquo;</div>
        <div class="dnd-text">
            You reach for the chest, but it snaps shut with a low growl.
            Its arcane lock pulses with a <em>Glyph of Warding</em> &mdash;
            these vaults are sealed by the Dungeon Master and opened only
            for those who carry the right sigils.
        </div>

        <div class="dnd-btn-group">
            <a href="/apps/private/" class="dnd-btn-enter">
                &#9758; Speak Friend and Enter
            </a>
            <button class="dnd-btn" onclick="closeSanctum()">
                &#9664; Retreat to Safety
            </button>
        </div>

        <div class="dnd-flavor">
            &ldquo;A wise adventurer knows when to pick their battles.&rdquo; &mdash; Dungeon Master&rsquo;s Guide
        </div>
    </div>
</div>

<script>
    function openSanctum() {
        document.getElementById('dndOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSanctum() {
        document.getElementById('dndOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSanctum();
    });

    document.getElementById('dndOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeSanctum();
    });
</script>

</body>
</html>
`;
    }

    return new Response(responseHTML, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
