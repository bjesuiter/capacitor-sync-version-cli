# Cap Sync Version (CLI)

<img src="https://img.shields.io/badge/code_style-XO+Prettier-00eaf0">
<img src="https://img.shields.io/badge/released_with-np-lightgrey">
<img src="https://img.shields.io/badge/badges_from-shields.io-brightgreen">

> This CLI syncs the npm package version to the capacitor android and ios projects.

Capacitor creates a folder for each platform in the root of your project, like `android`, `ios`, and `electron`.
Since electron is in beta right now, it's not supported by this tool.

Capacitor does not deal with syncing the version number from your package.json to the mobile projects,
mainly because this sync is not 1 to 1 possible without assumtions.
This cli uses an automatic alogrithm to calculate the android versionCode based on the version string from package.json.
The android versionCode is an ever increasing integer-32 defining the unique version for each app.

## Required Setup for Android

1. Create a file called `app.properties` under `./android/app/`.

2. Add the following two properties to the file

    ```
    versionName: 0.0.1
    versionCode: 1
    ```

    Note: These values will be overwritten with the next call to this `cap-sync-version` cli.

3. Load the `app.properties` file in `./android/app/build.gradle` by adding the following after `apply plugin: 'com.android.application'` at the top

    ```
    // This loads the custom app.properties file for applying it's values
    def appProperties = new Properties();
    file("app.properties").withInputStream { appProperties.load(it) }
    ```

4. Use these new properties to set `versionCode` and `versionName` in `./android/app/build.gradle`

    ```
    defaultConfig {
        versionCode appProperties.getProperty('versionCode').toInteger()
        versionName appProperties.getProperty('versionName')
    }
    ```

## Required Setup for iOS

None that I'm aware of

## CLI Usage

```
$> cap-sync-version --help

Usage: cap-sync-version [options]

Options:
  -v, --version                   output the version number
  -a, --android                   Sync package version to android. It will not update iOS, unless --ios is specified. (default: false)
  -p, --android-allow-prerelease  Allows prerelease versions for android.
                                  Warning: iOS does not support prerelease versions!
                                  So If you create a npm package prerelease version and allow prereleases for
                                  android, the ios version will simply be the version without prerelease number! (default: false)
  -i, --ios                       Sync package version to ios.  It will not update Android, unless --android is specified. (default: false)
  -h, --help                      display help for command

  General Information:
            Version: 0.0.1
            Purpose: This CLI syncs the npm package version to the capacitor android and ios projects.
            Default Behavior: syncs the package version to android and ios, if available

```

## Credits

Package created after  
 https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e

---

## Changelog

All notable changes to this project will be documented here.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

### [1.0.0] - 2020-04-22 - Initial Release

-   Feature: ability to sync versions of android and ios capacitor projects with the npm package version

### [0.0.0] - 2020-04-22 - Initial Package Version

Initial Package Creation
