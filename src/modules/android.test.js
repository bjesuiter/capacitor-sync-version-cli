import test from 'ava';
import {buildAndroidVersionCode} from './android.js';

// General Helper Functions
const macroTitleFunction = (providedTitle, input, expected) => `${providedTitle} ${input} => ${expected}`.trim();

// First Test Area => good-path tests for buildAndroidVersionCode
function versionCodeGenMacro(t, input, expected) {
	const versionCode = buildAndroidVersionCode(input);
	t.is(versionCode, expected);
}

versionCodeGenMacro.title = macroTitleFunction;

test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.0.1', 1);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.1.0', 1000);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '1.0.0', 1000000);

// Second Test Area => throwing tests for buildAndroidVersionCode

function versionCodeGenThrowing(t, input) {
	t.throws(() => buildAndroidVersionCode(input));
}

function versionCodeGenNotThrowing(t, input) {
	t.notThrows(() => buildAndroidVersionCode(input));
}

test('Function buildAndroidVersionCode throws on prerelease versions', versionCodeGenThrowing, '2.2.0-1');
test('Function buildAndroidVersionCode throws on major version too high', versionCodeGenThrowing, '2148.0.0');
test('Function buildAndroidVersionCode throws on minor version too high', versionCodeGenThrowing, '2.1000.0');
test('Function buildAndroidVersionCode throws on patch version too high', versionCodeGenThrowing, '2.0.1000');

test('Function buildAndroidVersionCode throws not major version on edge', versionCodeGenNotThrowing, '2147.0.0');
test('Function buildAndroidVersionCode throws not minor version on edge', versionCodeGenNotThrowing, '2.999.0');
test('Function buildAndroidVersionCode throws not patch version on edge', versionCodeGenNotThrowing, '2.0.999');

// Third Test Area => Check consistency of versionCodes (greater versions MUST produce greater version codes for google play console);

function versionCodeGenConsistency(t, input) {
	const versionCodeLower = buildAndroidVersionCode(input[0]);
	const versionCodeHigher = buildAndroidVersionCode(input[1]);
	t.true(versionCodeHigher > versionCodeLower);
}

versionCodeGenConsistency.title = (providedTitle, input) =>
	`VersionCode for ${input[1]} should be greater than for ${input[0]}`;

test('', versionCodeGenConsistency, ['0.0.1', '0.0.2']);
test('', versionCodeGenConsistency, ['0.0.1', '0.0.10']);
test('', versionCodeGenConsistency, ['0.0.1', '0.1.0']);
test('', versionCodeGenConsistency, ['0.0.2', '0.1.0']);
test('', versionCodeGenConsistency, ['0.1.0', '0.2.0']);
test('', versionCodeGenConsistency, ['0.2.0', '1.0.0']);
test('', versionCodeGenConsistency, ['1.0.0', '2.0.0']);
