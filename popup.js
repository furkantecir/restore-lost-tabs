// Popup script for tab backup extension

let currentBackups = []
let currentLanguage = "en"
let currentSettings = {}
let isOperationInProgress = false

// Initialize browser API
if (typeof browser === "undefined") {
  var browser = chrome
}

// Localization messages
const messages = {
  en: {
    extensionName: "Tab Backup",
    quickActions: "Quick Actions",
    backupNow: "Backup Now",
    restoreLatest: "Restore Latest Backup",
    backupHistory: "Backup History",
    loadingBackups: "Loading backups...",
    windows: "windows",
    window: "window",
    tabs: "tabs",
    tab: "tab",
    restore: "Restore",
    delete: "Delete",
    performingBackup: "Performing backup...",
    backupSuccess: "Backup completed successfully!",
    backupError: "Error occurred during backup",
    restoringBackup: "Restoring backup...",
    restoreSuccess: "Backup restored successfully!",
    restoreError: "Error occurred during restore",
    deleteSuccess: "Backup deleted successfully!",
    deleteError: "Error occurred while deleting backup",
    noBackupsFound: "No backups found",
    errorLoadingBackups: "Error loading backups",
    confirmRestore: "This will open new windows with the backed up tabs. Continue?",
    confirmDelete: "Are you sure you want to delete this backup?",
    autoBackup: "Auto Backup",
    disabled: "Disabled",
    oneMinute: "1 Minute",
    fiveMinutes: "5 Minutes",
    tenMinutes: "10 Minutes",
    thirtyMinutes: "30 Minutes",
    oneHour: "1 Hour",
    settingsUpdated: "Settings updated successfully!",
    autoBackupDisabled: "Automatic backup is disabled",
    nextBackupIn: "Next backup in",
    minutes: "minutes",
    minute: "minute",
    exportBackups: "Export",
    importBackups: "Import",
    exportSuccess: "Backups exported successfully!",
    exportError: "Error exporting backups",
    importSuccess: "Backups imported successfully!",
    importError: "Error importing backups",
    invalidBackupFile: "Invalid backup file format",
    storageUsage: "Storage usage:",
    backupsTab: "Backups",
    settingsTab: "Settings",
    displaySettings: "Display Settings",
    darkMode: "Dark Mode",
    dateFormat: "Date Format:",
    localeDefault: "Locale Default",
    keyboardShortcuts: "Keyboard Shortcuts",
    version: "Version 1.0.1",
    reportIssue: "Report Issue",
    backupHelp: "Creates a backup of all open tabs",
    restoreHelp: "Opens all tabs from the most recent backup",
    exportHelp: "Export all backups to a JSON file",
    importHelp: "Import backups from a JSON file",
    noChanges: "No changes since last backup",
    selectBackupFile: "Select backup file to import",
    importedBackups: "Imported {count} backups successfully",
    totalBackups: "Total backups: {count}",
    storageDetails: "{used} MB used of {total} MB ({percent}%)",
    colorTheme: "Color Theme:",
    themeBlue: "Blue (Default)",
    themeGreen: "Green",
    themeRed: "Red",
    themePurple: "Purple",
    themeUpdated: "Color theme updated successfully!",
  },
  tr: {
    extensionName: "Sekme Yedekleme",
    quickActions: "Hızlı İşlemler",
    backupNow: "Şimdi Yedekle",
    restoreLatest: "Son Yedeği Geri Yükle",
    backupHistory: "Yedek Geçmişi",
    loadingBackups: "Yedekler yükleniyor...",
    windows: "pencere",
    window: "pencere",
    tabs: "sekme",
    tab: "sekme",
    restore: "Geri Yükle",
    delete: "Sil",
    performingBackup: "Yedekleme yapılıyor...",
    backupSuccess: "Yedekleme başarıyla tamamlandı!",
    backupError: "Yedekleme sırasında hata oluştu",
    restoringBackup: "Yedek geri yükleniyor...",
    restoreSuccess: "Yedek başarıyla geri yüklendi!",
    restoreError: "Geri yükleme sırasında hata oluştu",
    deleteSuccess: "Yedek başarıyla silindi!",
    deleteError: "Yedek silinirken hata oluştu",
    noBackupsFound: "Yedek bulunamadı",
    errorLoadingBackups: "Yedekler yüklenirken hata oluştu",
    confirmRestore: "Bu işlem yedeklenen sekmelerle yeni pencereler açacak. Devam edilsin mi?",
    confirmDelete: "Bu yedeği silmek istediğinizden emin misiniz?",
    autoBackup: "Otomatik Yedekleme",
    disabled: "Devre Dışı",
    oneMinute: "1 Dakika",
    fiveMinutes: "5 Dakika",
    tenMinutes: "10 Dakika",
    thirtyMinutes: "30 Dakika",
    oneHour: "1 Saat",
    settingsUpdated: "Ayarlar başarıyla güncellendi!",
    autoBackupDisabled: "Otomatik yedekleme devre dışı",
    nextBackupIn: "Sonraki yedekleme",
    minutes: "dakika sonra",
    minute: "dakika sonra",
    exportBackups: "Dışa Aktar",
    importBackups: "İçe Aktar",
    exportSuccess: "Yedekler başarıyla dışa aktarıldı!",
    exportError: "Yedekleri dışa aktarırken hata oluştu",
    importSuccess: "Yedekler başarıyla içe aktarıldı!",
    importError: "Yedekleri içe aktarırken hata oluştu",
    invalidBackupFile: "Geçersiz yedek dosya formatı",
    storageUsage: "Depolama kullanımı:",
    backupsTab: "Yedekler",
    settingsTab: "Ayarlar",
    displaySettings: "Görüntü Ayarları",
    darkMode: "Karanlık Mod",
    dateFormat: "Tarih Formatı:",
    localeDefault: "Yerel Varsayılan",
    keyboardShortcuts: "Klavye Kısayolları",
    version: "Sürüm 1.0.1",
    reportIssue: "Sorun Bildir",
    backupHelp: "Tüm açık sekmelerin yedeğini oluşturur",
    restoreHelp: "En son yedekten tüm sekmeleri açar",
    exportHelp: "Tüm yedekleri JSON dosyasına aktarır",
    importHelp: "JSON dosyasından yedekleri içe aktarır",
    noChanges: "Son yedekten bu yana değişiklik yok",
    selectBackupFile: "İçe aktarılacak yedek dosyasını seçin",
    importedBackups: "{count} yedek başarıyla içe aktarıldı",
    totalBackups: "Toplam yedek: {count}",
    storageDetails: "{total} MB'nin {used} MB'si kullanıldı ({percent}%)",
    colorTheme: "Renk Teması:",
    themeBlue: "Mavi (Varsayılan)",
    themeGreen: "Yeşil",
    themeRed: "Kırmızı",
    themePurple: "Mor",
    themeUpdated: "Renk teması başarıyla güncellendi!",
  },
}

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  await loadLocalization()
  await loadBackups()
  await updateStorageInfo()
  setupEventListeners()
  updateAutoBackupStatus()
  setupKeyboardShortcuts()
})

