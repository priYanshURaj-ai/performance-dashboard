# 📊 Team Performance Dashboard
## Documentation Guide v2.0

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Dashboard Components](#3-dashboard-components)
4. [Key Metrics & Calculations](#4-key-metrics--calculations)
5. [Individual Performance Modal](#5-individual-performance-modal)
6. [Charts & Visualizations](#6-charts--visualizations)
7. [Technical Architecture](#7-technical-architecture)
8. [Troubleshooting & FAQs](#8-troubleshooting--faqs)

---

## 1. Overview

### 1.1 Purpose

The Team Performance Dashboard is a real-time performance tracking tool designed for leadership to monitor:
- Team productivity across multiple JIRA boards
- Sprint progress and velocity
- Individual contributions and bandwidth
- Daily activity trends

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Board Selection** | Switch between different JIRA boards via dropdown |
| **Time Period Filters** | View data for 7, 15, or 30 days |
| **Real-time Refresh** | Manual refresh button for latest data |
| **Individual Drill-down** | Click on any team member for detailed sprint view |
| **Daily Activity Trends** | Visual chart showing team activity patterns |

### 1.3 Configuration Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Working Hours/Day | **6 hours** | Accounts for meetings, breaks, code reviews, interruptions |
| Working Days/Week | **5 days** | Standard work week (Mon-Fri) |
| Weekly Capacity | **30 hours** | 6 hrs × 5 days = 30 productive hours |

---

## 2. Getting Started

### 2.1 Accessing the Dashboard

**URL:** `https://priyanshuraj-ai.github.io/performance-dashboard/`

### 2.2 Navigation Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  [Board Selector ▼]              [7d] [15d] [30d]    [🔄 Refresh]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│   │  Total   │ │ Completed│ │In Progress│ │   Open   │          │
│   │  Issues  │ │          │ │          │ │          │          │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────┐             │
│   │ Highest Utilization │  │   Most Available    │             │
│   │     (Left Panel)    │  │   (Right Panel)     │             │
│   └─────────────────────┘  └─────────────────────┘             │
│                                                                 │
│   ┌─────────────────────────────────────────────┐              │
│   │         Individual Performance Table         │              │
│   └─────────────────────────────────────────────┘              │
│                                                                 │
│   ┌─────────────────────────────────────────────┐              │
│   │           Daily Activity Trends              │              │
│   └─────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Basic Actions

| Action | How To |
|--------|--------|
| **Select Board** | Click dropdown → Choose board name |
| **Change Period** | Click 7d, 15d, or 30d button |
| **Refresh Data** | Click 🔄 Refresh button |
| **View Member Details** | Click on any member name |

---

## 3. Dashboard Components

### 3.1 Header Section

#### Board Selector
- **Purpose:** Filter dashboard to show data for a specific JIRA board
- **Options:** All PAI project boards (Bot Engine, RE Platform 2.0, etc.)
- **Behavior:** Selecting a board filters all metrics to that board's data

#### Period Selector
- **Purpose:** Filter data by time range
- **Options:** 
  - `7d` - Last 7 days
  - `15d` - Last 15 days  
  - `30d` - Last 30 days
- **Behavior:** All metrics recalculate based on selected period

#### Refresh Button
- **Purpose:** Manually fetch latest data from storage
- **Use When:** You've recently logged time or updated tickets

---

### 3.2 Team Summary Cards

| Card | Description | Source |
|------|-------------|--------|
| **Total Issues** | Count of all issues in selected board/period | JIRA issue count |
| **Completed** | Issues with status Done/Closed | Status = Done, Closed, Resolved |
| **In Progress** | Issues currently being worked on | Status = In Progress, In Development |
| **Open** | Issues not yet started | Status = To Do, Open, Backlog |

---

### 3.3 Bandwidth Overview

#### 3.3.1 Highest Utilization (Left Panel)

**Purpose:** Shows team members who have logged the most hours relative to expected hours.

| Element | Description |
|---------|-------------|
| **Ranking** | Sorted by utilization % (highest first) |
| **Member Name** | Team member's display name |
| **Hours Logged** | Total worklog hours in period |
| **Utilization %** | Logged hours ÷ Expected hours × 100 |
| **Progress Bar** | Visual representation of utilization |

**How to Read:**
- **Green (60-100%)** - On track
- **Yellow (<60%)** - Under-utilized, may have capacity
- **Red (>100%)** - Overloaded, may need support

---

#### 3.3.2 Most Available (Right Panel)

**Purpose:** Shows team members with the most bandwidth free based on task completion.

| Element | Description |
|---------|-------------|
| **Ranking** | Sorted by task completion % (lowest first = most available) |
| **Member Name** | Team member's display name |
| **Tasks Done/Total** | Completed tasks out of assigned tasks |
| **Completion %** | Tasks completed ÷ Total tasks × 100 |

**How to Read:**
- Lower completion % = More tasks remaining = More bandwidth consumed
- Higher completion % = Fewer tasks remaining = More bandwidth available

> **Note:** This shows who has completed fewer tasks relative to their assignment, indicating they still have work in pipeline.

---

### 3.4 Individual Performance Table

| Column | Description |
|--------|-------------|
| **Member** | Team member name with avatar |
| **Tasks** | Total tasks assigned in period |
| **Completed** | Tasks marked as Done/Closed |
| **Hours Logged** | Total worklog hours |
| **Utilization** | Percentage with progress bar |
| **Status** | Visual indicator badge |

**Status Badges:**
| Badge | Condition | Meaning |
|-------|-----------|---------|
| 🟢 On Track | 60-100% utilization | Healthy workload |
| 🟡 Low | <60% utilization | May have capacity |
| 🔴 High | >100% utilization | Potentially overloaded |

---

## 4. Key Metrics & Calculations

### 4.1 Utilization Percentage

**Formula:**
```
Utilization % = (Hours Logged / Expected Hours) × 100
```

**Components:**

| Variable | Calculation | Example |
|----------|-------------|---------|
| **Hours Logged** | Sum of all worklogs by user in period | 33 hours |
| **Expected Hours** | Days in period × 6 hours/day | 7 days × 6h = 42h |
| **Utilization** | (33 / 42) × 100 | **79%** |

---

### 4.2 Task Completion Percentage

**Formula:**
```
Task Completion % = (Tasks Done / Total Tasks Assigned) × 100
```

**Example:**
| Metric | Value |
|--------|-------|
| Total tasks assigned | 10 |
| Tasks completed | 3 |
| **Completion %** | (3/10) × 100 = **30%** |

---

### 4.3 Available Bandwidth (Task-Based)

**Formula:**
```
Available Bandwidth % = 100% - Task Completion %
```

**Interpretation:**
- If someone has completed 30% of their tasks → 70% of sprint workload remaining
- Lower completion = Less available (more work pending)
- Higher completion = More available (most work done)

---

### 4.4 Sprint Progress

**Formula:**
```
Sprint Day Progress = (Today - Sprint Start Date) / Total Sprint Days
```

**Example:**
| Metric | Value |
|--------|-------|
| Sprint Start | Jan 19 |
| Sprint End | Feb 1 |
| Today | Jan 25 |
| Total Days | 14 |
| Days Elapsed | 7 |
| **Progress** | Day 7 of 14 (50%) |

---

### 4.5 Status Indicator Logic

| Status | Utilization Range | Interpretation |
|--------|-------------------|----------------|
| 🟢 **On Track** | 60% - 100% | Healthy, productive workload |
| 🟡 **Under-utilized** | < 60% | May have available capacity |
| 🔴 **Overloaded** | > 100% | Working beyond expected hours |

---

## 5. Individual Performance Modal

Accessed by clicking any team member's name in the dashboard.

### 5.1 Modal Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar]  Member Name                              [X] │
│            email@company.com                            │
├─────────────────────────────────────────────────────────┤
│  🏃 Sprint Bandwidth    [Current Sprint] [Previous]     │
│                                                         │
│  Sprint Name        19 Jan - 1 Feb        Day 7 of 10  │
│                                                         │
│  [████████████████████░░░░░░]  79% UTILIZED  9.0h LEFT │
│   33h logged of 42h available                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │  5  │ │  3  │ │  0  │ │  0  │ │  2  │              │
│  │PICKED│ │DONE │ │ WIP │ │ UAT │ │TO DO│              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
├─────────────────────────────────────────────────────────┤
│  📋 Sprint Tickets                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ PAI-28696  Meetings and Adhoc tasks    3h  To Do  │ │
│  │ PAI-28473  Feature implementation      8h  Done   │ │
│  │ ...                                               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Sprint Bandwidth Section

| Field | Description | Calculation |
|-------|-------------|-------------|
| **Sprint Name** | Current active sprint | From JIRA sprint data |
| **Sprint Dates** | Start → End date | From JIRA |
| **Day X of Y** | Days into sprint | (Today - Start) |
| **Hours Logged** | User's total worklogs | Sum of worklogs in sprint |
| **Available Hours** | Expected hours so far | Days elapsed × 6h |
| **% Utilized** | Progress percentage | (Logged / Available) × 100 |
| **Hours Left** | Remaining capacity | Available - Logged |

### 5.3 Task Statistics Cards

| Card | Status Mapping |
|------|----------------|
| **Tasks Picked** | All tasks assigned to user in sprint |
| **Done** | Done, Closed, Resolved |
| **In Progress** | In Progress, In Development |
| **UAT** | UAT, Testing, QA |
| **To Do** | To Do, Open, Backlog |

### 5.4 Sprint Tickets List

Each ticket shows:
| Element | Description |
|---------|-------------|
| **Ticket ID** | JIRA issue key (e.g., PAI-28696) |
| **Summary** | Brief ticket description |
| **Estimate** | Original time estimate (hours) |
| **Status** | Current status badge with color |

---

## 6. Charts & Visualizations

### 6.1 Status Distribution Chart

**Type:** Donut/Pie Chart

**Purpose:** Visual breakdown of issues by status

**Segments:**
- 🟢 Done (Green)
- 🔵 In Progress (Blue)
- 🟡 To Do (Yellow)
- 🟣 UAT (Purple)

---

### 6.2 Top Performers Chart

**Type:** Horizontal Bar Chart

**Purpose:** Quick comparison of hours logged across team

**Reading:** Longer bars = More hours logged

---

### 6.3 Daily Activity Trends Chart

**Type:** Multi-line Chart

| Line | Color | Metric | Source |
|------|-------|--------|--------|
| **Issues Created** | Cyan | New tickets created per day | `created` date field |
| **Issues Resolved** | Green | Tickets closed per day | `resolutiondate` field |
| **Active Members** | Purple | Unique users who logged work | Worklog `author` |

**How to Read:**

| Pattern | Interpretation |
|---------|----------------|
| High Created + Low Resolved | Backlog growing, team may be overloaded |
| High Resolved + Low Created | Backlog shrinking, good progress |
| Weekend Dips | Expected - no work on Sat/Sun |
| Flat Lines | Potential data issue or low activity period |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │    │             │
│    JIRA     │───▶│    n8n      │───▶│   GitHub    │───▶│  Dashboard  │
│   Cloud     │    │  Workflow   │    │    Gist     │    │  (Browser)  │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     API              Process            Storage           Frontend
   (Source)         (Transform)         (JSON DB)          (Display)
```

### 7.2 Data Refresh Schedule

| Trigger | Time/Action |
|---------|-------------|
| **Automatic** | Daily at 9:30 PM IST |
| **Manual** | Click Refresh button on dashboard |

### 7.3 Data Collected from JIRA

| Data Type | Fields Extracted |
|-----------|------------------|
| **Issues** | Key, Summary, Status, Assignee, Reporter, Created, Resolution Date, Estimate |
| **Worklogs** | Author, Time Spent, Date Started |
| **Sprints** | Name, Start Date, End Date, State |
| **Subtasks** | Same as Issues, linked to parent |

### 7.4 Dynamic Team Member Detection

Members are automatically identified from:

1. **Issue Assignee** - Person assigned to the ticket
2. **Issue Reporter** - Person who created the ticket
3. **Worklog Author** - Person who logged time (includes subtasks)

> This means if you log time on any ticket in a board, you'll appear in that board's dashboard automatically.

### 7.5 Storage Details

| Property | Value |
|----------|-------|
| **Platform** | GitHub Gist |
| **Format** | JSON |
| **Size Limit** | Unlimited (free) |
| **Access** | Public read, authenticated write |

---

## 8. Troubleshooting & FAQs

### 8.1 Common Questions

#### Q: Why is my bandwidth based on 6 hours/day instead of 8?

**A:** The 6-hour productive day accounts for:
- Daily standups (15-30 min)
- Team meetings
- Code reviews
- Breaks and lunch
- Context switching
- Ad-hoc discussions and Slack/email

6 hours represents realistic "hands-on-keyboard" time.

---

#### Q: What's the difference between "Highest Utilization" and "Most Available"?

**A:** They measure different things:

| Metric | Measures | Based On |
|--------|----------|----------|
| **Highest Utilization** | Time spent | Hours logged vs expected |
| **Most Available** | Work remaining | Tasks completed vs assigned |

A person might:
- Log many hours but complete few tasks (working on complex items)
- Complete many tasks with few hours (quick wins)

---

#### Q: Why don't I see my logged hours?

**A:** Check these:
1. ✅ Worklogs are within the selected time period
2. ✅ Worklogs are on tickets in the selected board
3. ✅ Dashboard has been refreshed after logging
4. ✅ Correct board is selected

---

#### Q: How are subtask worklogs counted?

**A:** Subtask worklogs are:
- ✅ Attributed to the person who logged them (not parent assignee)
- ✅ Counted if worklog date falls within the sprint/period
- ✅ Rolled up to the parent board's metrics
- ✅ Appear under the logger's name in dashboard

---

#### Q: Why do different periods show the same numbers?

**A:** This could happen if:
- All issues were created within the shortest period (7 days)
- Data hasn't been refreshed recently
- JQL query scope is limited

---

#### Q: The dashboard shows wrong data after switching boards

**A:** Try:
1. Click the Refresh button
2. Re-select the board
3. Clear browser cache if issue persists

---

### 8.2 Data Accuracy

| Scenario | Dashboard Behavior |
|----------|-------------------|
| **No worklogs** | Member shows 0% utilization |
| **No assigned tasks** | Member won't appear in task-based metrics |
| **Only subtask work** | Still counted if worklogs exist |
| **Unestimated tickets** | Counts toward task totals, not hour estimates |

---

## 📌 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                      FORMULA CHEAT SHEET                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Utilization %     = (Hours Logged ÷ Expected Hours) × 100     │
│                                                                 │
│  Expected Hours    = Days in Period × 6 hrs/day                │
│                                                                 │
│  Task Completion % = (Done Tasks ÷ Total Tasks) × 100          │
│                                                                 │
│  Available %       = 100% - Task Completion %                  │
│                                                                 │
│  Weekly Capacity   = 5 days × 6 hrs = 30 hrs                   │
│                                                                 │
│  Sprint Progress   = (Today - Start) ÷ Total Days              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      STATUS INDICATORS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟢 On Track     →  60% - 100% utilization                     │
│  🟡 Under-utilized →  < 60% utilization                        │
│  🔴 Overloaded   →  > 100% utilization                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.0 | Jan 2026 | Multi-board support, 6hr bandwidth, GitHub Gist storage, Daily activity trends |
| v1.0 | Dec 2025 | Initial release with basic metrics |

---

## 📧 Support

For issues or feature requests, contact the dashboard maintainers or raise a ticket in JIRA.

---

*Document Last Updated: January 2026*

