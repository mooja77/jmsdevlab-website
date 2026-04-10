# 42 -- Shopify App Submission Runbook

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [App Build Playbook](../standards/70-app-build-playbook.md) | [GDPR Compliance](../standards/73-gdpr-compliance.md) | [Coding Standards](../standards/71-coding-standards.md)

---

## Overview

This runbook covers the end-to-end process of submitting a Shopify app for review, managing the review process, and handling rejections. It incorporates lessons learned from multiple submissions across the JMS Dev Lab portfolio (7 Shopify apps submitted as of March 2026).

---

## 1. Pre-Submission Checklist

Complete every item before clicking "Submit for review" in the Shopify Partners dashboard.

### App Functionality

- [ ] App installs successfully on a development store.
- [ ] All core features work as described in the app listing.
- [ ] Settings save and persist across page navigation and browser refresh.
- [ ] Billing flow works: plan selection, subscription creation, 14-day trial activation.
- [ ] App uninstalls cleanly (no errors, handles `app/uninstalled` webhook).
- [ ] No console errors in browser dev tools during normal usage.
- [ ] No JavaScript errors or uncaught exceptions.

### GDPR Compliance

- [ ] `customers/data_request` webhook implemented and tested.
- [ ] `customers/redact` webhook implemented and tested.
- [ ] `shop/redact` webhook implemented and tested.
- [ ] All 3 webhooks return HTTP 200 within 5 seconds.
- [ ] Webhooks actually process data (not just return 200 with no action).

### UI and UX

- [ ] App works on mobile viewport (375px).
- [ ] App works on tablet viewport (768px).
- [ ] App works on desktop viewport (1024px+).
- [ ] All screens have loading states (skeleton or spinner).
- [ ] All screens have empty states with helpful messaging.
- [ ] All screens have error states with retry option.
- [ ] Guided tour / onboarding works on first install.
- [ ] "Made by JMS Dev Lab" footer present.

### Geographic Requirements

- [ ] If the app is geography-specific (e.g., TaxMatch for US/IRS), this is clearly documented.
- [ ] App listing mentions geographic limitations.
- [ ] App does not assume geography without documentation (e.g., currency, tax rules, address formats).
- [ ] If using Eircode fields or similar locale-specific features, document them.

### Security

- [ ] No hardcoded API keys or secrets in client-side code.
- [ ] HTTPS enforced on all endpoints.
- [ ] Rate limiting active on API endpoints.
- [ ] Input validation on all user-submitted data.
- [ ] Session tokens verified on every authenticated request.

### Performance

- [ ] App loads within 3 seconds on first visit.
- [ ] No memory leaks during extended usage.
- [ ] API responses return within 2 seconds under normal conditions.
- [ ] Webhook endpoints respond within 5 seconds.

---

## 2. Required Assets

### App Icon

- **Size:** 1200x1200px PNG.
- **Format:** PNG with transparent background preferred.
- **Content:** App-specific branding (not JMS Dev Lab logo).
- **Quality:** Professional, clean, recognisable at small sizes (96x96 in app store listing).

### Screenshots

| Type | Requirements |
|------|-------------|
| Desktop | At least 3 screenshots showing key features |
| Mobile | At least 1 mobile screenshot (optional but recommended) |
| Format | PNG or JPG, minimum 1600x900px |
| Annotations | Callout text highlighting key features (recommended) |
| Content | Use realistic demo data, not lorem ipsum |

### Screencast Video

- **Length:** 2-3 minutes maximum.
- **Content:** Walk through the installation, core features, and settings.
- **Format:** MP4, hosted on YouTube (unlisted is fine).
- **Narration:** Optional but helpful. If no narration, use text annotations.
- **Quality:** 1080p minimum.

### Promotional Video (Optional but Recommended)

- Separate from the screencast.
- Focus on benefits, not features.
- 60-90 seconds.
- Can be animated or screen recording with polish.
- Host on YouTube with public visibility.

