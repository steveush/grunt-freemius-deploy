const CryptoJS = require( "crypto-js" );
const needle = require( "needle" );
const path = require( "path" );
const fsPromises = require( "fs/promises" );

//region type-definitions

/**
 * @typedef {object} FreemiusDeployOptions
 * @property {number} plugin_id
 * @property {number} developer_id
 * @property {string} secret_key
 * @property {string} public_key
 * @property {boolean} [add_contributor=true] - Allow Freemius PHP processor to automatically add freemius as a contributor for the plugin (modifies plugin's readme.txt file).
 */

/**
 * An alias for either the {@link FreemiusSuccessBody} or {@link FreemiusErrorBody} objects.
 * @typedef {FreemiusSuccessBody|FreemiusErrorBody} FreemiusResponseBody
 */

/**
 * The response body for a successful request.
 * @typedef {object} FreemiusSuccessBody
 * @property {string} id - The ID as it appears on the Deployment page within the Freemius dashboard.
 * @property {string} plugin_id - The plugin ID supplied when making the request.
 * @property {string} developer_id - The developer ID supplied when making the request.
 * @property {string} version - The version number parsed from the uploaded ZIP.
 * @property {string} requires_platform_version - The minimum platform version supported by the plugin.
 * @property {string} tested_up_to_version - The latest version of the platform the plugin was tested on.
 * @property {boolean} has_free - Whether the uploaded plugin contained a free version.
 * @property {boolean} has_premium - Whether the uploaded plugin contained a premium version.
 * @property {string} release_mode - The current release mode for the version. Can be pending, beta or released.
 * @property {string} created - The created timestamp.
 * @property {string} updated - The updated timestamp.
 */

/**
 * The response body for a failed request.
 * @typedef {object} FreemiusErrorBody
 * @property {string} path - The endpoint which generated the error.
 * @property {FreemiusErrorRequest} request - A summary of the request which generated the error.
 * @property {FreemiusErrorObject} error - The generated error.
 */

/**
 * The error object returned by Freemius.
 * @typedef {object} FreemiusErrorObject
 * @property {string} type - A camelized string representation of the HTTP status code.
 * @property {string} message - The message for the error.
 * @property {string} code - A slugified string representation of the HTTP status code.
 * @property {number} http - The HTTP status code.
 * @property {string} timestamp - The timestamp for the error.
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes|HTTP status codes}
 * @example The below shows an unauthorized 401 error.
 * {
 *     "type": "UnauthorizedAccess",
 *     "message": "Invalid Authorization header.",
 *     "code": "unauthorized_access",
 *     "http": 401,
 *     "timestamp": "Fri, 14 Apr 2023 03:48:10 +0000"
 * }
 */

/**
 * A summary of the original request that triggered the error.
 * @typedef {object} FreemiusErrorRequest
 * @property {string} developer_id - The developer ID supplied when making the request.
 * @property {string} plugin_id - The plugin ID supplied when making the request.
 * @property {{name:string,type:string,tmp_name:string,error:number,size:number}} file - A summary of the uploaded file.
 */

//endregion

/**
 * Deploy a new plugin version to Freemius using the supplied options.
 * @param {string} filepath - The path to the zip file containing the new version.
 * @param {FreemiusDeployOptions} options - The developer and plugin specific options.
 * @returns {Promise<FreemiusSuccessBody>}
 * @see {@link https://freemius.docs.apiary.io/#reference/deployment/deploy-new-version|Freemius documentation}
 * @throws {Error} If the supplied filepath is not a ".zip" then an error is thrown.
 */
const deployNewVersion = async( filepath, options ) => {
    if ( path.extname( filepath ) !== ".zip" ) {
        throw new Error( `${ filepath } is not a ZIP file.` );
    }

    const zipBuffer = await fsPromises.readFile( filepath );

    const resourceUrl = `/v1/developers/${ options.developer_id }/plugins/${ options.plugin_id }/tags.json`,
        boundary = '----' + ( new Date().getTime() ).toString( 16 ),
        timestamp = new Date().toUTCString();

    const stringToSign = [
        "POST",
        "", // MD5 - as per docs this should be empty
        `multipart/form-data; boundary=${ boundary }`,
        timestamp,
        resourceUrl
    ].join( "\n" );

    const hash = CryptoJS.HmacSHA256( stringToSign, options.secret_key ).toString();
    const signature = Buffer.from( hash ).toString( "base64url" );

    const auth = `FS ${ options.developer_id }:${ options.public_key }:${ signature }`;

    const requestData = /** @type {BodyData} */ {
        add_contributor: options.add_contributor,
        file: {
            buffer: zipBuffer,
            filename: path.basename( filepath ),
            content_type: 'application/zip'
        }
    };

    const requestOptions = /** @type {NeedleOptions} */ {
        multipart: true,
        boundary: boundary,
        headers: {
            "Content-MD5": "",
            "Date": timestamp,
            "Authorization": auth
        }
    };

    const { /** @type {FreemiusResponseBody} */ body } = await needle( "post", `https://api.freemius.com${ resourceUrl }`, requestData, requestOptions );

    return new Promise( ( resolve, reject ) => {
        if ( typeof body !== 'object' ) {
            reject( 'Unexpected response from Freemius, try deploying again in a minute.' );
        } else if ( typeof body.error !== 'undefined' ) {
            reject( 'Freemius Error: ' + body.error.message );
        } else {
            resolve( body );
        }
    } );
};

module.exports = deployNewVersion;