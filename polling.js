/**
 * Created by danielhollcraft on 8/12/16.
 *
 * Interface for Texas Insrurments CC2650 bluetooth
 *
 * The CC2650 does not require a passkey so there is essentially
 * no difference between pairing and connecting.
 *
 * A Sensor Tag has the following states:
 *
 * 1) When the tag is turned on, it is Discoverable
 * 2) When it accepts our connection request it is Connected.
 * 3) If it loses the connection, or we tell it to disconnect,
 *    it returns to being discoverable.
 *
 * Initially, the users selects the sensors that should be connected.
 * At start up, these sensors are automatically connected.
 * If for some reason, one of these sensors becomes disconnected,
 * it is automatically reconnected.
 */
const sensorTag = require('sensortag')
const async = require('async')

start()

function start() {
  sensorTag.discoverAll(onDiscover);
}

function onDiscover(sensor) {
  sensor.connectAndSetup((error) => {
    if (error){
      console.log('Error connecting sensor: ' + error)
    } else {
      console.log('sensor ' + sensor.id + ' connected.')

      /* Enable other sensors to see that there is a huge power consumption increase */
      // sensor.enableIrTemperature();
      // sensor.enableAccelerometer();
      // sensor.enableMagnetometer();
      // sensor.enableBarometricPressure();
      // sensor.enableGyroscope();

      setInterval(() => read(sensor), 10000)
    }
  });
}

function read(sensor) {
  const delayAfterEnablingSensor = 1500;  // Wait this long in ms before first sensor read
  let sensorTagData = {};

  async.series([
      (callback) => {
        sensorTagData.sensorId = sensor.uuid;
        callback();
      },
      (callback) => {
        // Read humidity sensor values
        async.series([
            (cb) => {
              sensor.enableHumidity(cb);
            },
            (cb) => {
              setTimeout(cb, delayAfterEnablingSensor);
            },
            (cb) => {
              // Sensor HDC1000 contains both temperature and humidity sensors
              // http://www.ti.com.cn/cn/lit/ds/symlink/hdc1000.pdf
              sensor.readHumidity((error, temperature, humidity) => {
                sensorTagData.temperature = Math.round(temperature)
                sensorTagData.humidity = Math.round(humidity)
                cb();
              });
            },
            (cb) => {
              sensor.disableHumidity(cb);
            }
          ],
          (error, results) => {
            if (error) {
              log(error);
            }
            callback();
          });
      },
      (callback) => {
        // Read luxometer sensor values
        async.series([
            (cb)  => {
              sensor.enableLuxometer(cb);
            },
            (cb)  => {
              setTimeout(cb, delayAfterEnablingSensor);
            },
            (cb)  => {
              sensor.readLuxometer((error, lux) => {
                sensorTagData.lights = lux
                cb();
              });
            },
            (cb)  => {
              sensor.disableLuxometer(cb);
            }
          ],
          (error, results) => {
            if (error) {
              log(error);
            }
            callback();
          });
      },
      (callback) => {
        // send recorded sensor values
        sensorTagData.recorded = Date.now();
        callback();
      }
    ],
    (error, results) => {
      if (error) {
        log(error);
      }

      console.log(JSON.stringify(sensorTagData));
    });

}