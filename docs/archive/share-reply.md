# ⚠️ DEPRECATED - MVP Share/Reply URL Flow

> **STATUS:** OUTDATED - This describes a URL-based sharing approach that was never implemented.  
> **REASON:** Current app uses Supabase database for session sharing, not URL parameters.  
> **SEE INSTEAD:** Current session sharing implementation in codebase.  
> **LAST UPDATED:** 2025-08-15

**Date:** 2025-08-15

This document outlines the client-only MVP implementation for sharing a session and replying with answers using URL parameters.

## Overview

The goal of this feature is to allow users to share a session with a partner and receive their answers without a backend. The entire state is encoded within the URL, making it a simple and portable solution for the MVP.

## Behavior with and without Database

This MVP implementation relies entirely on URL parameters for sharing and replying. This means:

-   **No Persistent Storage:** Session and answer data are *not* stored in a database. If a user closes their browser or clears their history, the session data is lost unless they have saved the URL.
-   **Client-Side Only:** All parsing and encoding of session/answer data happens directly in the user's browser. There is no server-side component involved in the sharing or reply process.
-   **URL Length Limitations:** Very large sessions or extensive answers might hit URL length limits imposed by browsers or web servers. This is a known limitation of this MVP approach.
-   **Future Database Integration:** When a database (like Supabase) is integrated, the `session` and `answers` parameters will likely be replaced by a single `sessionId` parameter, and the application will fetch/store data from the database. This MVP serves as a functional prototype for the UI/UX flow.

## URL Parameters

Two main URL parameters are used to manage the flow:

-   `session`: A base64-encoded JSON string representing the session data.
-   `answers`: A base64-encoded JSON string representing the partner's answers.

### `session` Parameter

When a user wants to share a session, the application will generate a URL with the `session` parameter. This parameter contains a JSON object with the following structure:

```json
{
  "day_vibe": { "name": "Cosmic Chill", "emoji": "🌌" },
  "tasks": [
    { "id": "task-1", "text": "First task" },
    { "id": "task-2", "text": "Second task" }
  ]
}
```

This JSON object is then base64-encoded and appended to the URL.

**Example URL with `session` parameter:**

```
https://your-app-url.com/?session=eyJkYXlfdmliZSI6eyJuYW1lIjoiQ29zbWljIENoaWxsIiwiZW1vamkiOiLwn6e4In0sInRhc2tzIjpbeyJpZCI6InRhc2stMSIsInRleHQiOiJGaXJzdCB0YXNrIn0seyJpZCI6InRhc2stMiIsInRleHQiOiJTZWNvbmQgdGFzayJ9XX0=
```

### `answers` Parameter

When a partner receives a shared session link, they can provide their answers. Once they are done, the application will generate a new URL with the `answers` parameter. This parameter contains a JSON object with the following structure:

```json
{
  "task-1": "Answer to the first task",
  "task-2": "Answer to the second task"
}
```

This JSON object is then base64-encoded and appended to the URL.

**Example URL with `answers` parameter:**

```
https://your-app-url.com/?answers=eyJ0YXNrLTEiOiJBbnN3ZXIgdG8gdGhlIGZpcnN0IHRhc2siLCJ0YXNr-MiI6IkFuc3dlciB0byB0aGUgc2Vjb25kIHRhc2sifQ==
```

## User Experience (UX)

### Copy-to-Clipboard

The application provides a "Copy Link" button that allows the user to easily copy the generated share or reply URL to their clipboard.

### Toasts

To provide feedback to the user, the application will display toast notifications for the following actions:

-   When the user copies a link to the clipboard, a "Link copied!" toast will be displayed.
-   If the copy action fails, a "Failed to copy link" toast will be displayed.

## Try It

Here are some non-runnable example URLs that you can use to see how the `session` and `answers` parameters are used.

**Share URL:**

```
https://example.com/?session=eyJkYXlfdmliZSI6eyJuYW1lIjoiQ29zbWljIENoaWxsIiwiZW1vamkiOiLwn6e4In0sInRhc2tzIjpbeyJpZCI6InRhc2stMSIsInRleHQiOiJGaXJzdCB0YXNrIn0seyJpZCI6InRhc2stMiIsInRleHQiOiJTZWNvbmQgdGFzayJ9XX0=
```

**Reply URL:**

```
https://example.com/?answers=eyJ0YXNrLTEiOiJBbnN3ZXIgdG8gdGhlIGZpcnN0IHRhc2siLCJ0YXNr-MiI6IkFuc3dlciB0byB0aGUgc2Vjb25kIHRhc2sifQ==
```