---

## 3. App Listing Content

### App Name

- Clear, descriptive name.
- Include primary function in the name if possible.
- Do not include "Shopify" in the name.

### Tagline

- One sentence, under 100 characters.
- Focus on the benefit, not the feature.
- Example: "Protect your margins by blocking unprofitable orders at checkout."

### Detailed Description

Structure:
1. **Opening hook** -- What problem does this solve? (1-2 sentences)
2. **Key benefits** -- 3-5 bullet points with concrete outcomes.
3. **How it works** -- Brief explanation of the workflow (3-4 sentences).
4. **Feature list** -- Detailed features organised by plan tier.
5. **Support** -- How to get help (john@jmsdevlab.com).

### Pricing Plans

All apps must use the following structure (specific prices vary by app):

| Element | Requirement |
|---------|------------|
| Trial | 14-day free trial on all plans |
| Free tier | None -- JMS Dev Lab policy prohibits free tiers |
| Plans | 3-4 tiers (Starter, Professional, Enterprise typical) |
| Currency | USD (Shopify standard) |
| Billing | Monthly recurring via Shopify Billing API |

### Privacy Policy URL

- Must be publicly accessible (no authentication required).
- Hosted on the app's marketing website.
- URL format: `https://appname.com/privacy`
- Include this URL in the app listing.

---

## 4. Testing Instructions Template

Shopify reviewers need clear instructions to test your app. Provide these in the "Testing instructions" field.

### Template

```
## Test Environment
- Development store: [store-name].myshopify.com
- Login: [provided via Shopify Partners collaboration]
- Test data: Pre-loaded with demo data

## Installation
1. Install the app from the provided link.
2. Approve the requested permissions.
3. You will be redirected to the app dashboard.

## Testing Core Features

### [Feature 1 Name]
1. Navigate to [location in the app].
2. Click [specific button/action].
3. Expected result: [what should happen].

### [Feature 2 Name]
1. Navigate to [location in the app].
2. [Step-by-step instructions].
3. Expected result: [what should happen].

### Settings
1. Go to Settings page.
2. Change [specific setting].
3. Navigate away and return to Settings.
4. Verify the setting was saved.

### Billing
1. From the dashboard, click "Upgrade Plan" or navigate to pricing.
2. Select a plan.
3. Confirm the subscription.
4. Verify plan features are unlocked.

## Geographic Requirements
[If applicable: "This app is designed for [specific geography/market].
It uses [specific locale features]. See app listing for details."]
[If not applicable: "This app has no geographic restrictions."]

## Known Limitations
- [List any known issues or limitations]

## Support
For any questions during review, contact john@jmsdevlab.com.
```

---

## 5. Common Review Failures

These are the most common reasons Shopify rejects apps, based on JMS Dev Lab's submission experience.

### 4.3.8 -- Geographic Requirements

**What it means:** Your app has geography-specific features (currency, tax rules, address formats) that are not documented in the app listing.

**How to fix:**
- Document geographic limitations clearly in the app listing description.
- Add a note in the testing instructions.
- If the app uses locale-specific fields (e.g., Eircode for Ireland), either:
  - Make them configurable (best).
  - Document them as intentional limitations.

**Apps at risk:** TaxMatch (US/IRS-specific), Jewel Value (has Eircode fields).

### 2.1.2 -- UI Bugs

**What it means:** The reviewer found broken UI elements, JavaScript errors, or non-functional features.

**How to fix:**
- Test every screen on mobile, tablet, and desktop.
- Open browser dev tools and check for console errors.
- Test with slow network (Chrome DevTools throttling).
- Test with empty data, large datasets, and edge cases.

**Common culprits:** Loading states missing, error states not handled, responsive breakpoints broken.

### GDPR Webhooks Non-Functional

**What it means:** The mandatory GDPR webhooks are registered but do not actually process data.

