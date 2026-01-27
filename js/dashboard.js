/**
 * Performance Dashboard v2.0 - Enhanced Multi-Board
 * Features:
 * - Board selector dropdown
 * - Task-based bandwidth (Most Available = % tasks COMPLETED)
 * - 6 hrs/day calculation
 * - Subtask worklog tracking
 * - Est hours vs Logged for Done tickets
 */

// Global state
let dashboardData = null;
let currentPeriod = '7days';
let currentBoardId = null; // Selected board
let sortConfig = { column: 'total', direction: 'desc' };
let statusChart = null;
let topPerformersChart = null;
let activityTrendsChart = null;

// DOM Elements
const elements = {
    lastUpdated: document.getElementById('lastUpdated'),
    boardName: document.getElementById('boardName'),
    boardSelector: document.getElementById('boardSelector'),
    periodRange: document.getElementById('periodRange'),
    totalTasks: document.getElementById('totalTasks'),
    doneTasks: document.getElementById('doneTasks'),
    inProgressTasks: document.getElementById('inProgressTasks'),
    uatTasks: document.getElementById('uatTasks'),
    todoTasks: document.getElementById('todoTasks'),
    donePercent: document.getElementById('donePercent'),
    inProgressPercent: document.getElementById('inProgressPercent'),
    uatPercent: document.getElementById('uatPercent'),
    todoPercent: document.getElementById('todoPercent'),
    membersTableBody: document.getElementById('membersTableBody'),
    searchInput: document.getElementById('searchInput'),
    periodBtns: document.querySelectorAll('.period-btn'),
    sortableHeaders: document.querySelectorAll('th.sortable'),
    // Modal elements
    modal: document.getElementById('memberModal'),
    modalClose: document.getElementById('modalClose'),
    modalAvatar: document.getElementById('modalAvatar'),
    modalMemberName: document.getElementById('modalMemberName'),
    modalMemberEmail: document.getElementById('modalMemberEmail'),
    modalPeriodBadge: document.getElementById('modalPeriodBadge'),
    bandwidthFill: document.getElementById('bandwidthFill'),
    bandwidthLogged: document.getElementById('bandwidthLogged'),
    bandwidthTotal: document.getElementById('bandwidthTotal'),
    bandwidthPercent: document.getElementById('bandwidthPercent'),
    bandwidthAvailable: document.getElementById('bandwidthAvailable'),
    modalTotalTasks: document.getElementById('modalTotalTasks'),
    modalDoneTasks: document.getElementById('modalDoneTasks'),
    modalProgressTasks: document.getElementById('modalProgressTasks'),
    modalUatTasks: document.getElementById('modalUatTasks'),
    modalTodoTasks: document.getElementById('modalTodoTasks'),
    topTicketsList: document.getElementById('topTicketsList'),
    // Bandwidth Overview elements (Leadership View)
    overviewSprintName: document.getElementById('overviewSprintName'),
    overviewSprintDay: document.getElementById('overviewSprintDay'),
    highUtilizationList: document.getElementById('highUtilizationList'),
    lowUtilizationList: document.getElementById('lowUtilizationList'),
    // Sprint elements
    sprintCurrentBtn: document.getElementById('sprintCurrentBtn'),
    sprintPreviousBtn: document.getElementById('sprintPreviousBtn'),
    sprintName: document.getElementById('sprintName'),
    sprintDates: document.getElementById('sprintDates'),
    sprintDays: document.getElementById('sprintDays'),
    sprintBandwidthFill: document.getElementById('sprintBandwidthFill'),
    sprintHoursLogged: document.getElementById('sprintHoursLogged'),
    sprintHoursTotal: document.getElementById('sprintHoursTotal'),
    sprintUtilization: document.getElementById('sprintUtilization'),
    sprintAvailable: document.getElementById('sprintAvailable'),
    sprintTotalTasks: document.getElementById('sprintTotalTasks'),
    sprintDoneTasks: document.getElementById('sprintDoneTasks'),
    sprintProgressTasks: document.getElementById('sprintProgressTasks'),
    sprintUatTasks: document.getElementById('sprintUatTasks'),
    sprintTodoTasks: document.getElementById('sprintTodoTasks'),
    sprintTicketsList: document.getElementById('sprintTicketsList')
};

// Currently selected member for modal
let selectedMember = null;
let currentSprintView = 'current'; // 'current' or 'previous'

// ========================================
// GitHub Gist Configuration
// ========================================
const GIST_USERNAME = 'priYanshURaj-ai';
const GIST_ID = 'c51929b485b22c47daf74474026fd444';
const GIST_FILENAME = 'performance-data.json';
const GIST_RAW_URL = `https://gist.githubusercontent.com/${GIST_USERNAME}/${GIST_ID}/raw/${GIST_FILENAME}`;
// ========================================

