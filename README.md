# YouTube Lite Guard

YouTube Lite Guard is a small Chrome extension that reduces YouTube page weight by removing optional, often-heavy UI sections.

It was built for people who want to keep a YouTube video or livestream open while gaming, working, or multitasking, without keeping the full comments/chat/recommendation surface alive.

## Features

- Hide live chat
- Hide comments
- Hide side recommendations
- Hide playlist panels
- Hide end screen cards
- Hide Shorts sections
- Hide the home feed
- Hide the mini player
- Hide the notification button
- Hide merch and shopping shelves
- Compact the watch page layout
- Optional aggressive cleanup that repeatedly removes sections YouTube re-inserts
- Show a YouTube page JS heap estimate in the toolbar popup
- Switch the toolbar UI between English and Traditional Chinese

All options are available from the Chrome toolbar popup.

## What It Does Not Do

This extension does not impose a hard memory limit on YouTube or Chrome. Browser extensions cannot reliably cap a tab's RAM usage.

Instead, it reduces the amount of YouTube UI that is allowed to stay mounted in the page. This can help with pages that grow over time due to live chat, recommendation panels, comments, or other dynamic sections.

The memory number shown in the popup is a page JavaScript heap estimate from Chrome's `performance.memory` API. It is useful for spotting page growth, but it is not the same as total tab memory shown in Chrome or Windows Task Manager.

## Install Locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `youtube-lite-guard` folder.
5. Pin the extension from Chrome's toolbar menu if you want quick access.
6. Refresh existing YouTube tabs.

## Recommended Settings

For the lightest YouTube watch page, enable:

- Enable lite mode
- Aggressive cleanup
- Hide live chat
- Hide comments
- Hide side recommendations
- Hide Shorts sections
- Hide merch and shopping

If you still want normal browsing on YouTube's home page, leave **Hide home feed** disabled.

## Privacy

YouTube Lite Guard does not collect, store, or transmit browsing data.

The extension only uses Chrome storage to save your local toggle settings.

## Project Note

This project was vibe-coded with help from OpenAI Codex after diagnosing a real-world YouTube resource usage problem during gaming and multitasking.

The code is intentionally small and readable so users can inspect what the extension does before installing it. It should be treated as a practical utility, not an official YouTube fix.

## Development

The extension is intentionally simple:

- `manifest.json` declares the Chrome extension.
- `content.js` removes selected YouTube sections.
- `content.css` hides selected sections early while the page is loading.
- `popup.html`, `popup.css`, and `popup.js` provide the toolbar controls.

After editing files, open `chrome://extensions` and click reload on the extension.

## License

This project uses the MIT License.

In plain English, that means you can use, copy, modify, publish, distribute, or fork this project, including for your own version, as long as the license notice stays included.

The software is provided as-is, without warranty.
