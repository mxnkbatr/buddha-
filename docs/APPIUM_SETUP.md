
# Setting up Appium with Capacitor

This guide explains how to use Appium to test your Capacitor-based application.

## Prerequisites

Before starting, ensure you have the following installed:

1.  **Node.js** (v18+)
2.  **Appium Server**:
    ```bash
    npm install -g appium
    ```
3.  **Appium Drivers**:
    ```bash
    appium driver install uiautomator2  # For Android
    appium driver install xcuitest      # For iOS
    ```
4.  **Appium Inspector** (Optional GUI for exploring your app): [Download here](https://github.com/appium/appium-inspector/releases)

---

## 1. Preparing Your App for Testing

Appium needs a compiled binary (`.apk` for Android, `.app` for iOS Simulator).

### Android

1.  Build the web assets and sync:
    ```bash
    npm run build
    npx cap sync android
    ```
2.  Build the debug APK:
    ```bash
    cd android
    ./gradlew assembleDebug
    ```
3.  **Locate the APK**:
    The built APK will be at:
    `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS (Simulator)

1.  Build the web assets and sync:
    ```bash
    npm run build
    npx cap sync ios
    ```
2.  Open Xcode workspace:
    ```bash
    npx cap open ios
    ```
3.  Build for Simulator in Xcode:
    - Select a Simulator target (e.g., iPhone 15).
    - Product -> Build.
4.  **Locate the .app**:
    - Build artifacts are usually in `~/Library/Developer/Xcode/DerivedData/...`.
    - Alternatively, build via command line:
      ```bash
      xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphonesimulator -configuration Debug derivedDataPath ios/build
      ```
    - The `.app` will be at `ios/build/Build/Products/Debug-iphonesimulator/App.app`.

---

## 2. Configuring Appium Inspector

To inspect your app elements, open Appium Inspector and use these capabilities on the "JSON Representation" tab.

### Android Capabilities

```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:app": "/absolute/path/to/your/project/android/app/build/outputs/apk/debug/app-debug.apk",
  "appium:appPackage": "mn.gevabal.buddha",
  "appium:appActivity": "mn.gevabal.buddha.MainActivity",
  "appium:ensureWebviewsHavePages": true,
  "appium:nativeWebScreenshot": true,
  "appium:newCommandTimeout": 3600,
  "appium:connectHardwareKeyboard": true
}
```

### iOS Capabilities

```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15",
  "appium:platformVersion": "17.2",
  "appium:app": "/absolute/path/to/your/project/ios/build/Build/Products/Debug-iphonesimulator/App.app",
  "appium:bundleId": "mn.gevabal.buddha",
  "appium:noReset": true
}
```

**Note**: Replace `/absolute/path/to/your/project/...` with the full path on your machine.

---

## 3. Writing Automated Tests (Example)

Since you are using a TypeScript/Next.js project, it is recommended to use **WebdriverIO** or a simple script with `webdriverio` package.

### Quick Start with WebdriverIO

1.  Install dependencies:
    ```bash
    npm install --save-dev webdriverio @wdio/cli
    ```

2.  Create a test script `scripts/test-mobile.js`:

```javascript
const { remote } = require('webdriverio');
const path = require('path');

const androidCaps = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:app': path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk'),
  'appium:appPackage': 'mn.gevabal.buddha',
  'appium:appActivity': 'mn.gevabal.buddha.MainActivity',
};

const iosCaps = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 15',
  'appium:app': path.join(__dirname, '../ios/build/Build/Products/Debug-iphonesimulator/App.app'),
  'appium:bundleId': 'mn.gevabal.buddha',
};

async function main() {
  // Change to iosCaps to test iOS
  const driver = await remote({
    path: '/',
    port: 4723,
    capabilities: androidCaps
  });

  try {
    console.log('App launched!');
    
    // Wait for the webview context if testing web content
    const contexts = await driver.getContexts();
    console.log('Available contexts:', contexts);
    
    // Switch to webview to interact with HTML elements
    // await driver.switchContext(contexts.find(c => c.includes('WEBVIEW')));
    
    // Or interact with native elements
    const element = await driver.$('~SomeAccessibilityId'); 
    // In Capacitor, Accessibility ID maps to aria-label in HTML usually
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // Keep open for 5s
  } catch (e) {
    console.error(e);
  } finally {
    await driver.deleteSession();
  }
}

main();
```

3.  Run the Appium server in one terminal:
    ```bash
    appium
    ```

4.  Run the test script in another terminal:
    ```bash
    node scripts/test-mobile.js
    ```
