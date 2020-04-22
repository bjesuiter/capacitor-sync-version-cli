/**
 * Extracts the parts of a npm version string
 * @param {*} npmVersionString A npm version string of the format major.minor.patch-prerelease
 */
export function splitVersionIntoParts(npmVersionString) {
	const [versionMajor, versionMinor, rest] = npmVersionString.split('.');
	const [versionPatch, versionPrerelease] = rest.split('-');

	return {
		versionMajor,
		versionMinor,
		versionPatch,
		versionPrerelease
	};
}
