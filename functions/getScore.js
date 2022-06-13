
// This function is the endpoint's request handler.
exports = function(payload) {
    const from = new Date(payload.from)
    const to = new Date(payload.to)
    const ndrivers = parseInt(payload.ndrivers)

    const pipeline = [
      {
        "$match": { "start": { "$gte":from, "$lte":to }  }
      },
      { "$lookup":
       {
         from: "buses",
         localField: "bus_id",
         foreignField: "_id",
         as: "driver_info"
       }
      },
      { "$group": {
          "_id": { $arrayElemAt: [ "$driver_info.driver_id", 0 ] },
          "numSchedules": { "$sum": 1 }
      } },
      { "$lookup":
      {
        from: "drivers",
        localField: "_id",
        foreignField: "_id",
        as: "driver_details"
      }
      },
      { "$project":
      {
        numSchedules: 1,
        driver_name: {$concat: [ { $arrayElemAt: [ "$driver_details.first_name", 0 ] }, " ", { $arrayElemAt: [ "$driver_details.last_name", 0 ] } ]}
      }
      },
      { "$sort": { 
        numSchedules: -1
      } },
      { "$limit" :  ndrivers}
    ]
  
    // Querying a mongodb service: 
    const docs = context.services.get("mongodb-atlas").db("audela").collection("schedules").aggregate(pipeline).toArray()
    return  docs
};
