This is not an official Google product.

Node-Nest
=========

Controls output pins of a beaglebone board in sync with Nest Thermostat states.

Example usage
-------------

Connect 120v air conditioner to Nest via Wi-Fi instead of using 24v HVAC wires.

Nest would think that it controls AC via 24v HVAC wire, but in reality your
beaglebone would control it instead.

1. Hardware configuration:
    1. BeagleBone Black w/ Wi-Fi module and external power source.
    2. PowerSwitch Tail II (PST2) in between your AC and power outlet.
    3. BeagleBone pin P9_2 connected to "-" PST2 input.
    4. BeagleBone pin P9_12 connected to "+" PST2 input.
    5. Wire jammed in Nest Y1 socket, accepting error message once.
2. Software configuration:
    1. [Ubuntu 14.04](https://gist.github.com/timothybasanov/4cac1f8be77a6f912886)
    2. [NodeJs 0.10](http://nodejs.org/) (0.12 is not compatible with bonescript as of April 2015)
    ```
sudo apt-get install npm nodejs-legacy
```
    3. NodeNest service & configuration:
        1. `git clone https://github.com/timothybasanov/node-nest.git`
        2. `cd node-nest`
        3. Config should be edited to add your login/pass for Nest: `nano config.js`
    4. Required NodeJs packages: `npm install bonescript unofficial-nest-api`
    5. Update bonescript to the nightly:
    ```
cd ..
git clone https://github.com/jadonk/bonescript.git
cp -v bonescript/src/* node-nest/node_modules/bonescript/
cp -v bonescript/package.json node-nest/node_modules/
cd node-nest
npm install ffi
```
    5. Test running: `sudo node index.js`
4. Running as a service (be careful, this opens a potential security hole as service runs under root):
    1. `sudo ln -sv ~/node-nest/index.js /usr/local/bin/node-nest`
    2. `sudo cp node-nest.conf /etc/init/`
    3. `sudo service node-nest start`
    4. Check: `sudo tail -F /var/log/upstart/node-nest.log`

Now your air conditioner should be controlled by Nest Thermostat. In real time.

Limitations
-------------

*  Could not read or write humidifier status as API exposed by Nest is limited, you can map your humidifier to a fan to trigger it once a day.
