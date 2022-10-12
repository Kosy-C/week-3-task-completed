const { getTrips, getDriver } = require('api');
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  const allTrips = await getTrips()
  const randomDriver = {}
  const allDrivers = {}
  let keys = []
  let tempAmount = 0
  let maxAmount = 0
  let minTripNo = 0
  let maxTripNo = 0
  // Sorted the drivers in order of trips embarked on
  allTrips.forEach(trip => keys.push(trip.driverID) )
  keys = [...new Set(keys)]

  // Fetch all the drivers and their details

  const promise = await Promise.allSettled(keys
  .map(id => getDriver(id)
  .then(result => randomDriver[id] = result )))

  // Matching ordered keys with randomly received details
  for (const id of keys) {
    if (id in randomDriver) allDrivers[id] = randomDriver[id]
  }
  // Output structure
  const obj = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,
    mostTripsByDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    },
    highestEarningDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    }
  }
  // Calculate billed total, non cash trips and cash trips
  for (let trip of allTrips) {
    if (trip.isCash === true) {
      obj.noOfCashTrips++
      const bill = Number(trip.billedAmount) || Number(trip.billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.cashBilledTotal += bill
    }
    if (trip.isCash === false) {
      obj.noOfNonCashTrips++
      const bill = Number(trip.billedAmount) || Number(trip.billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.nonCashBilledTotal += bill
    }
  }
  // Find driver with most trips and highest earning driver
  // Calculate no of drivers with more than one vehicles
  for (const id in allDrivers) {
    if (allDrivers[id].vehicleID.length > 1) obj.noOfDriversWithMoreThanOneVehicle++
    for (let trip of allTrips) {
      if (trip.driverID === id) {
        tempAmount += Number(trip.billedAmount) || Number(trip.billedAmount.replace(',', ''))
        minTripNo++
      }
      // Driver with most trips
      if (minTripNo > maxTripNo) {
        maxTripNo = minTripNo
        obj.mostTripsByDriver.name = allDrivers[id].name
        obj.mostTripsByDriver.email = allDrivers[id].email
        obj.mostTripsByDriver.phone = allDrivers[id].phone
        obj.mostTripsByDriver.noOfTrips = maxTripNo
        obj.mostTripsByDriver.totalAmountEarned = tempAmount
      }
      // Driver with most earnings
      if (tempAmount > maxAmount) {
        maxAmount = tempAmount
        obj.highestEarningDriver.name = allDrivers[id].name
        obj.highestEarningDriver.email = allDrivers[id].email
        obj.highestEarningDriver.phone = allDrivers[id].phone
        obj.highestEarningDriver.noOfTrips = minTripNo
        obj.highestEarningDriver.totalAmountEarned = maxAmount
      }
    }
    tempAmount = 0
    minTripNo = 0
  }
  obj.nonCashBilledTotal = Number(obj.nonCashBilledTotal.toFixed(2))
  obj.billedTotal = Number(obj.billedTotal.toFixed(2))
  return obj
}
console.log(analysis())
module.exports = analysis;