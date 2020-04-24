import test from 'ava';
import {buildAndroidVersionCode} from './android';

test('buildAndroidVersionCode: 0.0.1 => 1', t => {
	const versionCode = buildAndroidVersionCode('0.0.1');
	t.is(versionCode, 1);
});
