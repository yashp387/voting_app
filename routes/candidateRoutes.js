const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");
const User = require("../models/user");


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === "admin";
    } catch (error) {
        return false;
    }
}

// POST route to add a candidate
router.post("/", async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)) 
           return res.status(404).json({msg: "User has not admin role"});

        const data = req.body   // Assuming the rquest body contains the candidate data
  
        // Create a new candidate document using the Mongoose model
        const newCandidate = new Candidate(data);
      
         // Save the new User to the database
        const response = await newCandidate.save();
        console.log("Data saved");

        console.log("Data saved")
        res.status(200).json({response: response});
  
    } catch(error) {
        console.log(error);
        res.status(500).json("Internal server error occured");
    }
});


// Profile route
router.get("/profile",jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});

  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Internal server error"});
  }
});


router.put("/:candidateId", async (req, res) => {
  try {
       if(!checkAdminRole(req.user.id)) 
         return res.status(404).json({msg: "User has not admin role"});

    const userId = req.user.id;   // Extract the id from the token
    const {currentPassword, newPassword} = req.body;  // Extracgt the current and new passwords from the request body

    // Find the user by userId
    const user = await User.findById(userId);

    // If password does not match, return error
    if(!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({error: "Invalid password"});
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("Password updated");
    res.status(200).json({msg: "Password updated successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error occured");
  }
});


module.exports = router;