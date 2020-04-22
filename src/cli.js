import {Command} from 'commander';
import projectVersion from 'project-version';
import readPkg from 'read-pkg';
import {updateAndroidVersion} from './modules/android';
import {updateIosVersion} from './modules/ios';

import logdown from 'logdown';
const logger = logdown('Cap Sync Version');
logger.state = {isEnabled: true};

const cli = new Command();
cli.version(projectVersion, '-v, --version')
	.option(
		'-a, --android',
		'Sync package version to android. It will not update iOS, unless --ios is specified.',
		false
	)
	.option(
		'-p, --android-allow-prerelease',
		'Allows prerelease versions for android. Warning: iOS does not support prerelease versions! ' +
			'So If you create a npm package prerelease version and allow prereleases for android, the ios version will simply be the version without prerelease number!',
		false
	)
	.option(
		'-i, --ios',
		'Sync package version to ios.  It will not update Android, unless --android is specified.',
		false
	);

cli.on('--help', () => {
	console.log(
		`\n  General Information: 
            Version: ${projectVersion}
            Purpose: This CLI syncs the npm package version to the capacitor android and ios projects. 
            Default Behavior: syncs the package version to android and ios, if available
        `
	);
});

cli.parse(process.argv);

if (process.argv.slice(2).length === 0) {
	// Set android and ios flags to true when no params are given.
	// This allows deactivation of either ios or android, when the other is given explicitly
	cli.android = true;
	cli.ios = true;
}

async function main(cli) {
	const projectPackageJson = await readPkg();
	const packageVersion = projectPackageJson.version;

	logger.log('Updating capacitor project versions to: ', packageVersion);

	if (cli.android) {
		await updateAndroidVersion(packageVersion, cli.androidAllowPrerelease);
	}

	if (cli.ios) {
		await updateIosVersion(packageVersion);
	}
}

main(cli).catch(error => {
	logger.error(error);
	console.log('\n');
	// TODO: Display the help text in red on the console
	cli.outputHelp();
});
