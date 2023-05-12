module.exports = function( grunt ) {

    grunt.loadTasks( './tasks' );

    grunt.initConfig( {
        "freemius-deploy": {
            options: grunt.file.readJSON( 'freemius.json' ),
            src: [ './dist/test.txt', './dist/foobar.v2.1.28.zip' ]
        }
    } );

    grunt.registerTask( 'default', [ 'freemius-deploy' ] );

};