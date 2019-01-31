//firebase linked / connected
var config = {
    apiKey: "AIzaSyCBMRXkyJfPNLs-ywL1Q68ND4JDzOUuA7Q",
    authDomain: "train-scheduler-facf3.firebaseapp.com",
    databaseURL: "https://train-scheduler-facf3.firebaseio.com",
    projectId: "train-scheduler-facf3",
    storageBucket: "train-scheduler-facf3.appspot.com",
    messagingSenderId: "225448147446"
  };
  firebase.initializeApp(config);
  //create variables initialized on starting the page
  var database = firebase.database();
  console.log(database)
  //variables stored in firebase
  var name = "";
  var destination = "";
  var startTime = "";
  var frequency = "";
  //calculated variables, not stored in firebase
  var nextTrainArrival = "";
  var minutesAway = "";
  //create a function that will add a train to the database
  function addTrain() {
      var newTrain = {
          name: name,
          destination: destination,
          startTime: startTime,
          frequency: frequency
      }
      //on creation of a new train push it to the database
      database.ref().push(newTrain);
  };
  //create helper function to handle adding child elements, eventually appending them onto the page
  function childAdded() {
      database.ref().on("child_added", function (childSnapshot) {
          var trainName = childSnapshot.val().name;
          var trainDestination = childSnapshot.val().destination;
          var trainStartTime = childSnapshot.val().startTime;
          var trainFrequency = childSnapshot.val().frequency;
          //create a time difference moment for referencing trains time as needed
          var timeDifference = moment().diff(moment(trainStartTime, "hh:mm A"), "minutes");
          // if the first train time is later than it currently is
          if (timeDifference <= -1) {
              nextTrainArrival = trainStartTime;
              minutesAway = moment().diff(moment(trainStartTime, "hh:mm A"), "minutes");
              minutesAway = minutesAway - 1;
              minutesAway = minutesAway * -1;
              $('tbody').append(
                  '<tr>'
                  + '<td>' + trainName + '</td>'
                  + '<td>' + trainDestination + '</td>'
                  + '<td>' + trainFrequency + '</td>'
                  + '<td>' + nextTrainArrival + '</td>'
                  + '<td>' + minutesAway + '</td>'
                  + '</tr>')
                  console.log("time difference <=-1 passed")
          }
          else {
              var previousTrain = timeDifference % trainFrequency;
              //calculate minutes away by knowing the train frequency and the previous train's time
              minutesAway = trainFrequency - previousTrain;
              nextTrainArrival = moment().add(minutesAway, "minutes").format("hh:mm A");
              $('tbody').append(
                  '<tr>'
                  + '<td>' + trainName + '</td>'
                  + '<td>' + trainDestination + '</td>'
                  + '<td>' + trainFrequency + '</td>'
                  + '<td>' + nextTrainArrival + '</td>'
                  + '<td>' + minutesAway + '</td>'
                  + '</tr>')
                  console.log("time difference else hit")
          };
      });
  };
 
//function to update time
function updateTime() {
    setInterval(function () {
        $('tbody').empty();
        childAdded();
    }, 20 * 1000);
};
childAdded();
updateTime();
//submit button to obtain train information for variables
$('#submit-train').on('click', function () {
    console.log("button clicked")
    name = $('#train-name').val().trim();
    destination = $('#train-destination').val().trim();
    startTime = moment($('#train-time').val().trim(), "HH:mm A").format("hh:mm A");
    frequency = $('#train-frequency').val().trim();
    //create a new train and add it to the child, if something has not been filled in send an error
    if (name !== "" && destination !== "" && startTime !== "" && frequency !== "") {
        addTrain();
        childAdded();
        console.log("successful train added")
    }
    else {
        alert('Please fill out the whole form');
        console.log("failed to submit train")
     };
});