const express = require("express");
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require("./../jwt");
const Candidate = require("./../models/candidate");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");


const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if(user.role === "admin") {
            return true;
        }
    } catch (error) {
        return false;
    }
}

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) 
           return res.status(403).json({msg: "User does not have admin role"});

        const data = req.body   // Assuming the rquest body contains the candidate data
  
        // Create a new candidate document using the Mongoose model
        const newCandidate = new Candidate(data);
      
         // Save the new User to the database
        const response = await newCandidate.save();
        console.log("Candidate data saved")
        res.status(200).json({response: response});
  
    } catch(error) {
        console.log(error);
        res.status(500).json("Internal server error occured");
    }
});


router.put("/:candidateID", jwtAuthMiddleware,  async (req, res) => {
  try {
       if(!checkAdminRole(req.user.id)) 
         return res.status(403).json({msg: "User does not have admin role"});

       const candidateID = req.params.candidateID;  // Extract the id from URL parameter

       // Velidate objectId before querying
       if(!mongoose.Types.ObjectId.isValid(candidateID)) {
          return res.status(400).json({msg: "Invalid candidateID formate"})
       }
       const updatedCandidateData = req.body;  // Update the data for candidate
   
       const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
         new: true, // Return the updated document
         runValidators: true // Run mongoose validation
       });
   
       if(!response) {
         return res.status(404).json({error: "Candidate not found"})
       }
   
       console.log(" Candidate data updated");
       res.status(200).json({response : response, msg: "Candidate data updated"});
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error occured");
  }
});


router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
       if(!checkAdminRole(req.user.id)) 
          return res.status(403).json({msg: "User does not have admin role"});

       const candidateID = req.params.candidateID;  // Extract the id from URL parameter

       const response = await Candidate.findByIdAndDelete(candidateID);
   
       if(!response) {
         return res.status(404).json({error: "Candidate not found"})
       }
   
       console.log("Candidate deleted");
       res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error occured");
  }
});


// Let's Start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  // No admin can vote
  // User can vote only once

  candidateID = req.params.candidateID;
  userID = req.user.id; 
  
  try {
    // Find the Candidate document with the specific candidateID
    const candidate = await Candidate.findById(candidateID);
    if(!candidate) {
      return res.status(404).json({msg: "Candidate not found"});
    }

    const user = await User.findById(userID);
    if(!user) {
      return res.status(404).json({msg: "User not found"});
    }

    if(user.isVoted) {
      return res.status(400).json({mes: "You have already voted"});
    }

    if(user.role === "admin") {
      return res.json(403).json({msg: "Admin is not allowed"});
    }

    // Update the candidate document to record the vote
    candidate.votes.push({user: userID})
    candidate.voteCount++;
    await candidate.save();

    // Update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({msg: "Vote recorded successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error occured");
  }
});

// Vote count
router.get("/vote/count", async (req, res) => {
  try {
    // Find all the candidates and sort them by votecount in decending order
    const candidate = await Candidate.find().sort({voteCount: "desc"});

    // Map the candidate to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        voteCount: data.voteCount,
      }
    });

    res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    req.status(500).json("Internal server error occured");
  }
});


router.get("/", async (req, res) => {
  try {
    // List of candidates and select name and party name excluding party name
    const candidates = await Candidate.find({}, "name party -_id");
    res.json(candidates);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
})
module.exports = router;