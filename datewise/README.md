# DateWise Remote Manifest & Dynamic Config Guide (`version.json`)

Hosted at: `https://wiselyrise.in/datewise/version.json`

This file is automatically fetched by DateWise during background update checks and startup sync to manage:
1. **In-App Version Updates** (soft vs. forced updates, changelog display).
2. **Dynamic Rating Prompts** (kill switch, percentage sampling, campaign resets, engagement gates).
3. **Feature Request Bulb** (ideation campaigns, sampling, visibility).

---

## 1. Complete Schema & Field Reference

```json
{
  "latest_build": 96,
  "latest_version": "2.7.36",
  "min_build": 1,
  "changelog": "🐛 Bug fixes\n⚡ Enhanced Smart Add features.\n🔔 Cleaner notification cards & voice announcements.",
  "store_url": "https://play.google.com/store/apps/details?id=com.datewise.app",
  "rating_prompt": {
    "enabled": true,
    "campaign_id": "v2.7.36_launch",
    "sample_rate_percent": 100,
    "min_build": 96,
    "min_days_installed": 3,
    "min_reminders_count": 2
  },
  "feature_bulb": {
    "enabled": true,
    "campaign_id": "v2.7.36_feedback",
    "sample_rate_percent": 100,
    "min_build": 96
  }
}
```

### App Update Fields

| Field | Type | Description |
|---|---|---|
| `latest_build` | `int` | Highest published production build number on Google Play (e.g. `96`). Triggers update dialog if client build < `latest_build`. |
| `latest_version` | `string` | Human-readable version string (e.g. `"2.7.36"`). Displayed in update dialog. |
| `min_build` | `int` | Minimum required build before update is mandatory/forced. If client build < `min_build`, the update sheet is non-dismissible. |
| `changelog` | `string` | Release notes displayed in update dialog. Supports newlines (`\n`) and emojis. |
| `store_url` | `string` | Target Google Play Store URL. Defaults to `https://play.google.com/store/apps/details?id=com.datewise.app`. |

### Rating Prompt Fields (`rating_prompt`)

| Field | Type | Description |
|---|---|---|
| `enabled` | `bool` | Global kill switch for exit & milestone rating sheets. Set `false` to disable all rating prompts globally. |
| `campaign_id` | `string` | Unique identifier for a rating campaign. Changing this resets the 2-prompt limit for unrated users without re-prompting users who already rated or declined. |
| `sample_rate_percent` | `int (0..100)` | Percentage of random users who will see the rating prompt based on deterministic device hashing (`0..99` bucket). No tracking needed! |
| `min_build` | `int` | Minimum app build required before showing the prompt. Older client builds will ignore the prompt. |
| `min_days_installed` | `int` | Requires user to have had the app installed for at least $N$ days before being eligible. |
| `min_reminders_count` | `int` | Requires user to have created at least $N$ reminders before being eligible. |

### Feature Request Bulb Fields (`feature_bulb`)

| Field | Type | Description |
|---|---|---|
| `enabled` | `bool` | Kill switch for the feature request bulb on Home screen. Set `false` to hide it globally. |
| `campaign_id` | `string` | Unique identifier for a feature suggestion campaign. Changing this allows the bulb to reappear for users who previously dismissed it. |
| `sample_rate_percent` | `int (0..100)` | Percentage of random users who will see the feature bulb based on deterministic device hashing. |
| `min_build` | `int` | Minimum app build required before showing the feature request bulb. |

---

## 2. Sample Configurations (Copy & Paste Recipes)

### Recipe A: Conservative Gradual Rollout (Recommended for new releases)
*Prompts only 25% of devices after 5 days of usage and 3 reminders created.*
```json
{
  "rating_prompt": {
    "enabled": true,
    "campaign_id": "v2.7.36_conservative",
    "sample_rate_percent": 25,
    "min_build": 96,
    "min_days_installed": 5,
    "min_reminders_count": 3
  },
  "feature_bulb": {
    "enabled": true,
    "campaign_id": "v2.7.36_conservative",
    "sample_rate_percent": 25,
    "min_build": 96
  }
}
```

### Recipe B: Aggressive Campaign Reset (New Marketing / Review Drive)
*Bumps `campaign_id` to re-engage all unrated users who previously dismissed older prompts.*
```json
{
  "rating_prompt": {
    "enabled": true,
    "campaign_id": "spring_2026_drive",
    "sample_rate_percent": 100,
    "min_build": 96,
    "min_days_installed": 1,
    "min_reminders_count": 1
  },
  "feature_bulb": {
    "enabled": true,
    "campaign_id": "spring_2026_drive",
    "sample_rate_percent": 100,
    "min_build": 96
  }
}
```

### Recipe C: Emergency Kill Switch (Quiet Mode / Investigating Production Issues)
*Instantly silences all rating dialogs and bulb icons globally across all devices without needing an app release.*
```json
{
  "rating_prompt": {
    "enabled": false,
    "campaign_id": "emergency_silenced",
    "sample_rate_percent": 0,
    "min_build": 0,
    "min_days_installed": 0,
    "min_reminders_count": 0
  },
  "feature_bulb": {
    "enabled": false,
    "campaign_id": "emergency_silenced",
    "sample_rate_percent": 0,
    "min_build": 0
  }
}
```

### Recipe D: Power Users Only (Maximizing 5-Star Play Store Ratings)
*Targets deeply satisfied long-term users (installed >= 7 days, created >= 5 reminders).*
```json
{
  "rating_prompt": {
    "enabled": true,
    "campaign_id": "v2.7.36_power_users",
    "sample_rate_percent": 100,
    "min_build": 96,
    "min_days_installed": 7,
    "min_reminders_count": 5
  },
  "feature_bulb": {
    "enabled": true,
    "campaign_id": "v2.7.36_power_users",
    "sample_rate_percent": 100,
    "min_build": 96
  }
}
```

### Recipe E: Community Ideation & Feedback Focus
*Mutes rating prompt while actively displaying feature suggestion bulb to gather user feature requests.*
```json
{
  "rating_prompt": {
    "enabled": false,
    "campaign_id": "rating_paused",
    "sample_rate_percent": 0,
    "min_build": 96,
    "min_days_installed": 0,
    "min_reminders_count": 0
  },
  "feature_bulb": {
    "enabled": true,
    "campaign_id": "community_ideas_2026",
    "sample_rate_percent": 100,
    "min_build": 96
  }
}
```

---

## 3. Important Implementation Notes

- **Offline & Fallback Safety**: If `version.json` is unreachable or lacks the `rating_prompt` / `feature_bulb` blocks, the app automatically falls back to local code heuristics.
- **Privacy First**: User percentage sampling is calculated locally using `(appFirstInstallMs % 100)`. No device identifiers or analytics are sent to any server.
- **Permanent Protection**: Users who already rated (`prefHasRatedDateWise`) or tapped "Don't show again" (`prefRatePromptUserDeclined`) are permanently protected and will NEVER be prompted, even across new campaigns.
