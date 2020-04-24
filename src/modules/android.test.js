import test from 'ava';
import {buildAndroidVersionCode} from './android';

function versionCodeGenMacro(t, input, expected) {
	const versionCode = buildAndroidVersionCode(input);
	t.is(versionCode, expected);
}

versionCodeGenMacro.title = (providedTitle, input, expected) => `${providedTitle} ${input} => ${expected}`.trim();

test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.0.1', 1);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '0.1.0', 1000);
test('Function buildAndroidVersionCode', versionCodeGenMacro, '1.0.0', 1000000);

test('Function buildAndroidVersionCode throws on prerelease versions', t => {
	t.throws(() => buildAndroidVersionCode('2.2.0-1'));
});
