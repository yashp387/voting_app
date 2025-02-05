const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");

// POST route to add a person
router.post("/signup", async (req, res) => {
    try {
      const data = req.body   // Assuming the rquest body contains the User data
  
      // Create a new User document using the Mongoose model
      const newUser = new User(data);
      
      // Save the new User to the database
     const response = await newUser.save();
     console.log("Data saved");

     const payLoad = {
        id: response.id,
     }
     console.log(JSON.stringify(payLoad));

     const token = generateToken(payLoad);
    //  console.log("Token is: " ,token);

     console.log("Data saved")
     res.status(200).json({msg : "New Person added successfully", response: response, token: token});
  
    } catch(error) {
      console.log(error);
      res.status(500).json("Internal server error occured");
    }
});


// Login Route
router.post('/login', async(req, res) => {
  try{
      // Extract aadharCardNumber and password from request body
      const {aadharCardNumber, password} = req.body;

      // Find the user by aadharCardNumber
      const user = await User.findOne({aadharCardNumber: aadharCardNumber});

      // If user does not exist or password does not match, return error
      if( !user || !(await user.comparePassword(password))){
          return res.status(401).json({error: 'Invalid username or password'});
      }

      // generate Token 
      const payload = {
          id: user.id,
      }
      const token = generateToken(payload);

      // return token as response
      res.json({token})
  }catch(err){
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
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


router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
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