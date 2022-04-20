import SimplePlist from 'simple-plist';
import logdown from 'logdown';

const logger = logdown('Cap Sync Version - iOS');
logger.state = {isEnabled: true};

// Path to the Info.plist file which contains the version number for iOS Apps
export const iosInfoPlistPath = './ios/App/App/Info.plist';

export async function updateIosVersion(newVersionString, plist = []) {
	logger.log('Updating iOS App Version...');

	const [versionWithoutPrerelease, prereleaseVersion] = newVersionString.split('-');
	if (prereleaseVersion !== undefined) {
		logger.warn(`
		This package has a prerelease version defined. 
		Since iOS versions can only contain 3 numbers separated by dots, 
		THE PRERELEASE VERSION WILL BE IGNORED!`);
	}

	// Join additional plist files (incase of additional targets like AppClips)
	const plistPaths = [iosInfoPlistPath, ...plist];

	for (const path of plistPaths) {
		logger.log('Updating file ' + path);
		const plistObject = SimplePlist.readFileSync(path);

		plistObject.CFBundleShortVersionString = versionWithoutPrerelease;
		plistObject.CFBundleVersion = versionWithoutPrerelease;

		SimplePlist.writeFileSync(path, plistObject);
	}

	logger.log('Updating iOS App Version successful. Please commit all pending changes now.');
}
