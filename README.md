# GemStone/S 64 Bit IDE Extension for Visual Studio Code

The `gemstone` Visual Studio Code extension allows you to interact with GemStone with Code.

## Features

* Log in to GemStone.

## Requirements

You need to [download](https://gemtalksystems.com/products/gs64/) appropriate libraries and let us know where you put them using the extension settings.

* macOS (`~/lib`)
* * 3.4.x 
* * * libgcits-3.4.3-64.dylib
* * * libfloss-3.4.3-64.dylib
* * 3.5.x
* * * libgcits-3.5.0-64.dylib
* * * libkrb5-3.5.0-64.dylib
* * * libldap-3.5.0-64.dylib
* * * libssl-3.5.0-64.dylib

## Extension Settings

To use GemStone you need to provide a path to a GemStone C Interface (GCI) dynamic library and related login information. Open the user or workspace settings and add one or more entries for `gemstone.logins`.

## Known Issues

...

## Release Notes

### 0.1.0

Hook into Visual Studio Code extension framework and log in to a GemStone database.