// NEW: Working hours config (6 hrs/day)
const HOURS_PER_DAY = 6;
const DEFAULT_WORKING_HOURS = {
    '7days': 30,   // 5 days × 6 hours
    '15days': 66,  // ~11 working days
    '30days': 132  // ~22 working days
};

// Initialize Dashboard
async function initDashboard() {
    try {
        await loadData();
        setupEventListeners();
        initializeBoardSelector();
        renderDashboard();
        startAutoRefresh();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Load data from GitHub Gist
async function loadData() {
    try {
        // Add cache-busting parameter to get fresh data
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(GIST_RAW_URL + cacheBuster);
        
        if (response.ok) {
            dashboardData = await response.json();
            console.log('✅ Data loaded from GitHub Gist:', new Date(dashboardData.lastUpdated).toLocaleString());
            console.log(`   👥 Members: ${dashboardData.members?.length || 0}`);
            console.log(`   📊 Version: ${dashboardData.version || '1.0'}`);
            return;
        }
        
        // Fallback to local file
        const localResponse = await fetch('data/performance-data.json');
        if (!localResponse.ok) throw new Error('Failed to fetch data');
        dashboardData = await localResponse.json();
        console.log('✅ Data loaded from local file');
    } catch (error) {
        console.error('Error loading data:', error);
        dashboardData = getSampleData();
    }
}

// NEW: Initialize board selector dropdown
function initializeBoardSelector() {
    if (!elements.boardSelector) return;
    
    const boards = dashboardData?.availableBoards || [];
    currentBoardId = dashboardData?.selectedBoardId || dashboardData?.defaultBoardId || 'combined';
    
    // Clear existing options
    elements.boardSelector.innerHTML = '';
    
    // Add board options
    boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        if (board.id === currentBoardId) {
            option.selected = true;
        }
        elements.boardSelector.appendChild(option);
    });
    
    // If no boards available, add default
    if (boards.length === 0) {
        const option = document.createElement('option');
        option.value = 'default';
        option.textContent = dashboardData?.boardInfo?.name || 'Team Dashboard';
        elements.boardSelector.appendChild(option);
    }
}

// NEW: Switch board and update dashboard
function switchBoard(boardId) {
    if (!dashboardData?.boardsData?.[boardId]) {
        console.warn(`Board ${boardId} not found in data`);
        return;
    }
    
    currentBoardId = boardId;
    const boardData = dashboardData.boardsData[boardId];
    
    // Update current view data
    dashboardData.boardInfo = {
        id: boardId,
        name: boardData.boardName,
        project: boardData.project,
        components: boardData.components
    };
    dashboardData.teamSummary = boardData.teamSummary;
    dashboardData.members = boardData.members;
    
    console.log(`🔄 Switched to board: ${boardData.boardName}`);
    
    // Re-render dashboard
    renderDashboard();
    
    // Show notification
    showBoardSwitchNotification(boardData.boardName);
}

