const { getTrips } = require('api');
const { getDriver } = require('api');
const { getVehicle } = require('api');

async function driverReport() {
    const allTrips = await getTrips()
    const allDrivers = {};
    for (let i = 0; i < allTrips.length; i++) {
      try {
        let currentDriverID = allTrips[i].driverID;
        const driver = await getDriver(currentDriverID);
        //console.log(driver)
        allDrivers[currentDriverID] = driver;
        //creating a new property called vehicle and se it to new array
        allDrivers[currentDriverID]['vehicle'] = []
        if (driver.vehicleID.length > 1) {
          for (let j = 0; j < driver.vehicleID.length; j++) {
            const vehicle = await getVehicle(driver.vehicleID[j])
            allDrivers[allTrips[i].driverID]['vehicle'].push(vehicle)
          }
        } else {
          const vehicle = await getVehicle(driver.vehicleID)
          allDrivers[currentDriverID]['vehicle'].push(vehicle)
        }
      } catch (error) {
        continue;
      }
    }
    const output = []
    let personObj = {
      fullname: '',
      phone: '',
      id: '',
      vehicles: [],
      noOfTrips: 0,
      noOfCashTrips: 0,
      noOfNonCashTrips: 0,
      trips: [],
      totalAmountEarned: 0,
      totalCashAmount: 0,
      totalNonCashAmount: 0
    }
    let personVehicle = {
      plate: '',
      manufacturer: '',
    }
    let personTrip = {
      user: '',
      created: '',
      pickup: '',
      destination: '',
      billed: 0,
      isCash: false
    }
    const copyOfPersonObj = JSON.parse(JSON.stringify(personObj));
    const copyOfPersonVehicle = JSON.parse(JSON.stringify(personVehicle));
    const copyOfPersonTrip = JSON.parse(JSON.stringify(personTrip));
    for (const key in allDrivers) {
      for (let i = 0; i < allTrips.length; i++) {
        if (key === allTrips[i].driverID) {
          personObj.totalAmountEarned += Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
          personObj.noOfTrips++
          personObj.id = key
          personObj.fullname = allDrivers[key].name
          personObj.phone = allDrivers[key].phone
          if (allTrips[i].isCash === true) {
            personObj.totalCashAmount += Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
            personObj.noOfCashTrips++
          } else {
            personObj.totalNonCashAmount += Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
            personObj.noOfNonCashTrips++
          }
          personTrip.user = allTrips[i].user.name
          personTrip.created = allTrips[i].created
          personTrip.pickup = allTrips[i].pickup.address
          personTrip.destination = allTrips[i].destination.address
          personTrip.isCash = allTrips[i].isCash
          personTrip.billed = Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
          let currentDriverVehicleArray = allDrivers[key].vehicle;
          for (let j = 0; j < currentDriverVehicleArray.length; j++) {
            let currentVehicle = allDrivers[key].vehicle[j]
            personVehicle.plate = currentVehicle.plate
            personVehicle.manufacturer = currentVehicle.manufacturer
            if (personObj.vehicles.length < currentDriverVehicleArray.length) {
              personObj.vehicles.push(personVehicle)
              personVehicle = JSON.parse(JSON.stringify(copyOfPersonVehicle))
            }
          }
          personObj.trips.push(personTrip)
          personTrip = JSON.parse(JSON.stringify(copyOfPersonTrip))
        }
      }
      personObj.totalAmountEarned = Number(personObj.totalAmountEarned.toFixed(2))
      personObj.totalCashAmount = Number(personObj.totalCashAmount.toFixed(2))
      personObj.totalNonCashAmount = Number(personObj.totalNonCashAmount.toFixed(2))
      output.push(personObj)
      personObj = JSON.parse(JSON.stringify(copyOfPersonObj))
    }
    //console.log(output)
    return output
}
module.exports = driverReport;
driverReport()