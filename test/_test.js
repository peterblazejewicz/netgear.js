/* eslint-disable no-unused-vars */
/* This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at http://mozilla.org/MPL/2.0/.

	Copyright 2017, 2018, Robin de Gruijter <gruijter@hotmail.com> */

// INSTRUCTIONS FOR TESTING FROM DESKTOP:
// install node (https://nodejs.org)
// install this package: > npm i netgear
// run the test (from the test folder): > node test password

'use strict';

const os = require('os');

const NetgearRouter = require('../netgear.js');
const { version } = require('../package.json');
// const util = require('util');

let log = [];
let errorCount = 0;
let t0 = Date.now();
const router = new NetgearRouter();

// function to setup the router session
async function setupSession(password, user, host, port) {
	try {
		log.push('========== STARTING TEST ==========');
		log.push(`Node version: ${process.version}`);
		log.push(`Netgear package version: ${version}`);
		log.push(`OS: ${os.platform()} ${os.release()}`);
		router.password = password || router.password;
		router.username = user || router.username;
		router.host = host || router.host;
		router.port = port || router.port;
		t0 = Date.now();
		errorCount = 0;
		log.push('t = 0');
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

function logError(error) {
	log.push(error.message);
	const lastResponse = { lastResponse: router.lastResponse };
	log.push(lastResponse);
	errorCount += 1;
	return {};
}

// function to get various information
async function getRouterInfo() {
	try {
		// // Get router type, soap version, firmware version and internet connection status without login
		// log.push('getting currentSetting...');
		// const currentSetting = await router.getCurrentSetting();
		// log.push(currentSetting);

		log.push('trying to auto discover Netgear routers...');
		log.push(await router._discoverAllHostsInfo());
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// for other methods you first need to be logged in.
		log.push('trying to login...');
		await router.login(); // [password], [username], [host], [port] will override previous settings
		log.push(`login method: ${router.loginMethod}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get router type, serial number, hardware version, firmware version, soap version, firewall version, etc.
		log.push('trying to getInfo...');
		const info = await router.getInfo()
			.catch(error => logError(error));
		info.SerialNumber = '**********';
		log.push(info);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the support features.
		log.push('trying to get supportFeatures...');
		const supportFeatures = await router.getSupportFeatureListXML()
			.catch(error => logError(error));
		log.push(supportFeatures);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the parentalControlEnableStatus.
		log.push('trying to get Parental Control Status...');
		const parentalControlEnabled = await router.getParentalControlEnableStatus()
			.catch(error => logError(error));
		log.push(`Parental Control Enabled: ${parentalControlEnabled}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the qosEnableStatus.
		log.push('trying to get Qos Status...');
		const qosEnabled = await router.getQoSEnableStatus()
			.catch(error => logError(error));
		log.push(`Qos Enabled: ${qosEnabled}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the getBandwidthControlOptions.
		log.push('trying to get Qos Bandwidth options...');
		const bandwidthControlOptions = await router.getBandwidthControlOptions()
			.catch(error => logError(error));
		log.push(bandwidthControlOptions);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the blockDeviceEnabledStatus.
		log.push('trying to get Device Access Control Status...');
		const blockDeviceEnabled = await router.getBlockDeviceEnableStatus()
			.catch(error => logError(error));
		log.push(`Block Device Enabled: ${blockDeviceEnabled}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// get a list of attached devices
		log.push('trying to get attachedDevices...');
		const attachedDevices = await router.getAttachedDevices()
			.catch(error => logError(error));
		log.push(`Number of attached devices: ${attachedDevices.length}, method: ${router.getAttachedDevicesMethod}`);
		log.push(`First attached device: ${JSON.stringify(attachedDevices[0])}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// get guest wifi status
		log.push('trying to get Guest Wifi Status...');
		await router.getGuestWifiEnabled()
			.then((enabled) => { log.push(`2.4G-1 Guest wifi enabled: ${enabled}`); })
			.catch(() => { log.push('2.4G-1 Guest wifi is not available');	});
		await router.get5GGuestWifiEnabled()
			.then((enabled) => { log.push(`5.0G-1 Guest wifi enabled: ${enabled}, method: ${router.guestWifiMethod.get50_1}`); })
			.catch(() => { log.push(`5.0G-1 Guest wifi is not available, method: ${router.guestWifiMethod.get50_1}`); });
		await router.get5GGuestWifi2Enabled()
			.then((enabled) => { log.push(`5.0G-2 Guest wifi enabled: ${enabled}`); })
			.catch(() => { log.push('5.0G-2 Guest wifi is not available');	});
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the trafficMeterEnabled status.
		log.push('trying to get the Traffic Meter Enabled Status...');
		const trafficMeterEnabled = await router.getTrafficMeterEnabled()
			.catch(error => logError(error));
		log.push(`Traffic Meter Enabled: ${trafficMeterEnabled}`);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// Get the trafficMeter Options
		log.push('trying to get the Traffic Meter Options...');
		const getTrafficMeterOptions = await router.getTrafficMeterOptions()
			.catch(error => logError(error));
		log.push(getTrafficMeterOptions);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// get traffic statistics for this day and this month. Note: traffic monitoring must be enabled in router
		log.push('trying to get trafficMeter...');
		const traffic = await router.getTrafficMeter()
			.catch(error => logError(error));
		log.push(traffic);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// check for new router firmware and release note
		log.push('trying to check newFirmware...');
		const firmware = await router.checkNewFirmware()
			.catch(error => logError(error));
		log.push(`check newFirmware method: ${router.checkNewFirmwareMethod}`);
		log.push(firmware);
		log.push(`t = ${(Date.now() - t0) / 1000}`);

		// logout
		log.push('trying to logout...');
		await router.logout()
			.catch(error => logError(error));

		// finish test
		router.password = '*****';
		log.push(router);
		log.push(`t = ${(Date.now() - t0) / 1000}`);
		if (errorCount) {
			log.push(`test finished with ${errorCount} errors`);
		} else {
			log.push('test finished without errors :)');
		}

	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to block or allow an attached device
async function blockOrAllow(mac, action) {
	try {
		await router.login();
		await router.setBlockDeviceEnable(true);
		await router.setBlockDevice(mac, action);
		log.push(`${action} for ${mac} succesfull!`);
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to enable/disable wifi
async function doWifiStuff() {
	try {
		await router.login();
		// enable 2.4GHz-1 guest wifi
		await router.setGuestWifi(true);
		log.push('2.4-1 enabled');
		// disable 5GHz-1 guest wifi
		await router.set5GGuestWifi(false);
		log.push('5-1 disabled');
		// disable 5GHz-2 guest wifi
		await router.set5GGuestWifi2(false);
		log.push('5-2 disabled');
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to enable/disable QOS
async function doQosStuff() {
	try {
		await router.login();
		// Set the qosEnableStatus.
		await router.setQoSEnableStatus(true);
		log.push('Qos enabled');
		// Set the getBandwidthControlOptions.
		log.push('trying to set Qos Bandwidth options...');
		await router.setBandwidthControlOptions(60.5, 50.5);	// in MB/s
		// Get the getBandwidthControlOptions.
		log.push('trying to get Qos Bandwidth options...');
		const bandwidthControlOptions = await router.getBandwidthControlOptions();
		log.push(bandwidthControlOptions);
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to enable/disable TrafficMeter
async function doTrafficMeterStuff() {
	try {
		await router.login();
		// enable trafficMeter.
		await router.enableTrafficMeter(true);
		log.push('Traffic meter enabled');
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to enable/disable parental control
async function doParentalControlStuff() {
	try {
		await router.login();
		// disable parental control
		await router.enableParentalControl(false);
		log.push('Parental control disabled');
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to update router firmware
async function updateNewFirmware() {
	try {
		await router.login();
		log.push('trying to update router firmware');
		await router.updateNewFirmware();
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to do internet speed test (takes long time!)
async function speedTest() {
	try {
		await router.login();
		log.push('speed test is starting... (wait a minute)');
		const speed = await router.speedTest(); // takes 1 minute to respond!
		log.push(speed);
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to reboot router
async function reboot() {
	try {
		await router.login();
		// Reboot the router
		log.push('going to reboot the router now');
		await router.reboot();
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

// function to send WakeOnLan command to a device
async function wol(mac, secureOnPassword) {
	try {
		log.push(`performing WOL for ${mac}`);
		await router.wol(mac, secureOnPassword);
	}	catch (error) {
		log.push(error);
		router.password = '*****';
		log.push(router);
	}
}

exports.discover = () => {
	try {
		return Promise.resolve(router.discover());
	}	catch (error) {
		return Promise.reject(error);
	}
};

exports.test = async (password, user, host, port) => {
	log = [];	// empty the log
	try {
		await setupSession(password, user, host, port);
		await getRouterInfo();
		// await blockOrAllow('AA:BB:CC:DD:EE:FF', 'Block');
		// await blockOrAllow('AA:BB:CC:DD:EE:FF', 'Allow');
		// await speedTest();
		// await doWifiStuff();
		// await doQosStuff();
		// await doTrafficMeterStuff();
		// await doParentalControlStuff();
		// await updateNewFirmware();
		// await reboot();
		// await wol('AA:BB:CC:DD:EE:FF', '00:00:00:00:00:00');
		return Promise.resolve(log);
	}	catch (error) {
		return Promise.resolve(log);
	}
};
