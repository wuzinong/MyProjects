import _ from "lodash";
// [
//   {
//     id: 0,
//     name: "Bran",
//     dinner: ["apple", ["peach", "blueberry"]], //can be a string or an array
//   },
//   {
//     id: 0,
//     name: "Tom",
//     dinner: ["lemon", ["orange"]], //can be a string or an array
//   },
// ];

//In order to analyze it, we need to find all the food appear in the "dinner attribute" and order them

//then you write code like this
function getAllFood(data: any) {
  let resultMap = {} as any;
  //loop all the dinner fields and use object to filter the duplicated records
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].dinner.length; j++) {
      let foods = data[i].dinner[j];
      if (typeof foods === "string" && !resultMap[foods]) {
        //dealing with the string type
        resultMap[foods] = 1;
      } else if (isArray(foods)) {
        //dealing with the array
        foods.forEach((item: any) => {
          if (!resultMap[item]) {
            resultMap[item] = 1;
          }
        });
      }
    }
  }
  return Object.keys(resultMap).sort((a, b) => a.localeCompare(b));
}

function isArray(data: any) {
  return Object.prototype.toString.call(data).slice(8, -1) === "Array";
}

// with lodash
function getAllfood2(data: any) {
  return _.chain(data)
    .map("dinner")
    .flatMapDeep()
    .sortBy()
    .sortedUniq()
    .value();
}