**How to fix:**
- Test each webhook with realistic payloads.
- Verify data is actually deleted/exported (not just HTTP 200 returned).
- Check server logs for webhook processing.
- See [GDPR Compliance](../standards/73-gdpr-compliance.md).

### Settings Not Persisting

**What it means:** App settings revert to defaults when the user navigates away or refreshes.

**How to fix:**
- Save settings to the database on change (not just in local state).
- Load settings from the database on page mount.
- Test: Change a setting, navigate away, come back -- setting should be saved.
- Test: Change a setting, refresh the browser -- setting should be saved.

### Missing or Broken Billing

**What it means:** The billing flow does not work, or there is a way to use paid features without subscribing.

**How to fix:**
- Verify subscription creation via Shopify Billing API.
- Ensure plan-gated features check the active subscription.
- Test the upgrade/downgrade flow.
- Ensure the 14-day trial activates correctly.

---

## 6. Review Timeline

| Stage | Typical Duration |
|-------|-----------------|
| Submit to first response | 5-10 business days |
| Response window (after feedback) | **14 calendar days** |
| Resubmission to next response | 3-7 business days |
| Total (if issues found) | 2-6 weeks |

### Critical: 14-Day Response Window

After Shopify provides review feedback, you have **14 calendar days** to respond. If you do not respond within this window:

- The review is closed.
- You must resubmit from scratch.
- You lose your place in the review queue.

**Set a calendar reminder** when you receive review feedback. Respond as quickly as possible.

---

## 7. Case Study: StaffHub Review (Ref 102157)

StaffHub received the most detailed review feedback of any JMS Dev Lab app. This case study documents the issues and lessons learned.

### Issues Flagged

**Issue 1: Geographic Requirements (4.3.8)**
- The app had region-specific features not documented in the listing.
- **Fix:** Added geographic requirements documentation to the app listing.

**Issue 2: Valuation Error**
- A JavaScript error occurred during a specific user action.
- **Fix:** Debug and fix the error, add error boundary to prevent crashes.

**Issue 3: Settings Not Saving**
- App settings did not persist across page navigation.
- **Fix:** Save settings to database on change, load on page mount, verify with end-to-end test.

**Issue 4: Staff Portal Not Visible**
- The staff-facing portal (staff-hub-admin.vercel.app) was not accessible to reviewers.
- **Fix:** Provide reviewer access credentials and clear navigation to the portal.

### Lessons Learned

1. **Test settings persistence** before every submission. This is the most common and most preventable failure.
2. **Document everything** that might be geography-specific. When in doubt, add a note.
3. **Provide clear access** to all app components (admin panels, external portals).
4. **Fix JavaScript errors** -- even non-critical ones. Reviewers check the console.

---

## 8. Submission Process (Step by Step)

1. Log in to Shopify Partners: https://partners.shopify.com
2. Navigate to Apps > [Your App] > Distribution.
3. Verify all required fields are filled:
   - App name and tagline.
   - Detailed description.
   - App icon (1200x1200).
   - At least 3 screenshots.
   - Privacy policy URL.
   - Pricing plans configured.
4. Upload the screencast video URL.
5. Enter testing instructions (use the template above).
6. Review the pre-submission checklist one final time.
7. Click "Submit for review."
8. Note the date -- set a reminder for 14 days from any review feedback.
9. Monitor email (john@jmsdevlab.com) for reviewer communication.

---

## 9. Post-Approval

After your app is approved and live on the Shopify App Store:

1. **Verify the listing** -- Check that all content displays correctly.
2. **Test installation** from the app store (not just the development store link).
3. **Monitor reviews** -- Respond to merchant reviews within 24 hours.
4. **Track installs** -- Monitor install/uninstall metrics in the Partners dashboard.
5. **Plan updates** -- Address any merchant feedback in the first update.
6. **Marketing** -- Update the app's marketing website with "Available on the Shopify App Store" badge.
