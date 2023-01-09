/*! resol-vbus | Copyright (c) 2013-present, Daniel Wippermann | MIT license */

/**
 * @typedef ConfigurationValue
 * @type {object}
 * @property {String} valueId Value ID
 * @property {number} valueIndex Value Index
 * @property {number} value Value
 * @property {number} priority Priority (higher numbers mean higher priority)
 * @property {boolean} pending Indicates that this value has to be tranceived.
 * @property {boolean} transceived Indicates that this value has been tranceived.
 */


/**
 * @typedef Configuration
 * @type {ConfigurationValue[]}
 */



class ConfigurationOptimizer {

    /**
     * Converts the configurations provided into an array of {@see ConfigurationValue} objects.
     * The provided configurations can be either an array of partially initialized ConfigurationValue
     * objects or an object mapping value IDs as keys to values.
     * If no configuration is given a complete configuration set is returned.
     *
     * @param {array|object} configs... Configurations to complete.
     * @returns {Promise} A Promise that resolves to the completed array of values.
     */
    completeConfiguration(config) {
        throw new Error('Must be implemented by sub-class');
    }

    /**
     * Gets the optimized array of values based on what values are already loaded.
     *
     * @param {array} config The array of values that has already been loaded.
     * @returns {Promise} A Promise that resolves to the array of values to load next.
     */
    optimizeLoadConfiguration(config) {
        throw new Error('Must be implemented by sub-class');
    }

    /**
     * Gets the optimzed array of values to save to the controller.
     *
     * @param {array} newConfig The array of values to transfer.
     * @param {array} oldConfig The array of values that are assumed to be currently stored in the device.
     * @returns {Promise} A Promise that resolves to the array of values to save.
     */
    optimizeSaveConfiguration(newConfig, oldConfig) {
        throw new Error('Must be implemented by sub-class');
    }

    /**
     * Get the array of `ConfigurationValue` objects to set the current date / time to the controller.
     *
     * @param  {string} timezone Timezone the controller is in
     * @return {Promise} A Promise that resolves to the array of values to set the clock.
     */
    generateClockConfiguration(timezone) {
        throw new Error('Must be implemented by sub-class');
    }

    /**
     * Get an array of possible options for calling this `ConfigurationOptimizer`'s constructor.
     *
     * @return {Promise} A promise that resolves to an array of constructor options.
     */
    static async getOptimizerOptions() {
        if (this.deviceAddress !== null) {
            return [ null ];
        } else {
            throw new Error('Must be implemented by sub-class');
        }
    }

    /**
     * Find settings for this `ConfigurationOptimizer`'s constructor that matches the given options best.
     *
     * @param  {object} options Options to look for while searching a matching configuration optimizer.
     * @param  {string} options.id The identifier for the `ConfigurationOptimizer`.
     * @param  {number} options.deviceAddress The VBus address of the controller.
     * @param  {string} options.version The version of the controller.
     * @param  {Customizer} options.customizer A `Customizer` instance to query additional information with.
     * @return {Promise} A Promise that resolves to the best matching optimizer result or `null` if no match was found.
     */
    static async matchOptimizer(options) {
        if (this.deviceAddress !== null) {
            const match = (options.deviceAddress === this.deviceAddress) ? 1 : 0;

            return {
                match,
                Optimizer: this,
                options: null,
            };
        } else {
            throw new Error('Must be implemented by sub-class');
        }
    }

}


Object.assign(ConfigurationOptimizer, /** @lends ConfigurationOptimizer */ {

    deviceAddress: null,

});



module.exports = ConfigurationOptimizer;
