# Cap Sync Version (CLI)

![](https://img.shields.io/npm/v/cap-sync-version/latest)
![](https://img.shields.io/npm/l/cap-sync-version)
![](https://img.shields.io/snyk/vulnerabilities/npm/cap-sync-version)
![](https://img.shields.io/badge/code_style-XO%2BPrettier-00eaf0)
![](https://img.shields.io/badge/released_with-np-lightgrey)
![](https://img.shields.io/badge/badges_from-shields.io-brightgreen)

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
  -p, --android-allow-prerelease  Note: This flag is disabled since 2.0.0 and will be ignored, because it produced unrelieable version codes in android.  (default: false)
  -i, --ios                       Sync package version to ios.  It will not update Android, unless --android is specified. (default: false)
  -h, --help                      display help for command

  General Information:
            Version: 2.0.2
            Purpose: This CLI syncs the npm package version to the capacitor android and ios projects.
            Default Behavior: syncs the package version to android and ios, if available

```

## Credits

Package created after  
 https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e

Big Thanks for Contributions to

-   [Lucas Zeer](https://github.com/Lucaszw)

---

## Changelog

All notable changes to this project will be documented here.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

### Next Version

-   Contribution by [Lucas Zeer](https://github.com/Lucaszw):
    Possibility to add additional PList files on iOS as targets for version sync

### [2.0.3 & 2.0.4] - 2020-04-24

-   Update readme

### [2.0.2] - 2020-04-24

-   Add tests for buildAndroidVersionCode function to make sure all android version code generation works correctly and especially continuously

### [2.0.1] - 2020-04-24

-   Updates for Readme & Changelog

### [2.0.0] - 2020-04-24

-   prohibit generating versions with prerelease part
-   removes all code for prerelease versionCode generation for android to avoid instabilities in the version code

### [1.0.1] - 2020-04-22

-   Improve Badges in Readme

### [1.0.0] - 2020-04-22 - Initial Release

-   Feature: ability to sync versions of android and ios capacitor projects with the npm package version

### [0.0.0] - 2020-04-22 - Initial Package Version

Initial Package Creation

---

# FAQ

## Why is there no prerelease support on android anymore since version 2.0?

Note: Periods in example android version codes are for better readability

1. A version of 2.3.5-0 would have a version code of `2.030.500`
   and the version 2.3.5 would also have the version code `2.030.500`, since the prerelease digits are zero per default.
2. A version of 2.3.5-1 would have a higher version code as 2.3.5, even though 2.3.5 is the final version of 2.3.5-1.
   Version 2.3.5-1 would have the code `2.030.501`, but version 2.3.5 would have the code `2.030.500`, which would result in rejection of the built apk or aab by the google play console.
3. iOS is not able to encode prerelease versions like this altogether.

One could fix above errors, but not without making the version generation algorithm more complicated and less intuitive.
And when looking at the fact, that iOS doesn't even support prerelease versions, I'll simply increase the headroom of patch versions (where the developer can decide to mark them as beta or something).
