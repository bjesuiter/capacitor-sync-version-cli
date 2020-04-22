import {readFileSync as parsePlistFileSync, writeFileSync as writePlistFileSync} from 'simple-plist';

import logdown from 'logdown';
const logger = logdown('Cap Sync Version - iOS');
logger.state = {isEnabled: true};

// Path to the Info.plist file which contains the version number for iOS Apps
export const iosInfoPlistPath = './ios/App/App/Info.plist';

export async function updateIosVersion(newVersionString) {
	logger.log('Updating iOS App Version...');

	const plistObject = parsePlistFileSync(iosInfoPlistPath);
	const [versionWithoutPrerelease, prereleaseVersion] = newVersionString.split('-');

	if (prereleaseVersion !== undefined) {
		logger.warn(`This package has a prerelease version defined. 
        Since iOS versions can only contain 3 numbers separated by dots, the prerelease version will be ignored!`);
	}

	plistObject.CFBundleShortVersionString = versionWithoutPrerelease;
	plistObject.CFBundleVersion = versionWithoutPrerelease;
	logger.log(plistObject);

	writePlistFileSync(iosInfoPlistPath, plistObject);
}
