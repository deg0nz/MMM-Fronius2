"use strict";
/* Magic Mirror
 * Node Helper: MMM-Fronius2
 *
 * By Beh (hello@beh.wtf)
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const FroniusFetcher = require("./FroniusFetcher");

module.exports = NodeHelper.create({
    initialize: function (config) {
        if (typeof this.fetcher === "undefined") {
            this.fetcher = new FroniusFetcher(config);
            this.sendSocketNotification("MMM-Fronius2_INITIALIZED");
        }
    },

    fetchData: async function () {
        if (typeof this.fetcher === "undefined") return;

        try {
            const data = await this.fetcher.fetch();
            this.sendSocketNotification("MMM-Fronius2_DATA", data);
        } catch (error) {
            if (error.message === "RequestTimeout") {
                console.log("Data fetch from Fronius power converter timed out.");
                this.sendSocketNotification("MMM-Fronius2_ERROR_FETCH_TIMEOUT");
            }
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-Fronius2_INIT") {
            this.initialize(payload);
        }

        if (notification === "MMM-Fronius2_FETCH_DATA") {
            this.fetchData();
        }
    },
});
