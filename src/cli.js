#!/usr/bin/env node

import {Command} from 'commander';
import {readPackageSync, readPackageAsync} from 'read-pkg';
import logdown from 'logdown';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {updateAndroidVersion} from './modules/android.js';
import {updateIosVersion} from './modules/ios.js';

// Logdown initialization
const logger = logdown('Cap Sync Version');
logger.state = {isEnabled: true};

// get cap-sync-version cli version
const __dirname = dirname(fileURLToPath(import.meta.url));
const {version: cliVersion} = readPackageSync({cwd: join(__dirname, '..')});

const cli = new Command();
cli.version(cliVersion, '-v, --version')
	.option(
		'-a, --android',
		'Sync package version to android. It will not update iOS, unless --ios is specified.',
		false
	)
	.option(
		'-p, --android-allow-prerelease',
		'Note: This flag is disabled since 2.0.0 and will be ignored, because it produced unrelieable version codes in android. ',
		false
	)
	.option(
		'-i, --ios',
		'Sync package version to ios.  It will not update Android, unless --android is specified.',
		false
	)
	.option('-plist, --plist [files...]', 'Add additional plists to modify (ios only)', false);

cli.on('--help', () => {
	console.log(
		`\n  General Information: 
            Version: ${cliVersion}
            Purpose: This CLI syncs the npm package version to the capacitor android and ios projects. 
            Default Behavior: syncs the package version to android and ios, if available
        `
	);
});

cli.parse(process.argv);

async function main(cli) {
	const options = cli.opts();

	if (!options.android && !options.ios) {
		// Set android and ios flags to true when neither os given
		// This allows deactivation of either ios or android, when the other is given explicitly
		options.android = true;
		options.ios = true;
	}

	const projectPackageJson = await readPackageAsync();
	const packageVersion = projectPackageJson.version;

	logger.log('Updating capacitor project versions to: ', packageVersion);
	logger.log('sync android versions? ', options.android || false);
	logger.log('sync ios versions? ', options.ios || false);
	if (options.android) {
		await updateAndroidVersion(packageVersion);
	}

	if (options.ios) {
		let plistFiles = options.plist || [];
		plistFiles = plistFiles.map(f => f.trim());

		logger.log({plistFiles});
		await updateIosVersion(packageVersion, plistFiles);
	}
}

main(cli).catch(error => {
	logger.error(error);
	console.log('\n');
	cli.outputHelp();
});
