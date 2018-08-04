var config = {
    apiKey: "AIzaSyDHNp4MGanScEGS4XO0u31jKk-BR2H0WWw",
    authDomain: "my-cool-project-7f6e5.firebaseapp.com",
    databaseURL: "https://my-cool-project-7f6e5.firebaseio.com",
    projectId: "my-cool-project-7f6e5",
    storageBucket: "my-cool-project-7f6e5.appspot.com",
    messagingSenderId: "273337004389"
    };
    firebase.initializeApp(config);
    
   // Firebase database reference.
   var database = firebase.database();
  
  
    // variable where the objects can be stored.
   var player1 = null;
   var player2 = null;
   var p1Name  = "";
   var p2Name = "";
   var userName = "";
   var p1Select = "";
   var p2Select = "";
   var current = 1;
   
  
   

   // Firebase monitors to see if any changes occured such as a new player joining.
   database.ref("/players/").on("value", function(snapshot) {
       
    
       if (snapshot.child("player1").exists()) {
           console.log("Player One is ready.");
   
           //Player one information on firebase.
           player1 = snapshot.val().player1;
           p1Name = player1.name;
   
           //after game results.
           $("#playerOneName").text(p1Name);
           $("#playerOneResults").html("Win: " + player1.win + " Loss: " + player1.loss + " Tie: " + player1.tie);
       } else {
           console.log("Where is Player One?");
   
           player1 = null;
           p1Name = "";
   
           
           $("#playerOneName").text("Waiting for Player 1...");
           $("#playerOne").removeClass("currentPlayer");
           $("#playerTwo").removeClass("currentPlayer");
           database.ref("/results/").remove();
           $(".gameResult").html("Thanks for Playing");
           $(".queue").html("");
           $("#playerOneResults").html("Win: 0  Loss: 0  Tie: 0");
       }
   
       // Checks to see if there is a second player.
       if (snapshot.child("player2").exists()) {
           console.log("Player 2 is ready.");
   
           
           player2 = snapshot.val().player2;
           p2Name = player2.name;
   
           //after game results.
           $("#playerTwoName").text(p2Name);
           $("#playerTwoResults").html("Win: " + player2.win + " Loss: " + player2.loss + " Tie: " + player2.tie);
       } else {
           console.log("Where is Player 2?");
   
           player2 = null;
           p2Name = "";
   
          
           $("#playerTwoName").text("Waiting for Player 2...");
           $("#playerOne").removeClass("currentPlayer");
           $("#playerTwo").removeClass("currentPlayer");
           database.ref("/results/").remove();
           $(".gameResult").html("Select Rock Paper or Scissor");
           $(".queue").html("");
           $("#playerTwoResults").html("Win: 0  Loss: 0  Tie: 0");
       }
   
       // Game starts when there are two players in the game.
       if (player1 && player2) {
           
        
        //class with attributes with a border to see whose turn it is.
           $("#playerOne").addClass("currentPlayer");
   
           
           $(".queue").html("Waiting on " + p1Name + " to choose...");
       }
   
       //Clear's chat in firebase once players leave.
       if (!player1 && !player2) {
           database.ref("/chat/").remove();
           database.ref("/current/").remove();
           database.ref("/results/").remove();
   
           $("#chatDisplay").empty();
           $("#playerOne").removeClass("currentPlayer");
           $("#playerTwo").removeClass("currentPlayer");
           $(".gameResult").html("Select Rock Paper or Scissor  ");
           $(".queue").html("");
       }
   });
   
   // firebase detects if child(player) leaves the game.
   database.ref("/players/").on("child_removed", function(snapshot) {
       var msg = snapshot.val().name + " left the room.";
   
       // Get a key for the disconnection chat entry
       var chatKey = database.ref().child("/chat/").push().key;
   
       //auto message for leavers.
       database.ref("/chat/" + chatKey).set(msg);
   });
   
   // Detects if there are any new messages and adds it to the div on the html. 
   database.ref("/chat/").on("child_added", function(snapshot) {
       var chatMsg = snapshot.val();
       var chatEntry = $("<div>").html(chatMsg);
   
       
      
   
       $("#chatBox").append(chatEntry);
       $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
   });
   
   // uses the current variable to see whose turn it is.
   database.ref("/current/").on("value", function(snapshot) {
       
       if (snapshot.val() === 1) {
           console.log("PLAYER 1 GO");
           current = 1;
   
           //Once two players enter, message changes in the panel.
           if (player1 && player2) {
               $("#playerOne").addClass("currentPlayer");
               $("#playerTwo").removeClass("currentPlayer");
               $(".queue").html(p1Name + "'s "+ " turn");
           }
       } else if (snapshot.val() === 2) {
           console.log("PLAYER 2 GO");
           current = 2;
   
           if (player1 && player2) {
               $("#playerOne").removeClass("currentPlayer");
               $("#playerTwo").addClass("currentPlayer");
               $(".queue").html(p2Name + "'s "+" turn");
           }
       }
   });
   
   // Attach a listener to the database /outcome/ node to be notified of the game outcome
   database.ref("/results/").on("value", function(snapshot) {
       $(".gameResult").html(snapshot.val());
   });
   
  
   
   // Attach an event handler to the "Submit" button to add a new user to the database
   $("#playerName").on("click", function(event) {
       event.preventDefault();
   
       // First, make sure that the name field is non-empty and we are still waiting for a player
       if ( ($("#name-input").val().trim() !== "") && !(player1 && player2) ) {
           // Adding player1
           if (player1 === null) {
               console.log("Adding Player 1");
                //player1 firebase database.
               userName = $("#name-input").val().trim();
               player1 = {
                   name: userName,
                   win: 0,
                   loss: 0,
                   tie: 0,
                   move: ""
               };
   
               // Add player1 to the database.
               database.ref().child("/players/player1").set(player1);
   
   
               //sets current to 1 so it's alway player 1 turn first.
               database.ref().child("/current").set(1);
   
               // If this user disconnects by closing or refreshing the browser, remove the user from the database
               database.ref("/players/player1").onDisconnect().remove();
           } else if( (player1 !== null) && (player2 === null) ) {
              
               //player 2 to firebase database.
   
               userName = $("#name-input").val().trim();
               player2 = {
                   name: userName,
                   win: 0,
                   loss: 0,
                   tie: 0,
                   move: ""
               };
   
               // Add player2 to the database
               database.ref().child("/players/player2").set(player2);
   
               // clears data of player that leaves. 
               database.ref("/players/player2").onDisconnect().remove();
           }    
   
           // auto message from firebase when players join.
           var msg = userName + " entered the game.";
           
   
           // cariable set with key to show message.
           var chatKey = database.ref().child("/chat/").push().key;
   
           // Save the join chat entry
           database.ref("/chat/" + chatKey).set(msg);
   
           
       }
   });
   
   // on click for the new messages to show in chat. 
   $("#submitChat").on("click", function(event) {
       event.preventDefault();
   
      //there needs to be text in the textbot for it to be submitted.
       if ( (userName !== "") && ($("#chat-input").val().trim() !== "") ) {
           // saves the message and clears the text box.
           var msg = userName + ": " + $("#chat-input").val().trim();
           $("#chat-input").val("");
   
           
           var chatKey = database.ref().child("/chat/").push().key;
   
           // fire base database saves the new message.
           database.ref("/chat/" + chatKey).set(msg);
       }
   });
   
   //Player one onclick selection.(rock paper or scissors)
   $("#playerOne").on("click", ".userChoice", function(event) {
       event.preventDefault();
   
       //prevents the game from progressing without two players.
       if (player1 && player2 && (userName === player1.name) && (current === 1) ) {
           
           var move = $(this).text().trim();
   
          //adds the player selection into firebase database.
           p1Select = move;
           database.ref().child("/players/player1/move").set(move);
   
           // player two's turn.
           current = 2;
           database.ref().child("/current").set(2);
       }
   });

   function winLoss() {
    if (player1.move === "Rock"){
        if (player2.move === "Rock") {
           
            console.log("tie");

            database.ref().child("/results/").set("BOTH OF YOU ARE WINNERS!!");
            database.ref().child("/players/player1/tie").set(player1.tie + 1);
            database.ref().child("/players/player2/tie").set(player2.tie + 1);
        } else if (player2.move === "Paper") {
            
            console.log("paper wins");

            database.ref().child("/results/").set(p2Name + " win's");
            database.ref().child("/players/player1/loss").set(player1.loss + 1);
            database.ref().child("/players/player2/win").set(player2.win + 1);
        } else {
            console.log("rock wins");

            database.ref().child("/results/").set(p1Name + " win's");
            database.ref().child("/players/player1/win").set(player1.win + 1);
            database.ref().child("/players/player2/loss").set(player2.loss + 1);
        }

    } else if (player1.move === "Paper") {
        if (player2.move === "Rock") {
            
           

            database.ref().child("/results/").set(p1Name + " win's");
            database.ref().child("/players/player1/win").set(player1.win + 1);
            database.ref().child("/players/player2/loss").set(player2.loss + 1);
        } else if (player2.move === "Paper") {
           

            database.ref().child("/results/").set("BOTH OF YOU LOST!!");
            database.ref().child("/players/player1/tie").set(player1.tie + 1);
            database.ref().child("/players/player2/tie").set(player2.tie + 1);
        } else {
            

            database.ref().child("/results/").set(p2Name + " win's");
            database.ref().child("/players/player1/loss").set(player1.loss + 1);
            database.ref().child("/players/player2/win").set(player2.win + 1);
        }

    } else if (player1.move === "Scissors") {
        if (player2.move === "Rock") {
            
           

            database.ref().child("/results/").set(p2Name + " win's");
            database.ref().child("/players/player1/loss").set(player1.loss + 1);
            database.ref().child("/players/player2/win").set(player2.win + 1);
        } else if (player2.move === "Paper") {
            
         

            database.ref().child("/results/").set(p1Name + " win's");
            database.ref().child("/players/player1/win").set(player1.win + 1);
            database.ref().child("/players/player2/loss").set(player2.loss + 1);
        } else {
            

            database.ref().child("/results/").set("You guys think alike!");
            database.ref().child("/players/player1/tie").set(player1.tie + 1);
            database.ref().child("/players/player2/tie").set(player2.tie + 1);
        }

    }

    // After result, goes back to player 1's choice.
    current = 1;
    database.ref().child("/current").set(1);
}
   
  //Player two onclick selection.(rock paper or scissors)
   $("#playerTwo").on("click", ".userChoice", function(event) {
       event.preventDefault();
   
       
       if (player1 && player2 && (userName === player2.name) && (current === 2) ) {
           
           var move = $(this).text().trim();
   
           //adds the player selection into firebase database.
           p2Select = move;
           database.ref().child("/players/player2/move").set(move);
   
           
           winLoss();
       }
   });
   
   // function to determine who the winner is.
   