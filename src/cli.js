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
		'Note: This flag is disabled since 2.0.0 and will be ignored, because it produced unrelieable version codes in android. ',
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
		await updateAndroidVersion(packageVersion);
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