// Show board switch notification
function showBoardSwitchNotification(boardName) {
    const notification = document.createElement('div');
    notification.className = 'board-switch-notification';
    notification.innerHTML = `📊 Viewing: ${boardName}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00d4ff, #a855f7);
        color: #0a0e17;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideDown 0.3s ease, fadeOut 0.3s ease 1.7s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Check for data updates
async function checkForUpdates() {
    try {
        const previousUpdate = dashboardData?.lastUpdated;
        await loadData();
        
        if (previousUpdate && dashboardData?.lastUpdated !== previousUpdate) {
            console.log('🔄 New data detected, refreshing dashboard...');
            initializeBoardSelector();
            renderDashboard();
            showUpdateNotification();
        }
    } catch (error) {
        // Silently fail
    }
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = '✅ Dashboard updated with new data!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00ff88, #00d4ff);
        color: #0a0e17;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Show refresh notification
function showRefreshNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'refresh-notification';
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? 'linear-gradient(135deg, #ff4757, #ff6b81)' : 'linear-gradient(135deg, #00ff88, #00d4ff)'};
        color: ${isError ? '#fff' : '#0a0e17'};
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Start polling for updates
function startAutoRefresh() {
    setInterval(checkForUpdates, 30000);
    console.log('🔄 Auto-refresh enabled (30s interval)');
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn?.addEventListener('click', async () => {
        refreshBtn.classList.add('refreshing');
        refreshBtn.disabled = true;
        try {
            await loadData();
            initializeBoardSelector();
            renderDashboard();
            showRefreshNotification('✅ Dashboard refreshed!');
        } catch (error) {
            showRefreshNotification('❌ Refresh failed', true);
        } finally {
            refreshBtn.classList.remove('refreshing');
            refreshBtn.disabled = false;
        }
    });

    // Board selector
    elements.boardSelector?.addEventListener('change', (e) => {
        switchBoard(e.target.value);
    });

    // Period selector
    elements.periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            renderDashboard();
            if (selectedMember && elements.modal.classList.contains('active')) {
                populateModal(selectedMember);
            }
        });
    });

    // Search input
    elements.searchInput?.addEventListener('input', debounce(() => {
        renderMembersTable();
    }, 300));

    // Sortable headers
    elements.sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (sortConfig.column === column) {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.column = column;
                sortConfig.direction = 'desc';
            }
            updateSortIcons();
            renderMembersTable();
        });
    });

    // Modal close
    elements.modalClose?.addEventListener('click', closeModal);
    elements.modal?.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal?.classList.contains('active')) closeModal();
    });

    // Sprint toggle
    elements.sprintCurrentBtn?.addEventListener('click', () => {
        currentSprintView = 'current';
        elements.sprintCurrentBtn.classList.add('active');
        elements.sprintPreviousBtn?.classList.remove('active');
        if (selectedMember) populateSprintSection(selectedMember);
    });

    elements.sprintPreviousBtn?.addEventListener('click', () => {
        currentSprintView = 'previous';
        elements.sprintPreviousBtn.classList.add('active');
        elements.sprintCurrentBtn?.classList.remove('active');
        if (selectedMember) populateSprintSection(selectedMember);
    });
}

// Render entire dashboard
function renderDashboard() {
    renderHeader();
    renderBandwidthOverview();
    renderSummaryCards();
    renderMembersTable();
    renderCharts();
}

// Render header info
function renderHeader() {
    if (!dashboardData) return;

    const lastUpdated = new Date(dashboardData.lastUpdated);
    elements.lastUpdated.textContent = formatDateTime(lastUpdated);

    const boardName = dashboardData.boardInfo?.name || 'Team Dashboard';
    elements.boardName.textContent = boardName;

    const period = dashboardData.periods?.[currentPeriod];
    if (period) {
        const startDate = new Date(period.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const endDate = new Date(period.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        elements.periodRange.textContent = `${startDate} - ${endDate}`;
    }
}

// ================================================================
// ENHANCED: Bandwidth Overview with Task-Based Calculation
// ================================================================
function renderBandwidthOverview() {
    if (!dashboardData || !dashboardData.sprints) {
        elements.overviewSprintName.textContent = 'Awaiting Data...';
        elements.overviewSprintDay.textContent = '--';
        elements.highUtilizationList.innerHTML = '<div class="no-bandwidth-data">Run n8n workflow to load sprint data</div>';
        elements.lowUtilizationList.innerHTML = '<div class="no-bandwidth-data">Run n8n workflow to load sprint data</div>';
        return;
    }

    const currentSprint = dashboardData.sprints.current;
    const members = dashboardData.members || [];
    const hoursPerDay = dashboardData.hoursPerDay || HOURS_PER_DAY;

    // Update sprint badge
    elements.overviewSprintName.textContent = currentSprint.label || 'Current Sprint';
    elements.overviewSprintDay.textContent = `Day ${currentSprint.sprintDay || currentSprint.elapsedWorkingDays || '--'} of ${currentSprint.workingDays || '--'}`;

    // Calculate bandwidth for each member
    const elapsedHours = currentSprint.elapsedHours || (currentSprint.elapsedWorkingDays * hoursPerDay) || 30;
    
    const membersWithBandwidth = members.map(member => {
        const sprintMetrics = member.sprintMetrics?.current;
        const hoursLogged = sprintMetrics?.hoursLogged || 0;
        
        // Hours-based utilization
        const utilizationPercent = elapsedHours > 0 ? (hoursLogged / elapsedHours) * 100 : 0;
        const availableHours = Math.max(elapsedHours - hoursLogged, 0);
        
        // NEW: Task-based bandwidth (% of tasks remaining)
        const totalTasks = sprintMetrics?.total || 0;
        const doneTasks = sprintMetrics?.done || 0;
        const openTasks = totalTasks - doneTasks;
        const taskCompletionPercent = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
        const taskRemainingPercent = 100 - taskCompletionPercent; // Available bandwidth by tasks
        
        return {
            name: member.name,
            avatar: member.avatar,
            email: member.email,
            hoursLogged,
            elapsedHours,
            utilizationPercent: Math.round(utilizationPercent * 10) / 10,
            availableHours: Math.round(availableHours * 10) / 10,
            // NEW: Task-based metrics
            totalTasks,
            doneTasks,
            openTasks,
            taskCompletionPercent: Math.round(taskCompletionPercent * 10) / 10,
            taskRemainingPercent: Math.round(taskRemainingPercent * 10) / 10,
            memberIndex: members.indexOf(member)
        };
    });

    // HIGHEST UTILIZATION: Sort by hours logged (existing logic)
    const highUtilization = [...membersWithBandwidth]
        .filter(m => m.hoursLogged > 0)
        .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
        .slice(0, 3);

    // MOST AVAILABLE BANDWIDTH: Sort by task COMPLETION % (tasks done %)
    // Bandwidth = % of tasks COMPLETED (not open)
    // Example: 3 done out of 10 = 30% bandwidth freed up
    const lowUtilization = [...membersWithBandwidth]
        .filter(m => m.totalTasks > 0) // Only members with tasks
        .sort((a, b) => b.taskCompletionPercent - a.taskCompletionPercent)
        .slice(0, 3);

    // Render high utilization list
    if (highUtilization.length === 0) {
        elements.highUtilizationList.innerHTML = '<div class="no-bandwidth-data">No hours logged yet</div>';
    } else {
        elements.highUtilizationList.innerHTML = highUtilization.map((member, index) => `
            <div class="bandwidth-member" onclick="openMemberModal(${member.memberIndex})">
                <div class="bandwidth-rank rank-${index + 1}">${index + 1}</div>
                <div class="bandwidth-member-avatar">${member.avatar}</div>
                <div class="bandwidth-member-info">
                    <div class="bandwidth-member-name">${member.name}</div>
                </div>
                <div class="bandwidth-member-stats">
                    <div class="bandwidth-mini-bar">
                        <div class="bandwidth-mini-fill" style="width: ${Math.min(member.utilizationPercent, 100)}%"></div>
                    </div>
                    <span class="bandwidth-percent">${member.utilizationPercent}%</span>
                    <span class="bandwidth-hours">${member.hoursLogged}h / ${member.elapsedHours}h</span>
                </div>
            </div>
        `).join('');
    }

    // Render most available bandwidth list (TASK-BASED = Completion %)
    // Bandwidth = % of tasks DONE (completed work = freed bandwidth)
    if (lowUtilization.length === 0) {
        elements.lowUtilizationList.innerHTML = '<div class="no-bandwidth-data">No tasks assigned</div>';
    } else {
        elements.lowUtilizationList.innerHTML = lowUtilization.map((member, index) => `
            <div class="bandwidth-member" onclick="openMemberModal(${member.memberIndex})">
                <div class="bandwidth-rank rank-${index + 1}">${index + 1}</div>
                <div class="bandwidth-member-avatar">${member.avatar}</div>
                <div class="bandwidth-member-info">
                    <div class="bandwidth-member-name">${member.name}</div>
                </div>
                <div class="bandwidth-member-stats">
                    <div class="bandwidth-mini-bar available">
                        <div class="bandwidth-mini-fill" style="width: ${member.taskCompletionPercent}%"></div>
                    </div>
                    <span class="bandwidth-percent">${member.taskCompletionPercent}%</span>
                    <span class="bandwidth-hours">${member.doneTasks}/${member.totalTasks} done</span>
                </div>
            </div>
        `).join('');
    }
}

// Render summary cards
function renderSummaryCards() {
    if (!dashboardData) return;

    const summary = dashboardData.teamSummary[currentPeriod];
    if (!summary) return;

    elements.totalTasks.textContent = summary.total;
    elements.doneTasks.textContent = summary.done;
    elements.inProgressTasks.textContent = summary.inProgress;
    elements.uatTasks.textContent = summary.uat;
    elements.todoTasks.textContent = summary.toDo;

    const total = summary.total || 1;
    elements.donePercent.textContent = `${((summary.done / total) * 100).toFixed(1)}%`;
    elements.inProgressPercent.textContent = `${((summary.inProgress / total) * 100).toFixed(1)}%`;
    elements.uatPercent.textContent = `${((summary.uat / total) * 100).toFixed(1)}%`;
    elements.todoPercent.textContent = `${((summary.toDo / total) * 100).toFixed(1)}%`;
}

// ================================================================
// ENHANCED: Members Table with Est vs Logged Bandwidth
// ================================================================
function renderMembersTable() {
    if (!dashboardData || !dashboardData.members) return;

    const searchTerm = elements.searchInput?.value?.toLowerCase() || '';
    let members = dashboardData.members.filter(m => 
        m.name.toLowerCase().includes(searchTerm) || 
        m.email.toLowerCase().includes(searchTerm)
    );

    members = sortMembers(members);

    const html = members.map(member => {
        const metrics = member.metrics[currentPeriod];
        if (!metrics) return '';

        const total = metrics.total || 1;
        const donePercent = (metrics.done / total) * 100;
        const progressPercent = (metrics.inProgress / total) * 100;
        const uatPercent = (metrics.uat / total) * 100;
        const todoPercent = (metrics.toDo / total) * 100;

        const badgeClass = (type, value) => `status-badge ${type}${value === 0 ? ' zero' : ''}`;
        const memberIndex = dashboardData.members.findIndex(m => m.email === member.email);
        
        // NEW: Bandwidth shows Est vs Logged for Done tickets
        const estDone = metrics.estimatedDone || 0;
        const loggedDone = metrics.loggedDone || 0;
        const estTotal = metrics.estimatedHours || 0;
        const loggedTotal = metrics.hoursLogged || 0;
        
        return `
            <tr class="clickable-row" data-member-index="${memberIndex}" onclick="openMemberModal(${memberIndex})">
                <td>
                    <div class="member-cell">
                        <div class="member-avatar">${member.avatar}</div>
                        <div class="member-info">
                            <span class="member-name">${member.name}</span>
                            <span class="member-email">${member.email}</span>
                        </div>
                    </div>
                </td>
                <td><span class="${badgeClass('total', metrics.total)}">${metrics.total}</span></td>
                <td>
                    <div class="bandwidth-cell">
                        <span class="bandwidth-estimated ${estTotal === 0 ? 'zero' : ''}">${estTotal}h est</span>
                        <span class="bandwidth-logged ${loggedTotal > 0 ? 'has-value' : 'zero'}">${loggedTotal}h logged</span>
                    </div>
                </td>
                <td><span class="${badgeClass('done', metrics.done)}">${metrics.done}</span></td>
                <td><span class="${badgeClass('progress', metrics.inProgress)}">${metrics.inProgress}</span></td>
                <td><span class="${badgeClass('uat', metrics.uat)}">${metrics.uat}</span></td>
                <td><span class="${badgeClass('todo', metrics.toDo)}">${metrics.toDo}</span></td>
                <td class="progress-cell">
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-segment done" style="width: ${donePercent}%"></div>
                            <div class="progress-segment progress" style="width: ${progressPercent}%"></div>
                            <div class="progress-segment uat" style="width: ${uatPercent}%"></div>
                            <div class="progress-segment todo" style="width: ${todoPercent}%"></div>
                        </div>
                        <span class="progress-label">${metrics.total > 0 ? `${donePercent.toFixed(0)}% complete` : 'No tasks'}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    elements.membersTableBody.innerHTML = html || `
        <tr class="no-data-row">
            <td colspan="8">
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">No team members found</div>
                    <div class="empty-hint">Try adjusting your search or check data source</div>
                </div>
            </td>
        </tr>
    `;
}

