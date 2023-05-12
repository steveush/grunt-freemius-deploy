# @steveush/grunt-freemius-deploy v0.0.1

> A grunt task to help deploy packages to Freemius.

## Getting Started

If you haven't used [Grunt](https://gruntjs.com/) before, be sure to check out the [Getting Started](https://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](https://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install @steveush/grunt-freemius-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('@steveush/grunt-freemius-deploy');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](https://gruntjs.com/upgrading-from-0.3-to-0.4)*


## Freemius Deploy Task

_Run this task with the `grunt freemius-deploy` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](https://gruntjs.com/configuring-tasks) guide.

### Options

#### developer_id

Type: `Number`  
Default: `null`

Your developer ID as assigned by Freemius.

#### plugin_id

Type: `Number`  
Default: `null`

The plugin ID as assigned by Freemius.

#### secret_key

Type: `String`  
Default: `null`

The secret key for your plugin found in the **Settings > Keys** section.

#### public_key

Type: `String`  
Default: `null`

The public key for your plugin found in the **Settings > Keys** section.

## Usage Examples

*NOTE*: As these options are sensitive and should not be shared we recommend placing them into a separate `.json` file which is excluded from check in using your `.gitignore` file.

#### *Example*

In a custom JSON file e.g. `freemius.json`.

```js
{
    "developer_id": 1,
    "plugin_id": 1,
    "secret_key": "PLUGINSECRETKEY",
    "public_key": "PLUGINPUBLICKEY"
}
```

In your `Gruntfile.js`.

```js
grunt.initConfig( {
    "freemius-deploy": {
        options: grunt.file.readJSON( 'freemius.json' ),
        src: [ './dist/test-plugin.v0.0.1.zip' ]
    }
} );
```

In your `.gitignore`.

```txt
# Freemius
freemius.json
```

## Changelog

| Version | Date        | Notes                             |
|:-------:|:------------|:----------------------------------|
| v0.0.1  | 14 Apr 2023 | Initial commit of the repository. |