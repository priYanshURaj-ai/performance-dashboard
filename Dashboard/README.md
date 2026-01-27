# 📊 Team Performance Dashboard

A real-time performance tracking dashboard for Platform 2.0 & RE Platform 2.0 teams, displaying individual task metrics across multiple time periods.

## 🌟 Features

- **Multi-Period Analysis**: Track performance over Last 7, 15, and 30 days
- **Individual Metrics**: Per-member task breakdown by status
- **Status Tracking**: To Do, In Progress, UAT, Done
- **Beautiful UI**: Modern dark theme with responsive design
- **Auto-Updates**: Daily data refresh at 9:30 PM IST
- **Interactive Charts**: Status distribution and top performers visualization
- **Search & Sort**: Filter and sort team members easily

## 📁 Project Structure

```
PreformanceDashboard/
├── config/
│   └── team-members.json      # Team member configuration
│
├── n8n/
│   └── performance-workflow.json  # n8n workflow for data generation
│
├── web/
│   ├── index.html             # Main dashboard page
│   ├── css/
│   │   └── styles.css         # Dashboard styling
│   ├── js/
│   │   └── dashboard.js       # Dashboard logic
│   └── data/
│       └── performance-data.json  # Generated performance data
│
├── SampleCode.json            # Original sprint trigger workflow
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. View Dashboard Locally

Open the dashboard in your browser:

```bash
cd PreformanceDashboard/web
# Option 1: Use Python's built-in server
python3 -m http.server 8080

# Option 2: Use Node.js http-server
npx http-server -p 8080

# Option 3: Use Live Server in VS Code
```

Then open: http://localhost:8080

### 2. Import n8n Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `n8n/performance-workflow.json`
4. Update JIRA credentials if needed
5. Enable and test the workflow

### 3. Deploy Dashboard

**Option A: GitHub Pages (Free)**
```bash
# Push to GitHub and enable Pages from settings
```

**Option B: Vercel (Free)**
```bash
cd web
npx vercel
```

**Option C: Any Static Host**
- Upload contents of `web/` folder to your hosting

## ⚙️ Configuration

### Team Members

Edit `config/team-members.json` to update team members:

```json
{
  "members": [
    {
      "name": "John Doe",
      "email": "john.doe@company.com",
      "jiraUsername": "john.doe",
      "avatar": "JD"
    }
  ]
}
```

### n8n Workflow Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DASHBOARD_WEBHOOK_URL` | URL to POST data | - |
| `DASHBOARD_API_KEY` | API key for auth | - |
| `DASHBOARD_URL` | Public dashboard URL | - |
| `FROM_EMAIL` | Sender email for summary | - |
| `TO_EMAIL` | Recipient email | - |

### JIRA Configuration

The workflow uses these JQL queries:
```
project = PAI 
AND component in ("RE Platform 2.0", "Platform 2.0") 
AND updated >= -7d/-15d/-30d
```

## 📊 Data Schema

### Performance Data Structure

```json
{
  "lastUpdated": "2025-12-12T21:30:00+05:30",
  "sprintInfo": {
    "name": "Sprint 45",
    "startDate": "2025-12-01",
    "endDate": "2025-12-14"
  },
  "teamSummary": {
    "7days": { "total": 45, "done": 28, "inProgress": 10, "uat": 4, "toDo": 3 }
  },
  "members": [
    {
      "name": "John Doe",
      "email": "john@company.com",
      "metrics": {
        "7days": { "total": 5, "done": 3, "inProgress": 1, "uat": 1, "toDo": 0 }
      }
    }
  ]
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `web/css/styles.css`:

```css
:root {
    --status-done: #00ff88;
    --status-progress: #00d4ff;
    --status-uat: #ffd93d;
    --status-todo: #ff9f43;
}
```

### Status Mapping

Update status mapping in the n8n workflow code:

```javascript
const statusMapping = {
  'To Do': 'toDo',
  'In Progress': 'inProgress',
  'UAT': 'uat',
  'Done': 'done'
};
```

## 🔄 Update Flow

```
Daily 9:30 PM IST
       ↓
n8n Workflow Triggers
       ↓
Fetch JIRA Data (7d, 15d, 30d)
       ↓
Process & Aggregate
       ↓
┌──────────────┬──────────────┬──────────────┐
│ Update JSON  │ Send Webhook │ Email Summary│
└──────────────┴──────────────┴──────────────┘
       ↓
Dashboard Auto-Refreshes
```

## 👥 Team Members (25)

| # | Name | Email |
|---|------|-------|
| 1 | Sreerag Unnikrishnan | sreerag.unnikrishnan@paytm.com |
| 2 | Dinesh Kumar | dinesh34.kumar@paytm.com |
| 3 | Huan Zheng | huan.zheng@paytm.com |
| 4 | Keshav Sharma | keshav4.sharma@paytm.com |
| 5 | Kshitiz Gupta | kshitiz1.gupta@paytm.com |
| 6 | Pankaj Sirohi | pankaj.sirohi@paytm.com |
| 7 | Rohit Mishra | rohit8.mishra@paytmpayments.com |
| 8 | Arijit Bhattacharyya | Arijit.bhattacharyya@paytm.com |
| 9 | Aditya Shahi | aditya.shahi@paytm.com |
| 10 | Amit Tomar | amit2.tomar@paytm.com |
| 11 | Arjit Gupta | arjit.gupta@paytm.com |
| 12 | Britelyne Dass | britelyne.dass@paytm.com |
| 13 | Eshita Gupta | eshita1.gupta@paytm.com |
| 14 | Girish Kumar | girish3.kumar@paytm.com |
| 15 | Pappu Kumar | pappu1.kumar@paytm.com |
| 16 | Sanyam Jain | sanyam1.jain@paytm.com |
| 17 | Deepak Rawat | deepak5.rawat@paytm.com |
| 18 | Prakarsh Srivastava | prakarsh.srivastava@paytm.com |
| 19 | Abhishek Keshari | abhishek.keshari@paytm.com |
| 20 | Anand Yadav | anand3.yadav@paytm.com |
| 21 | Anshul Chauhan | anshul1.chauhan@paytm.com |
| 22 | Apurva Ninave | apurva.ninave@paytm.com |
| 23 | Babaji Komali | babaji.komali@paytm.com |
| 24 | Deepika Suyal | deepika.suyal@paytm.com |
| 25 | Tushar Aggarwal | tushar1.aggarwal@paytm.com |

## 📝 License

Internal Use - Paytm Platform 2.0 Team

---

Built with ❤️ for Platform 2.0 & RE Platform 2.0 Teams

