const express = require("express");
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require("./../jwt");
const Candidate = require("./../models/candidate");
const User = require("../models/user");


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
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
        console.log("Data saved")
        res.status(200).json({response: response});
  
    } catch(error) {
        console.log(error);
        res.status(500).json("Internal server error occured");
    }
});


router.put("/:candidateId", jwtAuthMiddleware,  async (req, res) => {
  try {
       if(!checkAdminRole(req.user.id)) 
         return res.status(403).json({msg: "User does not have admin role"});

       const candidateId = req.params.candidateId;  // Extract the id from URL parameter
       const updatedCandidateData = req.body;  // Update the data for candidate
   
       const response = await User.findByIdAndUpdate(candidateId, updatedCandidateData, {
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


router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
       if(!checkAdminRole(req.user.id)) 
          return res.status(403).json({msg: "User does not have admin role"});

       const candidateId = req.params.candidateId;  // Extract the id from URL parameter

       const response = await User.findByIdAndDelete(candidateId);
   
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


module.exports = router;