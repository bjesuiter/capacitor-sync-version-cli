import {parseFile as parsePropertiesFile, stringify as stringifyProperties} from 'java-props';
import fs from 'fs-extra';

import logdown from 'logdown';
const logger = logdown('Cap Sync Version - Android');
logger.state = {isEnabled: true};

// Path to the app.properties file => see Readme.md for setup instructions
export const androidAppPropertiesPath = './android/app/app.properties';

export async function updateAndroidVersion(newVersionString, allowPrereleaseVersions) {
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

	appProperties.versionCode = buildAndroidVersionCode(newVersionString, allowPrereleaseVersions);

	const newPropertiesString = stringifyProperties(appProperties);
	logger.log('New app.properties Content', appProperties);

	await fs.writeFile(androidAppPropertiesPath, newPropertiesString);
}

/**
 * Calculates the android version code based on the newVersionString.
 *
 * Note: Version Code is an int 32 at max, so the maximum value is 2.147.483.647.
 * With prerelease versions allowed, this will assign a version code of 2.040.105 for an app with version 2.4.1-5 .
 * With prerelease versions NOT allowed, this will assign a version code of 2.040.100 for an app with version 2.4.1-5 (prerelease version will simply be truncated).
 * That gives you the possibility of
 *     2147 major versions according to the maximum integer value possible for versionCode
 *     100 minor versions for every major version,
 *     100   patch levels for every minor version (this will still be true, even when prereleases are not allowed, to allow compatibility between both options),
 *     100 prerelease versions for every patch version (when prerelease versions are allowed)
 *
 * Note: I have not used the extra headroom, which may exist when ignoring prerelease version, to increase the possible values of the major version, because
 * - a major version above 2147 is ridiculus, even 2147 is super high already
 * - the two schemes of versionCode generation would be incompatible (because 2.040.105 could then mean either 2.4.1-5 or 24.1.5),
 *   which may produce hard to track bugs
 *
 * @param {*} newVersionString
 * @param {*} allowPrereleaseVersions
 */
export function buildAndroidVersionCode(newVersionString, allowPrereleaseVersions) {
	// Calculate new versionCode, based on https://medium.com/@manas/manage-your-android-app-s-versioncode-versionname-with-gradle-7f9c5dcf09bf
	const [versionMajor, versionMinor, rest] = newVersionString.split('.');
	const [versionPatch, versionPrerelease] = rest.split('-');

	let versionCode = versionMajor * 1000000;
	versionCode += versionMinor * 10000;
	versionCode += versionPatch * 100;

	if (versionPrerelease && allowPrereleaseVersions) {
		versionCode += versionPrerelease;
	}

	return versionCode;
}
