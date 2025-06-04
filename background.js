// Background script for tab backup functionality

let BACKUP_INTERVAL = 300 // Default: 5 minutes (in seconds)
const ALARM_NAME = "tabBackup"
const STORAGE_KEY = "tabBackups"
const SETTINGS_KEY = "tabBackupSettings"
const MAX_BACKUPS = 10 // Keep last 10 backups
const ERROR_LOG_KEY = "errorLogs"
const MAX_ERROR_LOGS = 20

// Initialize the extension
if (typeof browser === "undefined") {
  var browser = chrome
}

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tab Backup Extension installed")

  // Load settings first
  await loadSettings()

  // Create periodic alarm for auto-backup
  await createBackupAlarm()

  // Perform initial backup
  await performBackup()
})

// Load settings from storage
async function loadSettings() {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY)
    const settings = result[SETTINGS_KEY] || {}

    // Set backup interval from settings or use default
    BACKUP_INTERVAL = settings.backupInterval || 300 // Default 5 minutes

    console.log("Loaded settings:", settings)
  } catch (error) {
    console.error("Error loading settings:", error)
    await logError("load_settings_failed", error.message)
  }
}

// Create or update backup alarm
async function createBackupAlarm() {
  try {
    // Clear existing alarm
    await browser.alarms.clear(ALARM_NAME)

    // Only create alarm if auto-backup is enabled (interval > 0)
    if (BACKUP_INTERVAL > 0) {
      await browser.alarms.create(ALARM_NAME, {
        delayInMinutes: BACKUP_INTERVAL / 60,
        periodInMinutes: BACKUP_INTERVAL / 60,
      })
      console.log(`Backup alarm created for ${BACKUP_INTERVAL / 60} minutes`)
    } else {
      console.log("Auto-backup disabled")
    }
  } catch (error) {
    console.error("Error creating backup alarm:", error)
    await logError("create_alarm_failed", error.message)
  }
}

// Handle alarm for periodic backup
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Only backup if tabs have changed since last backup
    if (await hasTabsChanged()) {
      await performBackup()
    } else {
      console.log("Skipping backup - no changes detected")
    }
  }
})

// Check if tabs have changed since last backup
async function hasTabsChanged() {
  try {
    const windows = await browser.windows.getAll({ populate: true })
    const currentTabs = windows.map((window) => ({
      windowId: window.id,
      tabs: window.tabs.map((tab) => tab.url),
    }))

    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0) return true

    const lastBackup = backups[0]
    const lastBackupTabs = lastBackup.windows.map((window) => ({
      windowId: window.windowId,
      tabs: window.tabs.map((tab) => tab.url),
    }))

    return JSON.stringify(currentTabs) !== JSON.stringify(lastBackupTabs)
  } catch (error) {
    console.error("Error checking tab changes:", error)
    await logError("check_tabs_changed_failed", error.message)
    return true // Default to performing backup on error
  }
}

// Perform backup of all tabs
async function performBackup() {
  try {
    // Get all windows and their tabs
    const windows = await browser.windows.getAll({ populate: true })

    const backup = {
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      windows: [],
    }

    for (const window of windows) {
      const windowData = {
        windowId: window.id,
        focused: window.focused,
        tabs: [],
      }

      for (const tab of window.tabs) {
        // Skip extension pages and special URLs
        if (
          !tab.url.startsWith("moz-extension://") &&
          !tab.url.startsWith("about:") &&
          tab.url !== "chrome://newtab/" &&
          !tab.url.startsWith("chrome-extension://")
        ) {
          windowData.tabs.push({
            url: tab.url,
            title: tab.title,
            active: tab.active,
            pinned: tab.pinned,
            index: tab.index,
          })
        }
      }

      if (windowData.tabs.length > 0) {
        backup.windows.push(windowData)
      }
    }

    // Only save if we have tabs to backup
    if (backup.windows.length > 0) {
      await saveBackup(backup)
      console.log("Backup completed:", backup.date)
    }

    return { success: true, message: "Backup completed successfully" }
  } catch (error) {
    console.error("Error during backup:", error)
    await logError("backup_failed", error.message)
    throw new Error(`Backup failed: ${error.message}`)
  }
}

