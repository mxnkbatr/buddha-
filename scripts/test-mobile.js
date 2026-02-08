const { remote } = require('webdriverio');

// Define capabilities for Android
const capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:app': '/home/puujee/buddha/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:appPackage': 'mn.gevabal.buddha',
    'appium:appActivity': 'mn.gevabal.buddha.MainActivity',
    // Ensure webviews have pages to inspect if needed
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true,
    'appium:newCommandTimeout': 3600,
    'appium:connectHardwareKeyboard': true
};

async function main() {
    console.log('Initializing Appium driver...');
    const driver = await remote({
        protocol: 'http',
        hostname: '127.0.0.1',
        port: 4723,
        path: '/',
        capabilities
    });

    try {
        console.log('App launched successfully!');

        // Simple test: Keep the app open for 10 seconds to observe
        console.log('Keeping app open for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Example interaction (uncomment to use)
        // const contexts = await driver.getContexts();
        // console.log('Available contexts:', contexts);

        console.log('Test execution completed.');
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        console.log('Closing session...');
        await driver.deleteSession();
    }
}

main().catch(console.error);
