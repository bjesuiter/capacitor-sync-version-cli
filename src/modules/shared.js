/**
 * Extracts the parts of a npm version string
 * @param {*} npmVersionString A npm version string of the format major.minor.patch-prerelease
 */
export function splitVersionIntoParts(npmVersionString) {
	let [versionMajor, versionMinor, rest] = npmVersionString.split('.');
	let [versionPatch, versionPrerelease] = rest.split('-');

	// Convert all to int
	versionMajor = Number.parseInt(versionMajor, 10);
	versionMinor = Number.parseInt(versionMinor, 10);
	versionPatch = Number.parseInt(versionPatch, 10);

	if (versionPrerelease) {
		versionPrerelease = Number.parseInt(versionPrerelease, 10);
	}

	return {
		versionMajor,
		versionMinor,
		versionPatch,
		versionPrerelease,
		versionWithoutPrerelease: `${versionMajor}.${versionMinor}.${versionPatch}`
	};
}