// Load saved settings
async function loadSettings() {
  try {
    // Load language setting
    const result = await browser.storage.local.get("language")
    currentLanguage = result.language || "en"
    document.getElementById("languageSelect").value = currentLanguage

    // Load backup settings
    const settingsResponse = await browser.runtime.sendMessage({ action: "getSettings" })
    currentSettings = settingsResponse.settings || {}

    // Set interval selector
    const backupInterval = currentSettings.backupInterval || 300
    document.getElementById("intervalSelect").value = backupInterval

    // Set dark mode if enabled
    if (currentSettings.darkMode) {
      document.getElementById("darkModeToggle").checked = true
      document.body.classList.add("dark-mode")
    }

    // Set date format
    if (currentSettings.dateFormat) {
      document.getElementById("dateFormatSelect").value = currentSettings.dateFormat
    }

    // Set color theme
    if (currentSettings.colorTheme) {
      document.getElementById("colorThemeSelect").value = currentSettings.colorTheme
      applyColorTheme(currentSettings.colorTheme)
    } else {
      applyColorTheme("blue") // Default theme
    }
  } catch (error) {
    console.error("Error loading settings:", error)
    showStatus("Error loading settings: " + error.message, "error")
  }
}

// Setup event listeners
function setupEventListeners() {
  // Quick action buttons
  document.getElementById("backupNow").addEventListener("click", handleBackupNow)
  document.getElementById("restoreLatest").addEventListener("click", handleRestoreLatest)

  // Settings controls
  document.getElementById("languageSelect").addEventListener("change", handleLanguageChange)
  document.getElementById("intervalSelect").addEventListener("change", handleIntervalChange)
  document.getElementById("darkModeToggle").addEventListener("change", handleDarkModeChange)
  document.getElementById("dateFormatSelect").addEventListener("change", handleDateFormatChange)
  document.getElementById("colorThemeSelect").addEventListener("change", handleColorThemeChange)

  // Import/Export
  document.getElementById("exportBackups").addEventListener("click", handleExportBackups)
  document.getElementById("importBackups").addEventListener("click", () => {
    document.getElementById("importFile").click()
  })
  document.getElementById("importFile").addEventListener("change", handleImportBackups)

  // Tab navigation
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", handleTabClick)
  })

  // Event delegation for backup list actions
  document.getElementById("backupList").addEventListener("click", handleBackupListClick)
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    // Ctrl+B for backup
    if (event.ctrlKey && event.key === "b") {
      event.preventDefault()
      handleBackupNow()
    }

    // Ctrl+R for restore
    if (event.ctrlKey && event.key === "r") {
      event.preventDefault()
      handleRestoreLatest()
    }
  })
}

