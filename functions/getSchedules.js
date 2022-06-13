// This function is the endpoint's request handler.
exports = function(payload) {
    const from = new Date(payload.from)
    const to = new Date(payload.to)

    const pipeline = [
      {
        "$match": { "start": { "$gte":from, "$lte":to }  }
      },
      { "$lookup":
       {
         from: "buses",
         localField: "bus_id",
         foreignField: "_id",
         as: "bus_info"
       }
      },
      { "$project":
      {
        bus_id: 1,
        driver_id: { $arrayElemAt: [ "$bus_info.driver_id", 0 ] },
        bus_make: { $arrayElemAt: [ "$bus_info.make", 0 ] },
        bus_model: { $arrayElemAt: [ "$bus_info.model", 0 ] },
        bus_capacity: { $arrayElemAt: [ "$bus_info.capacity", 0 ] },
        start: 1,
        end: 1
      }},
      { "$lookup":
      {
        from: "drivers",
        localField: "driver_id",
        foreignField: "_id",
        as: "driver_details"
      }
      },
      { "$project":
      {
        bus_id: 1,
        driver_id: 1,
        bus_model: 1,
        bus_make: 1,
        bus_capacity: 1,
        driver_name: {$concat: [ { $arrayElemAt: [ "$driver_details.first_name", 0 ] }, " ", { $arrayElemAt: [ "$driver_details.last_name", 0 ] } ]},
        start: 1,
        end: 1
      }
      }
    ]
  
    // Querying a mongodb service: 
    const docs = context.services.get("mongodb-atlas").db("audela").collection("schedules").aggregate(pipeline).toArray()
    return  docs
};
