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


// Configuration for a script

module.exports = {
    user: 'user@gmail.com',
    password: 'sw0rdfish',
    // which pins should respond to different Nest devices
    out_pins: {
        // cooling
        ac: 'P9_12',
        cool_x2: null,
        fan: null,
        // heat
        heater: null,
        heat_x2: null,
        heat_x3: null,
        // alternative heat
        alt_heat: null,
        alt_heat_x2: null,
        aux_heater: null
    }
};
