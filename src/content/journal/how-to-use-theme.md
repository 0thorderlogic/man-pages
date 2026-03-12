---
title: "How to Use This Minimal Astro Theme"
date: 2026-03-07
description: "A quick guide to customizing and managing your new personal website."
---

Welcome to your new minimal personal website! This template is designed to be extremely fast, entirely static (zero JS by default except for the calendar rendering), and stunning with a built-in Gruvbox color scheme.

## Customizing Your Information

To make this site your own, start by opening `consts.ts` at the root of the project. Here you can edit your name, last name, and the site's default title and description.

You'll also want to edit the `src/content/navbar.json` file if you want to add, remove, or rename any navigation links.

## Writing Journal Entries

This very post is a markdown file! Writing new posts is incredibly easy.

1. Navigate to the `src/content/journal/` folder.
2. Create a new `.md` file.
3. Add the required frontmatter at the top (like `title`, `date`, and `description`).
4. Write your content below the dashes.

Astro Collections will automatically pull the file in, render it dynamically, parse the date, and even generate a live RSS feed entry for it.

## The Google Calendar Integration

To get the `/calendar` page working:

1. Copy `.env.example` to `.env`.
2. Open `.env` and configure your keys.

**How to get a Google API Key:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for "Google Calendar API" and click **Enable**.
4. Go to **APIs & Services > Credentials** on the left sidebar.
5. Click **Create Credentials > API Key**.
6. Paste this key into `GOOGLE_API_KEY` in your `.env` file.

**How to get your Calendar ID:**

1. Go to [Google Calendar](https://calendar.google.com/) on your computer.
2. Under "My calendars" on the left, hover over the calendar you want to share, click the three vertical dots (Options), and click **Settings and sharing**.
3. Under the "Access permissions for events" section, ensure **Make available to public** is checked.
4. Scroll down to the "Integrate calendar" section. You will see your **Calendar ID** (it often looks like `your_email@gmail.com` or a long string ending in `@group.calendar.google.com`).
5. Paste this ID into `GOOGLE_CALENDAR_ID` in your `.env` file.

The calendar page will automatically fetch the current month's events and inject them into a responsive grid. Since it heavily relies on date math, it's the only page on the site that uses a `<script>` tag by default.

### Calendar Code Layout

If you want to customize the calendar behavior, the code is now split into focused modules:

- `src/pages/calendar.astro`: Main page orchestration and event loading.
- `src/lib/calendar/fetchEvents.ts`: Fetches and normalizes Google Calendar events.
- `src/lib/calendar/types.ts`: Shared event and response types.
- `src/lib/calendar/date.ts`: Date formatting and day-key helpers.
- `src/components/calendar/`: Header, grid, and modal Astro components.
- `src/scripts/calendar.ts`: Client-side month navigation, day rendering, and modal interactions.

Grid event chips are intentionally non-clickable. To open an event in Google Calendar, click the day cell first and use **View in Calendar** inside the modal.

## Adding to the Archive

The Archive page is designed for scientific papers, PDFs, or important links.

Simply place your PDFs into the `public/pdfs/` folder. Then, open `src/content/archive.json` and map out the file's information. The Archive page will automatically parse the dates, sort them, and group them under large Year headings.

## Styling

We use **Tailwind CSS v4**. All of the colors rely on the `@theme` block defined in `src/styles/global.css`.

Instead of typing exact hex codes everywhere, use the custom Gruvbox utility classes like `text-gruv-aqua`, `bg-gruv-bg0-s`, or `border-gruv-yellow`.

Enjoy building on the internet!
