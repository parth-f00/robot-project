//we can clearly see that the network of roads in the village forms a graph.
//edges is the roads and the number of vertices are the places.

//we have to convert this array to an adjacency list for better uses.
//we will build an automation using pure javascript
// our automation will be a mail delivery entity or  maybe a robot picking up and dropping mails and parcels

//lets make the village where thr robot will be working in
//we will make an array of roads, where road has a source and destination
//there are 14 roads and 11 places

const roads=["Alice's House-Bob's House",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

//so w
function buildGraph(edges){
    let graph=Object.create(null);
    function addEdge(from, to){
        if(graph[from]==null){
            graph[from]=[to];
        }
        else graph[from].push(to);
    }

for(let [from,to] of edges.map(r=>r.split("-"))){
    addEdge(from,to);
    addEdge(to,from);
}
return graph;
}

const roadGraph=buildGraph(roads);

class VillageState{
    constructor(place, parcels){ //parcels has {place: that is the present location, address: where the parcel needs to be sent}
        this.place=place; //parcels place and village state place are different, village state place is robots place whereas parcels place is where the parcel is currently at
        this.parcels=parcels;
    }

    move(destination){
        if(!roadGraph[this.place].includes(destination)){
            return this;
        }
        else{
            let parcels= this.parcels.map(p=>{
                if(p.place!=this.place) return p;
                return {place:destination, address: p.address};
            }).filter(p=>p.place!=p.address);
            return new VillageState(destination, parcels);
        }
    }
}

//example for village state
// let first=new VillageState(
//     "Post Office",
//     [{place:"Post office", address:"Alice's House"}]
// );
// let next=first.move("Alice's House");
// console.log(next.place);

// console.log(next.parcels);
// //[] , it will be an empty array because the parcels for that that particular place and address have been delivered

// console.log(first.place);
//post office  - parcel objects are not changed when they are moved but re created, therefore the old object remains intact

//now why we are not changing the object but creating one because it helps to understand my prgoram.
//when objects are stable and fixed in our system, it is easier to do operations on them in isolation.
//but  when objects change pver time, that adds a whole new complexity factor in them.
//for smaller project such as this, it is easier to change the objects, but for large ons, it would be very difficult

//Simulation
function runRobot(state, robot, memory=[]){
    for(let turn=0;;turn++){
        if(state.parcels.length==0){
            console.log(`done in ${turn} turns`);
            break;
        }
        let action=robot(state,memory);//robot function outputs an object containing direction where it wants to move and the memory of the robot
        state=state.move(action.direction);
        memory=action.memory;
        console.log(`moved to ${action.direction}`);
    }
}
function randomPick(arr){
    let r_choice=Math.floor(Math.random()*arr.length);
    return arr[r_choice];
}

//creating a new state with some parcels
VillageState.random=function(parcelCount=5){
    let parcels=[];
    for(let i=0;i<parcelCount;i++){
        let address=randomPick(Object.keys(roadGraph));
        let place;
        do{
            place=randomPick(Object.keys(roadGraph));
        }while(place==address);
        parcels.push({place,address });
    }
    return new VillageState("Post Office", parcels);
};



//pathfinding: we will use BFS
function findRoute(graph,from,to){
    let work=[{at:from, route:[]}];
    for(let i=0;i<work.length;i++){
    let {at,route}=work[i];   // this is destructuring
    for(let neighbour of graph[at]){
        if(neighbour==to) return route.concat(neighbour);
        if(!work.some(w=>w.at==neighbour)){
            work.push({at:neighbour, route:route.concat(neighbour)});
        }
    }    
  }     
}

function goalOrientedRobot({place,parcels},route=[]){
    if(route.length==0){ //if the root array is empty, it means that we have to find a route to the location 
        let parcel=parcels[0];
        if(parcel.place!=place){
            route=findRoute(roadGraph,place,parcel.place);
        }
        else route=findRoute(roadGraph, place, parcel.address);
    }
    return {direction: route[0], memory: route.slice(1)};
}

runRobot(VillageState.random(), goalOrientedRobot);
