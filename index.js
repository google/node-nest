#!/usr/bin/env node
// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Connect to Nest web server,
// subscribe for status updates for the selected device
// and turn pin on/off based on it.

// Needs access to output pins, running as root could solve it

var config = require('./config');
var util = require('util');
var nest = require('unofficial-nest-api');

// Debug output disabled by default
util.debug = function () {
};

var exitTimeout;

function main() {
    util.log('Starting node-nest service');
    exitTimeout = setTimeout(function () {
        util.error("Can not login and get device status in 5 minutes, exiting");
        process.exit(1);
    }, 5 * 60 * 1000);
    loginAndSubscribe();
}

function loginAndSubscribe() {
    util.log(util.format('Logging in: %s', config.user));
    nest.login(config.user, config.password, function (err) {
        if (err) {
            util.error(util.format('Can not login: %s', err.stack));
            process.exit(1);
            return;
        }
        util.log(util.format('Login successful: %s', config.user));
        nest.fetchStatus(function (data) {
            util.debug(util.format('Status fetched: %j', data));
            for (var id in data.shared) {
                if (data.shared.hasOwnProperty(id)) {
                    util.log(util.format('Device found: %s', id));
                    subscribeToDevice(data.shared[id], processDeviceStatus);
                    // TODO: add support for multiple devices if requested
                    return;
                }
            }
        });
    });
}

function subscribeToDevice(device, processStatus) {
    clearTimeout(exitTimeout);
    exitTimeout = setTimeout(function () {
        try {
            util.error("No response from server within 5 minutes, turning off devices and exiting");
            for (var hvac_status in config.out_pins) {
                if (config.out_pins.hasOwnProperty(hvac_status)) {
                    var out_pin = config.out_pins[hvac_status];
                    if (out_pin) {
                        outputState(out_pin, false)
                    }
                }
            }
        } finally {
            process.exit(1);
        }
    }, 5 * 60 * 1000);

    if (device) {
        processStatus(device);
    }
    nest.subscribe(function (name, data) {
        util.log(util.format('Status updated by subscription: %j', name));
        subscribeToDevice(data, processStatus);
    });
}

function processDeviceStatus(device) {
    util.debug(util.format('Device data: %j', device));
    var re = new RegExp(/hvac_(.*)_state/);
    for (var prop in device) {
        if (device.hasOwnProperty(prop)) {
            var match = re.exec(prop);
            if (match && match[1]) {
                util.debug(util.format('Found hvac state: %s', match[1]));
                processHvacState(match[1], device[prop]);
            }
        }
    }
}

function processHvacState(name, value) {
    var pin = config.out_pins[name];
    if (pin) {
        outputState(pin, value);
    }
}

var bone = null;
function initializeBoneScript() {
    try {
        bone = require('bonescript');
        util.log('BoneScript loaded successfully');
    } catch (e) {
        bone = false;
    }
    for (var hvac_status in config.out_pins) {
        if (config.out_pins.hasOwnProperty(hvac_status)) {
            var out_pin = config.out_pins[hvac_status];
            if (out_pin) {
                util.log(util.format('Switching pin %s into OUTPUT mode for %s status', out_pin, hvac_status));
                try {
                    if (bone) {
                        bone.pinMode(out_pin, bone.OUTPUT);
                    }
                } catch (e) {
                    util.error(util.format('Can not switch pin %s into OUTPUT mode: %s', out_pin, e.stack));
                    process.exit(1);
                    return;
                }
            } else {
                util.debug(util.format('Ignoring %s status', hvac_status));
            }
        }
    }
    if (bone) {
        util.log('All required pins switched to OUTPUT mode');
    } else {
        util.error('BoneScript can not be loaded, emulating pins with logs');
    }
}
function outputState(pin, value) {
    if (bone == null) {
        initializeBoneScript();
    }
    try {
        util.log(util.format('Switching pin %s to %j', pin, value));
        if (bone) {
            bone.digitalWrite(pin, value);
        } else {
            util.error('BoneScript is not loaded, not touching actual pins');
        }
    } catch (e) {
        util.error(util.format('Can not switch pin %s to %j: %s', pin, value, e.message));
        process.exit(1);
    }
}

main();