// Save backup to storage
async function saveBackup(backup) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    let backups = result[STORAGE_KEY] || []

    // Add new backup to the beginning
    backups.unshift(backup)

    // Keep only the most recent backups
    if (backups.length > MAX_BACKUPS) {
      backups = backups.slice(0, MAX_BACKUPS)
    }

    await browser.storage.local.set({ [STORAGE_KEY]: backups })
  } catch (error) {
    console.error("Error saving backup:", error)
    await logError("save_backup_failed", error.message)
    throw error
  }
}

// Restore tabs from backup
async function restoreBackup(backupIndex = 0) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0 || !backups[backupIndex]) {
      throw new Error("No backup found")
    }

    const backup = backups[backupIndex]

    for (const windowData of backup.windows) {
      // Create new window for each backed up window
      const windowCreateData = {
        focused: windowData.focused,
      }

      // Create window with first tab
      if (windowData.tabs.length > 0) {
        windowCreateData.url = windowData.tabs[0].url
        const newWindow = await browser.windows.create(windowCreateData)

        // Add remaining tabs to the window
        for (let i = 1; i < windowData.tabs.length; i++) {
          const tab = windowData.tabs[i]
          await browser.tabs.create({
            windowId: newWindow.id,
            url: tab.url,
            pinned: tab.pinned,
            active: false,
          })
        }

        // Set the originally active tab as active
        const activeTab = windowData.tabs.find((tab) => tab.active)
        if (activeTab) {
          const tabs = await browser.tabs.query({ windowId: newWindow.id })
          const targetTab = tabs.find((tab) => tab.url === activeTab.url)
          if (targetTab) {
            await browser.tabs.update(targetTab.id, { active: true })
          }
        }
      }
    }

    return { success: true, message: "Backup restored successfully" }
  } catch (error) {
    console.error("Error restoring backup:", error)
    await logError("restore_backup_failed", error.message)
    throw error
  }
}

// Export backups to JSON file
async function exportBackups() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      backups: backups,
    }

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
      filename: `tab-backup-export-${new Date().toISOString().slice(0, 10)}.json`,
    }
  } catch (error) {
    console.error("Error exporting backups:", error)
    await logError("export_backups_failed", error.message)
    throw error
  }
}

// Import backups from JSON file
async function importBackups(jsonData) {
  try {
    const importData = JSON.parse(jsonData)

    // Validate import data
    if (!importData.version || !importData.backups || !Array.isArray(importData.backups)) {
      throw new Error("Invalid backup file format")
    }

    // Get existing backups
    const result = await browser.storage.local.get(STORAGE_KEY)
    const existingBackups = result[STORAGE_KEY] || []

    // Merge backups, avoiding duplicates by timestamp
    const existingTimestamps = new Set(existingBackups.map((b) => b.timestamp))
    const newBackups = importData.backups.filter((b) => !existingTimestamps.has(b.timestamp))

    // Combine and sort by timestamp (newest first)
    const combinedBackups = [...existingBackups, ...newBackups].sort((a, b) => b.timestamp - a.timestamp)

    // Keep only MAX_BACKUPS
    const trimmedBackups = combinedBackups.slice(0, MAX_BACKUPS)

    // Save to storage
    await browser.storage.local.set({ [STORAGE_KEY]: trimmedBackups })

    return {
      success: true,
      message: `Imported ${newBackups.length} backups successfully`,
      totalBackups: trimmedBackups.length,
    }
  } catch (error) {
    console.error("Error importing backups:", error)
    await logError("import_backups_failed", error.message)
    throw error
  }
}

