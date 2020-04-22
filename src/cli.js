import {Command} from 'commander';
import projectVersion from 'project-version';

const cli = new Command();
cli.version(projectVersion, '-v, --version')
	.option('-a,--android', 'Sync package version to android', true)
	.option(
		'-p, --android-allow-prerelease',
		'Allows prerelease versions for android. Warning: iOS does not support prerelease versions! ' +
			'So If you create a npm package prerelease version and allow prereleases for android, the ios version will simply be the version without prerelease number!',
		false
	)
	.option('-i, --ios', 'Sync package version to ios', true);

cli.on('--help', () => {
	console.log(
		`\n  General Information: 
            Version: ${projectVersion}
            Purpose: This CLI syncs the npm package version to the capacitor android and ios projects. 
            Default Behavior: syncs the package version to android and ios, if available
        `
	);
});
