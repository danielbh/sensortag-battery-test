/**
 * Created by danielhollcraft on 12/28/16.
 */
'use strict'

/**
 * Created by danielhollcraft on 8/12/16.
 * */
const sensorTag = require('sensortag')
const async = require('async')

let data = {}

start();

function start() {
  sensorTag.discoverAll(onDiscover);
}

function onDiscover(sensor) {
  sensor.connectAndSetup((error) => {
    if (error){
      console.log('Error connecting sensor: ' + error)
    } else {
      console.log('sensor ' + sensor.id + ' connected.')

      configure

      setInterval(() => console.log(data), 10000)
    }
  });
}

function configure(sensor) {
  data[sensor.uuid] = {};
  sensor.notifyHumidity();
  sensor.notifyLuxometer();

  sensorTag.on('luxometerChange', (lux) => {

  });
  sensorTag.on('humidityChange', (temperature, humidity) => {

  });
}