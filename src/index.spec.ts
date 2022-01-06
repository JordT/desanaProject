import * as expect from "expect";
import { fetchAvailability } from "./index";
import { Space } from "./types";

// the end goal
describe("src/index", () => {
  describe("a space with no advance notice", () => {
    let space: Space;
    before(async () => {
      space = await import("../fixtures/space-with-no-advance-notice.json");
    });

    // because of the time zone adjustment, the space is open.
    it("fetches availability for a space before the space has opened", () => {
      const availability = fetchAvailability(
        space,
        1,
        new Date(Date.UTC(2020, 8, 7, 15, 22))
                        // year, month-1, day, 
                        // Mon, 07 Sep 2020 15:22:00 GMT
      );

      expect(availability).toStrictEqual({
        "2020-09-07": {
          open: {
            hour: 11,
            minute: 30,
          },
          close: {
            hour: 17,
            minute: 0,
          },
        },
      });
    });
  });
});

// check multiple days are returned
describe("src/index", () => {
  describe("mutliple dates with no advance notice", () => {
    let space: Space;
    before(async () => {
      space = await import("../fixtures/space-with-no-advance-notice.json");
    });

    it("fetches multiple days of availability for a space before the space has opened", () => {
      const availability = fetchAvailability(
        space,
        2,
        new Date(Date.UTC(2020, 5, 1, 14, 22))
                        // year, month-1, day, 
                        // Mon, 5 June 2020 13:31:00 GMT
      );

      expect(availability).toStrictEqual({
          "2020-06-01": {
            "open": {
              "hour": 10,
              "minute": 30
            },
            "close": {
              "hour": 17,
              "minute": 0
            }
          },
          "2020-06-02": {
            "open" : {
              "hour":9,
              "minute": 0
            },
            "close": {
              "hour": 17, // 17
              "minute": 0
            }
          },
      });
    });
  });
});

// check space.minimumNotice is working
describe("src/index", () => {
  describe("a space with 30 mins advance notice", () => {
    let space: Space;
    before(async () => {
      space = await import("../fixtures/space-with-30-minutes-advance-notice.json");
    });

    it("fetches availability for a space with 30 mins advance notice", () => {
      const availability = fetchAvailability(
        space,
        1,
        new Date(Date.UTC(2020, 8, 7, 15, 22))
                        // year, month-1, day, 
                        // Mon, 07 Sep 2020 15:22:00 GMT
      );

      expect(availability).toStrictEqual({
        "2020-09-07": {
          open: {
            hour: 12,
            minute: 0,
          },
          close: {
            hour: 17,
            minute: 0,
          },
        },
      });
    });
  });
});