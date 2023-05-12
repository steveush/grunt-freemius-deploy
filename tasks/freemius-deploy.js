const chalk = require( "chalk" );
const isStringNotEmpty = require( "./utils/isStringNotEmpty" );
const deployNewVersion = require( "./utils/deployNewVersion" );

module.exports = function( grunt ) {

    grunt.registerMultiTask( 'freemius-deploy', function() {

        const options = this.options( /** @type {FreemiusDeployOptions} */ {
            "developer_id": null,
            "plugin_id": null,
            "public_key": null,
            "secret_key": null,
            "add_contributor": true
        } );

        const done = this.async();

        if ( !Number.isInteger( options.developer_id ) ) {
            grunt.log.error( 'The "developer_id" option must be an integer.' );
            return done( false );
        }
        if ( !Number.isInteger( options.plugin_id ) ) {
            grunt.log.error( 'The "plugin_id" option must be an integer.' );
            return done( false );
        }
        if ( !isStringNotEmpty( options.public_key ) ) {
            grunt.log.error( 'The "public_key" option must be a non empty string.' );
            return done( false );
        }
        if ( !isStringNotEmpty( options.secret_key ) ) {
            grunt.log.error( 'The "secret_key" option must be a non empty string.' );
            return done( false );
        }

        const requests = this.filesSrc.map( ( filepath ) => deployNewVersion( filepath, options ) );

        Promise.allSettled( requests ).then( ( results ) => {
            let failed = false;
            results.forEach( ( result ) => {
                if ( result.status === "fulfilled" ) {
                    const dashboardUrl = `https://dashboard.freemius.com/#!/live/plugins/${ result.value.plugin_id }/deployment/`;
                    grunt.log.ok( `Successfully deployed v${ result.value.version } to Freemius. Go and release it: ${ chalk.cyan( dashboardUrl ) }` );
                } else {
                    failed = true;
                    grunt.log.error( result.reason );
                }
            } );
            done( !failed );
        } );
    } );

};