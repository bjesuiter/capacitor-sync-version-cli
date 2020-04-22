export function splitVersionIntoParts(newVersionString) {
	const [versionMajor, versionMinor, rest] = newVersionString.split('.');
	const [versionPatch, versionPrerelease] = rest.split('-');

	return {
		versionMajor,
		versionMinor,
		versionPatch,
		versionPrerelease
	};
}