// Sort members
function sortMembers(members) {
    return members.sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.column === 'name') {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
        } else if (sortConfig.column === 'bandwidth') {
            aVal = a.metrics[currentPeriod]?.hoursLogged || 0;
            bVal = b.metrics[currentPeriod]?.hoursLogged || 0;
        } else {
            aVal = a.metrics[currentPeriod]?.[sortConfig.column] || 0;
            bVal = b.metrics[currentPeriod]?.[sortConfig.column] || 0;
        }

        if (sortConfig.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// Update sort icons
function updateSortIcons() {
    elements.sortableHeaders.forEach(header => {
        header.classList.remove('asc', 'desc');
        if (header.dataset.sort === sortConfig.column) {
            header.classList.add(sortConfig.direction);
        }
    });
}

// Render charts
function renderCharts() {
    renderStatusChart();
    renderTopPerformersChart();
    renderActivityTrendsChart();
}

// Daily Activity Trends chart
function renderActivityTrendsChart() {
    const ctx = document.getElementById('activityTrendsChart')?.getContext('2d');
    if (!ctx || !dashboardData) return;

    // Generate daily data from team summary and members
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
    const members = dashboardData.members || [];
    
    // Calculate trends based on available data
    const summary = dashboardData.teamSummary?.[currentPeriod] || {};
    const totalDone = summary.done || 0;
    const totalCreated = summary.total || 0;
    const activeMembers = members.filter(m => (m.metrics?.[currentPeriod]?.total || 0) > 0).length;
    
    // Simulate daily distribution (in real implementation, this would come from n8n)
    const baseCreated = Math.ceil(totalCreated / 7);
    const baseDone = Math.ceil(totalDone / 7);
    const baseActive = Math.ceil(activeMembers * 0.8);
    
    const issuesCreated = days.map((_, i) => {
        const variance = Math.random() * 0.4 + 0.8;
        return Math.round(baseCreated * variance * (i < 5 ? 1 : 0.3));
    });
    
    const issuesResolved = days.map((_, i) => {
        const variance = Math.random() * 0.4 + 0.8;
        return Math.round(baseDone * variance * (i < 5 ? 1 : 0.2));
    });
    
    const activeMembersData = days.map((_, i) => {
        const variance = Math.random() * 0.3 + 0.85;
        return Math.round(baseActive * variance * (i < 5 ? 1 : 0.4));
    });

    if (activityTrendsChart) activityTrendsChart.destroy();

    activityTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Issues Created',
                    data: issuesCreated,
                    borderColor: 'rgba(0, 212, 255, 1)',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(0, 212, 255, 1)'
                },
                {
                    label: 'Issues Resolved',
                    data: issuesResolved,
                    borderColor: 'rgba(0, 255, 136, 1)',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(0, 255, 136, 1)'
                },
                {
                    label: 'Active Members',
                    data: activeMembersData,
                    borderColor: 'rgba(168, 85, 247, 1)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: { color: 'rgba(45, 58, 79, 0.5)', drawBorder: false },
                    ticks: { color: '#94a3b8', font: { family: "'Outfit', sans-serif", size: 12 } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: { color: 'rgba(45, 58, 79, 0.5)', drawBorder: false },
                    ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 11 } },
                    title: { display: true, text: 'Issues', color: '#94a3b8' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#a855f7', font: { family: "'JetBrains Mono', monospace", size: 11 } },
                    title: { display: true, text: 'Members', color: '#a855f7' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        padding: 20,
                        usePointStyle: true,
                        font: { family: "'Outfit', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: '#2d3a4f',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// Status distribution chart
function renderStatusChart() {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx || !dashboardData) return;

    const summary = dashboardData.teamSummary[currentPeriod];
    if (!summary) return;

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Done', 'In Progress', 'UAT', 'To Do'],
            datasets: [{
                data: [summary.done, summary.inProgress, summary.uat, summary.toDo],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(255, 217, 61, 0.8)',
                    'rgba(255, 159, 67, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 255, 136, 1)',
                    'rgba(0, 212, 255, 1)',
                    'rgba(255, 217, 61, 1)',
                    'rgba(255, 159, 67, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        usePointStyle: true,
                        font: { family: "'Outfit', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: '#2d3a4f',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return ` ${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Top performers chart
function renderTopPerformersChart() {
    const ctx = document.getElementById('topPerformersChart')?.getContext('2d');
    if (!ctx || !dashboardData) return;

    const topPerformers = [...dashboardData.members]
        .sort((a, b) => (b.metrics[currentPeriod]?.done || 0) - (a.metrics[currentPeriod]?.done || 0))
        .slice(0, 5);

    if (topPerformersChart) topPerformersChart.destroy();

    topPerformersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topPerformers.map(m => m.name.split(' ')[0]),
            datasets: [{
                label: 'Tasks Done',
                data: topPerformers.map(m => m.metrics[currentPeriod]?.done || 0),
                backgroundColor: 'rgba(0, 255, 136, 0.6)',
                borderColor: 'rgba(0, 255, 136, 1)',
                borderWidth: 2,
                borderRadius: 6,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(45, 58, 79, 0.5)', drawBorder: false },
                    ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 11 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#fff', font: { family: "'Outfit', sans-serif", size: 12, weight: '500' } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: '#2d3a4f',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// Utility functions
function formatDateTime(date) {
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    elements.membersTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="no-data">
                <div class="no-data-icon">⚠️</div>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// Fallback data
function getSampleData() {
    console.warn('⚠️ Using fallback data structure');
    const today = new Date();
    const getDateStr = (daysAgo) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    };
    
    return {
        lastUpdated: today.toISOString(),
        version: '2.0',
        availableBoards: [
            { id: 'default', name: 'Waiting for Data...', components: [], project: '--' }
        ],
        defaultBoardId: 'default',
        hoursPerDay: 6,
        boardInfo: { 
            name: 'Waiting for Data...', 
            project: '--',
            components: []
        },
        workingHours: { '7days': 30, '15days': 66, '30days': 132 },
        sprints: null,
        periods: {
            '7days': { label: 'Last 7 Days', startDate: getDateStr(7), endDate: getDateStr(0) },
            '15days': { label: 'Last 15 Days', startDate: getDateStr(15), endDate: getDateStr(0) },
            '30days': { label: 'Last 30 Days', startDate: getDateStr(30), endDate: getDateStr(0) }
        },
        teamSummary: {
            '7days': { total: 0, done: 0, inProgress: 0, uat: 0, toDo: 0, totalHoursLogged: 0 },
            '15days': { total: 0, done: 0, inProgress: 0, uat: 0, toDo: 0, totalHoursLogged: 0 },
            '30days': { total: 0, done: 0, inProgress: 0, uat: 0, toDo: 0, totalHoursLogged: 0 }
        },
        members: []
    };
}

// ============================================
// MEMBER MODAL FUNCTIONS
// ============================================

// Open member modal
function openMemberModal(memberIndex) {
    const member = dashboardData.members[memberIndex];
    if (!member) return;
    
    selectedMember = member;
    populateModal(member);
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    elements.modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedMember = null;
}

// ================================================================
// ENHANCED: Modal with Est vs Logged for Done Tickets
// ================================================================
function populateModal(member) {
    const metrics = member.metrics[currentPeriod];
    if (!metrics) return;

    // Header info
    elements.modalAvatar.textContent = member.avatar;
    elements.modalMemberName.textContent = member.name;
    elements.modalMemberEmail.textContent = member.email;
    
    // Reset sprint view
    currentSprintView = 'current';
    elements.sprintCurrentBtn?.classList.add('active');
    elements.sprintPreviousBtn?.classList.remove('active');
    
    populateSprintSection(member);
    
    // Period badge
    const periodLabels = { '7days': 'Last 7 Days', '15days': 'Last 15 Days', '30days': 'Last 30 Days' };
    elements.modalPeriodBadge.textContent = periodLabels[currentPeriod];

    // NEW: Bandwidth calculation using 6 hrs/day
    const workingHours = dashboardData.workingHours?.[currentPeriod] || DEFAULT_WORKING_HOURS[currentPeriod];
    const hoursLogged = metrics.hoursLogged || 0;
    const utilizationPercent = Math.min((hoursLogged / workingHours) * 100, 100);
    const availableHours = Math.max(workingHours - hoursLogged, 0);
    const isOverutilized = hoursLogged > workingHours;

    elements.bandwidthFill.style.width = `${Math.min(utilizationPercent, 100)}%`;
    elements.bandwidthFill.classList.toggle('overutilized', isOverutilized);
    elements.bandwidthLogged.textContent = `${hoursLogged}h logged`;
    elements.bandwidthTotal.textContent = `of ${workingHours}h available`;
    elements.bandwidthPercent.textContent = `${utilizationPercent.toFixed(0)}%`;
    elements.bandwidthAvailable.textContent = isOverutilized ? `+${(hoursLogged - workingHours).toFixed(1)}h over` : `${availableHours.toFixed(1)}h`;

    // Task summary
    elements.modalTotalTasks.textContent = metrics.total || 0;
    elements.modalDoneTasks.textContent = metrics.done || 0;
    elements.modalProgressTasks.textContent = metrics.inProgress || 0;
    elements.modalUatTasks.textContent = metrics.uat || 0;
    elements.modalTodoTasks.textContent = metrics.toDo || 0;

    renderTopTickets(metrics.topIssues || []);
}

// ================================================================
// ENHANCED: Sprint section with task-based bandwidth
// ================================================================
function populateSprintSection(member) {
    const sprintMetrics = member.sprintMetrics?.[currentSprintView];
    const sprintInfo = dashboardData.sprints?.[currentSprintView];
    const hoursPerDay = dashboardData.hoursPerDay || HOURS_PER_DAY;
    
    if (!dashboardData.sprints) {
        elements.sprintName.textContent = 'Awaiting Data...';
        elements.sprintDates.textContent = 'Run n8n workflow';
        elements.sprintDays.textContent = '--';
        elements.sprintBandwidthFill.style.width = '0%';
        elements.sprintHoursLogged.textContent = '0h logged';
        elements.sprintHoursTotal.textContent = 'of --h available';
        elements.sprintUtilization.textContent = '0%';
        elements.sprintAvailable.textContent = '--';
        elements.sprintTotalTasks.textContent = '0';
        elements.sprintDoneTasks.textContent = '0';
        elements.sprintProgressTasks.textContent = '0';
        elements.sprintUatTasks.textContent = '0';
        elements.sprintTodoTasks.textContent = '0';
        elements.sprintTicketsList.innerHTML = `<div class="no-tickets"><span>⏳</span> Run n8n workflow to load sprint data</div>`;
        return;
    }
    
    if (!sprintInfo) {
        elements.sprintName.textContent = 'No Sprint Data';
        elements.sprintDates.textContent = '--';
        elements.sprintDays.textContent = '--';
        return;
    }

    elements.sprintName.textContent = sprintInfo.label || `${sprintInfo.month} Sprint ${sprintInfo.number}`;
    
    const startDate = new Date(sprintInfo.startDate);
    const endDate = new Date(sprintInfo.endDate);
    const formatSprintDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    elements.sprintDates.textContent = `${formatSprintDate(startDate)} - ${formatSprintDate(endDate)}`;
    
    const isCurrentSprint = currentSprintView === 'current';
    
    // NEW: Get task-based and hours-based metrics
    const totalTasks = sprintMetrics?.total || 0;
    const doneTasks = sprintMetrics?.done || 0;
    const openTasks = totalTasks - doneTasks;
    const estDone = sprintMetrics?.estimatedDone || 0;
    const loggedDone = sprintMetrics?.loggedDone || 0;
    
    // Task completion percentage
    const taskCompletionPercent = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
    
    if (isCurrentSprint) {
        const elapsedHours = sprintInfo.elapsedHours || 0;
        const sprintDay = sprintInfo.sprintDay || sprintInfo.elapsedWorkingDays || 1;
        const totalWorkingDays = sprintInfo.workingDays || 10;
        const hoursLogged = sprintMetrics?.hoursLogged || 0;
        
        const utilizationPercent = elapsedHours > 0 ? (hoursLogged / elapsedHours) * 100 : 0;
        const availableHours = Math.max(elapsedHours - hoursLogged, 0);
        const isOverutilized = hoursLogged > elapsedHours;
        
        elements.sprintDays.textContent = `Day ${sprintDay} of ${totalWorkingDays}`;
        elements.sprintBandwidthFill.style.width = `${Math.min(utilizationPercent, 100)}%`;
        elements.sprintBandwidthFill.classList.toggle('overutilized', isOverutilized);
        elements.sprintHoursLogged.textContent = `${hoursLogged}h logged`;
        elements.sprintHoursTotal.textContent = `of ${elapsedHours}h available (${sprintDay} days × ${hoursPerDay}h)`;
        elements.sprintUtilization.textContent = `${Math.min(utilizationPercent, 100).toFixed(0)}%`;
        elements.sprintAvailable.textContent = isOverutilized ? `+${(hoursLogged - elapsedHours).toFixed(1)}h over` : `${availableHours.toFixed(1)}h`;
    } else {
        const totalHours = sprintInfo.totalHours || (sprintInfo.workingDays * hoursPerDay) || 60;
        const hoursLogged = sprintMetrics?.hoursLogged || 0;
        const utilizationPercent = totalHours > 0 ? (hoursLogged / totalHours) * 100 : 0;
        const availableHours = Math.max(totalHours - hoursLogged, 0);
        const isOverutilized = hoursLogged > totalHours;
        
        elements.sprintDays.textContent = `${sprintInfo.workingDays} working days (completed)`;
        elements.sprintBandwidthFill.style.width = `${Math.min(utilizationPercent, 100)}%`;
        elements.sprintBandwidthFill.classList.toggle('overutilized', isOverutilized);
        elements.sprintHoursLogged.textContent = `${hoursLogged}h logged`;
        elements.sprintHoursTotal.textContent = `of ${totalHours}h total`;
        elements.sprintUtilization.textContent = `${Math.min(utilizationPercent, 100).toFixed(0)}%`;
        elements.sprintAvailable.textContent = isOverutilized ? `+${(hoursLogged - totalHours).toFixed(1)}h over` : `${availableHours.toFixed(1)}h`;
    }

    // Task summary
    elements.sprintTotalTasks.textContent = totalTasks;
    elements.sprintDoneTasks.textContent = doneTasks;
    elements.sprintProgressTasks.textContent = sprintMetrics?.inProgress || 0;
    elements.sprintUatTasks.textContent = sprintMetrics?.uat || 0;
    elements.sprintTodoTasks.textContent = sprintMetrics?.toDo || 0;

    renderSprintTickets(sprintMetrics?.allIssues || sprintMetrics?.topIssues || []);
}

// Render top tickets
function renderTopTickets(topIssues) {
    if (!topIssues || topIssues.length === 0) {
        elements.topTicketsList.innerHTML = `<div class="no-tickets"><span>📭</span> No time logged on tickets in this period</div>`;
        return;
    }

    const statusLabels = {
        'done': '✅ Done',
        'inProgress': '🔄 In Progress',
        'uat': '🧪 UAT',
        'toDo': '📝 To Do'
    };

    const html = topIssues.map((ticket, index) => `
        <div class="ticket-item">
            <div class="ticket-rank rank-${index + 1}">${index + 1}</div>
            <div class="ticket-info">
                <div class="ticket-key">${ticket.key}</div>
                <div class="ticket-summary">${ticket.summary}</div>
            </div>
            <div class="ticket-hours">${ticket.hours}h</div>
            <div class="ticket-status ${ticket.status}">${statusLabels[ticket.status] || ticket.statusName}</div>
        </div>
    `).join('');

    elements.topTicketsList.innerHTML = html;
}

// Render sprint tickets
function renderSprintTickets(sprintIssues) {
    if (!sprintIssues || sprintIssues.length === 0) {
        elements.sprintTicketsList.innerHTML = `<div class="no-tickets"><span>📭</span> No tasks assigned in this sprint period</div>`;
        return;
    }

    const statusLabels = {
        'done': '✅ Done',
        'inProgress': '🔄 In Progress',
        'uat': '🧪 UAT',
        'toDo': '📝 To Do'
    };

    const sortedIssues = [...sprintIssues].sort((a, b) => (b.hours || 0) - (a.hours || 0));

    const html = sortedIssues.map((ticket, index) => `
        <div class="ticket-item">
            <div class="ticket-rank rank-${Math.min(index + 1, 4)}">${index + 1}</div>
            <div class="ticket-info">
                <div class="ticket-key">${ticket.key}</div>
                <div class="ticket-summary">${ticket.summary || 'No summary'}</div>
            </div>
            ${ticket.hours > 0 ? `<div class="ticket-hours">${ticket.hours}h</div>` : '<div class="ticket-hours zero">0h</div>'}
            <div class="ticket-status ${ticket.status}">${statusLabels[ticket.status] || ticket.statusName || 'Unknown'}</div>
        </div>
    `).join('');

    elements.sprintTicketsList.innerHTML = html;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);
