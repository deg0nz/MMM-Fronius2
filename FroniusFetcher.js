"use strict";

const fetch = require("node-fetch");
// Once MagicMirror uses an electron version that uses Node 16, we can get this from globalThis
const AbortController = require("node-abort-controller").AbortController;

class FroniusFetcher {
    constructor(config) {
        this.requestTimeout = config.requestTimeout;
        this.url = `http://${config.ip}/solar_api/v1/GetPowerFlowRealtimeData.fcgi`;
        this.dummyData = config.dummyData;
    }

    async fetch() {
        if(this.dummyData) {
            return this.fetchDummyData();
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, this.requestTimeout);

        try {
            const response = await fetch(this.url, { signal: controller.signal });
            const rawData = await response.json();
            const convertedData = this.convertSiteData(rawData);
            return convertedData;
        } catch (error) {
            if (error.type === "aborted" || error.code === "EHOSTUNREACH") {
                throw new Error("RequestTimeout");
            }

            console.error(error);
        } finally {
            clearTimeout(timeout);
        }
    }

    convertSiteData(rawData) {
        const targetData = rawData.Body.Data.Site;
        const convertedData = {
            energyDay: Math.round(targetData.E_Day),
            energyTotal: Math.round(targetData.E_Total),
            energyYear: Math.round(targetData.E_Year),
            energyNow: targetData.P_PV,
            meterLocation: targetData.Meter_Location,
            mode: targetData.Mode,
            powerAkku: targetData.P_Akku,
            powerGrid: targetData.P_Grid,
            powerLoad: targetData.P_Load,
            autonomy: targetData.rel_Autonomy,
            selfConsumption: targetData.rel_SelfConsumption,
        };

        return convertedData;
    }

    fetchDummyData() {
        const convertedData = {
            energyDay: this._getRandomArbitrary(1000, 50000),
            energyTotal: this._getRandomArbitrary(50000, 5000000),
            energyYear: this._getRandomArbitrary(20000, 500000),
            energyNow: this._getRandomArbitrary(1, 10000)
        };

        console.log(`Generated dummy data: ${JSON.stringify(convertedData)}`);

        return convertedData;
    }

    _getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
}

module.exports = FroniusFetcher;
