import path from 'node:path';

import test from 'ava';
import fs from 'fs-extra';
import {
	androidAppPropertiesPath,
	androidGradleFilePath,
	buildAndroidVersionCode,
	updateAndroidVersion,
} from './android.js';

// General Helper Functions
const macroTitleFunction = (providedTitle, input, expected) => `${providedTitle} ${input} => ${expected}`.trim();

// First Test Area => good-path tests for buildAndroidVersionCode
function versionCodeGenMacro(t, input, expected) {
	const versionCode = buildAndroidVersionCode(input);
	t.is(versionCode, expected);
}

async function cleanResources() {
	await fs.rm(path.dirname(androidGradleFilePath).split('/')[1], {recursive: true, force: true});
}

versionCodeGenMacro.title = macroTitleFunction;

test.before(async () => {
	await cleanResources();
	await fs.mkdirp(path.dirname(androidGradleFilePath));
	await fs.writeFile(
		androidGradleFilePath,
		`apply plugin: 'com.android.application'

android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "myapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 10010
        versionName "v1.2.3"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
                // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
                // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
`,
	);
});

test.after(async () => {
	await cleanResources();
});

test('transforms build.gradle and creates app.properties', async t => {
	// Call the function to transform the build.gradle file
	await updateAndroidVersion('1.0.0');

	// Read the transformed build.gradle file
	const gradleFileContent = await fs.readFile(androidGradleFilePath);
	t.true(
		gradleFileContent.includes(
			'def appProperties = new Properties();\nfile("app.properties").withInputStream { appProperties.load(it) }',
		),
	);
	t.true(gradleFileContent.includes(`versionCode appProperties.getProperty('versionCode').toInteger()`));
	t.true(gradleFileContent.includes(`versionName appProperties.getProperty('versionName')`));

	// Verify that the app.properties file exists and has the correct content
	const appPropertiesContent = await fs.readFile(androidAppPropertiesPath);
	// As we called updateAndroidVersion with 1.0.0, it will generate versionCode 1000000 and versionName 1.0.0
	t.true(appPropertiesContent.includes('versionCode: 1000000'));
	t.true(appPropertiesContent.includes('versionName: 1.0.0'));
});

test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.0.1', 1);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.1.0', 1000);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '1.0.0', 1_000_000);

// Second Test Area => throwing tests for buildAndroidVersionCode

function versionCodeGenThrowing(t, input) {
	t.throws(() => buildAndroidVersionCode(input));
}

function versionCodeGenNotThrowing(t, input) {
	t.notThrows(() => buildAndroidVersionCode(input));
}

test('Function buildAndroidVersionCode throws on prerelease versions', versionCodeGenThrowing, '2.2.0-1');
test('Function buildAndroidVersionCode throws on major version too high', versionCodeGenThrowing, '2148.0.0');
test('Function buildAndroidVersionCode throws on minor version too high', versionCodeGenThrowing, '2.1000.0');
test('Function buildAndroidVersionCode throws on patch version too high', versionCodeGenThrowing, '2.0.1000');

test('Function buildAndroidVersionCode throws not major version on edge', versionCodeGenNotThrowing, '2147.0.0');
test('Function buildAndroidVersionCode throws not minor version on edge', versionCodeGenNotThrowing, '2.999.0');
test('Function buildAndroidVersionCode throws not patch version on edge', versionCodeGenNotThrowing, '2.0.999');

// Third Test Area => Check consistency of versionCodes (greater versions MUST produce greater version codes for google play console);

function versionCodeGenConsistency(t, input) {
	const versionCodeLower = buildAndroidVersionCode(input[0]);
	const versionCodeHigher = buildAndroidVersionCode(input[1]);
	t.true(versionCodeHigher > versionCodeLower);
}

versionCodeGenConsistency.title = (providedTitle, input) =>
	`VersionCode for ${input[1]} should be greater than for ${input[0]}`;

test('', versionCodeGenConsistency, ['0.0.1', '0.0.2']);
test('', versionCodeGenConsistency, ['0.0.1', '0.0.10']);
test('', versionCodeGenConsistency, ['0.0.1', '0.1.0']);
test('', versionCodeGenConsistency, ['0.0.2', '0.1.0']);
test('', versionCodeGenConsistency, ['0.1.0', '0.2.0']);
test('', versionCodeGenConsistency, ['0.2.0', '1.0.0']);
test('', versionCodeGenConsistency, ['1.0.0', '2.0.0']);
