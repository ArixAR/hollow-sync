# Hollow Sync

A cross-platform GUI application for **Hollow Knight** and **Hollow Knight: Silksong** that lets you transfer your progress between PC and Nintendo Switch.

> **Prefer command line?** Check out the [CLI version](https://gist.github.com/ArixAR/1e4c9672a8c95e398d369efe5ff54807) for terminal based usage.

## Important

This tool requires homebrew on your Switch. Always backup your saves before using. Use at your own risk.

## Requirements

- Windows 10 or newer
- [Hollow Knight](https://store.steampowered.com/app/367520/Hollow_Knight/) or [Silksong](https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/) installed on Windows
- [Homebrew-enabled Nintendo Switch](https://switch.hacks.guide/)
- [JKSV](https://github.com/J-D-K/JKSV) installed on your Switch

## Installation

### Option 1: Pre-built App (Recommended)
1. Download the latest release from the [Releases page](https://github.com/ArixAR/hollow-sync/releases)
2. Run the installer (.exe file)
3. Launch "Hollow Sync" from your Start menu

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/ArixAR/hollow-sync.git
cd hollow-sync

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Or build for production
npm run tauri build
```

## How to Use

**Step 1: Setup**
- Open the Hollow Sync app
- The app automatically scans for both Hollow Knight and Silksong saves
- Switch between games using the toggle at the top
- Select your save slot from the detected characters

**Step 2: Sync Saves**
- Click "Sync to Switch" to prepare your PC save for Switch
- Click "Sync to PC" to prepare your Switch save for PC
- The app shows save timestamps to help avoid conflicts

**Step 3: Transfer to Switch**
1. Insert your Switch SD card into your PC
2. Copy the generated `.zip` file to the appropriate JKSV folder:
   - Hollow Knight: `/JKSV/Hollow Knight/`
   - Silksong: `/JKSV/Hollow Knight  Silksong/`
3. Use JKSV on Switch to restore the backup

## Alternative: Automatic Cloud Sync

For a more automated approach, you can set up JKSV to sync directly with cloud storage instead of manually transferring files via SD card.

**Setup:** Configure automatic cloud backups using either:
- [Google Drive](https://switch.hacks.guide/homebrew/jksv.html?tab=google-drive#setting-up-remote-save-data-backups-google-drive-webdav)
- [WebDAV](https://switch.hacks.guide/homebrew/jksv.html?tab=webdav#setting-up-remote-save-data-backups-google-drive-webdav)

**Once cloud sync is configured:**
1. Point the app to your cloud folder path in settings
2. Use the sync buttons normally - the app will handle cloud files
3. Changes automatically sync across both platforms

**Benefits:** No more SD card removal, automatic backups, and seamless syncing once configured.

**Note:** You still need this app for format conversion since PC and Switch use different save file formats.

## Save Locations

**PC:**
- Hollow Knight: `C:\Users\[Username]\AppData\LocalLow\Team Cherry\Hollow Knight\`
- Silksong: `C:\Users\[Username]\AppData\LocalLow\Team Cherry\Hollow Knight Silksong\[UserID]`

**Switch (JKSV folders):**
- Hollow Knight: `/JKSV/Hollow Knight/`
- Silksong: `/JKSV/Hollow Knight  Silksong/`

## Troubleshooting

**Can't find saves?** Make sure you've played Hollow Knight or Silksong and saved at least once.

**App won't start?** Check that you're running Windows 10 or newer.

**Sync not working?** Verify the output folder exists and you have write permissions.

**Switch issues?** Check that JKSV is installed and you're using the exact SD card path.

## Advanced: Switch 1 → Switch 2 Save Migration

If you want to move your Hollow Knight or Silksong saves directly from Switch 1 to Switch 2, this requires additional steps beyond the normal PC ↔ Switch sync.

**Warning: This process is advanced and carries risk. Only attempt if you fully understand the implications.**

See the full guide here: [Switch Save Transfer Guide](https://gist.github.com/ArixAR/3a537f9a25f9f608e59f6721696ece48)