// Handle tab click
function handleTabClick(event) {
  const tabId = event.currentTarget.getAttribute("data-tab")

  // Update active tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  event.currentTarget.classList.add("active")

  // Show selected tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(tabId).classList.add("active")
}

// Handle language change
async function handleLanguageChange(event) {
  currentLanguage = event.target.value

  // Save language preference
  try {
    await browser.storage.local.set({ language: currentLanguage })
  } catch (error) {
    console.error("Error saving language:", error)
  }

  // Update UI
  loadLocalization()
  renderBackupList() // Re-render to update button text
  updateAutoBackupStatus()
}

// Handle backup interval change
async function handleIntervalChange(event) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  try {
    const newInterval = Number.parseInt(event.target.value)

    // Update settings
    currentSettings.backupInterval = newInterval

    // Send to background script
    const response = await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })

    if (response.success) {
      showStatus(getMessage("settingsUpdated"), "success")
      updateAutoBackupStatus()
    } else {
      showStatus(response.error || getMessage("backupError"), "error")
    }
  } catch (error) {
    console.error("Error updating interval:", error)
    showStatus(error.message || getMessage("backupError"), "error")
  } finally {
    isOperationInProgress = false
  }
}

// Handle dark mode toggle
async function handleDarkModeChange(event) {
  const darkMode = event.target.checked

  // Update body class
  if (darkMode) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }

  // Save setting
  try {
    currentSettings.darkMode = darkMode
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
  } catch (error) {
    console.error("Error saving dark mode setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle date format change
async function handleDateFormatChange(event) {
  const dateFormat = event.target.value

  // Save setting
  try {
    currentSettings.dateFormat = dateFormat
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })

    // Refresh backup list to show new date format
    await loadBackups()
  } catch (error) {
    console.error("Error saving date format setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle color theme change
async function handleColorThemeChange(event) {
  const colorTheme = event.target.value

  // Apply theme immediately
  applyColorTheme(colorTheme)

  // Save setting
  try {
    currentSettings.colorTheme = colorTheme
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("themeUpdated"), "success")
  } catch (error) {
    console.error("Error saving color theme setting:", error)
    showStatus(error.message, "error")
  }
}

// Apply color theme to the document
function applyColorTheme(theme) {
  // Remove existing theme classes
  document.body.classList.remove("theme-blue", "theme-green", "theme-red", "theme-purple")

  // Add new theme class
  document.body.classList.add(`theme-${theme}`)
}

// Update auto backup status display
function updateAutoBackupStatus() {
  const statusDiv = document.getElementById("autoBackupStatus")
  const interval = currentSettings.backupInterval || 300

  if (interval === 0) {
    statusDiv.textContent = getMessage("autoBackupDisabled")
  } else {
    const minutes = interval / 60
    const minuteText = minutes === 1 ? getMessage("minute") : getMessage("minutes")
    statusDiv.textContent = `${getMessage("nextBackupIn")} ${minutes} ${minuteText}`
  }
}

// Handle manual backup
async function handleBackupNow() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const backupButton = document.getElementById("backupNow")
  backupButton.classList.add("loading")
  backupButton.disabled = true

  try {
    showStatus(getMessage("performingBackup"), "loading")

    const response = await browser.runtime.sendMessage({ action: "performBackup" })

    if (response.success) {
      showStatus(getMessage("backupSuccess"), "success")
      await loadBackups() // Refresh the list
      await updateStorageInfo() // Update storage usage
    } else if (response.error === "no_changes") {
      showStatus(getMessage("noChanges"), "info")
    } else {
      showStatus(response.error || getMessage("backupError"), "error")
    }
  } catch (error) {
    console.error("Backup error:", error)
    showStatus(error.message || getMessage("backupError"), "error")
  } finally {
    backupButton.classList.remove("loading")
    backupButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle restore latest backup
async function handleRestoreLatest() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const restoreButton = document.getElementById("restoreLatest")

  if (currentBackups.length === 0) {
    showStatus(getMessage("noBackupsFound"), "error")
    isOperationInProgress = false
    return
  }

  if (!confirm(getMessage("confirmRestore"))) {
    isOperationInProgress = false
    return
  }

  restoreButton.classList.add("loading")
  restoreButton.disabled = true

  try {
    showStatus(getMessage("restoringBackup"), "loading")

    const response = await browser.runtime.sendMessage({
      action: "restoreBackup",
      backupIndex: 0,
    })

    if (response.success) {
      showStatus(getMessage("restoreSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("restoreError"), "error")
    }
  } catch (error) {
    console.error("Restore error:", error)
    showStatus(error.message || getMessage("restoreError"), "error")
  } finally {
    restoreButton.classList.remove("loading")
    restoreButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle export backups
async function handleExportBackups() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const exportButton = document.getElementById("exportBackups")
  exportButton.classList.add("loading")
  exportButton.disabled = true

  try {
    showStatus("Exporting backups...", "loading")

    const response = await browser.runtime.sendMessage({ action: "exportBackups" })

    if (response.success) {
      // Create download link
      const blob = new Blob([response.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      showStatus(getMessage("exportSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("exportError"), "error")
    }
  } catch (error) {
    console.error("Export error:", error)
    showStatus(error.message || getMessage("exportError"), "error")
  } finally {
    exportButton.classList.remove("loading")
    exportButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle import backups
async function handleImportBackups(event) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const importButton = document.getElementById("importBackups")
  importButton.classList.add("loading")
  importButton.disabled = true

  try {
    const file = event.target.files[0]
    if (!file) {
      isOperationInProgress = false
      importButton.classList.remove("loading")
      importButton.disabled = false
      return
    }

    showStatus("Importing backups...", "loading")

    // Read file
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = e.target.result

        const response = await browser.runtime.sendMessage({
          action: "importBackups",
          jsonData,
        })

        if (response.success) {
          showStatus(response.message, "success")
          await loadBackups() // Refresh the list
          await updateStorageInfo() // Update storage usage
        } else {
          showStatus(response.error || getMessage("importError"), "error")
        }
      } catch (error) {
        console.error("Import processing error:", error)
        showStatus(error.message || getMessage("importError"), "error")
      } finally {
        importButton.classList.remove("loading")
        importButton.disabled = false
        isOperationInProgress = false
        // Reset file input
        document.getElementById("importFile").value = ""
      }
    }

    reader.onerror = () => {
      showStatus(getMessage("importError"), "error")
      importButton.classList.remove("loading")
      importButton.disabled = false
      isOperationInProgress = false
      // Reset file input
      document.getElementById("importFile").value = ""
    }

    reader.readAsText(file)
  } catch (error) {
    console.error("Import error:", error)
    showStatus(error.message || getMessage("importError"), "error")
    importButton.classList.remove("loading")
    importButton.disabled = false
    isOperationInProgress = false
    // Reset file input
    document.getElementById("importFile").value = ""
  }
}

// Update storage info
async function updateStorageInfo() {
  try {
    const response = await browser.runtime.sendMessage({ action: "getStorageInfo" })

    if (response.success) {
      const progressBar = document.getElementById("storageProgressBar")
      const details = document.getElementById("storageDetails")

      // Update progress bar
      if (response.percentUsed) {
        progressBar.style.width = `${response.percentUsed}%`
      }

      // Update details text
      if (response.backupsSizeMB && response.quota) {
        const detailsText = getMessage("storageDetails")
          .replace("{used}", response.backupsSizeMB)
          .replace("{total}", response.quota)
          .replace("{percent}", response.percentUsed)
        details.textContent = detailsText
      } else {
        details.textContent = `${response.backupsSizeMB} MB, ${response.backupsCount} backups`
      }
    }
  } catch (error) {
    console.error("Error getting storage info:", error)
  }
}

// Load backups from storage
async function loadBackups() {
  try {
    const response = await browser.runtime.sendMessage({ action: "getBackups" })
    currentBackups = response.backups || []
    renderBackupList()
  } catch (error) {
    console.error("Error loading backups:", error)
    document.getElementById("backupList").innerHTML =
      `<div class="empty-state" style="color: #dc3545;">${getMessage("errorLoadingBackups")}</div>`
  }
}

// Format date according to settings
function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    const format = currentSettings.dateFormat || "locale"

    switch (format) {
      case "iso":
        return date.toISOString().slice(0, 19).replace("T", " ")
      case "us":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      case "eu":
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      default:
        return date.toLocaleString(currentLanguage)
    }
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString // Return original if error
  }
}

// Get pluralized text
function getPluralText(count, singular, plural) {
  return count === 1 ? singular : plural
}

// Render backup list
function renderBackupList() {
  const backupList = document.getElementById("backupList")

  if (currentBackups.length === 0) {
    backupList.innerHTML = `<div class="empty-state">${getMessage("noBackupsFound")}</div>`
    return
  }

  backupList.innerHTML = currentBackups
    .map((backup, index) => {
      const totalTabs = backup.windows.reduce((sum, window) => sum + window.tabs.length, 0)
      const windowsText = getPluralText(backup.windows.length, getMessage("window"), getMessage("windows"))
      const tabsText = getPluralText(totalTabs, getMessage("tab"), getMessage("tabs"))
      const formattedDate = formatDate(backup.date)

      return `
      <div class="backup-item" data-index="${index}">
        <div class="backup-date">${formattedDate}</div>
        <div class="backup-info">
          ${backup.windows.length} ${windowsText}, 
          ${totalTabs} ${tabsText}
        </div>
        <div class="backup-actions">
          <button class="button button-secondary restore-btn" data-index="${index}" aria-label="${getMessage("restore")} ${formattedDate}">
            ${getMessage("restore")}
          </button>
          <button class="button button-danger delete-btn" data-index="${index}" aria-label="${getMessage("delete")} ${formattedDate}">
            ${getMessage("delete")}
          </button>
        </div>
      </div>
    `
    })
    .join("")
}

// Handle backup list clicks (event delegation)
function handleBackupListClick(event) {
  const target = event.target

  // Handle restore button click
  if (target.classList.contains("restore-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    restoreBackup(index)
  }

  // Handle delete button click
  if (target.classList.contains("delete-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    deleteBackup(index)
  }
}

// Restore specific backup
async function restoreBackup(index) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  if (!confirm(getMessage("confirmRestore"))) {
    isOperationInProgress = false
    return
  }

  try {
    showStatus(getMessage("restoringBackup"), "loading")

    // Find and disable the button
    const button = document.querySelector(`.restore-btn[data-index="${index}"]`)
    if (button) {
      button.classList.add("loading")
      button.disabled = true
    }

    const response = await browser.runtime.sendMessage({
      action: "restoreBackup",
      backupIndex: index,
    })

    if (response.success) {
      showStatus(getMessage("restoreSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("restoreError"), "error")
    }
  } catch (error) {
    console.error("Restore error:", error)
    showStatus(error.message || getMessage("restoreError"), "error")
  } finally {
    // Re-enable the button
    const button = document.querySelector(`.restore-btn[data-index="${index}"]`)
    if (button) {
      button.classList.remove("loading")
      button.disabled = false
    }
    isOperationInProgress = false
  }
}

// Delete specific backup
async function deleteBackup(index) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  if (!confirm(getMessage("confirmDelete"))) {
    isOperationInProgress = false
    return
  }

  try {
    showStatus("Deleting backup...", "loading") // Show loading first

    // Find and disable the button
    const button = document.querySelector(`.delete-btn[data-index="${index}"]`)
    if (button) {
      button.classList.add("loading")
      button.disabled = true
    }

    const response = await browser.runtime.sendMessage({
      action: "deleteBackup",
      backupIndex: index,
    })

    if (response.success) {
      showStatus(getMessage("deleteSuccess"), "success")
      await loadBackups() // Refresh the list
      await updateStorageInfo() // Update storage usage
    } else {
      showStatus(response.error || getMessage("deleteError"), "error")
    }
  } catch (error) {
    console.error("Delete error:", error)
    showStatus(error.message || getMessage("deleteError"), "error")
  } finally {
    isOperationInProgress = false
  }
}

// Get localized message
function getMessage(key) {
  return messages[currentLanguage][key] || messages.en[key] || key
}

// Show status message
function showStatus(messageKey, type) {
  const statusDiv = document.getElementById("status")
  const message = getMessage(messageKey) || messageKey // Allow direct messages

  statusDiv.textContent = message
  statusDiv.className = `status status-${type}`
  statusDiv.style.display = "block"

  if (type === "loading") {
    document.body.classList.add("loading")
  } else {
    document.body.classList.remove("loading")

    // Hide status after 5 seconds for success/error messages (increased from 3s)
    if (type !== "loading") {
      setTimeout(() => {
        statusDiv.style.opacity = "0"
        setTimeout(() => {
          statusDiv.style.display = "none"
          statusDiv.style.opacity = "1"
        }, 300) // Match transition duration
      }, 5000)
    }
  }
}

// Load localization
function loadLocalization() {
  const elements = document.querySelectorAll("[data-i18n]")
  elements.forEach((element) => {
    const messageKey = element.getAttribute("data-i18n")
    const message = getMessage(messageKey)
    if (message) {
      element.textContent = message
    }
  })
}