// Get storage usage information
async function getStorageInfo() {
  try {
    const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2)

    // Get all storage data
    const allData = await browser.storage.local.get(null)
    const backupsData = allData[STORAGE_KEY] || []

    // Calculate sizes
    const totalSize = new Blob([JSON.stringify(allData)]).size
    const backupsSize = new Blob([JSON.stringify(backupsData)]).size

    // Get storage quota if available
    let quota = null
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      quota = estimate.quota
    }

    return {
      success: true,
      totalSizeBytes: totalSize,
      totalSizeMB: bytesToMB(totalSize),
      backupsSizeBytes: backupsSize,
      backupsSizeMB: bytesToMB(backupsSize),
      backupsCount: backupsData.length,
      quota: quota ? bytesToMB(quota) : null,
      percentUsed: quota ? ((totalSize / quota) * 100).toFixed(1) : null,
    }
  } catch (error) {
    console.error("Error getting storage info:", error)
    await logError("get_storage_info_failed", error.message)
    throw error
  }
}

// Log errors for debugging
async function logError(errorType, errorMessage) {
  try {
    const timestamp = Date.now()
    const result = await browser.storage.local.get(ERROR_LOG_KEY)
    let errorLogs = result[ERROR_LOG_KEY] || []

    // Add new error to the beginning
    errorLogs.unshift({
      type: errorType,
      message: errorMessage,
      timestamp,
      date: new Date(timestamp).toISOString(),
    })

    // Keep only recent errors
    if (errorLogs.length > MAX_ERROR_LOGS) {
      errorLogs = errorLogs.slice(0, MAX_ERROR_LOGS)
    }

    await browser.storage.local.set({ [ERROR_LOG_KEY]: errorLogs })
  } catch (error) {
    console.error("Error logging error:", error)
    // Can't do much if error logging itself fails
  }
}

// Delete a specific backup
async function deleteBackup(backupIndex) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backupIndex >= 0 && backupIndex < backups.length) {
      backups.splice(backupIndex, 1)
      await browser.storage.local.set({ [STORAGE_KEY]: backups })
      return { success: true, message: "Backup deleted successfully" }
    } else {
      throw new Error("Invalid backup index")
    }
  } catch (error) {
    console.error("Error deleting backup:", error)
    await logError("delete_backup_failed", error.message)
    throw error
  }
}

// Update settings
async function updateSettings(newSettings) {
  try {
    // Save settings to storage
    await browser.storage.local.set({ [SETTINGS_KEY]: newSettings })

    // Update backup interval
    BACKUP_INTERVAL = newSettings.backupInterval || 300

    // Recreate alarm with new interval
    await createBackupAlarm()

    console.log("Settings updated:", newSettings)
    return { success: true, message: "Settings updated successfully" }
  } catch (error) {
    console.error("Error updating settings:", error)
    await logError("update_settings_failed", error.message)
    throw error
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case "performBackup":
        return await performBackup()

      case "restoreBackup":
        return await restoreBackup(message.backupIndex || 0)

      case "getBackups":
        const result = await browser.storage.local.get(STORAGE_KEY)
        return { backups: result[STORAGE_KEY] || [] }

      case "deleteBackup":
        return await deleteBackup(message.backupIndex)

      case "getSettings":
        const settingsResult = await browser.storage.local.get(SETTINGS_KEY)
        return { settings: settingsResult[SETTINGS_KEY] || {} }

      case "updateSettings":
        return await updateSettings(message.settings)

      case "exportBackups":
        return await exportBackups()

      case "importBackups":
        return await importBackups(message.jsonData)

      case "getStorageInfo":
        return await getStorageInfo()

      case "getErrorLogs":
        const errorResult = await browser.storage.local.get(ERROR_LOG_KEY)
        return { logs: errorResult[ERROR_LOG_KEY] || [] }

      default:
        return { error: "Unknown action" }
    }
  } catch (error) {
    console.error("Error handling message:", error)
    return { error: error.message }
  }
})

// Listen for keyboard commands
browser.commands.onCommand.addListener(async (command) => {
  try {
    if (command === "backup-now") {
      await performBackup()
    } else if (command === "restore-latest") {
      const result = await browser.storage.local.get(STORAGE_KEY)
      const backups = result[STORAGE_KEY] || []

      if (backups.length > 0) {
        await restoreBackup(0)
      }
    }
  } catch (error) {
    console.error("Error handling command:", error)
    await logError("command_failed", `${command}: ${error.message}`)
  }
})
