import { IANAZone } from "luxon";
import { OpeningTimes, Space } from "./types";
const { DateTime } = require('luxon');

/**
 * Fetches upcoming availability for a space
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 */
export const fetchAvailability = (
  space: Space,
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  // Create return object
  let availability: Record<string, OpeningTimes> = {}

  // adjust 'now' Date object to the timezone specified in space object
  // let getTimeZoneOffset = moment(now).tz(space.timeZone).format('ZZ') //get timezone offset
  // now = moment(now).utcOffset(getTimeZoneOffset).format('YYYY-MM-DD hh:mm') // apply timezone offset
  // now = moment(now).toDate();   //convert moment wrapper back to a JS Date Object (we could refactor to moment throughout...)

  // This gets us a Luxon datetime object
  availability[now.toString()] = {}
  let getLuxonDTObj = DateTime.fromJSDate(now)
  // let getTimeZoneOffset = new IANAZone(space.timeZone)
  // availability[getLuxonDTObj.toString()] = {}
  availability[getLuxonDTObj] = {}
  // need to get an offest from the space.timezone?
  // and apply it
  // availability[getTimeZoneOffset.offset(1).toString()] = {}

  // get the timezone offset
  // create adjust the date object
  // return to vanilla
  // moment is using a 12 hour clock. super duper
  
  // Round current minutes to next 15 minute interval
  if (now.getMinutes() != 0 || 15 || 30 || 45){
    if (now.getMinutes() < 15) {
      now.setMinutes(15)
    } 
    else if (now.getMinutes() < 30) {
      now.setMinutes(30)
    } else if(now.getMinutes() < 45) {
      now.setMinutes(45)
    } else if (now.getMinutes() <= 59) {
      now.setMinutes(0)
      now.setHours(now.getHours() + 1)
    }
  }
  
  //Adjust time for space.minimumNotice
  if (space.minimumNotice > 0) {
    now.setMinutes(now.getMinutes() + space.minimumNotice)
  }

  // Functions to display date/month in strings
  const formatDates = (d:number) => {   //display dates correctly
    if (d.toString().length == 1) {
      return `0${d}`
    } else {
      return d
    }
  }
  const formatMonths = (d:number) => {   //display dates correctly - adjust for zero index
    if (d.toString().length == 1) {
      return `0${d+1}`
    } else {
      return d+1
    }
  }

  let getLen = Object.keys(space.openingTimes).length
  let i: number = 0
  let currentDate: Date = now
  let firstDayComplete: boolean = false

  while (i < numberOfDays) {
    let returnDate = `${now.getFullYear()}-${formatMonths(now.getMonth())}-${formatDates(now.getDate())}` //Use Luxon to provide formatting
    let currentDay = currentDate.getDay()
    
    // address Sunday being zero indexed
    if (currentDay == 0) currentDay = 7;

    // handle first day availability, where we need to consider time of day
    if (firstDayComplete == false && currentDay <= getLen) {
      if (space.openingTimes[currentDay].open == undefined) {
        availability[returnDate] = space.openingTimes[currentDay]
        currentDate.setDate(currentDate.getDate() + 1)
        i++;
      } else {
        let currentTimeHour = now.getHours()
        let currentTimeMinute = now.getMinutes()
        let returnTime: OpeningTimes = {
          "open" : {
            "hour": space.openingTimes[currentDay].open!.hour,
            "minute": space.openingTimes[currentDay].open!.minute
          },
          "close": {
            "hour": space.openingTimes[currentDay].close!.hour,
            "minute": space.openingTimes[currentDay].close!.minute
          }
        }

        // Set opening time and adjust if required
        if (currentTimeHour >= space.openingTimes[currentDay].open!.hour) {
          returnTime.open!.hour = currentTimeHour
          if (currentTimeMinute > space.openingTimes[currentDay].open!.hour){
            returnTime.open!.minute = currentTimeMinute
          }
        }

        if(currentTimeHour >= space.openingTimes[currentDay].close!.hour) {
          currentDate.setDate(currentDate.getDate() + 1)
          continue;
        }

        availability[returnDate] = returnTime
        currentDate.setDate(currentDate.getDate() + 1)
        i++;
      }
    }
    // Handle all valid days that aren't the first day need a correct flag here...
    if (i > 0 && firstDayComplete == true && currentDay <= getLen) {
      availability[returnDate] = space.openingTimes[currentDay]
      currentDate.setDate(currentDate.getDate() + 1)
      i++;
    }

    // iterate to the next day if availability is not defined in the 'space' object
    if (currentDay > getLen) {
      currentDate.setDate(currentDate.getDate() + 1) // does this need to be in an if? We always want to move to the next day.
    }
    firstDayComplete = true;
  }
  return availability;
};

// we need to return multiple days - look how/when we are iterating.
// get rid of moment

// loop through by date until 

// for (let i: number = 0; i < numberOfDays; i++) {

//   // Day is now 0
//   // let currentDay = now.getDay() || 7 - 1; // DAY OF THE WEEK 0-6
//   let currentDay = now.getDay() + i; // DAY OF THE WEEK 0-6
//   let currentDate = now.getDate() + i; // YYYY MM DD // can't iterate with i
//   let returnDate = `${now.getFullYear()}-${formatMonths(now.getMonth())}-${formatDates(currentDate)}`

  

//   // check times for day 1
//   if (i === 0) {
//     // If there's no availablility on current day - return empty object
//     if(space.openingTimes[currentDay] == undefined) {
//       availability[returnDate] = {}
//     } 
    
//     if (space.openingTimes[currentDay] != undefined) { // else return time
//       let currentTimeHour = now.getHours()
//       let currentTimeMinute = now.getMinutes()
//       let returnTime: OpeningTimes = space.openingTimes[currentDay] 
    
      // if (currentTimeHour >= returnTime.open!.hour) {  
      //   returnTime.open!.hour = currentTimeHour
      //   if (currentTimeMinute > returnTime.open!.minute) {
      //     returnTime.open!.minute = currentTimeMinute
      //   }
      // }
//       availability[returnDate] = returnTime
//     }
//   }

//   // return remaining days w/ no time consideration
//   if (i >= 1) {
//     availability[returnDate] = space.openingTimes[currentDay]
//   }
// }


// Calculate availabilty for the number of days specified in numberOfDays

// Don't return times that in the past relative to 'now'

