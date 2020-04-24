import {parseFile as parsePropertiesFile, stringify as stringifyProperties} from 'java-props';
import fs from 'fs-extra';

import logdown from 'logdown';
import {splitVersionIntoParts} from './shared';
const logger = logdown('Cap Sync Version - Android');
logger.state = {isEnabled: true};

// Path to the app.properties file => see Readme.md for setup instructions
export const androidAppPropertiesPath = './android/app/app.properties';

export async function updateAndroidVersion(newVersionString) {
	logger.log('Updating Android App Version...');

	const appPropertiesExist = await fs.exists(androidAppPropertiesPath);
	if (appPropertiesExist === false) {
		throw new Error(
			`The file ${androidAppPropertiesPath} does not exist. => Please consult the readme of cap-sync-version on how to setup android version sync.`
		);
	}

	// Note: app.properties is a manually created custom file which is used in build.gradle
	// to set the android versionName and versionCode variables
	const appProperties = await parsePropertiesFile(androidAppPropertiesPath);
	const {versionPrerelease, versionWithoutPrerelease} = splitVersionIntoParts(newVersionString);

	if (versionPrerelease !== undefined) {
		throw new Error(`This package has a prerelease version number (${newVersionString}), 
		but prerelease versions are not allowed (see https://github.com/bjesuiter/capacitor-sync-version-cli/blob/master/README.md#why-is-there-no-prerelease-support-on-android-anymore-since-version-20).
		Please change your package version to a version without prerelease part`);
	}

	appProperties.versionName = versionWithoutPrerelease;

	appProperties.versionCode = buildAndroidVersionCode(newVersionString);
	appProperties.versionCode = `${appProperties.versionCode}`;

	logger.log('New app.properties Content', appProperties);
	const newPropertiesString = stringifyProperties(appProperties);

	await fs.writeFile(androidAppPropertiesPath, newPropertiesString);

	logger.log('Updating Android App Version successful. Please commit all pending changes now.');
}

/**
 * Calculates the android version code based on the newVersionString.
 *
 * Note: Version Code is an int 32 at max, so the maximum value is 2.147.483.647.
 * With prerelease versions NOT allowed, this will assign a version code of 2.004.001 for an app with version 2.4.1.
 * That gives you the possibility of
 *     2147 major versions according to the maximum integer value possible for versionCode
 *     1000 minor versions for every major version and
 *     1000 patch levels for every minor version.
 *
 * Note: I have not used the extra headroom, which may exist when ignoring prerelease version, to increase the possible values of the major version, because
 * - a major version above 2147 is ridiculus, even 2147 is super high already
 * - its more useful to have more room in the patch and minor levels
 *
 * @param {*} newVersionString
 */
export function buildAndroidVersionCode(newVersionString) {
	// Calculate new versionCode, based on https://medium.com/@manas/manage-your-android-app-s-versioncode-versionname-with-gradle-7f9c5dcf09bf
	const {versionMajor, versionMinor, versionPatch} = splitVersionIntoParts(newVersionString);

	const maxMajor = 2147;
	const maxMinor = 1000;
	const maxPatch = 1000;

	if (versionMajor > maxMajor) {
		throw new Error(`You've reached the maximum major version number of ${maxMajor}. 
		A higher major version can't be added to the android versionCode field. 
		For details, look at the function 'buildAndroidVersionCode' in https://github.com/bjesuiter/capacitor-sync-version-cli/blob/master/src/modules/android.js`);
	}

	if (versionMinor === maxMinor) {
		throw new Error(`You've reached the maximum of ${maxMinor} minor versions inside major version ${versionMajor}. 
		Please increase version to the next major version. 
		For details, look at the function 'buildAndroidVersionCode' in https://github.com/bjesuiter/capacitor-sync-version-cli/blob/master/src/modules/android.js`);
	}

	if (versionPatch === maxPatch) {
		throw new Error(`You've reached the maximum of ${maxPatch} patch versions inside major & minor version ${versionMajor}.${versionMinor}. 
		Please increase version to the next minor or major version instead. 
		For details, look at the function 'buildAndroidVersionCode' in https://github.com/bjesuiter/capacitor-sync-version-cli/blob/master/src/modules/android.js`);
	}

	let versionCode = versionMajor * 1000000;
	versionCode += versionMinor * 1000;
	versionCode += versionPatch;
	return versionCode;
}
